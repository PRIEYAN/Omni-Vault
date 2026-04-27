// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC
/// @notice 6-decimal ERC20 used for local + testnet testing of Omni-Vault.
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "USDC") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /// @notice USDC uses 6 decimals.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Public faucet mint. Anyone can mint test USDC on testnets.
    /// @param to Recipient.
    /// @param amount Amount in 6-decimal units.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
