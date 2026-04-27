import { ShieldCheck, Sparkles, Boxes, KeyRound } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Confidential Execution", body: "Strategy logic runs inside iExec NOX confidential containers — opaque to MEV bots." },
  { icon: Sparkles,    title: "AI Allocation",         body: "ChainGPT continuously evaluates protocols and rebalances for optimal risk-adjusted yield." },
  { icon: Boxes,       title: "ERC-4626 Vault",        body: "Standard share accounting. Composable with the entire DeFi ecosystem." },
  { icon: KeyRound,    title: "Non-Custodial",         body: "You hold the keys. Withdraw your share of the underlying at any time." },
];

export function Features() {
  return (
    <section className="relative bg-background border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-28">
        <div className="mb-16 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Why Omni-Vault
          </div>
          <h2 className="font-display mt-4 text-5xl tracking-tight text-foreground md:text-6xl">
            Built for the
            <br />
            paranoid.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="bg-background p-8 transition-colors hover:bg-card">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-tight text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
