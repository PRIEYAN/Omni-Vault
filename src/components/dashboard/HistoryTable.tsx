import { ExternalLink } from "lucide-react";

export type Activity = {
  type: "Deposit" | "Withdraw";
  amount: string;
  date: string;
  hash: string;
  shares?: string;
};

// TODO: read from on-chain events / indexer. Mock for now.
export const MOCK_ACTIVITY: Activity[] = [
  { type: "Deposit", amount: "+1,000.00 USDC", shares: "987.42", date: "2h ago",  hash: "0x84a2…f19b" },
  { type: "Deposit", amount: "+2,500.00 USDC", shares: "2,461.18", date: "1d ago",  hash: "0x12cc…aa90" },
  { type: "Withdraw", amount: "−500.00 USDC", shares: "488.10",  date: "3d ago",  hash: "0xee71…0c44" },
  { type: "Deposit", amount: "+1,500.00 USDC", shares: "1,484.20", date: "1w ago",  hash: "0x55b1…7732" },
  { type: "Deposit", amount: "+500.00 USDC",  shares: "499.10", date: "2w ago",  hash: "0xab09…dd13" },
];

export function HistoryTable({
  rows,
  showFilters = false,
}: {
  rows: Activity[];
  showFilters?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Activity
          </div>
          <div className="mt-1 text-base font-semibold">Recent transactions</div>
        </div>
        {showFilters && (
          <div className="flex gap-1 rounded-lg border border-border bg-background/40 p-1 text-xs">
            {["All", "Deposits", "Withdrawals"].map((f, i) => (
              <button
                key={f}
                className={
                  "rounded-md px-3 py-1.5 font-medium transition-colors " +
                  (i === 0
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-normal">Date</th>
              <th className="px-5 py-3 font-normal">Type</th>
              <th className="px-5 py-3 font-normal">Amount</th>
              <th className="px-5 py-3 font-normal">Shares</th>
              <th className="px-5 py-3 font-normal">Tx</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border/60 transition-colors hover:bg-background/40">
                <td className="px-5 py-3.5 text-muted-foreground">{r.date}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                      (r.type === "Deposit"
                        ? "bg-accent/10 text-accent"
                        : "bg-destructive/10 text-destructive")
                    }
                  >
                    {r.type}
                  </span>
                </td>
                <td className={r.type === "Deposit" ? "px-5 py-3.5 font-mono text-foreground" : "px-5 py-3.5 font-mono text-destructive"}>
                  {r.amount}
                </td>
                <td className="px-5 py-3.5 font-mono text-muted-foreground">{r.shares}</td>
                <td className="px-5 py-3.5">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${r.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline"
                  >
                    {r.hash}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
