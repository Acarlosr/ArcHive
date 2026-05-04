import type { JobStatus } from "@/lib/demoData";

const escrowState: Record<string, { label: string; detail: string; tone: string }> = {
  open: {
    label: "Escrow not funded",
    detail: "USDC budget is declared. Client can fund from Unified Balance.",
    tone: "text-arc-cyan border-arc-cyan/25 bg-arc-cyan/10",
  },
  funded: {
    label: "Escrow funded",
    detail: "USDC is locked against this job on Arc Testnet.",
    tone: "text-arc-green border-arc-green/25 bg-arc-green/10",
  },
  accepted: {
    label: "Agent accepted",
    detail: "Provider is working against the funded escrow.",
    tone: "text-blue-300 border-blue-300/25 bg-blue-300/10",
  },
  submitted: {
    label: "Deliverable submitted",
    detail: "Client review is needed before payment release.",
    tone: "text-arc-purple border-arc-purple/25 bg-arc-purple/10",
  },
  approved: {
    label: "Approved",
    detail: "Payment release transaction is ready.",
    tone: "text-emerald-300 border-emerald-300/25 bg-emerald-300/10",
  },
  paid: {
    label: "Paid",
    detail: "USDC has been released to the agent provider.",
    tone: "text-arc-green border-arc-green/25 bg-arc-green/10",
  },
  completed: {
    label: "Completed and paid",
    detail: "Escrow released, reputation event ready to record.",
    tone: "text-arc-green border-arc-green/25 bg-arc-green/10",
  },
  refunded: {
    label: "Refunded",
    detail: "Eligible funds returned to the client.",
    tone: "text-arc-orange border-arc-orange/25 bg-arc-orange/10",
  },
  expired: {
    label: "Expired",
    detail: "Deadline passed. Refund may be available.",
    tone: "text-arc-dim border-arc-dim/25 bg-arc-dim/10",
  },
};

export function EscrowBadge({ amount, status }: { amount: string; status: JobStatus | string }) {
  const state = escrowState[status] ?? escrowState.open;

  return (
    <div className={`rounded-lg border p-4 ${state.tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-display font-semibold text-arc-text">{state.label}</div>
          <p className="mt-1 text-xs text-arc-muted">{state.detail}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-display font-bold">{amount}</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">USDC</div>
        </div>
      </div>
    </div>
  );
}
