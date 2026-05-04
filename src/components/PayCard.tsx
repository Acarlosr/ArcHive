"use client";
// src/components/PayCard.tsx
// The public-facing payment card shown on /pay/[id].
// Handles wallet connection, fee estimation, and the spend() call.

import { useAccount } from "wagmi";
import { usePayLink } from "@/hooks/usePayLink";
import { useFeeEstimate } from "@/hooks/useFeeEstimate";
import { FeeBreakdown } from "./FeeBreakdown";
import { TxStatus } from "./TxStatus";
import { WalletConnectCTA } from "@/components/WalletConnectCTA";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";

interface PayCardProps {
  linkId: string;
}

const STATUS_MESSAGES: Record<string, { title: string; sub: string }> = {
  bridging: {
    title: "Bridging via Circle CCTP…",
    sub: "Moving USDC cross-chain",
  },
  spending: {
    title: "Executing spend()…",
    sub: "Settling on Arc Testnet via Unified Balance",
  },
  confirming: {
    title: "Confirming on Arc…",
    sub: "Sub-second finality",
  },
  success: {
    title: "Payment complete ✓",
    sub: "USDC sent via Arc Unified Balance",
  },
  error: {
    title: "Something went wrong",
    sub: "Please try again",
  },
};

export function PayCard({ linkId }: PayCardProps) {
  return (
    <WalletProviderIsland>
      <PayCardInner linkId={linkId} />
    </WalletProviderIsland>
  );
}

function PayCardInner({ linkId }: PayCardProps) {
  const { isConnected } = useAccount();
  const { link, status, txHash, explorerUrl, error, pay } =
    usePayLink(linkId);

  const { estimate, isLoading: estimatingFees } = useFeeEstimate({
    amount: link?.amount ?? "0",
    recipientAddress: link?.recipient_wallet ?? "",
    enabled: !!link && status === "ready" && isConnected,
  });

  // ── Loading link ──
  if (status === "loading-link") {
    return (
      <div className="flex items-center justify-center py-16 text-[#8fa8c0] text-sm">
        Loading payment link…
      </div>
    );
  }

  // ── Not found / expired ──
  if (status === "error" && !link) {
    return (
      <div className="text-center py-12">
        <div className="text-3xl mb-3">🔗</div>
        <div className="text-[#e8f0f8] font-semibold mb-1">Link not found</div>
        <div className="text-sm text-[#8fa8c0]">{error}</div>
      </div>
    );
  }

  // ── Already paid ──
  if (status === "already-paid") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0a1a12] border border-[#00e5a0]/20">
          <div className="w-8 h-8 rounded-full bg-[#00e5a0]/10 border border-[#00e5a0]/30 flex items-center justify-center text-[#00e5a0]">
            ✓
          </div>
          <div>
            <div className="font-semibold text-[#00e5a0] text-sm">
              Already paid
            </div>
            <div className="text-xs text-[#8fa8c0]">
              ${link?.amount} USDC was sent successfully
            </div>
          </div>
        </div>
        {txHash && (
          <a
            href={explorerUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs font-mono text-[#00d4ff] hover:underline"
          >
            View on Arc Explorer →
          </a>
        )}
      </div>
    );
  }

  // ── TX in progress / success / error ──
  if (["bridging", "spending", "confirming", "success", "error"].includes(status)) {
    return (
      <TxStatus
        status={status as any}
        title={STATUS_MESSAGES[status]?.title ?? ""}
        sub={
          status === "success"
            ? `$${link?.amount} USDC sent to ${link?.recipient_wallet.slice(0, 6)}…${link?.recipient_wallet.slice(-4)}`
            : STATUS_MESSAGES[status]?.sub ?? ""
        }
        txHash={txHash}
        explorerUrl={explorerUrl}
        error={error}
      />
    );
  }

  // ── Ready to pay ──
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="text-3xl font-bold tracking-tight">
          ${link?.amount}{" "}
          <span className="text-[#8fa8c0] text-xl font-normal">USDC</span>
        </div>
        <div className="text-sm text-[#8fa8c0] mt-1">{link?.description}</div>
      </div>

      <div className="h-px bg-[#1e2d40]" />

      {/* Wallet connect */}
      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-[#8fa8c0]">
            Connect your wallet to pay from any supported chain.
          </p>
          <WalletConnectCTA />
        </div>
      ) : (
        <>
          {/* Fee breakdown */}
          <FeeBreakdown
            amount={link?.amount ?? "0"}
            estimate={estimate}
            isLoading={estimatingFees}
          />

          {/* Pay button */}
          <button
            onClick={pay}
            disabled={estimatingFees}
            className="w-full py-3.5 bg-[#00d4ff] text-[#080c10] rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-white hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Pay via Arc Unified Balance</span>
            <span>→</span>
          </button>

          <p className="text-xs text-center text-[#4d6a85]">
            Funds settle directly to the recipient's wallet on Arc Testnet
          </p>
        </>
      )}

      {/* Accepted chains */}
      {link?.accepted_chains && link.accepted_chains.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#4d6a85] font-mono">Accepts from:</span>
          {link.accepted_chains.map((c) => (
            <span
              key={c}
              className="text-xs font-mono bg-[#141c26] border border-[#1e2d40] rounded px-2 py-0.5 text-[#8fa8c0]"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
