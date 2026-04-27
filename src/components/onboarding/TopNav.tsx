import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "@tanstack/react-router";
import omniLogo from "@/assets/omni-logo.png";

export function TopNav() {
  return (
    <header className="fixed inset-x-0 top-4 z-30 px-4">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-full
                      border border-border bg-background/90 px-3 py-2 backdrop-blur-md
                      shadow-[0_8px_30px_-10px_rgba(20,18,32,0.15)]">
        <Link to="/" className="flex items-center gap-2 pl-1">
          <img src={omniLogo} alt="Omni-Vault" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="font-display text-lg leading-none tracking-tight text-foreground">
            Omni
            <span className="text-foreground/40">·</span>
            Vault
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "Strategies", href: "#strategies" },
            { label: "How it works", href: "#how" },
            { label: "Docs", href: "#docs" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ConnectButton.Custom>
            {({ openConnectModal, account, chain, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <button
                  onClick={openConnectModal}
                  className="rounded-full bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-background
                             transition-all hover:scale-[1.03] active:scale-[0.98]"
                >
                  {connected ? "Open App" : "Get Started"}
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
