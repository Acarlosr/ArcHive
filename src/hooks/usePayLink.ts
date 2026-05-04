// src/hooks/usePayLink.ts
// Hook that handles the full payment flow for /pay/[id]:
// 1. Load link data from DB
// 2. Execute spend() via Arc Unified Balance
// 3. Mark link as paid in DB

import { useState, useEffect } from "react";
import { useWalletClient } from "wagmi";
import { getLinkById, markLinkPaid, type PayLink } from "@/lib/db/links";
import { spendFromUnifiedBalance } from "@/lib/arc/unifiedBalance";

type PayStatus =
  | "idle"
  | "loading-link"
  | "ready"
  | "bridging"
  | "spending"
  | "confirming"
  | "success"
  | "error"
  | "already-paid";

interface UsePayLinkResult {
  link: PayLink | null;
  status: PayStatus;
  txHash: string | null;
  explorerUrl: string | null;
  error: string | null;
  pay: () => Promise<void>;
}

export function usePayLink(linkId: string): UsePayLinkResult {
  const { data: walletClient } = useWalletClient();
  const [link, setLink] = useState<PayLink | null>(null);
  const [status, setStatus] = useState<PayStatus>("loading-link");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load link on mount
  useEffect(() => {
    if (!linkId) return;
    setStatus("loading-link");

    getLinkById(linkId)
      .then((data) => {
        if (!data) {
          setError("Link not found");
          setStatus("error");
          return;
        }
        if (data.status === "paid") {
          setLink(data);
          setTxHash(data.tx_hash);
          setExplorerUrl(data.explorer_url);
          setStatus("already-paid");
          return;
        }
        if (data.expiry && new Date(data.expiry) < new Date()) {
          setLink(data);
          setError("This payment link has expired");
          setStatus("error");
          return;
        }
        setLink(data);
        setStatus("ready");
      })
      .catch(() => {
        setError("Failed to load payment link");
        setStatus("error");
      });
  }, [linkId]);

  // Execute payment
  const pay = async () => {
    if (!link || !walletClient) return;

    setError(null);

    try {
      // Step 1: bridging indicator
      setStatus("bridging");
      await new Promise((r) => setTimeout(r, 500)); // let UI update

      // Step 2: execute spend via Arc App Kit
      setStatus("spending");
      const result = await spendFromUnifiedBalance({
        walletClient,
        amount: link.amount,
        recipientAddress: link.recipient_wallet,
        feeRecipient: process.env.NEXT_PUBLIC_FEE_RECIPIENT,
        feeBps: 50,
      });

      // Step 3: confirm
      setStatus("confirming");
      setTxHash(result.txHash);
      setExplorerUrl(result.explorerUrl);

      // Step 4: persist to DB
      await markLinkPaid(link.id, result.txHash, result.explorerUrl);

      setStatus("success");
    } catch (err: any) {
      setError(err?.message ?? "Payment failed. Please try again.");
      setStatus("error");
    }
  };

  return { link, status, txHash, explorerUrl, error, pay };
}
