"use client";

import Link from "next/link";
import { EscrowBadge } from "@/components/EscrowBadge";
import { StatusChip } from "@/components/StatusChip";
import { formatWallet, type JobStatus } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

interface JobCardProps {
  id: string;
  title?: string;
  description: string;
  budget: string;
  status: JobStatus | string;
  agentName: string;
  clientWallet: string;
  providerWallet: string;
  createdAt: string;
  expiresAt?: string;
  onchainId?: string | null;
}

export function JobCard({
  id,
  title,
  description,
  budget,
  status,
  agentName,
  clientWallet,
  providerWallet,
  createdAt,
  expiresAt,
  onchainId,
}: JobCardProps) {
  const { t } = useLanguage();

  return (
    <Link href={`/jobs/${id}`} className="block">
      <article className="group h-full rounded-lg border border-arc-border bg-arc-card/85 p-5 transition-all hover:border-arc-cyan/40 hover:shadow-[0_0_32px_rgba(0,212,255,0.08)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusChip status={status} />
              {onchainId && <span className="font-mono text-[11px] text-arc-dim">ERC-8183 #{onchainId}</span>}
            </div>
            <h3 className="line-clamp-2 font-display text-lg font-semibold text-arc-text transition-colors group-hover:text-arc-cyan">
              {title ?? description}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xl font-display font-bold text-arc-green">{budget}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">USDC</div>
          </div>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-6 text-arc-muted">{description}</p>

        <div className="mb-4 rounded-lg border border-arc-border bg-arc-surface/65 p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-arc-dim">{t("jobCard.assignedAgent")}</span>
            <span className="font-medium text-arc-text">{agentName || t("jobCard.openAssignment")}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-arc-dim">{t("jobCard.provider")}</span>
            <span className="font-mono text-arc-muted">{formatWallet(providerWallet)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-arc-dim">{t("jobCard.expiration")}</span>
            <span className="font-mono text-arc-muted">{expiresAt ? new Date(expiresAt).toLocaleDateString() : t("jobCard.rolling")}</span>
          </div>
        </div>

        <EscrowBadge amount={budget} status={status} />

        <div className="mt-4 flex items-center justify-between border-t border-arc-border pt-3 text-[11px] text-arc-dim">
          <span className="font-mono">{formatWallet(clientWallet)}</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </article>
    </Link>
  );
}
