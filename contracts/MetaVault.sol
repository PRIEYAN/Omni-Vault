// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IStrategy {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external returns (uint256);
    function totalAssets() external view returns (uint256);
}

/// @title MetaVault
/// @notice Confidential yield vault. Strategy decisions are made off-chain by ChainGPT
///         and executed inside iExec NOX confidential containers. ERC-4626-style share
///         accounting for the underlying USDC asset.
contract MetaVault is Ownable, ReentrancyGuard {
    IERC20 public immutable asset;

    uint256 public totalShares;
    mapping(address => uint256) public shares;
    mapping(address => uint256) public depositedAmount;

    address[] public strategies;
    uint256[] public allocations; // basis points, sum = 10000

    uint256 public performanceFee = 1000; // 10% in bps
    address public feeRecipient;

    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 shares, uint256 amount);
    event Rebalance(uint256[] newAllocations);

    constructor(address _asset, address _feeRecipient) Ownable(msg.sender) {
        asset = IERC20(_asset);
        feeRecipient = _feeRecipient;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        uint256 totalBefore = totalAssets();
        asset.transferFrom(msg.sender, address(this), amount);
        uint256 newShares = totalShares == 0 ? amount : (amount * totalShares) / totalBefore;
        shares[msg.sender] += newShares;
        depositedAmount[msg.sender] += amount;
        totalShares += newShares;
        emit Deposit(msg.sender, amount, newShares);
    }

    function withdraw(uint256 shareAmount) external nonReentrant {
        require(shares[msg.sender] >= shareAmount, "Insufficient shares");
        uint256 payout = (totalAssets() * shareAmount) / totalShares;
        uint256 principal = (depositedAmount[msg.sender] * shareAmount) / shares[msg.sender];
        uint256 profit = payout > principal ? payout - principal : 0;
        uint256 fee = (profit * performanceFee) / 10000;

        shares[msg.sender] -= shareAmount;
        depositedAmount[msg.sender] -= principal;
        totalShares -= shareAmount;

        if (fee > 0) asset.transfer(feeRecipient, fee);
        asset.transfer(msg.sender, payout - fee);
        emit Withdraw(msg.sender, shareAmount, payout - fee);
    }

    function totalAssets() public view returns (uint256 total) {
        total = asset.balanceOf(address(this));
        for (uint i = 0; i < strategies.length; i++) {
            total += IStrategy(strategies[i]).totalAssets();
        }
    }

    function sharePrice() public view returns (uint256) {
        if (totalShares == 0) return 1e18;
        return (totalAssets() * 1e18) / totalShares;
    }

    function getUserValue(address user) public view returns (uint256) {
        if (totalShares == 0) return 0;
        return (totalAssets() * shares[user]) / totalShares;
    }

    function addStrategy(address strategy, uint256 allocation) external onlyOwner {
        strategies.push(strategy);
        allocations.push(allocation);
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }

    function setPerformanceFee(uint256 _bps) external onlyOwner {
        require(_bps <= 3000, "fee too high");
        performanceFee = _bps;
    }

    /// @notice Update per-strategy allocations (basis points, summing to 10000).
    /// @param newAllocations New allocation array, one per strategy.
    function rebalance(uint256[] calldata newAllocations) external onlyOwner {
        require(newAllocations.length == strategies.length, "len mismatch");
        uint256 sum;
        for (uint256 i = 0; i < newAllocations.length; i++) {
            sum += newAllocations[i];
        }
        require(sum == 10000, "bad allocations");
        for (uint256 i = 0; i < newAllocations.length; i++) {
            allocations[i] = newAllocations[i];
        }
        emit Rebalance(newAllocations);
    }

    /// @notice Remove a strategy whose totalAssets() is zero.
    /// @param index Index of the strategy to remove.
    function removeStrategy(uint256 index) external onlyOwner {
        require(index < strategies.length, "bad index");
        require(IStrategy(strategies[index]).totalAssets() == 0, "strategy non-empty");

        uint256 last = strategies.length - 1;
        if (index != last) {
            strategies[index] = strategies[last];
            allocations[index] = allocations[last];
        }
        strategies.pop();
        allocations.pop();
    }
}
