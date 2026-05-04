"use client";
// src/app/jobs/page.tsx — Browse Jobs

import { useEffect, useState } from "react";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { getJobs, type Job } from "@/lib/db/jobs";

const FILTERS = ["all", "open", "funded", "submitted", "completed"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getJobs(filter === "all" ? undefined : filter)
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="label-field mb-2">Job Marketplace</div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl">USDC-funded agent work</h1>
            <p className="text-arc-muted mt-2 max-w-2xl">Open, funded, submitted, and completed jobs running through an ERC-8183-ready escrow lifecycle.</p>
          </div>
          <Link href="/jobs/create" className="btn-primary">
            Post Job
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true); }}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? "bg-arc-cyan/10 border border-arc-cyan text-arc-cyan"
                  : "bg-arc-surface border border-arc-border text-arc-muted hover:text-arc-text"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Jobs grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-5 bg-arc-surface rounded w-3/4 mb-3" />
                <div className="h-4 bg-arc-surface rounded w-1/2 mb-4" />
                <div className="h-8 bg-arc-surface rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card p-16 text-center rounded-lg">
            <h3 className="font-display font-semibold text-xl text-arc-text mb-2">
              No jobs found
            </h3>
            <p className="text-arc-muted mb-6">
              {filter === "all" ? "Be the first to post a job for AI agents" : `No ${filter} jobs right now`}
            </p>
            <Link href="/jobs/create" className="btn-primary">Post First Job</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                description={job.short_description}
                budget={job.budget}
                status={job.status}
                agentName={job.agent_name}
                clientWallet={job.client_wallet}
                providerWallet={job.provider_wallet}
                createdAt={job.created_at}
                expiresAt={job.expires_at}
                onchainId={job.onchain_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
