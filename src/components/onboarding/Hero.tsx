import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowUpRight, X } from "lucide-react";
import { useState } from "react";
import omniLogo from "@/assets/omni-logo.png";

export function Hero() {
  const [showToast, setShowToast] = useState(true);

  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-background pt-24">
      <div className="relative mx-auto flex max-w-[1400px] flex-col items-center px-6 pt-16 text-center md:pt-24">
        <h1 className="font-display text-foreground leading-[0.84] tracking-[-0.04em]
                       text-[19vw] sm:text-[16vw] md:text-[13vw] lg:text-[11.5vw]
                       max-w-[14ch]">
          YOUR YIELD,
          <br />
          ON-CHAIN.
        </h1>

        <div className="mt-10 md:mt-14">
          <ConnectButton.Custom>
            {({ openConnectModal, account, chain, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <button
                  onClick={openConnectModal}
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-9 py-5
                             text-sm font-bold uppercase tracking-[0.18em] text-background
                             transition-all hover:scale-[1.03] active:scale-[0.98]
                             shadow-[0_10px_30px_-10px_rgba(20,18,32,0.4)]"
                >
                  {connected ? "Enter Vault" : "Get Started"}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>

      {/* Omni-Man logo anchored bottom-center */}
      <div className="relative mx-auto mt-12 flex justify-center md:mt-16">
        <img
          src={omniLogo}
          alt="Omni-Vault — Omni-Man emblem"
          width={1024}
          height={1024}
          className="pointer-events-none w-[58vw] max-w-[420px] select-none drop-shadow-[0_30px_50px_rgba(200,16,46,0.25)]
                     animate-[float_6s_ease-in-out_infinite]"
        />
      </div>

      {/* Right rail */}
      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 hidden md:block">
        <div className="flex h-16 w-9 flex-col items-center justify-center gap-1.5 rounded-full bg-foreground shadow-[0_10px_30px_-10px_rgba(20,18,32,0.5)]">
          <span className="h-1.5 w-1.5 rounded-full bg-background" />
          <span className="h-1.5 w-1.5 rounded-full bg-background/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-background/40" />
        </div>
      </div>

      {/* Updates toast */}
      {showToast && (
        <div className="absolute bottom-5 left-5 z-20 flex items-center gap-3 rounded-full bg-background pl-1.5 pr-3 py-1.5
                        shadow-card border border-border max-w-[92vw]">
          <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
            Updates
          </span>
          <span className="truncate text-xs font-medium text-foreground/80">
            Omni-Vault NOX strategy is now live on Sepolia
          </span>
          <button
            onClick={() => setShowToast(false)}
            className="grid h-5 w-5 place-items-center rounded-full text-foreground/60 hover:bg-muted"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </section>
  );
}
