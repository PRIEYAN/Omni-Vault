import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import "@rainbow-me/rainbowkit/styles.css";

import { wagmiConfig } from "@/lib/wagmi";

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#1A1330",
            accentColorForeground: "#FFFFFF",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                color: "#1A1330",
                border: "1px solid #E6E5EA",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                boxShadow: "0 12px 30px -18px rgba(20,18,32,0.25)",
              },
              success: { iconTheme: { primary: "#C8102E", secondary: "#FFFFFF" } },
              error: { iconTheme: { primary: "#C8102E", secondary: "#FFFFFF" } },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
