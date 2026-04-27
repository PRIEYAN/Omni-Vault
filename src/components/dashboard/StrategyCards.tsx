import { ShieldCheck, Sparkles } from "lucide-react";

// TODO: pull live APY/TVL from on-chain strategy adapters + indexer.
const strategies = [
  {
    name: "Aave Lending",
    short: "AAVE",
    apy: "8.4%",
    tvl: "$960K",
    risk: "Low",
    riskTone: "text-emerald-300",
    allocation: 40,
    desc: "Supply USDC to Aave v3 pools for variable-rate yield.",
    confidential: false,
  },
  {
    name: "Compound Finance",
    short: "COMP",
    apy: "7.1%",
    tvl: "$840K",
    risk: "Low",
    riskTone: "text-emerald-300",
    allocation: 35,
    desc: "Lend USDC on Compound v3 with battle-tested risk parameters.",
    confidential: false,
  },
  {
    name: "iExec NOX Confidential",
    short: "NOX",
    apy: "21.6%",
    tvl: "$600K",
    risk: "Med",
    riskTone: "text-amber-300",
    allocation: 25,
    desc: "MEV-resistant strategy executed inside iExec NOX confidential containers.",
    confidential: true,
  },
];

export function StrategyCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {strategies.map((s) => (
        <div
          key={s.name}
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:border-accent/40"
        >
          {s.confidential && (
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-background/40 font-mono text-xs text-accent">
                {s.short}
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight">{s.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Strategy
                </div>
              </div>
            </div>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent">
              {s.apy} APY
            </span>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{s.desc}</p>

          {s.confidential && (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              Confidential Compute
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-sm">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">TVL</div>
              <div className="mt-1 font-mono">{s.tvl}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Risk</div>
              <div className={"mt-1 font-mono " + s.riskTone}>{s.risk}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Alloc</div>
              <div className="mt-1 font-mono">{s.allocation}%</div>
            </div>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${s.allocation}%` }}
            />
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        <Sparkles className="h-5 w-5 text-accent" />
        <div className="mt-3 font-medium text-foreground">AI rebalance</div>
        <p className="mt-1 text-xs">
          ChainGPT scores strategies hourly. Allocations are committed on-chain after a TimelockController
          delay.
        </p>
      </div>
    </div>
  );
}
