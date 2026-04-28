// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StrategyBase.sol";

interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

/// @title AaveStrategy
/// @notice Strategy that supplies the underlying asset to Aave V3 on Sepolia
///         and earns aToken-denominated yield.
contract AaveStrategy is StrategyBase {
    /// @notice Aave V3 Pool on Sepolia.
    address public constant AAVE_POOL = 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951;
    /// @notice aUSDC on Sepolia.
    address public constant A_USDC = 0x16dA4541aD1807f4443d92D26044C1147406EB80;

    IAavePool public immutable pool;
    IERC20 public immutable aToken;

    /// @param _asset Underlying asset (USDC).
    /// @param _vault MetaVault address.
    constructor(address _asset, address _vault) StrategyBase(_asset, _vault) {
        pool = IAavePool(AAVE_POOL);
        aToken = IERC20(A_USDC);
    }

    /// @inheritdoc StrategyBase
    function _depositToProtocol(uint256 amount) internal override {
        asset.approve(address(pool), amount);
        pool.supply(address(asset), amount, address(this), 0);
    }

    /// @inheritdoc StrategyBase
    function _withdrawFromProtocol(uint256 amount) internal override returns (uint256) {
        return pool.withdraw(address(asset), amount, address(this));
    }

    /// @notice Total value supplied to Aave (1:1 with aToken balance).
    function totalAssets() external view override returns (uint256) {
        return aToken.balanceOf(address(this));
    }
}
