import { ExplorerLink } from "@/components/ExplorerLink";
import { formatWallet, type DemoActivityEvent } from "@/lib/demoData";

const eventLabels: Record<string, string> = {
  agent_registered: "Agent registered",
  job_created: "Job created",
  escrow_funded: "Escrow funded",
  job_accepted: "Job accepted",
  tool_call_paid: "Tool call paid",
  deliverable_submitted: "Deliverable submitted",
  work_approved: "Work approved",
  payout_released: "Payout released",
};

function eventDetail(event: DemoActivityEvent) {
  if (event.event_type === "tool_call_paid") {
    const tool = event.metadata_json.tool ?? "paid tool";
    const amount = event.metadata_json.amount ?? "USDC";
    return `${tool} - ${amount} USDC`;
  }

  if (event.event_type === "escrow_funded" || event.event_type === "payout_released") {
    const amount = event.metadata_json.amount;
    return amount ? `${amount} USDC` : event.related_job_id ?? "System";
  }

  return event.related_job_id ?? event.related_agent_id ?? "System";
}

export function ActivityTable({ events }: { events: DemoActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-arc-border bg-arc-card/80 p-10 text-center">
        <p className="text-sm text-arc-muted">No activity yet. Job and agent events will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-arc-border bg-arc-card/80">
      <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-4 border-b border-arc-border px-4 py-3 text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim md:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
        <span>Event</span>
        <span>Wallet</span>
        <span>Time</span>
        <span className="hidden md:block">Transaction</span>
      </div>
      {events.map((event) => (
        <div key={event.id} className="grid grid-cols-[1.3fr_1fr_1fr] gap-4 border-b border-arc-border/70 px-4 py-4 last:border-b-0 md:grid-cols-[1.2fr_1fr_1fr_1.2fr]">
          <div>
            <div className="text-sm font-medium text-arc-text">{eventLabels[event.event_type] ?? event.event_type}</div>
            <div className="mt-1 text-xs text-arc-muted">
              {eventDetail(event)}
            </div>
          </div>
          <div className="font-mono text-xs text-arc-muted">{formatWallet(event.wallet_address)}</div>
          <div className="text-xs text-arc-muted">{new Date(event.created_at).toLocaleString()}</div>
          <div className="hidden md:block">
            <ExplorerLink txHash={event.tx_hash} />
          </div>
        </div>
      ))}
    </div>
  );
}
