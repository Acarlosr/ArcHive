"use client";

import Link from "next/link";
import { AuditorAccessPanel } from "@/components/AuditorAccessPanel";
import { ExplorerLink } from "@/components/ExplorerLink";
import { getDemoProofPacks, type ProofCheck, type ProofCheckStatus, type ProofPack } from "@/lib/proofPacks";
import { formatWallet } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

const packs = getDemoProofPacks();

const integrationMap = [
  {
    title: "Goldsky",
    detail:
      "Index job, escrow, tool-spend, deliverable, approval, and payout events into queryable Proof Packs.",
  },
  {
    title: "Circle Agent Stack",
    detail:
      "Attach agent wallets, service discovery, CLI actions, Circle Skills, and x402 receipts to the work ledger.",
  },
  {
    title: "Dynamic",
    detail:
      "Reduce onboarding friction with embedded wallets, passkeys, wallet lifecycle webhooks, and smoother signing.",
  },
  {
    title: "Post-Quantum Roadmap",
    detail:
      "Keep deliverables hash-only today and prepare job/security metadata for future PQ-safe identity and recovery paths.",
  },
];

const integrationMapPt = [
  {
    title: "Goldsky",
    detail:
      "Indexar eventos de job, escrow, gasto de tools, entrega, aprovação e payout em Proof Packs consultáveis.",
  },
  {
    title: "Circle Agent Stack",
    detail:
      "Ligar agent wallets, descoberta de serviços, ações via CLI, Circle Skills e recibos x402 ao ledger do trabalho.",
  },
  {
    title: "Dynamic",
    detail:
      "Reduzir fricção de entrada com embedded wallets, passkeys, webhooks de ciclo de carteira e assinatura mais simples.",
  },
  {
    title: "Roadmap Post-Quantum",
    detail:
      "Manter entregas em modo hash-only hoje e preparar metadata de segurança para identidade e recovery PQ-safe no futuro.",
  },
];

const jobCopyPt: Record<string, { title: string; short: string }> = {
  job_8183_001: {
    title: "Mapear concorrentes de gateways de stablecoin",
    short: "Mapa competitivo de gateways de stablecoin com liquidação e notas de risco.",
  },
  job_8183_002: {
    title: "Reconciliar payouts de agentes da turma de abril",
    short: "Reconciliação de payouts em USDC para a turma de agentes de abril.",
  },
  job_8183_003: {
    title: "Criar especificação de integração ERC-8183",
    short: "Plano tipado de integração para o ciclo de escrow ERC-8183.",
  },
  job_8183_004: {
    title: "Monitorar registros de agentes na Arc Testnet",
    short: "Resumo diário da atividade de identidade de agentes na Arc Testnet.",
  },
};

const checkLabels = {
  en: {
    "agent-identity": "Agent identity",
    escrow: "USDC escrow",
    "tool-spend": "Tool spend receipts",
    deliverable: "Deliverable proof",
    approval: "Client approval",
    payout: "Payout release",
  },
  pt: {
    "agent-identity": "Identidade do agente",
    escrow: "Escrow em USDC",
    "tool-spend": "Recibos de tools",
    deliverable: "Prova de entrega",
    approval: "Aprovação do cliente",
    payout: "Liberação do payout",
  },
} as const;

function statusTone(status: ProofCheckStatus) {
  if (status === "verified") return "border-arc-green/35 bg-arc-green/10 text-arc-green";
  if (status === "pending") return "border-arc-gold/35 bg-arc-gold/10 text-arc-gold";
  return "border-arc-rose/35 bg-arc-rose/10 text-arc-rose";
}

function statusLabel(status: ProofCheckStatus, isPt: boolean) {
  if (status === "verified") return isPt ? "verificado" : "verified";
  if (status === "pending") return isPt ? "pendente" : "pending";
  return isPt ? "faltando" : "missing";
}

function jobTitle(pack: ProofPack, isPt: boolean) {
  return isPt ? jobCopyPt[pack.job.id]?.title ?? pack.job.title : pack.job.title;
}

function jobShortDescription(pack: ProofPack, isPt: boolean) {
  return isPt ? jobCopyPt[pack.job.id]?.short ?? pack.job.short_description : pack.job.short_description;
}

function privacyLabel(mode: ProofPack["privacyMode"], isPt: boolean) {
  if (mode === "hash-only") return isPt ? "somente hash" : "hash-only";
  return mode;
}

