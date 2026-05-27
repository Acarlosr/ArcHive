"use client";
// src/app/agents/page.tsx — Browse AI Agents

import { useEffect, useState } from "react";
import Link from "next/link";
import { AgentCard } from "@/components/AgentCard";
import { getAgents, type Agent } from "@/lib/db/agents";
import { useLanguage } from "@/lib/i18n";

export default function AgentsPage() {
  const { t } = useLanguage();
  const supportedAgentWork = [
    {
      title: t("home.agent.research"),
      agentType: t("agentType.research"),
      detail: t("home.agent.researchDetail"),
    },
    {
      title: t("home.agent.data"),
      agentType: t("agentType.finance"),
      detail: t("home.agent.dataDetail"),
    },
    {
      title: t("home.agent.scoring"),
      agentType: t("agentType.monitoring"),
      detail: t("home.agent.scoringDetail"),
    },
    {
      title: t("home.agent.workflow"),
      agentType: t("agentType.engineering"),
      detail: t("home.agent.workflowDetail"),
    },
    {
      title: t("home.agent.operator"),
      agentType: t("agentType.operator"),
      detail: t("home.agent.operatorDetail"),
    },
  ];
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="label-field mb-2">{t("agents.label")}</div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl">{t("agents.title")}</h1>
            <p className="text-arc-muted mt-2 max-w-2xl">{t("agents.subtitle")}</p>
          </div>
          <Link href="/agents/register" className="btn-primary">
            {t("agents.register")}
          </Link>
        </div>

        <section className="mb-8 grid gap-3 md:grid-cols-4">
          {supportedAgentWork.map((work) => (
            <div key={work.title} className="rounded-lg border border-arc-border bg-arc-card/75 p-4">
              <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-green">
                {work.agentType}
              </div>
              <div className="font-display text-sm font-semibold text-arc-text">{work.title}</div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-arc-muted">{work.detail}</p>
            </div>
          ))}
        </section>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-arc-surface" />
                  <div className="flex-1">
                    <div className="h-4 bg-arc-surface rounded w-3/4 mb-2" />
                    <div className="h-3 bg-arc-surface rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-arc-surface rounded mb-3" />
                <div className="h-8 bg-arc-surface rounded" />
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="glass-card p-16 text-center rounded-lg">
            <h3 className="font-display font-semibold text-xl text-arc-text mb-2">
              {t("agents.emptyTitle")}
            </h3>
            <p className="text-arc-muted mb-6">{t("agents.emptyDetail")}</p>
            <Link href="/agents/register" className="btn-primary">
              {t("agents.emptyCta")}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                name={agent.name}
                description={agent.description}
                agentType={agent.agent_type}
                capabilities={agent.capabilities}
                reputationScore={agent.reputation_score}
                jobsCompleted={agent.jobs_completed}
                onchainId={agent.onchain_agent_id ?? agent.onchain_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
