import { Wallet, ArrowDownToLine, TrendingUp } from "lucide-react";

const steps = [
  { n: "01", icon: Wallet,         title: "Connect Wallet", body: "Use any EVM wallet via RainbowKit. Non-custodial — you always hold your keys." },
  { n: "02", icon: ArrowDownToLine, title: "Deposit USDC",   body: "Mint vault shares (ERC-4626 style). One transaction. Withdraw any time." },
  { n: "03", icon: TrendingUp,      title: "Earn Yield",     body: "ChainGPT picks the allocation. iExec NOX executes it confidentially. You collect." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative bg-card border-t border-border">
      <div className="mx-auto max-w-[1400px] px-6 py-28">
        <div className="mb-16 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            How it works
          </div>
          <h2 className="font-display mt-4 text-5xl tracking-tight text-foreground md:text-6xl">
            Three steps.
            <br />
            That's it.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group relative rounded-3xl border border-border bg-background p-8 transition-all
                         hover:-translate-y-1 hover:shadow-card"
            >
              <div className="font-mono text-xs text-muted-foreground">{s.n}</div>
              <s.icon className="mt-8 h-8 w-8 text-accent" strokeWidth={1.5} />
              <h3 className="mt-6 text-2xl font-bold tracking-tight text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
