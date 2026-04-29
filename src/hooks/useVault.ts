import { sepolia } from "wagmi/chains";
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  METAVAULT_ABI,
  METAVAULT_ADDRESS,
  ERC20_ABI,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/contracts";
import { usePublicClient } from "wagmi";
import { Address } from "viem";

const VAULT_DEPLOYED =
  METAVAULT_ADDRESS !== "0x0000000000000000000000000000000000000000";
const EXPECTED_CHAIN_ID = sepolia.id;

/* ------------------------------------------------------------------ */
/* Vault stats                                                        */
/* ------------------------------------------------------------------ */
export function useVaultStats() {
  const { address } = useAccount();

  const totalAssets = useReadContract({
    chainId: EXPECTED_CHAIN_ID,
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "totalAssets",
    query: { enabled: VAULT_DEPLOYED },
  });

  const sharePrice = useReadContract({
    chainId: EXPECTED_CHAIN_ID,
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "sharePrice",
    query: { enabled: VAULT_DEPLOYED },
  });

  const userShares = useReadContract({
    chainId: EXPECTED_CHAIN_ID,
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "shares",
    args: address ? [address] : undefined,
    query: { enabled: VAULT_DEPLOYED && !!address },
  });

  const userValue = useReadContract({
    chainId: EXPECTED_CHAIN_ID,
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "getUserValue",
    args: address ? [address] : undefined,
    query: { enabled: VAULT_DEPLOYED && !!address },
  });

  return { totalAssets, sharePrice, userShares, userValue };
}

/* ------------------------------------------------------------------ */
/* User PnL                                                           */
/* ------------------------------------------------------------------ */
export function useUserPnL() {
  const { address } = useAccount();
  const { userValue } = useVaultStats();

  const deposited = useReadContract({
    chainId: EXPECTED_CHAIN_ID,
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "depositedAmount",
    args: address ? [address] : undefined,
    query: { enabled: VAULT_DEPLOYED && !!address },
  });

  return useMemo(() => {
    if (!VAULT_DEPLOYED) {
      return {
        deposited: 0,
        currentValue: 0,
        pnl: 0,
        pnlPercent: 0,
      };
    }
    const dep = deposited.data ? Number(formatUnits(deposited.data as bigint, USDC_DECIMALS)) : 0;
    const cur = userValue.data ? Number(formatUnits(userValue.data as bigint, USDC_DECIMALS)) : 0;
    const pnl = cur - dep;
    return {
      deposited: dep,
      currentValue: cur,
      pnl,
      pnlPercent: dep > 0 ? (pnl / dep) * 100 : 0,
    };
  }, [deposited.data, userValue.data]);
}

export type VaultActivity = {
  type: "Deposit" | "Withdraw";
  amount: bigint;
  shares: bigint;
  hash: `0x${string}`;
  timestampMs: number;
};

