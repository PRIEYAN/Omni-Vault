import omniLogo from "@/assets/omni-logo.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 px-6 py-16 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <img src={omniLogo} alt="Omni-Vault" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="font-display text-2xl tracking-tight text-foreground">Omni-Vault</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Confidential, AI-allocated DeFi yield. Built on iExec NOX. Powered by ChainGPT.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-10 text-sm">
          {[
            { title: "Product", links: ["Vault", "Strategies", "Docs"] },
            { title: "Develop", links: ["Contracts", "GitHub", "Audit"] },
            { title: "Connect", links: ["Discord", "Twitter", "Mirror"] },
          ].map((g) => (
            <div key={g.title}>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {g.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-foreground/80 hover:text-accent">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>© Omni-Vault Labs</span>
          <span>Built on iExec NOX · Powered by ChainGPT</span>
        </div>
      </div>
    </footer>
  );
}
