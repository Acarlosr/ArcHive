"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { HeroWalletOnboarding } from "@/components/HeroWalletOnboarding";
import { WalletConnectCTA } from "@/components/WalletConnectCTA";
import { agentPaidTools, getDemoSpendReceipts } from "@/lib/agentSpend";
import { demoAgents, demoJobs } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

const toolReceipts = getDemoSpendReceipts("job_8183_001");

export default function HomePage() {
  const { locale, t } = useLanguage();
  const isPt = locale === "pt-BR";
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
  const storySteps = [
    {
      tag: t("home.story.post.tag"),
      title: t("home.story.post.title"),
      caption: t("home.story.post.caption"),
      ring: "border-arc-rose/45 bg-arc-rose/15 text-arc-rose",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M14 3H6v18h12V7z" />
          <path d="M14 3v4h4M12 12v5M9.5 14.5h5" />
        </svg>
      ),
    },
    {
      tag: t("home.story.work.tag"),
      title: t("home.story.work.title"),
      caption: t("home.story.work.caption"),
      ring: "border-arc-purple/45 bg-arc-purple/15 text-arc-purple",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      ),
    },
    {
      tag: t("home.story.escrow.tag"),
      title: t("home.story.escrow.title"),
      caption: t("home.story.escrow.caption"),
      ring: "border-arc-gold/45 bg-arc-gold/15 text-arc-gold",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      ),
    },
    {
      tag: t("home.story.pay.tag"),
      title: t("home.story.pay.title"),
      caption: t("home.story.pay.caption"),
      ring: "border-arc-green/45 bg-arc-green/15 text-arc-green",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      ),
    },
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
  const arcPrimitives = [
    { title: t("home.arc.usdc"), detail: t("home.arc.usdcDetail"), stat: "USDC" },
    { title: t("home.arc.identity"), detail: t("home.arc.identityDetail"), stat: "ERC-8004" },
    { title: t("home.arc.settlement"), detail: t("home.arc.settlementDetail"), stat: "Arc" },
    { title: t("home.arc.tools"), detail: t("home.arc.toolsDetail"), stat: "x402" },
  ];
  const trustPoints = [
    t("home.trust.client"),
    t("home.trust.provider"),
    t("home.trust.refund"),
    t("home.trust.trace"),
  ];
  const payoutFlow = [
    t("home.flow.human"),
    t("home.flow.agent"),
    t("home.flow.escrow"),
    t("home.flow.proof"),
    t("home.flow.approve"),
    t("home.flow.payout"),
  ];

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden border-b border-arc-border px-4 py-20 sm:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(189,216,207,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(189,216,207,0.026)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_10%,rgba(45,243,208,0.10),transparent_38%),radial-gradient(circle_at_80%_22%,rgba(216,185,106,0.09),transparent_30%),radial-gradient(circle_at_36%_38%,rgba(168,85,247,0.045),transparent_26%),linear-gradient(180deg,rgba(5,9,8,0.18)_0%,#050908_88%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-arc-cyan/25 bg-arc-cyan/10 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.14em] text-arc-cyan shadow-[0_0_28px_rgba(24,242,194,0.10)]">
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
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-arc-muted">
              <span>{isPt ? "Precisa configurar a testnet?" : "Need testnet setup?"}</span>
              <Link href="/guide" className="font-medium text-arc-cyan transition-colors hover:text-white">
                {isPt ? "Adicionar Arc Testnet" : "Add Arc Testnet"}
              </Link>
              <Link href="/tools" className="font-medium text-arc-gold transition-colors hover:text-white">
                {isPt ? "Explorar tools medidas" : "Explore metered tools"}
              </Link>
            </div>
          </div>

          <div className="agent-orbit-card min-h-[620px] border-arc-border/90 bg-[#0d1412]/80 p-5">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="label-field">{t("home.liveRoute")}</div>
                <div className="mt-1 font-display text-xl font-semibold text-arc-text">{t("home.escrowFunded")}</div>
              </div>
              <div className="rounded-full border border-arc-gold/30 bg-arc-gold/10 px-3 py-1 text-xs font-mono text-arc-gold">2,400 USDC</div>
            </div>

            <div className="relative z-10 mt-6 rounded-lg border border-arc-border/80 bg-[#060b0a]/70 p-5">
              <div className="label-field mb-4">{t("home.story.label")}</div>
              <div>
                {storySteps.map((step, index) => (
                  <div key={step.title} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`agent-node-pulse flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${step.ring}`}
                        style={{ "--node-delay": `${index * 0.7}s` } as CSSProperties}
                      >
                        {step.icon}
                      </div>
                      {index < storySteps.length - 1 && (
                        <div className="relative my-1.5 h-8 w-px bg-gradient-to-b from-arc-border to-arc-border/25">
                          <span
                            className="route-spark left-1/2 top-1"
                            style={{ "--spark-delay": `${index * 0.5}s` } as CSSProperties}
                          />
                        </div>
                      )}
                    </div>
                    <div className="pb-5">
                      <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-arc-dim">{step.tag}</div>
                      <div className="mt-0.5 font-display text-base font-semibold text-arc-text">{step.title}</div>
                      <div className="mt-0.5 text-sm leading-6 text-arc-muted">{step.caption}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-3">
              {metrics.slice(0, 3).map((metric) => (
                <div key={metric.label} className="rounded-md border border-arc-border bg-arc-bg/55 p-3">
                  <div className="font-display text-xl font-bold text-arc-text">{metric.value}</div>
                  <div className="mt-1 text-[9px] font-mono uppercase tracking-[0.14em] text-arc-dim">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-4 border-t border-arc-border/60 pt-4 text-center text-[10px] font-mono uppercase tracking-[0.12em] text-arc-dim">
              {t("home.story.trust")}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-arc-border px-4 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-lg border border-arc-border bg-arc-card/82 p-6">
            <div className="label-field mb-2">{t("home.arc.label")}</div>
            <h2 className="font-display text-3xl font-bold text-arc-text">{t("home.arc.title")}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-arc-muted">{t("home.arc.detail")}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {arcPrimitives.map((item) => (
                <div key={item.title} className="rounded-lg border border-arc-border bg-arc-surface/70 p-4">
                  <div className="mb-5 inline-flex rounded-md border border-arc-cyan/25 bg-arc-cyan/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-cyan">
                    {item.stat}
                  </div>
                  <h3 className="font-display text-base font-semibold text-arc-text">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-arc-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/10 p-6">
              <div className="label-field mb-2 text-arc-cyan">{t("home.flow.label")}</div>
              <h2 className="font-display text-2xl font-bold text-arc-text">{t("home.flow.title")}</h2>
              <div className="mt-5 grid gap-2">
                {payoutFlow.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-md border border-arc-border bg-arc-bg/55 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-arc-cyan/35 bg-arc-cyan/10 font-mono text-xs text-arc-cyan">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-arc-text">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-lg border border-arc-border bg-arc-card/82 p-5">
                <h3 className="font-display text-lg font-semibold text-arc-text">{t("home.proof.title")}</h3>
                <p className="mt-2 text-sm leading-6 text-arc-muted">{t("home.proof.detail")}</p>
              </div>
              <div className="rounded-lg border border-arc-green/25 bg-arc-green/10 p-5">
                <h3 className="font-display text-lg font-semibold text-arc-text">{t("home.trust.title")}</h3>
                <div className="mt-3 space-y-2">
                  {trustPoints.map((point) => (
                    <div key={point} className="flex gap-2 text-sm leading-6 text-arc-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-arc-green" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-arc-border px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <HeroWalletOnboarding />
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
