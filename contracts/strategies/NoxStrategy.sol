// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./StrategyBase.sol";

/// @title NoxStrategy
/// @notice Confidential strategy executed inside iExec NOX TEE workers.
///         Funds remain held by this contract while the actual yield-generation
///         strategy is decided/executed off-chain. An authorized oracle (the TEE)
///         posts signed yield reports back on-chain.
contract NoxStrategy is StrategyBase {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    /// @notice Address allowed to submit signed yield reports (the iExec TEE result poster).
    address public authorizedOracle;

    /// @notice Latest reported off-chain yield (in underlying asset units).
    uint256 public reportedYield;

    /// @notice Timestamp of the most recent accepted yield report.
    uint256 public lastReportTimestamp;

    /// @notice Underlying asset currently held/staked through NOX.
    uint256 public stakedAmount;

    event YieldReported(uint256 yieldAmount, uint256 timestamp);
    event AuthorizedOracleUpdated(address oracle);

    /// @param _asset Underlying asset (USDC).
    /// @param _vault MetaVault address.
    constructor(address _asset, address _vault) StrategyBase(_asset, _vault) {}

    /// @inheritdoc StrategyBase
    function _depositToProtocol(uint256 amount) internal override {
        stakedAmount += amount;
    }

    /// @inheritdoc StrategyBase
    function _withdrawFromProtocol(uint256 amount) internal override returns (uint256) {
        require(amount <= stakedAmount, "NoxStrategy: exceeds staked");
        stakedAmount -= amount;
        return amount;
    }

    /// @notice Submit a signed yield report from the iExec TEE worker.
    /// @param yieldAmount Cumulative yield to record (in underlying units).
    /// @param signature  ECDSA signature over keccak256(abi.encodePacked(yieldAmount, chainid, this)).
    function submitYieldReport(uint256 yieldAmount, bytes calldata signature) external {
        require(authorizedOracle != address(0), "NoxStrategy: oracle unset");
        bytes32 digest = keccak256(abi.encodePacked(yieldAmount, block.chainid, address(this)))
            .toEthSignedMessageHash();
        address signer = digest.recover(signature);
        require(signer == authorizedOracle, "NoxStrategy: bad signature");

        reportedYield = yieldAmount;
        lastReportTimestamp = block.timestamp;
        emit YieldReported(yieldAmount, block.timestamp);
    }

    /// @notice Total assets = principal staked + last reported off-chain yield.
    function totalAssets() external view override returns (uint256) {
        return stakedAmount + reportedYield;
    }

    /// @notice Update the authorized TEE oracle that may submit yield reports.
    /// @param oracle New oracle address.
    function setAuthorizedOracle(address oracle) external onlyOwner {
        authorizedOracle = oracle;
        emit AuthorizedOracleUpdated(oracle);
    }
}
