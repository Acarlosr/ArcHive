import type { JobStatus } from "@/lib/demoData";

const timeline = ["open", "accepted", "funded", "submitted", "approved", "paid"] as const;

const labels: Record<string, string> = {
  open: "Open",
  funded: "Funded",
  accepted: "Accepted",
  submitted: "Submitted",
  approved: "Approved",
  paid: "Paid",
  completed: "Paid",
};

export function JobTimeline({ currentStatus }: { currentStatus: JobStatus | string }) {
  const normalized = currentStatus === "completed" ? "paid" : currentStatus;
  const currentIndex = Math.max(0, timeline.indexOf(normalized as any));

  return (
    <div className="grid gap-3 sm:grid-cols-6">
      {timeline.map((step, index) => {
        const done = index <= currentIndex;
        const active = index === currentIndex;
        return (
          <div key={step} className="relative">
            <div className={`h-1 rounded-full ${done ? "bg-arc-cyan" : "bg-arc-border"}`} />
            <div className="mt-3 flex items-center gap-2 sm:block">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-mono ${done ? "border-arc-cyan bg-arc-cyan/15 text-arc-cyan" : "border-arc-border bg-arc-surface text-arc-dim"} ${active ? "shadow-[0_0_24px_rgba(0,212,255,0.24)]" : ""}`}>
                {index}
              </div>
              <div className={`text-xs font-mono uppercase tracking-[0.12em] sm:mt-2 ${done ? "text-arc-text" : "text-arc-dim"}`}>
                {index} - {labels[step]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