export function useVaultActivity() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: EXPECTED_CHAIN_ID });
  const [rows, setRows] = useState<VaultActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      if (!address || !VAULT_DEPLOYED || !publicClient) {
        setRows([]);
        return;
      }
      setLoading(true);
      try {
        // Fetching from block 0 can be slow / unreliable on some RPCs.
        // We only need recent activity for the UI.
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock > 50000n ? latestBlock - 50000n : 0n;
        const userLower = address.toLowerCase();

        const [depositLogs, withdrawLogs] = await Promise.all([
          publicClient.getLogs({
            address: METAVAULT_ADDRESS,
            event: {
              type: "event",
              name: "Deposit",
              inputs: [
                { type: "address", name: "user", indexed: true },
                { type: "uint256", name: "amount" },
                { type: "uint256", name: "shares" },
              ],
            },
            // Don't rely on args filtering via RPC; filter locally to avoid silent mismatches.
            fromBlock,
            toBlock: "latest",
          }),
          publicClient.getLogs({
            address: METAVAULT_ADDRESS,
            event: {
              type: "event",
              name: "Withdraw",
              inputs: [
                { type: "address", name: "user", indexed: true },
                { type: "uint256", name: "shares" },
                { type: "uint256", name: "amount" },
              ],
            },
            fromBlock,
            toBlock: "latest",
          }),
        ]);

        // Filter logs locally by user address (RPC-side args filters are not always consistent).
        const depositLogsForUser = depositLogs.filter((log) => (log.args as any).user?.toLowerCase?.() === userLower);
        const withdrawLogsForUser = withdrawLogs.filter((log) => (log.args as any).user?.toLowerCase?.() === userLower);

        const rowsWithBlocks = await Promise.all(
          [...depositLogsForUser, ...withdrawLogsForUser].map(async (log) => {
            const block =
              log.blockHash != null
                ? await publicClient.getBlock({ blockHash: log.blockHash })
                : await publicClient.getBlock({ blockNumber: log.blockNumber! });

            if (log.eventName === "Deposit") {
              return {
                type: "Deposit" as const,
                amount: log.args.amount as bigint,
                shares: log.args.shares as bigint,
                hash: log.transactionHash!,
                timestampMs: Number(block.timestamp) * 1000,
              };
            }
            return {
              type: "Withdraw" as const,
              amount: log.args.amount as bigint,
              shares: log.args.shares as bigint,
              hash: log.transactionHash!,
              timestampMs: Number(block.timestamp) * 1000,
            };
          }),
        );

        rowsWithBlocks.sort((a, b) => b.timestampMs - a.timestampMs);
        if (!isCancelled) setRows(rowsWithBlocks);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("useVaultActivity: failed to load logs", e);
        if (!isCancelled) setRows([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [address, publicClient]);

  return { rows, loading };
}

const STRATEGY_ABI = [
  {
    type: "function",
    name: "totalAssets",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export type StrategySnapshot = {
  index: number;
  address: Address;
  allocationBps: number;
  totalAssets: bigint;
};

export function useVaultStrategies() {
  const publicClient = usePublicClient({ chainId: EXPECTED_CHAIN_ID });
  const [strategies, setStrategies] = useState<StrategySnapshot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!VAULT_DEPLOYED || !publicClient) return;
      setLoading(true);
      try {
        const next: StrategySnapshot[] = [];
        for (let i = 0; i < 10; i++) {
          try {
            const [strategyAddress, allocationRaw] = await Promise.all([
              publicClient.readContract({
                address: METAVAULT_ADDRESS,
                abi: METAVAULT_ABI,
                functionName: "strategies",
                args: [BigInt(i)],
              }),
              publicClient.readContract({
                address: METAVAULT_ADDRESS,
                abi: METAVAULT_ABI,
                functionName: "allocations",
                args: [BigInt(i)],
              }),
            ]);
            const totalAssets = (await publicClient.readContract({
              address: strategyAddress as Address,
              abi: STRATEGY_ABI,
              functionName: "totalAssets",
            })) as bigint;

            next.push({
              index: i,
              address: strategyAddress as Address,
              allocationBps: Number(allocationRaw),
              totalAssets,
            });
          } catch {
            break;
          }
        }
        if (!cancelled) setStrategies(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [publicClient]);

  return { strategies, loading };
}

/* ------------------------------------------------------------------ */
/* USDC balance + allowance                                           */
/* ------------------------------------------------------------------ */
export function useUsdc() {
  const { address } = useAccount();

  const balance = useReadContract({
    chainId: EXPECTED_CHAIN_ID,
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const allowance = useReadContract({
    chainId: EXPECTED_CHAIN_ID,
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, METAVAULT_ADDRESS] : undefined,
    query: { enabled: !!address && VAULT_DEPLOYED },
  });

  return { balance, allowance };
}

/* ------------------------------------------------------------------ */
/* Deposit (approve -> deposit)                                       */
/* ------------------------------------------------------------------ */
export function useDeposit() {
  const chainId = useChainId();
  const { allowance, balance } = useUsdc();
  const [step, setStep] = useState<"idle" | "approving" | "depositing">("idle");
  const { writeContractAsync, data: hash, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (receipt.isSuccess && hash) {
      toast.success(`Confirmed: ${hash.slice(0, 10)}…`);
      setStep("idle");
      reset();
      balance.refetch();
      allowance.refetch();
    }
  }, [receipt.isSuccess, hash, reset, balance, allowance]);

  async function deposit(amountStr: string) {
    if (chainId !== EXPECTED_CHAIN_ID) {
      toast.error("Wrong network: switch wallet to Ethereum Sepolia.");
      return;
    }
    if (!VAULT_DEPLOYED) {
      toast.error("Vault contract not yet deployed. Update lib/contracts.ts.");
      return;
    }
    try {
      const amount = parseUnits(amountStr, USDC_DECIMALS);
      const current = (allowance.data as bigint | undefined) ?? 0n;
      if (current < amount) {
        setStep("approving");
        const t = toast.loading("Approve USDC…");
        await writeContractAsync({
          chainId: EXPECTED_CHAIN_ID,
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [METAVAULT_ADDRESS, amount],
        });
        toast.dismiss(t);
        toast.success("USDC approved");
      }
      setStep("depositing");
      const t2 = toast.loading("Depositing…");
      await writeContractAsync({
        chainId: EXPECTED_CHAIN_ID,
        address: METAVAULT_ADDRESS,
        abi: METAVAULT_ABI,
        functionName: "deposit",
        args: [amount],
      });
      toast.dismiss(t2);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      toast.error(msg.slice(0, 80));
      setStep("idle");
    }
  }

  return { deposit, step, hash, isPending: step !== "idle" };
}

/* ------------------------------------------------------------------ */
/* Withdraw                                                           */
/* ------------------------------------------------------------------ */
export function useWithdraw() {
  const chainId = useChainId();
  const [pending, setPending] = useState(false);
  const { writeContractAsync, data: hash, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (receipt.isSuccess && hash) {
      toast.success(`Withdrawn: ${hash.slice(0, 10)}…`);
      setPending(false);
      reset();
    }
  }, [receipt.isSuccess, hash, reset]);

  async function withdraw(shareAmount: bigint) {
    if (chainId !== EXPECTED_CHAIN_ID) {
      toast.error("Wrong network: switch wallet to Ethereum Sepolia.");
      return;
    }
    if (!VAULT_DEPLOYED) {
      toast.error("Vault contract not yet deployed. Update lib/contracts.ts.");
      return;
    }
    try {
      setPending(true);
      const t = toast.loading("Withdrawing…");
      await writeContractAsync({
        chainId: EXPECTED_CHAIN_ID,
        address: METAVAULT_ADDRESS,
        abi: METAVAULT_ABI,
        functionName: "withdraw",
        args: [shareAmount],
      });
      toast.dismiss(t);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      toast.error(msg.slice(0, 80));
      setPending(false);
    }
  }

  return { withdraw, pending, hash };
}
