// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StrategyBase.sol";

interface IComet {
    function supply(address asset, uint256 amount) external;
    function withdraw(address asset, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

/// @title CompoundStrategy
/// @notice Strategy that supplies the underlying asset to Compound V3 (Comet)
///         on Sepolia.
contract CompoundStrategy is StrategyBase {
    /// @notice Compound V3 Comet USDC market on Sepolia.
    address public constant COMET_USDC = 0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e;

    IComet public immutable comet;

    /// @param _asset Underlying asset (USDC).
    /// @param _vault MetaVault address.
    constructor(address _asset, address _vault) StrategyBase(_asset, _vault) {
        comet = IComet(COMET_USDC);
    }

    /// @inheritdoc StrategyBase
    function _depositToProtocol(uint256 amount) internal override {
        asset.approve(address(comet), amount);
        comet.supply(address(asset), amount);
    }

    /// @inheritdoc StrategyBase
    function _withdrawFromProtocol(uint256 amount) internal override returns (uint256) {
        comet.withdraw(address(asset), amount);
        return amount;
    }

    /// @notice Total balance held by this strategy in the Comet market.
    function totalAssets() external view override returns (uint256) {
        return comet.balanceOf(address(this));
    }
}
