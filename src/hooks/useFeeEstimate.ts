// src/hooks/useFeeEstimate.ts
// Debounced fee estimation hook — shows real Arc fee breakdown in the UI
// before the user confirms payment.

import { useState, useEffect, useRef } from "react";
import { useWalletClient } from "wagmi";
import { estimateSpend, type SpendEstimate } from "@/lib/arc/unifiedBalance";

interface UseFeeEstimateParams {
  amount: string;
  recipientAddress: string;
  enabled?: boolean;
}

interface UseFeeEstimateResult {
  estimate: SpendEstimate | null;
  isLoading: boolean;
  error: string | null;
}

export function useFeeEstimate({
  amount,
  recipientAddress,
  enabled = true,
}: UseFeeEstimateParams): UseFeeEstimateResult {
  const { data: walletClient } = useWalletClient();
  const [estimate, setEstimate] = useState<SpendEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !walletClient || !amount || !recipientAddress) {
      setEstimate(null);
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setEstimate(null);
      return;
    }

    // Debounce 600ms so we don't hammer the SDK on every keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await estimateSpend({
          walletClient,
          amount,
          recipientAddress,
          feeRecipient: process.env.NEXT_PUBLIC_FEE_RECIPIENT,
          feeBps: 50, // 0.5%
        });
        setEstimate(result);
      } catch (err: any) {
        setError(err?.message ?? "Failed to estimate fees");
        setEstimate(null);
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [amount, recipientAddress, walletClient, enabled]);

  return { estimate, isLoading, error };
}