function checkLabel(check: ProofCheck, isPt: boolean) {
  const key = check.id as keyof typeof checkLabels.en;
  return isPt ? checkLabels.pt[key] ?? check.label : checkLabels.en[key] ?? check.label;
}

function checkDetail(check: ProofCheck, pack: ProofPack, isPt: boolean) {
  const agentName = pack.agent?.name ?? (isPt ? "Agente não atribuído" : "Unassigned agent");

  if (check.id === "agent-identity") {
    if (!pack.agent?.onchain_agent_id) {
      return isPt ? "Nenhuma identidade de agente foi vinculada ainda." : "No agent identity linked yet.";
    }
    return isPt
      ? `${agentName} registrado com ${pack.agent.onchain_agent_id}`
      : `${agentName} registered with ${pack.agent.onchain_agent_id}`;
  }

  if (check.id === "escrow") {
    if (check.status === "verified") {
      return isPt
        ? `${pack.job.budget_usdc} USDC reservado para este job.`
        : `${pack.job.budget_usdc} USDC reserved for this job.`;
    }
    return isPt
      ? "Orçamento declarado; funding do escrow ainda pendente."
      : "Budget declared; escrow funding is still pending.";
  }

  if (check.id === "tool-spend") {
    if (pack.receipts.length > 0) {
      return isPt
        ? `${pack.receipts.length} recibo(s) x402, total de ${pack.totalToolSpendUsdc} USDC.`
        : `${pack.receipts.length} x402 receipt(s), ${pack.totalToolSpendUsdc} USDC total.`;
    }
    return isPt
      ? "Nenhum recibo de tool medido foi anexado ainda."
      : "No metered tool receipts have been attached yet.";
  }

  if (check.id === "deliverable") {
    if (pack.job.deliverable_hash) {
      return isPt
        ? `Prova somente por hash: ${pack.job.deliverable_hash}`
        : `Hash-only proof: ${pack.job.deliverable_hash}`;
    }
    return isPt
      ? "O conteúdo da entrega fica privado; apenas um hash/link de prova é esperado onchain."
      : "Deliverable content stays private; only a hash/proof link is expected onchain.";
  }

  if (check.id === "approval") {
    if (check.status === "verified") {
      return isPt
        ? "A aprovação do cliente está registrada para liberação."
        : "Client approval is recorded for release.";
    }
    return isPt ? "A revisão do cliente ainda está pendente." : "Client review is still pending.";
  }

  if (check.id === "payout") {
    if (check.status === "verified") {
      return isPt
        ? "O payout em USDC foi liberado para o prestador."
        : "USDC payout has been released to the provider.";
    }
    return isPt
      ? "O payout só é liberado depois da aprovação."
      : "Payout is not released until approval is complete.";
  }

  return check.detail;
}

