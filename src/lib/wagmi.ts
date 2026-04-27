import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, mainnet } from "wagmi/chains";
import { http } from "viem";

// NOTE: Replace with your own WalletConnect Cloud projectId in production.
// A placeholder works for local development with injected wallets only.
export const wagmiConfig = getDefaultConfig({
  appName: "MetaVault",
  projectId: "metavault-demo-projectid",
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});
