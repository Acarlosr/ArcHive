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
import { acceptJob, approveAndPay, autoReleaseEscrow, fundEscrow, refundEscrow, submitDeliverable } from "@/lib/arc/jobMarketplace";
import { formatCountdown, getTimelockState } from "@/lib/arc/timelock";
import { formatWallet } from "@/lib/demoData";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";
import { useLanguage } from "@/lib/i18n";

type ActionState = "idle" | "processing" | "success" | "error";

export default function JobDetailPage() {
  return (
    <WalletProviderIsland>
      <JobDetailContent />
    </WalletProviderIsland>
  );
}

function JobDetailContent() {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const params = useParams();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [error, setError] = useState("");
  const [deliverableProof, setDeliverableProof] = useState("ipfs://bafybeihive-deliverable");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    getJobById(params.id as string).then(setJob).finally(() => setLoading(false));
  }, [params.id]);

  // Tick the clock once a minute so the approval countdown stays live.
  useEffect(() => {
    if (job?.status !== "submitted") return;
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, [job?.status]);

  const currentWallet = address?.toLowerCase();
  const isClient = Boolean(job && currentWallet === job.client_wallet.toLowerCase());
  const isProvider = Boolean(job && currentWallet === job.provider_wallet.toLowerCase());
  const timelock = getTimelockState(job?.submitted_at, now);

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
      setError(err?.message ?? (isPt ? "Ação falhou" : "Action failed"));
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
        <h1 className="font-display text-3xl font-bold text-arc-text">{isPt ? "Job não encontrado" : "Job not found"}</h1>
        <Link href="/jobs" className="mt-4 inline-flex text-arc-cyan">{isPt ? "Voltar para jobs" : "Back to jobs"}</Link>
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
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{isPt ? "Orçamento USDC" : "USDC budget"}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-arc-text">{isPt ? "Ciclo do job" : "Lifecycle"}</h2>
                <span className="text-xs text-arc-muted">{isPt ? "Rota de aberto até escrow pago" : "Open to paid escrow route"}</span>
              </div>
              <JobTimeline currentStatus={job.status} />
            </div>

            <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
              <h2 className="mb-5 font-display text-xl font-semibold text-arc-text">{isPt ? "Ações por função" : "Role actions"}</h2>
              <div className="mb-5 rounded-lg border border-arc-border bg-arc-surface/70 p-4 text-sm leading-6 text-arc-muted">
                {isPt
                  ? "O escrow protege os dois lados: prestadores recebem apenas após aprovação, e clientes podem manter os fundos travados enquanto pedem revisão ou usam o caminho de reembolso quando elegível. Resolução de disputa está planejada como módulo futuro do ArcHive."
                  : "Escrow protects both sides: providers are paid only after approval, and clients can keep funds locked while requesting revision or use the refund path when eligible. Dispute resolution is planned as a future ArcHive module."}
              </div>
              {!address ? (
                <WalletOnboardingModal title={isPt ? "Conecte para agir neste job" : "Connect to act on this job"} />
              ) : (
                <div className="space-y-4">
                  {isClient && job.status === "open" && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => fundEscrow({ walletClient, jobId: job.onchain_id ?? job.id, budgetUsdc: job.budget, recipientAddress: job.provider_wallet }), "funded")}>
                      {isPt ? "Financiar escrow via Unified Balance" : "Fund escrow from Unified Balance"}
                    </button>
                  )}
                  {isProvider && job.status === "open" && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => acceptJob({ walletClient, jobId: job.onchain_id ?? job.id, budgetUsdc: job.budget }), "accepted")}>
                      {isPt ? "Aceitar job e definir orçamento" : "Accept job and set budget"}
                    </button>
                  )}
                  {isClient && job.status === "accepted" && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => fundEscrow({ walletClient, jobId: job.onchain_id ?? job.id, budgetUsdc: job.budget, recipientAddress: job.provider_wallet }), "funded")}>
                      {isPt ? "Financiar escrow na Arc" : "Fund escrow on Arc"}
                    </button>
                  )}
                  {isClient && job.status === "funded" && (
                    <div className="rounded-lg border border-arc-cyan/25 bg-arc-cyan/5 p-4 text-sm leading-6 text-arc-muted">
                      {isPt
                        ? "Escrow financiado. Agora é a vez do prestador enviar a prova de entrega — essa carteira (cliente) não tem mais ações até lá. Volte aqui para aprovar o pagamento ou pedir reembolso assim que a entrega for enviada."
                        : "Escrow funded. It's now the provider's turn to submit proof of delivery — this wallet (client) has no further action until then. Come back to approve payment or request a refund once the delivery is submitted."}
                    </div>
                  )}
                  {isProvider && job.status === "funded" && (
                    <div className="space-y-3">
                      <label>
                        <span className="label-field mb-2 block">{isPt ? "Prova de entrega" : "Proof of delivery"}</span>
                        <input className="input-field" value={deliverableProof} onChange={(event) => setDeliverableProof(event.target.value)} placeholder={isPt ? "ipfs://, link de arquivo ou referência sha256" : "ipfs://, file link, or sha256 reference"} />
                      </label>
                      <p className="text-xs leading-5 text-arc-muted">
                        {isPt
                          ? "Adicione um recibo de entrega, link de arquivo, URI IPFS ou referência técnica que prove o que foi entregue. O ArcHive salva isso como registro de prova do job."
                          : "Add a delivery receipt, file link, IPFS URI, or technical reference that proves what was delivered. ArcHive stores it as the job proof record."}
                      </p>
                      <button className="btn-primary w-full" disabled={actionState === "processing" || !deliverableProof.trim()} onClick={() => runAction(() => submitDeliverable({ walletClient, jobId: job.onchain_id ?? job.id, deliverableHash: deliverableProof }), "submitted", { deliverable_hash: deliverableProof, submitted_at: new Date().toISOString() })}>
                        {isPt ? "Enviar prova de entrega" : "Submit proof of delivery"}
                      </button>
                    </div>
                  )}
                  {job.status === "submitted" && timelock.hasSubmission && (
                    <div className={`rounded-lg border p-4 text-sm leading-6 ${timelock.eligibleForAutoRelease ? "border-arc-green/30 bg-arc-green/10" : "border-arc-cyan/25 bg-arc-cyan/5"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">
                          {isPt ? "Timelock de aprovação" : "Approval timelock"}
                        </span>
                        <span className={`font-mono text-sm font-semibold ${timelock.eligibleForAutoRelease ? "text-arc-green" : "text-arc-cyan"}`}>
                          {timelock.eligibleForAutoRelease ? (isPt ? "prazo encerrado" : "window closed") : formatCountdown(timelock.msRemaining, isPt)}
                        </span>
                      </div>
                      <p className="mt-2 text-arc-muted">
                        {timelock.eligibleForAutoRelease
                          ? isPt
                            ? "A janela de revisão terminou sem ação do cliente. O pagamento está elegível para liberação automática ao prestador."
                            : "The review window closed with no client action. The payout is eligible for auto-release to the provider."
                          : isPt
                            ? `O cliente tem até ${timelock.autoReleaseAt?.toLocaleString()} (janela de ${timelock.windowHours}h) para aprovar ou reembolsar. Sem ação, o pagamento libera automaticamente ao prestador.`
                            : `The client has until ${timelock.autoReleaseAt?.toLocaleString()} (${timelock.windowHours}h window) to approve or refund. With no action, the payout auto-releases to the provider.`}
                      </p>
                    </div>
                  )}
                  {isClient && job.status === "submitted" && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => approveAndPay({ walletClient, jobId: job.onchain_id ?? job.id }), "completed")}>
                      {isPt ? "Aprovar trabalho e liberar pagamento" : "Approve work and release payment"}
                    </button>
                  )}
                  {isClient && job.status === "submitted" && !timelock.eligibleForAutoRelease && (
                    <button className="btn-secondary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => refundEscrow({ walletClient, jobId: job.onchain_id ?? job.id, reason: "client-dispute" }), "refunded")}>
                      {isPt ? "Contestar e solicitar reembolso" : "Dispute and request refund"}
                    </button>
                  )}
                  {isProvider && job.status === "submitted" && timelock.eligibleForAutoRelease && (
                    <button className="btn-primary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => autoReleaseEscrow({ walletClient, jobId: job.onchain_id ?? job.id }), "completed")}>
                      {isPt ? "Reivindicar liberação automática" : "Claim auto-release payout"}
                    </button>
                  )}
                  {isClient && ["expired", "open"].includes(job.status) && (
                    <button className="btn-secondary w-full" disabled={actionState === "processing"} onClick={() => runAction(() => refundEscrow({ walletClient, jobId: job.onchain_id ?? job.id }), "refunded")}>
                      {isPt ? "Reembolsar se elegível" : "Refund if eligible"}
                    </button>
                  )}
                  {!isClient && !isProvider && (
                    <div className="rounded-lg border border-arc-border bg-arc-surface/70 p-4 text-sm text-arc-muted">
                      {isPt
                        ? "Esta carteira conectada está visualizando como observadora. Ações de cliente e prestador aparecem apenas para as carteiras atribuídas."
                        : "This connected wallet is viewing as an observer. Client and provider actions are shown to their assigned wallets."}
                    </div>
                  )}
                  {actionState === "success" && (
                    <div className="rounded-lg border border-arc-green/25 bg-arc-green/10 p-3 text-sm text-arc-green">
                      {isPt ? "Ação confirmada e estado do job atualizado." : "Action confirmed and job state updated."}
                    </div>
                  )}
                  {error && <div className="rounded-lg border border-arc-red/25 bg-arc-red/10 p-3 text-sm text-arc-red">{error}</div>}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
              <h2 className="mb-4 font-display text-xl font-semibold text-arc-text">{isPt ? "Histórico de transações" : "Transaction history"}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-arc-border bg-arc-surface/70 p-3">
                  <span className="text-sm text-arc-muted">{isPt ? "Criação do job / evento mais recente de escrow" : "Job creation / latest escrow event"}</span>
                  <ExplorerLink txHash={job.tx_hash} />
                </div>
                {job.deliverable_hash && (
                  <div className="rounded-md border border-arc-border bg-arc-surface/70 p-3">
                    <div className="text-sm text-arc-muted">{isPt ? "Recibo de prova de entrega" : "Proof of delivery receipt"}</div>
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
              <h2 className="mb-4 font-display text-lg font-semibold text-arc-text">{isPt ? "Participantes" : "Participants"}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3"><span className="text-arc-muted">{isPt ? "Cliente" : "Client"}</span><span className="font-mono text-arc-text">{formatWallet(job.client_wallet)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-arc-muted">{isPt ? "Prestador" : "Provider"}</span><span className="font-mono text-arc-text">{formatWallet(job.provider_wallet)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-arc-muted">{isPt ? "Agente" : "Agent"}</span><span className="text-arc-text">{job.agent_name}</span></div>
                <div className="flex justify-between gap-3"><span className="text-arc-muted">{isPt ? "Expiração" : "Expiration"}</span><span className="font-mono text-arc-text">{new Date(job.expires_at).toLocaleDateString()}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