export default function ProofPage() {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const completedPacks = packs.filter((pack) => pack.completeness === 100).length;
  const totalReceipts = packs.reduce((sum, pack) => sum + pack.receipts.length, 0);
  const totalEvents = packs.reduce((sum, pack) => sum + pack.indexedEventCount, 0);
  const totalEscrow = packs.reduce((sum, pack) => sum + Number(pack.job.budget_usdc), 0);
  const totalEscrowLabel = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(totalEscrow);
  const map = isPt ? integrationMapPt : integrationMap;

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="label-field mb-2">ArcHive V2</div>
            <h1 className="font-display text-4xl font-bold text-arc-text sm:text-5xl">
              {isPt ? "Proof Packs para trabalho agentic" : "Proof Packs for agentic work"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arc-muted">
              {isPt
                ? "Cada job vira um pacote verificável: identidade do agente, escrow em USDC, recibos x402, prova de entrega, aprovação e payout. O conteúdo do trabalho pode ficar privado; o que aparece publicamente é a prova."
                : "Every job becomes a verifiable package: agent identity, USDC escrow, x402 receipts, deliverable proof, approval, and payout. Work content can stay private; the public surface is the proof."}
            </p>
          </div>

          <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/10 p-5">
            <div className="text-sm font-display font-semibold text-arc-text">
              {isPt ? "Sem DEX, sem yield, sem token próprio" : "No DEX, no yield, no project token"}
            </div>
            <p className="mt-2 text-sm leading-6 text-arc-muted">
              {isPt
                ? "A V2 continua centrada em jobs, agentes, escrow, gastos controlados e liquidação em USDC na Arc."
                : "V2 stays centered on jobs, agents, escrow, controlled tool spend, and USDC settlement on Arc."}
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProofMetric label={isPt ? "Proof Packs" : "Proof Packs"} value={packs.length.toString()} />
          <ProofMetric label={isPt ? "eventos indexáveis" : "indexable events"} value={totalEvents.toString()} />
          <ProofMetric label={isPt ? "recibos x402" : "x402 receipts"} value={totalReceipts.toString()} />
          <ProofMetric label={isPt ? "USDC em jobs" : "job USDC"} value={`$${totalEscrowLabel}`} />
        </section>

        <AuditorAccessPanel packs={packs} isPt={isPt} />

        <section className="mb-8 rounded-lg border border-arc-border bg-arc-card/85 p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="label-field mb-2">{isPt ? "Ledger de prova" : "Proof Ledger"}</div>
              <h2 className="font-display text-2xl font-bold text-arc-text">
                {isPt ? "Jobs prontos para revisão" : "Jobs ready for review"}
              </h2>
            </div>
            <Link href="/activity" className="text-sm font-medium text-arc-green hover:text-white">
              {isPt ? "Ver activity log" : "View activity log"}
            </Link>
          </div>

          <div className="space-y-4">
            {packs.map((pack) => (
              <div key={pack.id} className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_180px] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-arc-dim">
                        {pack.job.onchain_job_id ?? pack.job.id}
                      </span>
                      <span className="rounded-full border border-arc-border px-2 py-1 text-[10px] font-mono uppercase tracking-[0.12em] text-arc-muted">
                        {privacyLabel(pack.privacyMode, isPt)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-bold text-arc-text">{jobTitle(pack, isPt)}</h3>
                    <p className="mt-2 text-sm leading-6 text-arc-muted">{jobShortDescription(pack, isPt)}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-arc-muted">
                      <span>{isPt ? "Agente" : "Agent"}: {pack.agent?.name ?? (isPt ? "Não atribuído" : "Unassigned")}</span>
                      <span>{isPt ? "Cliente" : "Client"}: {formatWallet(pack.job.client_wallet)}</span>
                      <span>{pack.job.budget_usdc} USDC</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-right font-display text-3xl font-bold text-arc-cyan">{pack.completeness}%</div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-arc-bg">
                      <div className="h-full rounded-full bg-arc-cyan" style={{ width: `${pack.completeness}%` }} />
                    </div>
                    <div className="mt-2 text-right text-xs text-arc-muted">
                      {isPt ? "prova completa" : "proof complete"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {pack.checks.map((check) => (
                    <div key={check.id} className="rounded-md border border-arc-border bg-arc-bg/70 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-display text-sm font-semibold text-arc-text">{checkLabel(check, isPt)}</div>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase ${statusTone(check.status)}`}>
                          {statusLabel(check.status, isPt)}
                        </span>
                      </div>
                      <p className="mt-2 min-h-[42px] text-xs leading-5 text-arc-muted">{checkDetail(check, pack, isPt)}</p>
                      {check.txHash ? (
                        <div className="mt-2">
                          <ExplorerLink txHash={check.txHash} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">{isPt ? "Critério V2" : "V2 Readiness"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">
              {isPt ? "O que melhora para a Arc" : "What this improves for Arc"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-arc-muted">
              {isPt
                ? "ArcHive deixa a economia agentic mais observável. Em vez de só dizer que um agente trabalhou, a UI mostra onde o dinheiro ficou, quais ferramentas foram pagas, qual prova foi enviada e quando o payout saiu."
                : "ArcHive makes the agentic economy more observable. Instead of only saying an agent worked, the UI shows where funds sat, which tools were paid, what proof was submitted, and when payout happened."}
            </p>
            <div className="mt-5 rounded-md border border-arc-border bg-arc-bg/80 p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">
                {isPt ? "packs completos" : "complete packs"}
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-arc-text">{completedPacks}/{packs.length}</div>
            </div>
          </div>

          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">{isPt ? "Mapa de integrações" : "Integration map"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">
              {isPt ? "Próximas peças sem mudar a tese" : "Next pieces without changing the thesis"}
            </h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {map.map((item) => (
                <div key={item.title} className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
                  <div className="font-display text-base font-semibold text-arc-text">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-arc-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProofMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/80 p-5">
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{label}</div>
      <div className="mt-2 font-display text-xl font-bold text-arc-text">{value}</div>
    </div>
  );
}
