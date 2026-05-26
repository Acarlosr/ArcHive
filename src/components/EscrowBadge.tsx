"use client";

import type { JobStatus } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

const escrowState: Record<string, { labelKey: string; detailKey: string; tone: string }> = {
  open: {
    labelKey: "escrow.open.label",
    detailKey: "escrow.open.detail",
    tone: "text-arc-cyan border-arc-cyan/25 bg-arc-cyan/10",
  },
  funded: {
    labelKey: "escrow.funded.label",
    detailKey: "escrow.funded.detail",
    tone: "text-arc-green border-arc-green/25 bg-arc-green/10",
  },
  accepted: {
    labelKey: "escrow.accepted.label",
    detailKey: "escrow.accepted.detail",
    tone: "text-blue-300 border-blue-300/25 bg-blue-300/10",
  },
  submitted: {
    labelKey: "escrow.submitted.label",
    detailKey: "escrow.submitted.detail",
    tone: "text-arc-purple border-arc-purple/25 bg-arc-purple/10",
  },
  approved: {
    labelKey: "escrow.approved.label",
    detailKey: "escrow.approved.detail",
    tone: "text-emerald-300 border-emerald-300/25 bg-emerald-300/10",
  },
  paid: {
    labelKey: "escrow.paid.label",
    detailKey: "escrow.paid.detail",
    tone: "text-arc-green border-arc-green/25 bg-arc-green/10",
  },
  completed: {
    labelKey: "escrow.completed.label",
    detailKey: "escrow.completed.detail",
    tone: "text-arc-green border-arc-green/25 bg-arc-green/10",
  },
  refunded: {
    labelKey: "escrow.refunded.label",
    detailKey: "escrow.refunded.detail",
    tone: "text-arc-orange border-arc-orange/25 bg-arc-orange/10",
  },
  expired: {
    labelKey: "escrow.expired.label",
    detailKey: "escrow.expired.detail",
    tone: "text-arc-dim border-arc-dim/25 bg-arc-dim/10",
  },
};

export function EscrowBadge({ amount, status }: { amount: string; status: JobStatus | string }) {
  const { t } = useLanguage();
  const state = escrowState[status] ?? escrowState.open;

  return (
    <div className={`rounded-lg border p-4 ${state.tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-display font-semibold text-arc-text">{t(state.labelKey)}</div>
          <p className="mt-1 text-xs text-arc-muted">{t(state.detailKey)}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-display font-bold">{amount}</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">USDC</div>
        </div>
      </div>
    </div>
  );
}
