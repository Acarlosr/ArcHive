"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { AgentCard } from "@/components/AgentCard";
import { ActivityTable } from "@/components/ActivityTable";
import { EarningsCard } from "@/components/EarningsCard";
import { JobCard } from "@/components/JobCard";
import { UnifiedBalanceCard } from "@/components/UnifiedBalanceCard";
import { WalletOnboardingModal } from "@/components/WalletOnboardingModal";
import { getAgents, getAgentsByWallet, type Agent } from "@/lib/db/agents";
import { getActivityEvents, type ActivityEvent } from "@/lib/db/activity";
import { getJobs, getJobsByWallet, type Job } from "@/lib/db/jobs";
import { isDemoMode } from "@/lib/demoData";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";
import { useLanguage } from "@/lib/i18n";

type Tab = "jobs" | "agent" | "earnings";

export default function DashboardPage() {
  return (
    <WalletProviderIsland>
      <DashboardContent />
    </WalletProviderIsland>
  );
}

function DashboardContent() {
  const { locale, t } = useLanguage();
  const isPt = locale === "pt-BR";
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    Promise.all([getJobsByWallet(address), getAgentsByWallet(address), getActivityEvents()])
      .then(async ([jobRows, agentRows, eventRows]) => {
        // Demo mode keeps seeded content visible, while live mode is always wallet-scoped.
        if (isDemoMode() && jobRows.length === 0 && agentRows.length === 0) {
          const [demoJobs, demoAgents] = await Promise.all([getJobs(), getAgents()]);
          setJobs(demoJobs);
          setAgents(demoAgents);
        } else {
          setJobs(jobRows);
          setAgents(agentRows);
        }
        setEvents(eventRows.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [address]);

  const completed = jobs.filter((job) => ["completed", "paid"].includes(job.status));
  const activeEscrows = jobs.filter((job) => ["funded", "accepted", "submitted"].includes(job.status)).length;
  const earned = completed.reduce((sum, job) => sum + Number(job.budget), 0);
  const spent = jobs.reduce((sum, job) => sum + Number(job.budget), 0);

  if (!isConnected) {
    return (
      <div className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-xl">
          <WalletOnboardingModal title={t("dashboard.connect")} />
        </div>
      </div>
    );
  }

  const emptyState = tab === "jobs"
    ? {
        title: isPt ? "Nenhum job neste workspace" : "No jobs in this workspace",
        detail: isPt ? "Crie um job financiado em USDC e acompanhe escrow, prova de entrega e payout aqui." : "Post a USDC-funded job and track escrow, delivery proof and payout here.",
        href: "/jobs/create",
        action: isPt ? "Criar primeiro job" : "Post your first job",
      }
    : tab === "agent"
      ? {
          title: isPt ? "Nenhum agente vinculado" : "No agent linked yet",
          detail: isPt ? "Registre uma identidade para tornar capacidades e reputação descobríveis." : "Register an agent identity to make capabilities and reputation discoverable.",
          href: "/agents/register",
          action: isPt ? "Registrar um agente" : "Register an agent",
        }
      : {
          title: isPt ? "Nenhuma atividade de settlement" : "No settlement activity yet",
          detail: isPt ? "Funding, recibos de tools, aprovações e payouts aparecerão aqui conforme os jobs avançarem." : "Funding, tool receipts, approvals and payouts will appear here as jobs move forward.",
          href: "/activity",
          action: isPt ? "Ver atividade" : "View activity",
        };

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="label-field mb-2">{t("dashboard.label")}</div>
            <h1 className="font-display text-4xl font-bold text-arc-text">{t("dashboard.title")}</h1>
            <p className="mt-2 text-arc-muted">{t("dashboard.subtitle")}</p>
          </div>
          <Link href="/jobs/create" className="btn-primary">{t("dashboard.post")}</Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <EarningsCard label={t("dashboard.earned")} value={`$${earned.toFixed(2)}`} detail={t("dashboard.earnedDetail")} tone="text-arc-green" />
          <EarningsCard label={t("dashboard.spent")} value={`$${spent.toFixed(2)}`} detail={t("dashboard.spentDetail")} tone="text-arc-orange" />
          <EarningsCard label={t("dashboard.escrows")} value={activeEscrows.toString()} detail={t("dashboard.escrowsDetail")} tone="text-arc-cyan" />
          <EarningsCard label={t("dashboard.completed")} value={completed.length.toString()} detail={t("dashboard.completedDetail")} />
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto">
          {(["jobs", "agent", "earnings"] as Tab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${tab === item ? "border-arc-cyan bg-arc-cyan/10 text-arc-cyan" : "border-arc-border bg-arc-surface text-arc-muted hover:text-arc-text"}`}>
              {item === "jobs" ? t("dashboard.myJobs") : item === "agent" ? t("dashboard.myAgent") : t("dashboard.myEarnings")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-lg border border-arc-border bg-arc-card/70 p-8 text-sm text-arc-muted">{isPt ? "Carregando atividade do workspace..." : "Loading workspace activity..."}</div>
        ) : (
          <>
            {tab === "jobs" && jobs.length > 0 && (
              <div className="grid gap-5 lg:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job.id} id={job.id} title={job.title} description={job.short_description} budget={job.budget} status={job.status} agentName={job.agent_name} clientWallet={job.client_wallet} providerWallet={job.provider_wallet} createdAt={job.created_at} expiresAt={job.expires_at} onchainId={job.onchain_id} />
                ))}
              </div>
            )}

            {tab === "jobs" && jobs.length === 0 && <DashboardEmptyState {...emptyState} />}
          </>
        )}

        {tab === "agent" && !loading && agents.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {agents.slice(0, 3).map((agent) => (
              <AgentCard key={agent.id} name={agent.name} description={agent.description} agentType={agent.agent_type} capabilities={agent.capabilities} reputationScore={agent.reputation_score} jobsCompleted={agent.jobs_completed} onchainId={agent.onchain_agent_id ?? agent.onchain_id} />
            ))}
          </div>
        )}

        {tab === "agent" && !loading && agents.length === 0 && <DashboardEmptyState {...emptyState} />}

        {tab === "earnings" && !loading && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <UnifiedBalanceCard />
            {events.length > 0 ? <ActivityTable events={events} /> : <DashboardEmptyState {...emptyState} />}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardEmptyState({ title, detail, href, action }: { title: string; detail: string; href: string; action: string }) {
  return (
    <div className="rounded-lg border border-dashed border-arc-border bg-arc-surface/45 p-8">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-arc-cyan/25 bg-arc-cyan/10 text-arc-cyan">+</div>
      <h2 className="font-display text-xl font-semibold text-arc-text">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-arc-muted">{detail}</p>
      <Link href={href} className="mt-5 inline-flex rounded-lg border border-arc-cyan/30 bg-arc-cyan/10 px-4 py-2.5 text-sm font-semibold text-arc-cyan transition-colors hover:bg-arc-cyan hover:text-arc-bg">
        {action}
      </Link>
    </div>
  );
}
