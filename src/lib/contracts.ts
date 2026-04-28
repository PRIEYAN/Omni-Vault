// MetaVault contract config (deployed on Ethereum Sepolia).

export const METAVAULT_ADDRESS = "0x7dc508aC5EE4c9D864c0f1A1514efADD8295f76d" as `0x${string}`;
// Mock USDC deployed with the same Ethereum Sepolia deployment.
export const USDC_ADDRESS = "0xA9cA4740f15353c040C68eF4EB2a759A8E4F483D" as `0x${string}`;

export const METAVAULT_ABI = [
  { type: "function", name: "deposit", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [{ name: "shareAmount", type: "uint256" }], outputs: [] },
  { type: "function", name: "totalAssets", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalShares", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "shares", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "depositedAmount", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "sharePrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getUserValue", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "strategies", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "allocations", stateMutability: "view", inputs: [{ name: "", type: "uint256" }], outputs: [{ type: "uint256" }] },
] as const;

export const ERC20_ABI = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;

export const USDC_DECIMALS = 6;
