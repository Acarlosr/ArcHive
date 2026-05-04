import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoJobs, explorerTxUrl, isDemoMode, type DemoJob, type JobStatus } from "@/lib/demoData";

let supabase: SupabaseClient | null = null;

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
    expires_at: expiresAt,
    expiry_hours: Math.max(1, Math.round((new Date(expiresAt).getTime() - new Date(createdAt).getTime()) / 3600000)),
    created_at: createdAt,
  };
}

export async function createJobRecord(data: Omit<Job, "id" | "created_at" | "deliverable_hash" | "explorer_url" | "expiry_hours">): Promise<Job> {
  const client = getSupabase();
  const payload = {
    ...data,
    onchain_job_id: data.onchain_job_id ?? data.onchain_id,
    budget_usdc: data.budget_usdc ?? data.budget,
  };

  if (!client) {
    return normalizeJob({
      ...payload,
      id: `job_demo_${Date.now()}`,
      deliverable_hash: null,
      created_at: new Date().toISOString(),
    });
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
    return demoJobs
      .filter((job) => !status || job.status === status)
      .map(normalizeJob);
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
    const job = demoJobs.find((item) => item.id === id || item.onchain_job_id === id);
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
    return demoJobs
      .filter((job) => job.client_wallet.toLowerCase() === lowerWallet || job.provider_wallet.toLowerCase() === lowerWallet)
      .map(normalizeJob);
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
  if (!client) return;

  const { error } = await client.from("jobs").update({ status, ...extras }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateJobOnchainId(id: string, onchainId: string, txHash: string) {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client
    .from("jobs")
    .update({ onchain_job_id: onchainId, onchain_id: onchainId, tx_hash: txHash })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
