// src/lib/arc/timelock.ts
//
// App-layer approval timelock for ArcHive escrow.
//
// After a provider submits a deliverable, the client gets a review window to
// approve or dispute/refund. If the window elapses with no client action, the
// payout becomes eligible for auto-release to the provider. This mirrors the
// on-chain timelock planned for the escrow contract (roadmap item 2) but runs
// entirely in-app, so it works today in mock mode without touching the deployed
// ERC-8183 contract. When the real escrow contract lands, `getTimelockState`
// stays the single source of truth the UI reads from.

const DEFAULT_REVIEW_WINDOW_HOURS = 72;

/** Review window in hours. Configurable via NEXT_PUBLIC_ARC_REVIEW_WINDOW_HOURS. */
export function getReviewWindowHours(): number {
  const raw = process.env.NEXT_PUBLIC_ARC_REVIEW_WINDOW_HOURS;
  const parsed = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_REVIEW_WINDOW_HOURS;
}

export interface TimelockState {
  /** When the deliverable was submitted, or null if not submitted yet. */
  submittedAt: Date | null;
  /** When the payout auto-releases to the provider, or null. */
  autoReleaseAt: Date | null;
  /** Length of the review window used, in hours. */
  windowHours: number;
  /** Milliseconds left in the window (>0 within, <=0 elapsed; 0 if unknown). */
  msRemaining: number;
  /** True once the window elapsed and the client took no action. */
  eligibleForAutoRelease: boolean;
  /** True when a valid submission timestamp exists. */
  hasSubmission: boolean;
}

export function getAutoReleaseAt(
  submittedAtISO: string | null | undefined,
  windowHours: number = getReviewWindowHours(),
): Date | null {
  if (!submittedAtISO) return null;
  const t = new Date(submittedAtISO).getTime();
  if (!Number.isFinite(t)) return null;
  return new Date(t + windowHours * 3600 * 1000);
}

export function getTimelockState(
  submittedAtISO: string | null | undefined,
  now: Date = new Date(),
  windowHours: number = getReviewWindowHours(),
): TimelockState {
  const parsed = submittedAtISO ? new Date(submittedAtISO) : null;
  const valid = Boolean(parsed && Number.isFinite(parsed.getTime()));
  const autoReleaseAt = valid ? new Date(parsed!.getTime() + windowHours * 3600 * 1000) : null;
  const msRemaining = autoReleaseAt ? autoReleaseAt.getTime() - now.getTime() : 0;
  return {
    submittedAt: valid ? parsed : null,
    autoReleaseAt,
    windowHours,
    msRemaining,
    eligibleForAutoRelease: Boolean(autoReleaseAt && msRemaining <= 0),
    hasSubmission: valid,
  };
}

/** Human-readable countdown, e.g. "2d 5h 12m" or "window closed". */
export function formatCountdown(ms: number, isPt = false): string {
  if (ms <= 0) return isPt ? "prazo encerrado" : "window closed";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}
