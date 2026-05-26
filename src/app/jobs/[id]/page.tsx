"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { AgentSpendPolicyCard } from "@/components/AgentSpendPolicyCard";
import { EscrowBadge } from "@/components/EscrowBadge";
import { ExplorerLink } from "@/components/ExplorerLink";
import { JobTimeline } from "@/components/JobTimeline";
import { StatusChip } from "@/components/StatusChip";
import { WalletOnboardingModal } from "@/components/WalletOnboardingModal";
import { getJobById, updateJobStatus, type Job } from "@/lib/db/jobs";
import { acceptJob, approveAndPay, fundEscrow, refundEscrow, submitDeliverable } from "@/lib/arc/jobMarketplace";
import { formatWallet } from "@/lib/demoData";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";

type ActionState = "idle" | "processing" | "success" | "error";

export default function JobDetailPage() {
  return (
    <WalletProviderIsland>
      <JobDetailContent />
    </WalletProviderIsland>
  );
}

function JobDetailContent() {
  const params = useParams();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [error, setError] = useState("");
  const [deliverableProof, setDeliverableProof] = useState("ipfs://bafybeihive-deliverable");

  useEffect(() => {
    getJobById(params.id as string).then(setJob).finally(() => setLoading(false));
  }, [params.id]);

  const currentWallet = address?.toLowerCase();
  const isClient = Boolean(job && currentWallet === job.client_wallet.toLowerCase());
  const isProvider = Boolean(job && currentWallet === job.provider_wallet.toLowerCase());

  async function runAction(action: () => Promise<any>, nextStatus: Job["status"], extras?: Partial<Job>) {
    if (!job) return;
    setActionState("processing");
    setError("");
    try {
      const result = await action();
      const actionExtras = {
        ...extras,
        ...(result?.txHash ? { tx_hash: result.txHash } : {}),
      };
      await updateJobStatus(job.id, nextStatus, actionExtras);
      setJob({ ...job, status: nextStatus, ...actionExtras });
      setActionState("success");
    } catch (err: any) {
      setError(err?.message ?? "Action failed");
      setActionState("error");
    }
  }

  if (loading) {
    return (
      <div className="px-4 pb-16 pt-24">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-arc-border border-t-arc-cyan" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="px-4 pb-16 pt-24 text-center">
        <h1 className="font-display text-3xl font-bold text-arc-text">Job not found</h1>
        <Link href="/jobs" className="mt-4 inline-flex text-arc-cyan">Back to jobs</Link>
      </div>
    );
  }

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusChip status={job.status} />
              {job.onchain_id && <span className="font-mono text-xs text-arc-dim">ERC-8183 #{job.onchain_id}</span>}
            </div>
            <h1 className="max-w-3xl font-display text-4xl font-bold text-arc-text">{job.title}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-arc-muted">{job.description}</p>
          </div>
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-5 text-right">
            <div className="text-3xl font-display font-bold text-arc-green">{job.budget}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">USDC budget</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-arc-text">Lifecycle</h2>
                <span className="text-xs text-arc-muted">Open to paid escrow route</span>
              </div>
              <JobTimeline currentStatus={job.status} />
            </div>

            <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
              <h2 className="mb-5 font-display text-xl font-semibold text-arc-text">Role actions</h2>
              <div className="mb-5 rounded-lg border border-arc-border bg-arc-surface/70 p-4 text-sm leading-6 text-arc-muted">
                Escrow protects both sides: providers are paid only after approval, and clients can keep funds locked while requesting revision or use the refund path when eligible. Dispute resolution is planned as a future ArcHive module.
              </div>
              {!address ? (
                <WalletOnboardingModal title="Connect to act on this job" />
              ) : (
                <div className="space-y-4">
                  {isClient && job.status === "open" && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => fundEscrow({ walletClient, jobId: job.onchain_id ?? job.id, budgetUsdc: job.budget, recipientAddress: job.provider_wallet }), "funded")}>
                      Fund escrow from Unified Balance
                    </button>
                  )}
                  {isProvider && job.status === "open" && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => acceptJob({ walletClient, jobId: job.onchain_id ?? job.id, budgetUsdc: job.budget }), "accepted")}>
                      Accept job and set budget
                    </button>
                  )}
                  {isClient && job.status === "accepted" && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => fundEscrow({ walletClient, jobId: job.onchain_id ?? job.id, budgetUsdc: job.budget, recipientAddress: job.provider_wallet }), "funded")}>
                      Fund escrow on Arc
                    </button>
                  )}
                  {isProvider && job.status === "funded" && (
                    <div className="space-y-3">
                      <label>
                        <span className="label-field mb-2 block">Proof of delivery</span>
                        <input className="input-field" value={deliverableProof} onChange={(event) => setDeliverableProof(event.target.value)} placeholder="ipfs://, file link, or sha256 reference" />
                      </label>
                      <p className="text-xs leading-5 text-arc-muted">
                        Add a delivery receipt, file link, IPFS URI, or technical reference that proves what was delivered. ArcHive stores it as the job proof record.
                      </p>
                      <button className="btn-primary w-full" disabled={actionState === "processing" || !deliverableProof.trim()} onClick={() => runAction(() => submitDeliverable({ walletClient, jobId: job.onchain_id ?? job.id, deliverableHash: deliverableProof }), "submitted", { deliverable_hash: deliverableProof })}>
                        Submit proof of delivery
                      </button>
                    </div>
                  )}
                  {isClient && job.status === "submitted" && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => approveAndPay({ walletClient, jobId: job.onchain_id ?? job.id }), "completed")}>
                      Approve work and release payment
                    </button>
                  )}
                  {isClient && ["expired", "open"].includes(job.status) && (
                    <button className="btn-secondary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => refundEscrow({ walletClient, jobId: job.onchain_id ?? job.id }), "refunded")}>
                      Refund if eligible
                    </button>
                  )}
                  {!isClient && !isProvider && (
                    <div className="rounded-lg border border-arc-border bg-arc-surface/70 p-4 text-sm text-arc-muted">
                      This connected wallet is viewing as an observer. Client and provider actions are shown to their assigned wallets.
                    </div>
                  )}
                  {actionState === "success" && (
                    <div className="rounded-lg border border-arc-green/25 bg-arc-green/10 p-3 text-sm text-arc-green">
                      Action confirmed and job state updated.
                    </div>
                  )}
                  {error && <div className="rounded-lg border border-arc-red/25 bg-arc-red/10 p-3 text-sm text-arc-red">{error}</div>}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
              <h2 className="mb-4 font-display text-xl font-semibold text-arc-text">Transaction history</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-arc-border bg-arc-surface/70 p-3">
                  <span className="text-sm text-arc-muted">Job creation / latest escrow event</span>
                  <ExplorerLink txHash={job.tx_hash} />
                </div>
                {job.deliverable_hash && (
                  <div className="rounded-md border border-arc-border bg-arc-surface/70 p-3">
                    <div className="text-sm text-arc-muted">Proof of delivery receipt</div>
                    <div className="mt-1 break-all font-mono text-xs text-arc-cyan">{job.deliverable_hash}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <EscrowBadge amount={job.budget} status={job.status} />
            <AgentSpendPolicyCard
              jobId={job.id}
              agentId={job.agent_id}
              jobBudgetUsdc={job.budget}
              enabled={["funded", "accepted", "submitted", "approved", "paid", "completed"].includes(job.status)}
            />
            <div className="rounded-lg border border-arc-border bg-arc-card/85 p-5">
              <h2 className="mb-4 font-display text-lg font-semibold text-arc-text">Participants</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3"><span className="text-arc-muted">Client</span><span className="font-mono text-arc-text">{formatWallet(job.client_wallet)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-arc-muted">Provider</span><span className="font-mono text-arc-text">{formatWallet(job.provider_wallet)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-arc-muted">Agent</span><span className="text-arc-text">{job.agent_name}</span></div>
                <div className="flex justify-between gap-3"><span className="text-arc-muted">Expiration</span><span className="font-mono text-arc-text">{new Date(job.expires_at).toLocaleDateString()}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
