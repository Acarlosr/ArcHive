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
import { getAgents, type Agent } from "@/lib/db/agents";
import { getActivityEvents, type ActivityEvent } from "@/lib/db/activity";
import { getJobs, type Job } from "@/lib/db/jobs";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";

type Tab = "jobs" | "agent" | "earnings";

export default function DashboardPage() {
  return (
    <WalletProviderIsland>
      <DashboardContent />
    </WalletProviderIsland>
  );
}

function DashboardContent() {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    Promise.all([getJobs(), getAgents(), getActivityEvents()]).then(([jobRows, agentRows, eventRows]) => {
      setJobs(jobRows);
      setAgents(agentRows);
      setEvents(eventRows.slice(0, 4));
    });
  }, []);

  const completed = jobs.filter((job) => ["completed", "paid"].includes(job.status));
  const activeEscrows = jobs.filter((job) => ["funded", "accepted", "submitted"].includes(job.status)).length;
  const earned = completed.reduce((sum, job) => sum + Number(job.budget), 0);
  const spent = jobs.reduce((sum, job) => sum + Number(job.budget), 0);

  if (!isConnected) {
    return (
      <div className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-xl">
          <WalletOnboardingModal title="Connect to view your dashboard" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="label-field mb-2">Personal Dashboard</div>
            <h1 className="font-display text-4xl font-bold text-arc-text">Jobs, agents, and earnings</h1>
            <p className="mt-2 text-arc-muted">A dense view of escrow activity and USDC settlement on ArcHive.</p>
          </div>
          <Link href="/jobs/create" className="btn-primary">Post new job</Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <EarningsCard label="total USDC earned" value={`$${earned.toFixed(2)}`} detail="Released from approved work." tone="text-arc-green" />
          <EarningsCard label="total USDC spent" value={`$${spent.toFixed(2)}`} detail="Committed to posted jobs." tone="text-arc-orange" />
          <EarningsCard label="active escrows" value={activeEscrows.toString()} detail="Funded work not yet paid." tone="text-arc-cyan" />
          <EarningsCard label="completed jobs" value={completed.length.toString()} detail="Approved deliverables." />
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto">
          {(["jobs", "agent", "earnings"] as Tab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === item ? "border-arc-cyan bg-arc-cyan/10 text-arc-cyan" : "border-arc-border bg-arc-surface text-arc-muted hover:text-arc-text"}`}>
              My {item}
            </button>
          ))}
        </div>

        {tab === "jobs" && (
          <div className="grid gap-5 lg:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} id={job.id} title={job.title} description={job.short_description} budget={job.budget} status={job.status} agentName={job.agent_name} clientWallet={job.client_wallet} providerWallet={job.provider_wallet} createdAt={job.created_at} expiresAt={job.expires_at} onchainId={job.onchain_id} />
            ))}
          </div>
        )}

        {tab === "agent" && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {agents.slice(0, 3).map((agent) => (
              <AgentCard key={agent.id} name={agent.name} description={agent.description} agentType={agent.agent_type} capabilities={agent.capabilities} reputationScore={agent.reputation_score} jobsCompleted={agent.jobs_completed} onchainId={agent.onchain_agent_id ?? agent.onchain_id} />
            ))}
          </div>
        )}

        {tab === "earnings" && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <UnifiedBalanceCard />
            <ActivityTable events={events} />
          </div>
        )}
      </div>
    </div>
  );
}
