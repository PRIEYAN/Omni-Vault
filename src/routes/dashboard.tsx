import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { sepolia } from "wagmi/chains";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Layers,
  LogOut,
  Wallet,
} from "lucide-react";

import { StatsRow } from "@/components/dashboard/StatsRow";
import { SharePriceChart } from "@/components/dashboard/SharePriceChart";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { DepositForm } from "@/components/dashboard/DepositForm";
import { WithdrawForm } from "@/components/dashboard/WithdrawForm";
import { StrategyCards } from "@/components/dashboard/StrategyCards";
import { HistoryTable } from "@/components/dashboard/HistoryTable";
import { useUserPnL, useVaultActivity, useVaultStats } from "@/hooks/useVault";
import { USDC_DECIMALS } from "@/lib/contracts";
import omniLogo from "@/assets/omni-logo.png";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type Tab = "dashboard" | "deposit" | "withdraw" | "strategies" | "history";

const NAV: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { id: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { id: "strategies", label: "Strategies", icon: Layers },
  { id: "history", label: "History", icon: History },
];

function shorten(addr?: string) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function DashboardPage() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const walletBalance = useBalance({
    address,
    chainId: sepolia.id,
    query: { enabled: !!address },
  });
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const pnl = useUserPnL();
  const { sharePrice } = useVaultStats();
  const { rows: activityRows } = useVaultActivity();

  const activity = useMemo(
    () =>
      activityRows.map((row) => ({
        type: row.type,
        amount: `${row.type === "Deposit" ? "+" : "-"}${Number(
          formatUnits(row.amount, USDC_DECIMALS),
        ).toFixed(2)} USDC`,
        shares: Number(formatUnits(row.shares, USDC_DECIMALS)).toFixed(4),
        date: new Date(row.timestampMs).toLocaleString(),
        hash: row.hash,
      })),
    [activityRows],
  );

  const sharePriceValue = sharePrice.data
    ? Number(formatUnits(sharePrice.data as bigint, 18)).toFixed(4)
    : "0.0000";

  // Protect route — bounce back to onboarding if not connected.
  // Wait one tick so wagmi hydrates connector state before redirecting.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!isConnected) navigate({ to: "/" });
    }, 400);
    return () => clearTimeout(t);
  }, [isConnected, navigate]);

  const stats = useMemo(
    () => [
      { label: "Total Deposited", value: `$${pnl.deposited.toFixed(2)}`, hint: "USDC" },
      { label: "Current Value", value: `$${pnl.currentValue.toFixed(2)}`, hint: "Live" },
      {
        label: "Profit & Loss",
        value: `${pnl.pnl >= 0 ? "+" : ""}$${pnl.pnl.toFixed(2)}`,
        delta: `${pnl.pnlPercent >= 0 ? "+" : ""}${pnl.pnlPercent.toFixed(2)}%`,
        deltaTone: (pnl.pnl >= 0 ? "up" : "down") as "up" | "down",
      },
      { label: "Share Price", value: `$${sharePriceValue}`, hint: "mvUSDC" },
      { label: "APY (30d)", value: "N/A", hint: "Needs indexer" },
    ],
    [pnl, sharePriceValue],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
          <Link to="/" className="flex items-center gap-2 px-5 py-5">
            <img src={omniLogo} alt="Omni-Vault" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-display text-base leading-none tracking-tight">Omni-Vault</span>
          </Link>

          <div className="px-3 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Vault
          </div>
          <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
            {NAV.map((n) => {
              const active = tab === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className={
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors " +
                    (active
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-card hover:text-foreground")
                  }
                >
                  <n.icon className="h-4 w-4" strokeWidth={1.6} />
                  {n.label}
                </button>
              );
            })}
          </nav>

          <div className="m-3 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
              iExec NOX
            </div>
            <p className="mt-1 leading-relaxed">
              Strategy execution runs inside confidential containers. Decisions by ChainGPT.
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="flex items-center justify-between border-b border-border bg-background/80 px-5 py-3 backdrop-blur md:px-8">
            <div className="md:hidden">
              <Link to="/" className="font-mono text-sm uppercase tracking-widest">
                Omni-Vault
              </Link>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {NAV.find((n) => n.id === tab)?.label}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm">Omni-Vault v1</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {chain?.name ?? "Sepolia"}
              </span>

              {isConnected ? (
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                  <span className="font-mono text-xs text-muted-foreground">
                    {walletBalance.data
                      ? `${Number(walletBalance.data.formatted).toFixed(4)} ${walletBalance.data.symbol}`
                      : "0.0000 ETH"}
                  </span>
                  <Wallet className="h-3.5 w-3.5 text-accent" />
                  <span className="font-mono text-xs">{shorten(address)}</span>
                  <button
                    aria-label="Disconnect"
                    onClick={() => disconnect()}
                    className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <ConnectButton showBalance={false} chainStatus="none" />
              )}
            </div>
          </header>

          {/* Mobile tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 md:hidden">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium " +
                  (tab === n.id
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground")
                }
              >
                {n.label}
              </button>
            ))}
          </div>

          <main className="flex-1 px-5 py-6 md:px-8 md:py-8">
            {tab === "dashboard" && (
              <div className="space-y-6">
                <StatsRow stats={stats} />
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <SharePriceChart />
                  </div>
                  <AllocationChart />
                </div>
                <HistoryTable rows={activity} />
              </div>
            )}

            {tab === "deposit" && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <DepositForm />
                </div>
                <AllocationChart />
              </div>
            )}

            {tab === "withdraw" && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <WithdrawForm />
                </div>
                <SharePriceChart />
              </div>
            )}

            {tab === "strategies" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Strategies</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Active vault allocations. Rebalanced by ChainGPT, executed on iExec NOX.
                  </p>
                </div>
                <StrategyCards />
              </div>
            )}

            {tab === "history" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Transaction history</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All your deposits and withdrawals on Sepolia.
                  </p>
                </div>
                <HistoryTable rows={activity} showFilters />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
