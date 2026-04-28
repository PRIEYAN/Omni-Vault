import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";
import { useVaultStrategies } from "@/hooks/useVault";

const COLORS = ["#C8102E", "#1A1330", "#F0B0BB", "#9C88FF", "#6BA7FF"];

export function AllocationChart() {
  const { strategies } = useVaultStrategies();
  const data = useMemo(
    () =>
      strategies.map((s, i) => ({
        name: `Strategy ${s.index + 1}`,
        value: s.allocationBps / 100,
        color: COLORS[i % COLORS.length],
      })),
    [strategies],
  );

  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-card">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Strategy Allocation
      </div>

      <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
        <div className="h-48">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={3}
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E6E5EA",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#1A1330",
                    boxShadow: "0 12px 30px -18px rgba(20,18,32,0.25)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No strategies configured on-chain.
            </div>
          )}
        </div>

        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                <span className="text-sm">{d.name}</span>
              </div>
              <span className="font-mono text-sm">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
