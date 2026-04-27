import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
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

const VAULT_DEPLOYED =
  METAVAULT_ADDRESS !== "0x0000000000000000000000000000000000000000";

/* ------------------------------------------------------------------ */
/* Vault stats                                                        */
/* ------------------------------------------------------------------ */
export function useVaultStats() {
  const { address } = useAccount();

  const totalAssets = useReadContract({
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "totalAssets",
    query: { enabled: VAULT_DEPLOYED },
  });

  const sharePrice = useReadContract({
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "sharePrice",
    query: { enabled: VAULT_DEPLOYED },
  });

  const userShares = useReadContract({
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "shares",
    args: address ? [address] : undefined,
    query: { enabled: VAULT_DEPLOYED && !!address },
  });

  const userValue = useReadContract({
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
    address: METAVAULT_ADDRESS,
    abi: METAVAULT_ABI,
    functionName: "depositedAmount",
    args: address ? [address] : undefined,
    query: { enabled: VAULT_DEPLOYED && !!address },
  });

  return useMemo(() => {
    // TODO: replace with real on-chain reads once contract is deployed.
    if (!VAULT_DEPLOYED) {
      const dep = 5000;
      const cur = 5483.21;
      return {
        deposited: dep,
        currentValue: cur,
        pnl: cur - dep,
        pnlPercent: ((cur - dep) / dep) * 100,
        isMock: true,
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
      isMock: false,
    };
  }, [deposited.data, userValue.data]);
}

/* ------------------------------------------------------------------ */
/* USDC balance + allowance                                           */
/* ------------------------------------------------------------------ */
export function useUsdc() {
  const { address } = useAccount();

  const balance = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const allowance = useReadContract({
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
    if (!VAULT_DEPLOYED) {
      toast.error("Vault contract not yet deployed. Update lib/contracts.ts.");
      return;
    }
    try {
      setPending(true);
      const t = toast.loading("Withdrawing…");
      await writeContractAsync({
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
