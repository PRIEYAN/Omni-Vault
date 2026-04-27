# MetaVault — Setup Guide

Confidential yield vault on iExec NOX, AI-allocated by ChainGPT.

> **Stack note**: This frontend is built with **TanStack Start + Vite** (not
> Next.js App Router). Routes live in `src/routes/`. Wagmi v2 + viem + RainbowKit
> handle wallet connectivity. The Solidity contract under `contracts/` is
> framework-agnostic and can be compiled with either Hardhat or Foundry.

---

## 1. Prerequisites

- **Node.js 18+** (`node -v`)
- **Git**
- **MetaMask** (or any RainbowKit-supported wallet) on **Sepolia** testnet
- Sepolia ETH for gas — grab some from a faucet
- Sepolia USDC — Circle's official faucet: https://faucet.circle.com

---

## 2. Install dependencies

```bash
npm install
# or
bun install
```

---

## 3. Compile the contract

You can use **Hardhat** *or* **Foundry**. Both target `contracts/MetaVault.sol`.

### Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
npx hardhat init     # choose "Create a TypeScript project"
npx hardhat compile
```

### Foundry

```bash
forge init --no-commit
forge install OpenZeppelin/openzeppelin-contracts
forge build
```

The compiled ABI lives at `artifacts/contracts/MetaVault.sol/MetaVault.json`
(Hardhat) or `out/MetaVault.sol/MetaVault.json` (Foundry).

---

## 4. Deploy to Sepolia

Create `.env.local` at the project root:

```env
PRIVATE_KEY=0xabc...                  # deployer EOA, funded with Sepolia ETH
ALCHEMY_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238  # Circle Sepolia USDC
FEE_RECIPIENT=0xYourTreasuryAddress
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY   # for verification
```

Hardhat deploy script (`scripts/deploy.ts`):

```ts
import { ethers } from "hardhat";

async function main() {
  const Vault = await ethers.getContractFactory("MetaVault");
  const vault = await Vault.deploy(process.env.USDC_ADDRESS!, process.env.FEE_RECIPIENT!);
  await vault.waitForDeployment();
  console.log("MetaVault deployed at:", await vault.getAddress());
}
main().catch((e) => { console.error(e); process.exit(1); });
```

Run it:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia <DEPLOYED_ADDRESS> <USDC_ADDRESS> <FEE_RECIPIENT>
```

---

## 5. Update `src/lib/contracts.ts`

Open `src/lib/contracts.ts` and:

1. Replace `METAVAULT_ADDRESS` with your deployed address.
2. Replace `METAVAULT_ABI` with the full ABI from the compiled artifact.
   (The placeholder ABI in the file only includes the read/write methods the
   UI calls — paste the complete JSON ABI to enable Etherscan/explorer
   features and additional events.)

---

## 6. Configure wagmi & RainbowKit

`src/lib/wagmi.ts` is preconfigured for **Sepolia** + **Mainnet** with
RainbowKit's `getDefaultConfig`. To enable WalletConnect (mobile / extra
wallets):

1. Create a project at https://cloud.walletconnect.com
2. Replace `projectId: "metavault-demo-projectid"` with your WalletConnect
   `projectId`.

Add new chains in the `chains` and `transports` arrays.

---

## 7. Run the dev server

```bash
npm run dev
```

Visit http://localhost:5173 (or the port the CLI prints). You'll land on the
onboarding page; connecting a wallet routes you to `/dashboard`.

---

## 8. Environment variables (`.env.local` template)

```env
# Frontend (Vite — must be prefixed with VITE_)
VITE_WALLETCONNECT_PROJECT_ID=YOUR_WC_PROJECT_ID
VITE_DEFAULT_CHAIN_ID=11155111

# Server-side (deployment / scripts only — never imported in browser code)
PRIVATE_KEY=0xabc...
ALCHEMY_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
FEE_RECIPIENT=0xYourTreasuryAddress
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Off-chain services
IEXEC_WALLET_ADDRESS=0x...
IEXEC_PRIVATE_KEY=0x...
CHAINGPT_API_KEY=cg_live_...
```

---

## 9. iExec NOX integration

NOX (the confidential layer of iExec) executes the vault's strategy logic
inside TEE-backed containers. Strategy decisions arrive on-chain via the
vault owner / executor; the *computation* is opaque.

### Push a confidential task

Install the SDK:

```bash
npm install --save-dev iexec
```

Initialize once:

```bash
iexec init --skip-wallet
iexec wallet import $IEXEC_PRIVATE_KEY
iexec storage init
```

Push a confidential task referencing your TEE app and the strategy input:

```bash
iexec app run \
  --tag tee \
  --workerpool prod-v8-bellecour.main.pools.iexec.eth \
  --app <YOUR_TEE_APP_ADDRESS> \
  --dataset <ENCRYPTED_INPUT_DATASET> \
  --args "rebalance --vault $METAVAULT_ADDRESS"
```

The task's verified result (a signed allocation vector) can then be relayed
on-chain through `MetaVault.addStrategy` / a future `rebalance()` admin call.

Docs: https://docs.iex.ec

---

## 10. ChainGPT integration

ChainGPT scores DeFi protocols and produces an allocation vector consumed by
the iExec task above.

1. Get an API key at https://app.chaingpt.org → Developers → API Keys.
2. Store as `CHAINGPT_API_KEY` (server-side only, never in `VITE_*`).
3. Call from a server function or off-chain worker:

```ts
const r = await fetch("https://api.chaingpt.org/chat/stream", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.CHAINGPT_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "general_assistant",
    question: "Given current market conditions, suggest a USDC allocation across Aave, Compound, and an iExec NOX confidential strategy. Output basis points summing to 10000.",
  }),
});
```

The model output is parsed into an `uint256[]` and fed to the NOX task as
`args` or as part of the encrypted dataset.

---

### Project layout (frontend)

```
src/
  routes/
    __root.tsx           # global shell + Web3Provider
    index.tsx            # /        — onboarding (Hero, HowItWorks, Features)
    dashboard.tsx        # /dashboard — sidebar + tabs (Dashboard, Deposit, Withdraw, Strategies, History)
  components/
    onboarding/          # Hero, HowItWorks, Features, SiteFooter
    dashboard/           # StatsRow, SharePriceChart, AllocationChart, DepositForm, WithdrawForm, StrategyCards, HistoryTable
    providers/Web3Provider.tsx
  hooks/useVault.ts      # useDeposit, useWithdraw, useVaultStats, useUserPnL, useUsdc
  lib/
    contracts.ts         # addresses + ABI
    wagmi.ts             # wagmi + RainbowKit config
contracts/MetaVault.sol  # ERC-4626-style vault
```
