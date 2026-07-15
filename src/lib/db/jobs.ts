import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoJobs, explorerTxUrl, isDemoMode, type DemoJob, type JobStatus } from "@/lib/demoData";

let supabase: SupabaseClient | null = null;
const DEMO_JOBS_STORAGE_KEY = "archve.demo.jobs";

function getSupabase() {
  if (isDemoMode()) return null;
  supabase ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return supabase;
}

export interface Job extends DemoJob {
  onchain_id: string | null;
  budget: string;
  expiry_hours: number;
  explorer_url: string | null;
}

function normalizeJob(job: Partial<DemoJob> & Record<string, any>): Job {
  const createdAt = job.created_at ?? new Date().toISOString();
  const expiresAt = job.expires_at ?? new Date(Date.now() + 72 * 3600 * 1000).toISOString();
  const budget = String(job.budget_usdc ?? job.budget ?? "0.00");
  const title = job.title ?? String(job.description ?? "Untitled job").slice(0, 72);

  return {
    id: job.id ?? `job_${Date.now()}`,
    onchain_job_id: job.onchain_job_id ?? job.onchain_id ?? null,
    onchain_id: job.onchain_id ?? job.onchain_job_id ?? null,
    title,
    description: job.description ?? "",
    short_description: job.short_description ?? job.description ?? title,
    budget_usdc: budget,
    budget,
    status: (job.status ?? "open") as JobStatus,
    client_wallet: job.client_wallet ?? "",
    provider_wallet: job.provider_wallet ?? "",
    agent_id: job.agent_id ?? "",
    agent_name: job.agent_name ?? "",
    deliverable_hash: job.deliverable_hash ?? null,
    tx_hash: job.tx_hash ?? null,
    explorer_url: job.tx_hash ? explorerTxUrl(job.tx_hash) : null,
    // Approval timelock: real submissions store their own submitted_at; seed
    // demo jobs already in "submitted" get a recent fallback so the countdown
    // renders live instead of showing an immediately-elapsed window.
    submitted_at:
      job.submitted_at ??
      ((job.status ?? "open") === "submitted"
        ? new Date(Date.now() - 6 * 3600 * 1000).toISOString()
        : null),
    expires_at: expiresAt,
    expiry_hours: Math.max(1, Math.round((new Date(expiresAt).getTime() - new Date(createdAt).getTime()) / 3600000)),
    created_at: createdAt,
  };
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStoredDemoJobs(): Job[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_JOBS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeJob) : [];
  } catch {
    return [];
  }
}

function saveStoredDemoJobs(jobs: Job[]) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(DEMO_JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

function getDemoJobs(status?: string) {
  const jobsById = new Map<string, Job>();
  for (const job of demoJobs.map(normalizeJob)) jobsById.set(job.id, job);
  for (const job of getStoredDemoJobs()) jobsById.set(job.id, job);
  return Array.from(jobsById.values())
    .filter((job) => !status || job.status === status)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createJobRecord(data: Omit<Job, "id" | "created_at" | "deliverable_hash" | "explorer_url" | "expiry_hours">): Promise<Job> {
  const client = getSupabase();
  const { id: _ignoredId, ...dataWithoutEmptyId } = data as typeof data & { id?: string };
  const payload = {
    ...dataWithoutEmptyId,
    onchain_job_id: dataWithoutEmptyId.onchain_job_id ?? dataWithoutEmptyId.onchain_id,
    budget_usdc: dataWithoutEmptyId.budget_usdc ?? dataWithoutEmptyId.budget,
  };

  if (!client) {
    const job = normalizeJob({
      ...payload,
      id: `job_demo_${Date.now()}`,
      deliverable_hash: null,
      created_at: new Date().toISOString(),
    });
    saveStoredDemoJobs([job, ...getStoredDemoJobs().filter((item) => item.id !== job.id)]);
    return job;
  }

  const { data: job, error } = await client
    .from("jobs")
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return normalizeJob(job);
}

export async function getJobs(status?: string): Promise<Job[]> {
  const client = getSupabase();
  if (!client) {
    return getDemoJobs(status);
  }

  let query = client.from("jobs").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeJob);
}

export async function getJobById(id: string): Promise<Job | null> {
  const client = getSupabase();
  if (!client) {
    const job = getDemoJobs().find((item) => item.id === id || item.onchain_job_id === id || item.onchain_id === id);
    return job ? normalizeJob(job) : null;
  }

  const { data, error } = await client
    .from("jobs")
    .select("*")
    .or(`id.eq.${id},onchain_job_id.eq.${id},onchain_id.eq.${id}`)
    .single();
  if (error) return null;
  return normalizeJob(data);
}

export async function getJobsByWallet(wallet: string): Promise<Job[]> {
  const lowerWallet = wallet.toLowerCase();
  const client = getSupabase();
  if (!client) {
    return getDemoJobs()
      .filter((job) => job.client_wallet.toLowerCase() === lowerWallet || job.provider_wallet.toLowerCase() === lowerWallet)
  }

  const { data, error } = await client
    .from("jobs")
    .select("*")
    .or(`client_wallet.eq.${lowerWallet},provider_wallet.eq.${lowerWallet}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeJob);
}

export async function updateJobStatus(id: string, status: Job["status"], extras?: Partial<Job>) {
  const client = getSupabase();
  if (!client) {
    const jobs = getStoredDemoJobs();
    const current = getDemoJobs().find((job) => job.id === id || job.onchain_id === id || job.onchain_job_id === id);
    if (!current) return;
    const updated = normalizeJob({ ...current, status, ...extras });
    saveStoredDemoJobs([updated, ...jobs.filter((job) => job.id !== updated.id)]);
    return;
  }

  const { error } = await client.from("jobs").update({ status, ...extras }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateJobOnchainId(id: string, onchainId: string, txHash: string) {
  const client = getSupabase();
  if (!client) {
    const jobs = getStoredDemoJobs();
    const current = getDemoJobs().find((job) => job.id === id);
    if (!current) return;
    const updated = normalizeJob({ ...current, onchain_job_id: onchainId, onchain_id: onchainId, tx_hash: txHash });
    saveStoredDemoJobs([updated, ...jobs.filter((job) => job.id !== updated.id)]);
    return;
  }

  const { error } = await client
    .from("jobs")
    .update({ onchain_job_id: onchainId, onchain_id: onchainId, tx_hash: txHash })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
