// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title StrategyBase
/// @notice Abstract base contract that all Omni-Vault strategies inherit from.
///         Handles vault authorization, pause control, and the deposit/withdraw
///         entrypoints. Concrete strategies implement protocol-specific logic.
abstract contract StrategyBase is Ownable {
    /// @notice The MetaVault that owns and routes funds through this strategy.
    address public vault;

    /// @notice The underlying asset (e.g. USDC) managed by this strategy.
    IERC20 public asset;

    /// @notice When true, deposits are blocked. Withdrawals remain enabled.
    bool public paused;

    event Paused();
    event Unpaused();
    event StrategyDeposit(uint256 amount);
    event StrategyWithdraw(uint256 amount);

    modifier onlyVault() {
        require(msg.sender == vault, "StrategyBase: not vault");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "StrategyBase: paused");
        _;
    }

    /// @param _asset Underlying ERC20 asset address (e.g. USDC).
    /// @param _vault MetaVault address authorized to call deposit/withdraw.
    constructor(address _asset, address _vault) Ownable(msg.sender) {
        require(_asset != address(0) && _vault != address(0), "StrategyBase: zero addr");
        asset = IERC20(_asset);
        vault = _vault;
    }

    /// @notice Internal hook implemented by subclasses to push funds into the protocol.
    function _depositToProtocol(uint256 amount) internal virtual;

    /// @notice Internal hook implemented by subclasses to pull funds from the protocol.
    /// @return actual amount of asset received back into the strategy.
    function _withdrawFromProtocol(uint256 amount) internal virtual returns (uint256);

    /// @notice Pulls `amount` of asset from the vault and deposits to the underlying protocol.
    /// @param amount Amount of underlying asset to deposit.
    function deposit(uint256 amount) external onlyVault whenNotPaused {
        require(amount > 0, "StrategyBase: zero amount");
        asset.transferFrom(vault, address(this), amount);
        _depositToProtocol(amount);
        emit StrategyDeposit(amount);
    }

    /// @notice Withdraws `amount` of asset from the protocol and returns it to the vault.
    /// @param amount Requested amount to withdraw.
    /// @return received Actual amount transferred back to the vault.
    function withdraw(uint256 amount) external onlyVault returns (uint256 received) {
        require(amount > 0, "StrategyBase: zero amount");
        received = _withdrawFromProtocol(amount);
        asset.transfer(vault, received);
        emit StrategyWithdraw(received);
    }

    /// @notice Pause new deposits. Existing positions remain withdrawable.
    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    /// @notice Resume deposits.
    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    /// @notice Returns the total value of assets managed by this strategy in underlying units.
    function totalAssets() external view virtual returns (uint256);
}
