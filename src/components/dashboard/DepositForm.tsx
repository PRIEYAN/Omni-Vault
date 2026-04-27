import { useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { ArrowDownToLine } from "lucide-react";
import { useDeposit, useUsdc } from "@/hooks/useVault";
import { USDC_DECIMALS } from "@/lib/contracts";

export function DepositForm() {
  const { isConnected } = useAccount();
  const { balance } = useUsdc();
  const { deposit, isPending, step } = useDeposit();
  const [amount, setAmount] = useState("");

  const usdcBalance = balance.data ? Number(formatUnits(balance.data as bigint, USDC_DECIMALS)) : 0;
  const num = Number(amount || "0");
  const sharePreview = num > 0 ? (num * 0.987).toFixed(4) : "0.0000";

  const cta =
    step === "approving" ? "Approving USDC…" : step === "depositing" ? "Depositing…" : "Approve & Deposit";

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background/40 text-accent">
          <ArrowDownToLine className="h-4 w-4" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Deposit
          </div>
          <div className="text-base font-semibold">Add USDC to Omni-Vault</div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background/40 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Amount</span>
          <span>
            Balance: <span className="font-mono text-foreground">{usdcBalance.toFixed(2)}</span> USDC
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
          />
          <button
            onClick={() => setAmount(usdcBalance ? usdcBalance.toString() : "")}
            className="rounded-md border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent/40 hover:text-accent"
          >
            Max
          </button>
          <span className="rounded-md border border-border px-3 py-1.5 font-mono text-xs">USDC</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3 text-sm">
        <span className="text-muted-foreground">You will receive</span>
        <span className="font-mono">{sharePreview} mvUSDC</span>
      </div>

      <button
        disabled={!isConnected || !num || isPending}
        onClick={() => deposit(amount)}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isConnected ? cta : "Connect wallet first"}
      </button>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Two-step flow: approve USDC spending, then deposit. ERC-4626 share accounting.
      </p>
    </div>
  );
}
