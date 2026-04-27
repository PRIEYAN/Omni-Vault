import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

type Stat = {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  hint?: string;
  icon?: LucideIcon;
};

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-accent/30"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {s.label}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
            {s.delta && (
              <span
                className={
                  "inline-flex items-center gap-0.5 text-xs font-medium " +
                  (s.deltaTone === "up"
                    ? "text-accent"
                    : s.deltaTone === "down"
                      ? "text-destructive"
                      : "text-muted-foreground")
                }
              >
                {s.deltaTone === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : s.deltaTone === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {s.delta}
              </span>
            )}
          </div>
          {s.hint && (
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.hint}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
