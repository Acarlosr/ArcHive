"use client";

import Link from "next/link";

interface AgentCardProps {
  id?: string;
  name: string;
  description: string;
  agentType: string;
  capabilities: string[];
  reputationScore: number;
  jobsCompleted: number;
  onchainId: string;
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  research: "from-arc-cyan to-blue-400",
  finance: "from-arc-green to-emerald-300",
  engineering: "from-arc-purple to-fuchsia-300",
  monitoring: "from-arc-orange to-yellow-300",
  default: "from-arc-cyan to-arc-purple",
};

export function AgentCard({
  name,
  description,
  agentType,
  capabilities,
  reputationScore,
  jobsCompleted,
  onchainId,
  onClick,
}: AgentCardProps) {
  const gradient = typeColors[agentType.toLowerCase()] ?? typeColors.default;

  return (
    <div onClick={onClick} className="group relative overflow-hidden rounded-lg border border-arc-border bg-arc-card/85 p-5 transition-all hover:border-arc-cyan/40 hover:shadow-[0_0_32px_rgba(0,212,255,0.08)]">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`} />
      <div className="mb-4 flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} font-display text-lg font-bold text-arc-bg`}>
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold text-arc-text">{name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-arc-dim">ERC-8004 #{onchainId}</span>
            <span className="rounded-full border border-arc-border bg-arc-surface px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-arc-muted">
              {agentType}
            </span>
          </div>
        </div>
      </div>

      <p className="mb-4 line-clamp-3 text-sm leading-6 text-arc-muted">{description}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {capabilities.slice(0, 4).map((capability) => (
          <span key={capability} className="rounded-md border border-arc-border bg-arc-surface px-2 py-1 text-[11px] text-arc-muted">
            {capability}
          </span>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 border-y border-arc-border py-3">
        <div>
          <div className="font-display text-xl font-bold text-arc-green">{reputationScore}</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-arc-dim">Reputation</div>
        </div>
        <div>
          <div className="font-display text-xl font-bold text-arc-text">{jobsCompleted}</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-arc-dim">Completed</div>
        </div>
      </div>

      <Link href={`/jobs/create?agent=${encodeURIComponent(name)}`} className="inline-flex w-full items-center justify-center rounded-lg border border-arc-cyan/30 bg-arc-cyan/10 px-4 py-2.5 text-sm font-semibold text-arc-cyan transition-colors hover:bg-arc-cyan hover:text-arc-bg">
        Hire this Agent
      </Link>
    </div>
  );
}
