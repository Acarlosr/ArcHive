import { getDemoSpendReceipts, type ToolSpendReceipt } from "@/lib/agentSpend";
import { demoActivityEvents, demoAgents, demoJobs, type DemoActivityEvent, type DemoAgent, type DemoJob } from "@/lib/demoData";

export type ProofCheckStatus = "verified" | "pending" | "missing";

export interface ProofCheck {
  id: string;
  label: string;
  status: ProofCheckStatus;
  detail: string;
  txHash?: `0x${string}`;
}

export interface ProofPack {
  id: string;
  job: DemoJob;
  agent: DemoAgent | null;
  events: DemoActivityEvent[];
  receipts: ToolSpendReceipt[];
  checks: ProofCheck[];
  completeness: number;
  indexedEventCount: number;
  totalToolSpendUsdc: string;
  privacyMode: "hash-only";
}

const fundedStatuses = new Set(["funded", "accepted", "submitted", "approved", "paid", "completed"]);
const approvedStatuses = new Set(["approved", "paid", "completed"]);
const payoutStatuses = new Set(["paid", "completed"]);

export interface ProofContext {
  agents: DemoAgent[];
  events: DemoActivityEvent[];
}

function findJobEvent(
  events: DemoActivityEvent[],
  jobId: string,
  eventType: DemoActivityEvent["event_type"],
) {
  return events.find((event) => event.related_job_id === jobId && event.event_type === eventType);
}

function makeCheck({
  id,
  label,
  ok,
  pending,
  detail,
  txHash,
}: {
  id: string;
  label: string;
  ok: boolean;
  pending?: boolean;
  detail: string;
  txHash?: string | null;
}): ProofCheck {
  return {
    id,
    label,
    status: ok ? "verified" : pending ? "pending" : "missing",
    detail,
    txHash: txHash ? (txHash as `0x${string}`) : undefined,
  };
}

// Without `ctx` this builds a demo pack (demo data, demo receipts). With `ctx`
// it builds a pack from real records: no demo receipts, and a transaction hash
// is only attached to a check when an event or the job state actually backs it.
export function buildProofPack(job: DemoJob, ctx?: ProofContext): ProofPack {
  const real = Boolean(ctx);
  const agentList = ctx?.agents ?? demoAgents;
  const eventList = ctx?.events ?? demoActivityEvents;
  const agent = agentList.find((item) => item.id === job.agent_id) ?? null;
  const events = eventList
    .filter((event) => event.related_job_id === job.id || event.related_agent_id === job.agent_id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const receipts = real ? [] : getDemoSpendReceipts(job.id, job.agent_id);
  const totalToolSpend = receipts.reduce((sum, receipt) => sum + Number(receipt.amountUsdc), 0);
  const escrowEvent = findJobEvent(eventList, job.id, "escrow_funded");
  const deliverableEvent = findJobEvent(eventList, job.id, "deliverable_submitted");
  const payoutEvent = findJobEvent(eventList, job.id, "payout_released");

  const checks: ProofCheck[] = [
    makeCheck({
      id: "agent-identity",
      label: "Agent identity",
      ok: Boolean(agent?.onchain_agent_id),
      detail: agent ? `${agent.name} registered with ${agent.onchain_agent_id}` : "No agent identity linked yet.",
      txHash: events.find((event) => event.event_type === "agent_registered")?.tx_hash,
    }),
    makeCheck({
      id: "escrow",
      label: "USDC escrow",
      ok: fundedStatuses.has(job.status),
      pending: job.status === "open",
      detail: fundedStatuses.has(job.status)
        ? `${job.budget_usdc} USDC reserved for this job.`
        : "Budget declared; escrow funding is still pending.",
      txHash: escrowEvent?.tx_hash ?? (real ? null : job.tx_hash),
    }),
    makeCheck({
      id: "tool-spend",
      label: "Tool spend receipts",
      ok: receipts.length > 0,
      pending: fundedStatuses.has(job.status),
      detail: receipts.length > 0
        ? `${receipts.length} x402 receipt(s), ${totalToolSpend.toFixed(4)} USDC total.`
        : "No metered tool receipts have been attached yet.",
      txHash: receipts[0]?.txHash,
    }),
    makeCheck({
      id: "deliverable",
      label: "Deliverable proof",
      ok: Boolean(job.deliverable_hash),
      pending: fundedStatuses.has(job.status),
      detail: job.deliverable_hash
        ? `Hash-only proof: ${job.deliverable_hash}`
        : "Deliverable content stays private; only a hash/proof link is expected onchain.",
      txHash: deliverableEvent?.tx_hash ?? (real ? null : job.tx_hash),
    }),
    makeCheck({
      id: "approval",
      label: "Client approval",
      ok: approvedStatuses.has(job.status),
      pending: job.status === "submitted",
      detail: approvedStatuses.has(job.status)
        ? "Client approval is recorded for release."
        : "Client review is still pending.",
      txHash: findJobEvent(eventList, job.id, "work_approved")?.tx_hash,
    }),
    makeCheck({
      id: "payout",
      label: "Payout release",
      ok: payoutStatuses.has(job.status) || Boolean(payoutEvent),
      pending: approvedStatuses.has(job.status) || job.status === "submitted",
      detail: payoutStatuses.has(job.status) || payoutEvent
        ? "USDC payout has been released to the provider."
        : "Payout is not released until approval is complete.",
      txHash: payoutEvent?.tx_hash ?? (payoutStatuses.has(job.status) ? job.tx_hash : null),
    }),
  ];

  const verified = checks.filter((check) => check.status === "verified").length;

  return {
    id: `proof-${job.id}`,
    job,
    agent,
    events,
    receipts,
    checks,
    completeness: Math.round((verified / checks.length) * 100),
    indexedEventCount: events.length,
    totalToolSpendUsdc: totalToolSpend.toFixed(4),
    privacyMode: "hash-only",
  };
}

export function buildProofPacks(jobs: DemoJob[], agents: DemoAgent[], events: DemoActivityEvent[]) {
  return jobs.map((job) => buildProofPack(job, { agents, events })).sort((a, b) => b.completeness - a.completeness);
}

export function getDemoProofPacks() {
  return demoJobs.map(buildProofPack).sort((a, b) => b.completeness - a.completeness);
}
