export function EarningsCard({
  label,
  value,
  detail,
  tone = "text-arc-text",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/80 p-5">
      <div className="label-field mb-3">{label}</div>
      <div className={`text-2xl font-display font-bold ${tone}`}>{value}</div>
      <p className="mt-1 text-xs text-arc-muted">{detail}</p>
    </div>
  );
}
