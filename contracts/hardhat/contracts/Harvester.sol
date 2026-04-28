// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IMetaVault {
    function totalAssets() external view returns (uint256);
    function strategies(uint256 index) external view returns (address);
    function allocations(uint256 index) external view returns (uint256);
    function rebalance(uint256[] calldata newAllocations) external;
}

/// @title Harvester
/// @notice Periodic yield collection and rebalance trigger for Omni-Vault.
///         Anyone can call `harvest()` after the cooldown; only the owner
///         can push a new allocation set via `rebalance()`.
contract Harvester is Ownable {
    /// @notice MetaVault this harvester operates against.
    address public vault;

    /// @notice Last successful harvest timestamp.
    uint256 public lastHarvestTime;

    /// @notice Minimum interval between permissionless harvests.
    uint256 public harvestInterval = 24 hours;

    event HarvestExecuted(uint256 totalAssets, uint256 timestamp);
    event Rebalanced(uint256[] allocations);
    event HarvestIntervalUpdated(uint256 interval);

    /// @param _vault MetaVault address.
    constructor(address _vault) Ownable(msg.sender) {
        require(_vault != address(0), "Harvester: zero vault");
        vault = _vault;
    }

    /// @notice Trigger a harvest cycle. Permissionless after `harvestInterval`.
    function harvest() external {
        require(
            block.timestamp >= lastHarvestTime + harvestInterval || msg.sender == owner(),
            "Harvester: cooldown"
        );
        uint256 total = IMetaVault(vault).totalAssets();
        lastHarvestTime = block.timestamp;
        emit HarvestExecuted(total, block.timestamp);
    }

    /// @notice Push a new allocation set (in basis points, summing to 10000) to the vault.
    /// @param newAllocations Per-strategy allocation in bps.
    function rebalance(uint256[] calldata newAllocations) external onlyOwner {
        uint256 sum;
        for (uint256 i = 0; i < newAllocations.length; i++) {
            sum += newAllocations[i];
        }
        require(sum == 10000, "Harvester: bad allocations");
        IMetaVault(vault).rebalance(newAllocations);
        emit Rebalanced(newAllocations);
    }

    /// @notice Update the minimum interval between permissionless harvests.
    /// @param interval New interval in seconds.
    function setHarvestInterval(uint256 interval) external onlyOwner {
        harvestInterval = interval;
        emit HarvestIntervalUpdated(interval);
    }
}
