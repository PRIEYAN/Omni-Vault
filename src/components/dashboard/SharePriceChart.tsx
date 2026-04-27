import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// TODO: replace with on-chain historical share-price data once vault is deployed.
const data = Array.from({ length: 30 }, (_, i) => {
  const base = 1 + i * 0.0042;
  const noise = Math.sin(i / 3) * 0.004;
  return {
    day: `D${i + 1}`,
    price: +(base + noise).toFixed(4),
  };
});

const RED = "#C8102E";
const INK = "#1A1330";
const MUTED = "#7A7585";

export function SharePriceChart() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5 shadow-card">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Share Price (USDC)
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">
            ${data[data.length - 1].price.toFixed(4)}
          </div>
        </div>
        <div className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
          +12.8% APY
        </div>
      </div>
      <div className="mt-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={RED} stopOpacity={0.35} />
                <stop offset="95%" stopColor={RED} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={MUTED} fontSize={10} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E6E5EA",
                borderRadius: 10,
                fontSize: 12,
                color: INK,
                boxShadow: "0 12px 30px -18px rgba(20,18,32,0.25)",
              }}
              labelStyle={{ color: MUTED }}
            />
            <Area type="monotone" dataKey="price" stroke={RED} strokeWidth={2.4} fill="url(#spArea)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
