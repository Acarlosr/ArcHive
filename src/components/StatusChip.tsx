"use client";

import type { JobStatus } from "@/lib/demoData";
import { useLanguage } from "@/lib/i18n";

const statusClasses: Record<string, string> = {
  open: "border-arc-cyan/30 bg-arc-cyan/10 text-arc-cyan",
  funded: "border-arc-green/30 bg-arc-green/10 text-arc-green",
  accepted: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  submitted: "border-arc-purple/30 bg-arc-purple/10 text-arc-purple",
  approved: "border-emerald-300/30 bg-emerald-300/10 text-emerald-300",
  paid: "border-arc-green/30 bg-arc-green/10 text-arc-green",
  completed: "border-arc-green/30 bg-arc-green/10 text-arc-green",
  refunded: "border-arc-orange/30 bg-arc-orange/10 text-arc-orange",
  expired: "border-arc-dim/30 bg-arc-dim/10 text-arc-dim",
};

export function StatusChip({ status }: { status: JobStatus | string }) {
  const { t } = useLanguage();

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.12em] ${statusClasses[status] ?? statusClasses.open}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t(`status.${status}`)}
    </span>
  );
}
