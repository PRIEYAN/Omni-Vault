import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ArrowUpFromLine } from "lucide-react";
import { useUserPnL, useVaultStats, useWithdraw } from "@/hooks/useVault";
import { formatUnits, parseUnits } from "viem";
import { USDC_DECIMALS } from "@/lib/contracts";

export function WithdrawForm() {
  const { isConnected } = useAccount();
  const { userShares } = useVaultStats();
  const pnl = useUserPnL();
  const { withdraw, pending } = useWithdraw();

  const sharesBig = (userShares.data as bigint | undefined) ?? 0n;
  const sharesNum = Number(formatUnits(sharesBig, USDC_DECIMALS)) || (pnl.isMock ? 5483.21 : 0);

  const [percent, setPercent] = useState(50);

  const sharesToBurn = useMemo(() => (sharesNum * percent) / 100, [sharesNum, percent]);
  const usdcOut = useMemo(() => (pnl.currentValue * percent) / 100, [pnl.currentValue, percent]);
  const profitOut = useMemo(() => (pnl.pnl * percent) / 100, [pnl.pnl, percent]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background/40 text-accent">
          <ArrowUpFromLine className="h-4 w-4" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Withdraw
          </div>
          <div className="text-base font-semibold">Redeem vault shares</div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background/40 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Shares to redeem</span>
          <span className="font-mono">{sharesToBurn.toFixed(4)} mvUSDC</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <div className="text-3xl font-semibold tracking-tight">{percent}%</div>
          <div className="text-xs text-muted-foreground">of position</div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={percent}
          onChange={(e) => setPercent(Number(e.target.value))}
          className="mt-4 w-full accent-[#C8102E]"
        />
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background/40 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            You receive
          </div>
          <div className="mt-1 font-mono text-base">${usdcOut.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-border bg-background/40 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Profit
          </div>
          <div className={"mt-1 font-mono text-base " + (profitOut >= 0 ? "text-accent" : "text-destructive")}>
            {profitOut >= 0 ? "+" : ""}${profitOut.toFixed(2)}
          </div>
        </div>
      </div>

      <button
        disabled={!isConnected || pending || percent === 0}
        onClick={() => {
          const burn = (sharesBig * BigInt(percent)) / 100n;
          if (burn === 0n) {
            // mock path
            withdraw(parseUnits(sharesToBurn.toFixed(6), USDC_DECIMALS));
          } else {
            withdraw(burn);
          }
        }}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!isConnected ? "Connect wallet first" : pending ? "Withdrawing…" : "Confirm withdrawal"}
      </button>
    </div>
  );
}
