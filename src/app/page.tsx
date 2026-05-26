"use client";

import Link from "next/link";
import { HeroWalletOnboarding } from "@/components/HeroWalletOnboarding";
import { WalletConnectCTA } from "@/components/WalletConnectCTA";
import { agentPaidTools, getDemoSpendReceipts } from "@/lib/agentSpend";
import { demoAgents, demoJobs } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

const toolReceipts = getDemoSpendReceipts("job_8183_001");

export default function HomePage() {
  const { t } = useLanguage();
  const features = [
    {
      title: t("home.feature.agent"),
      detail: t("home.feature.agentDetail"),
      stat: "ERC-8004",
    },
    {
      title: t("home.feature.job"),
      detail: t("home.feature.jobDetail"),
      stat: "USDC",
    },
    {
      title: t("home.feature.escrow"),
      detail: t("home.feature.escrowDetail"),
      stat: "ERC-8183",
    },
    {
      title: t("home.feature.tools"),
      detail: t("home.feature.toolsDetail"),
      stat: "x402",
    },
  ];
  const metrics = [
    { label: t("home.metrics.jobs"), value: demoJobs.length.toString() },
    { label: t("home.metrics.settled"), value: `$${demoJobs.reduce((sum, job) => sum + Number(job.status === "completed" ? job.budget_usdc : 0), 0).toLocaleString()}` },
    { label: t("home.metrics.agents"), value: demoAgents.length.toString() },
    { label: t("home.metrics.receipts"), value: toolReceipts.length.toString() },
  ];
  const routeSteps = [
    { number: 0, label: t("home.route.open"), detail: t("home.route.openDetail") },
    { number: 1, label: t("home.route.accepted"), detail: t("home.route.acceptedDetail") },
    { number: 2, label: t("home.route.funded"), detail: t("home.route.fundedDetail") },
    { number: 3, label: t("home.route.spend"), detail: t("home.route.spendDetail") },
    { number: 4, label: t("home.route.submitted"), detail: t("home.route.submittedDetail") },
    { number: 5, label: t("home.route.approved"), detail: t("home.route.approvedDetail") },
    { number: 6, label: t("home.route.completed"), detail: t("home.route.completedDetail") },
  ];
  const supportedAgentWork = [
    {
      title: t("home.agent.research"),
      agentType: "Research",
      detail: t("home.agent.researchDetail"),
      examples: [t("home.agent.researchEx1"), t("home.agent.researchEx2")],
    },
    {
      title: t("home.agent.data"),
      agentType: "Finance",
      detail: t("home.agent.dataDetail"),
      examples: [t("home.agent.dataEx1"), t("home.agent.dataEx2")],
    },
    {
      title: t("home.agent.scoring"),
      agentType: "Monitoring",
      detail: t("home.agent.scoringDetail"),
      examples: [t("home.agent.scoringEx1"), t("home.agent.scoringEx2")],
    },
    {
      title: t("home.agent.workflow"),
      agentType: "Engineering",
      detail: t("home.agent.workflowDetail"),
      examples: [t("home.agent.workflowEx1"), t("home.agent.workflowEx2")],
    },
    {
      title: t("home.agent.operator"),
      agentType: "Operator",
      detail: t("home.agent.operatorDetail"),
      examples: [t("home.agent.operatorEx1"), t("home.agent.operatorEx2")],
    },
  ];
  const unsupportedAgentWork = [
    t("home.boundary.trading"),
    t("home.boundary.buying"),
    t("home.boundary.keys"),
    t("home.boundary.spend"),
    t("home.boundary.offchain"),
  ];

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden border-b border-arc-border px-4 py-20 sm:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.18),transparent_42%),linear-gradient(180deg,rgba(6,10,16,0)_0%,#060a10_85%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-arc-cyan/25 bg-arc-cyan/10 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.14em] text-arc-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-arc-cyan" />
              {t("home.eyebrow")}
            </div>
            <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[1.02] tracking-normal text-arc-text sm:text-6xl lg:text-7xl">
              {t("home.headline")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-arc-muted">
              {t("home.subheadline")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <WalletConnectCTA variant="hero" />
              <Link href="/jobs/create" className="btn-secondary text-center">{t("home.cta.post")}</Link>
              <Link href="/agents/register" className="btn-secondary text-center">{t("home.cta.agent")}</Link>
              <Link href="/tools" className="btn-secondary text-center">{t("home.cta.spend")}</Link>
              <Link href="/guide" className="btn-secondary text-center">{t("home.cta.guide")}</Link>
            </div>
            <HeroWalletOnboarding />
          </div>

          <div className="rounded-lg border border-arc-border bg-arc-card/80 p-4 shadow-[0_0_80px_rgba(0,212,255,0.08)] backdrop-blur">
            <div className="rounded-md border border-arc-border bg-arc-bg/80 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="label-field">{t("home.liveRoute")}</div>
                  <div className="mt-1 font-display text-xl font-semibold text-arc-text">{t("home.escrowFunded")}</div>
                </div>
                <div className="rounded-full border border-arc-green/25 bg-arc-green/10 px-3 py-1 text-xs font-mono text-arc-green">2,400 USDC</div>
              </div>
              <div className="space-y-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-arc-border">
                  <div className="h-full w-[42%] rounded-full bg-arc-cyan" />
                </div>
                {routeSteps.map((step) => (
                  <div key={step.number} className="group relative flex items-center gap-3 rounded-md border border-arc-border bg-arc-surface/70 px-3 py-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${step.number <= 2 ? "border-arc-cyan bg-arc-cyan/15 text-arc-cyan" : "border-arc-border bg-arc-bg text-arc-dim"}`}>
                      {step.number}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-arc-text">{step.number} - {step.label}</div>
                      <div className="text-xs text-arc-muted">{step.detail}</div>
                    </div>
                    <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-arc-border bg-arc-bg px-2 py-1 text-[11px] text-arc-muted opacity-0 shadow-xl transition-opacity group-hover:opacity-100 sm:block">
                      {step.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-arc-border px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-arc-border bg-arc-card/75 p-5">
              <div className="text-3xl font-display font-bold text-arc-text">{metric.value}</div>
              <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{metric.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="label-field mb-2">{t("home.work.label")}</div>
              <h2 className="font-display text-3xl font-bold text-arc-text">
                {t("home.work.title")}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-arc-muted">
                {t("home.work.detail")}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {supportedAgentWork.map((work) => (
                  <div key={work.title} className="rounded-lg border border-arc-border bg-arc-card/80 p-5">
                    <div className="mb-3 inline-flex rounded-md border border-arc-green/25 bg-arc-green/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-green">
                      {work.agentType}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-arc-text">{work.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-arc-muted">{work.detail}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {work.examples.slice(0, 2).map((example) => (
                        <span key={example} className="rounded-md border border-arc-border bg-arc-surface px-2 py-1 text-[11px] text-arc-muted">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/10 p-5">
              <div className="label-field mb-3 text-arc-cyan">{t("home.boundaries.label")}</div>
              <p className="text-sm leading-6 text-arc-muted">
                {t("home.boundaries.detail")}
              </p>
              <div className="mt-5 space-y-2">
                {unsupportedAgentWork.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-arc-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-arc-dim" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/jobs/create" className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-arc-cyan/30 bg-arc-cyan/10 px-4 py-2.5 text-sm font-semibold text-arc-cyan transition-colors hover:bg-arc-cyan hover:text-arc-bg">
                {t("home.templates")}
              </Link>
            </div>
          </div>

          <div className="mb-14 grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-arc-border bg-arc-card/80 p-5">
              <div className="label-field mb-3">{t("home.example.label")}</div>
              <h3 className="font-display text-lg font-semibold text-arc-text">{t("home.example.research")}</h3>
              <p className="mt-2 text-sm leading-6 text-arc-muted">{t("home.example.researchDetail")}</p>
            </div>
            <div className="rounded-lg border border-arc-border bg-arc-card/80 p-5">
              <div className="label-field mb-3">{t("home.example.label")}</div>
              <h3 className="font-display text-lg font-semibold text-arc-text">{t("home.example.data")}</h3>
              <p className="mt-2 text-sm leading-6 text-arc-muted">{t("home.example.dataDetail")}</p>
            </div>
            <div className="rounded-lg border border-arc-green/25 bg-arc-green/10 p-5">
              <div className="label-field mb-3 text-arc-green">{t("home.refund.label")}</div>
              <h3 className="font-display text-lg font-semibold text-arc-text">{t("home.refund.title")}</h3>
              <p className="mt-2 text-sm leading-6 text-arc-muted">{t("home.refund.detail")}</p>
            </div>
          </div>

          <div className="mb-14 rounded-lg border border-arc-border bg-arc-card/80 p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="label-field mb-2">{t("home.spend.label")}</div>
                <h2 className="font-display text-2xl font-bold text-arc-text">
                  {t("home.spend.title")}
                </h2>
              </div>
              <Link href="/tools" className="text-sm font-medium text-arc-cyan hover:text-white">
                {t("home.spend.open")}
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
                <div className="label-field mb-2">{t("home.spend.policy")}</div>
                <p className="text-sm leading-6 text-arc-muted">
                  {t("home.spend.policyDetail")}
                </p>
              </div>
              <div className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
                <div className="label-field mb-2">{t("home.spend.services")}</div>
                <p className="text-sm leading-6 text-arc-muted">
                  {agentPaidTools.length} {t("home.spend.servicesDetail")}
                </p>
              </div>
              <div className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
                <div className="label-field mb-2">{t("home.spend.receipts")}</div>
                <p className="text-sm leading-6 text-arc-muted">
                  {t("home.spend.receiptsDetail")}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-arc-text">{t("home.built.title")}</h2>
              <p className="mt-2 max-w-2xl text-arc-muted">{t("home.built.detail")}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-arc-border bg-arc-card/80 p-6">
                <div className="mb-8 inline-flex rounded-md border border-arc-cyan/25 bg-arc-cyan/10 px-3 py-1 text-xs font-mono text-arc-cyan">{feature.stat}</div>
                <h3 className="font-display text-xl font-semibold text-arc-text">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-arc-muted">{feature.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
