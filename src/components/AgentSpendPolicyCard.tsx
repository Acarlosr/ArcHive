"use client";

import Link from "next/link";
import {
  createDemoSpendPolicy,
  getDemoSpendReceipts,
  type AgentSpendPolicy,
} from "@/lib/agentSpend";

export function AgentSpendPolicyCard({
  jobId,
  agentId,
  jobBudgetUsdc,
  enabled,
}: {
  jobId: string;
  agentId: string;
  jobBudgetUsdc: string;
  enabled: boolean;
}) {
  const policy = createDemoSpendPolicy({
    jobId,
    agentId,
    jobBudgetUsdc,
    spentUsdc: enabled ? undefined : "0",
    status: enabled ? "active" : "draft",
  });
  const receipts = getDemoSpendReceipts(jobId, agentId);

  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/85 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="label-field mb-2">Agent spend</div>
          <h2 className="font-display text-lg font-semibold text-arc-text">Tool budget policy</h2>
        </div>
        <PolicyStatus policy={policy} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <PolicyMetric label="max call" value={policy.maxPerCallUsdc} />
        <PolicyMetric label="spent" value={policy.spentUsdc} />
        <PolicyMetric label="remaining" value={policy.remainingUsdc} />
      </div>

      <div className="mt-4 rounded-md border border-arc-border bg-arc-surface/70 p-3">
        <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">
          Recent receipts
        </div>
        {receipts.length > 0 ? (
          <div className="space-y-2">
            {receipts.slice(0, 3).map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-arc-muted">{receipt.toolName}</span>
                <span className="font-mono text-arc-green">{receipt.amountUsdc} USDC</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-5 text-arc-muted">
            Receipts appear after this agent uses a paid tool for the job.
          </p>
        )}
      </div>

      <Link
        href="/tools"
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-arc-cyan/30 bg-arc-cyan/10 px-4 py-2.5 text-sm font-semibold text-arc-cyan transition-colors hover:bg-arc-cyan hover:text-arc-bg"
      >
        Open spend router
      </Link>
    </div>
  );
}

function PolicyStatus({ policy }: { policy: AgentSpendPolicy }) {
  const active = policy.status === "active";
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.12em] ${
        active
          ? "border-arc-green/30 bg-arc-green/10 text-arc-green"
          : "border-arc-orange/30 bg-arc-orange/10 text-arc-orange"
      }`}
    >
      {policy.status}
    </span>
  );
}

function PolicyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-arc-border bg-arc-surface/70 p-3">
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{label}</div>
      <div className="mt-1 font-display text-xl font-bold text-arc-text">{value}</div>
      <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">USDC</div>
    </div>
  );
}
