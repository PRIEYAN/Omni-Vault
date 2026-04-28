import { ShieldCheck, Sparkles } from "lucide-react";
import { formatUnits } from "viem";
import { useVaultStrategies } from "@/hooks/useVault";
import { USDC_DECIMALS } from "@/lib/contracts";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function StrategyCards() {
  const { strategies, loading } = useVaultStrategies();

  if (!loading && strategies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        No strategies are configured on-chain for this vault yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {strategies.map((s) => (
        <div
          key={s.address}
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:border-accent/40"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-background/40 font-mono text-xs text-accent">
                S{s.index + 1}
              </div>
              <div>
                <div className="text-base font-semibold tracking-tight">Strategy {s.index + 1}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {shortAddress(s.address)}
                </div>
              </div>
            </div>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent">
              {(s.allocationBps / 100).toFixed(2)}% Alloc
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 text-sm">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Assets</div>
              <div className="mt-1 font-mono">
                {Number(formatUnits(s.totalAssets, USDC_DECIMALS)).toFixed(2)} USDC
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Chain</div>
              <div className="mt-1 font-mono">Sepolia</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Alloc</div>
              <div className="mt-1 font-mono">{(s.allocationBps / 100).toFixed(2)}%</div>
            </div>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${s.allocationBps / 100}%` }}
            />
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <ShieldCheck className="h-4 w-4 text-accent" />
        </div>
        <div className="mt-3 font-medium text-foreground">AI rebalance</div>
        <p className="mt-1 text-xs">
          Allocations shown above are pulled from on-chain storage. APY history is omitted until an indexer is
          connected.
        </p>
      </div>
    </div>
  );
}
