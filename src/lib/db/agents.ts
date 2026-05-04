import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoAgents, isDemoMode, type DemoAgent } from "@/lib/demoData";

let supabase: SupabaseClient | null = null;
const DEMO_AGENTS_STORAGE_KEY = "archve.demo.agents";

function getSupabase() {
  if (isDemoMode()) return null;
  supabase ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return supabase;
}

export interface Agent extends DemoAgent {
  onchain_id: string;
  tx_hash?: string | null;
}

function normalizeAgent(agent: DemoAgent | Agent): Agent {
  return {
    ...agent,
    onchain_id: "onchain_id" in agent ? agent.onchain_id : agent.onchain_agent_id,
  };
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStoredDemoAgents(): Agent[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_AGENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeAgent) : [];
  } catch {
    return [];
  }
}

function saveStoredDemoAgents(agents: Agent[]) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(DEMO_AGENTS_STORAGE_KEY, JSON.stringify(agents));
}

function getDemoAgents() {
  const agentsById = new Map<string, Agent>();
  for (const agent of demoAgents.map(normalizeAgent)) agentsById.set(agent.id, agent);
  for (const agent of getStoredDemoAgents()) agentsById.set(agent.id, agent);
  return Array.from(agentsById.values()).sort((a, b) => Number(b.reputation_score) - Number(a.reputation_score));
}

export async function createAgent(data: Omit<Agent, "id" | "created_at" | "jobs_completed">): Promise<Agent> {
  const client = getSupabase();
  if (!client) {
    const agent = normalizeAgent({
      ...data,
      id: `agt_demo_${Date.now()}`,
      onchain_agent_id: data.onchain_agent_id ?? data.onchain_id,
      jobs_completed: 0,
      created_at: new Date().toISOString(),
    });
    saveStoredDemoAgents([agent, ...getStoredDemoAgents().filter((item) => item.id !== agent.id)]);
    return agent;
  }

  const { data: agent, error } = await client
    .from("agents")
    .insert({
      ...data,
      onchain_agent_id: data.onchain_agent_id ?? data.onchain_id,
      jobs_completed: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return normalizeAgent(agent);
}

export async function getAgents(): Promise<Agent[]> {
  const client = getSupabase();
  if (!client) return getDemoAgents();

  const { data, error } = await client
    .from("agents")
    .select("*")
    .order("reputation_score", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeAgent);
}

export async function getAgentByOnchainId(onchainId: string): Promise<Agent | null> {
  const client = getSupabase();
  if (!client) {
    const agent = getDemoAgents().find((item) => item.onchain_agent_id === onchainId || item.onchain_id === onchainId || item.id === onchainId);
    return agent ? normalizeAgent(agent) : null;
  }

  const { data, error } = await client
    .from("agents")
    .select("*")
    .or(`onchain_agent_id.eq.${onchainId},onchain_id.eq.${onchainId},id.eq.${onchainId}`)
    .single();
  if (error) return null;
  return normalizeAgent(data);
}

export async function getAgentsByWallet(wallet: string): Promise<Agent[]> {
  const lowerWallet = wallet.toLowerCase();
  const client = getSupabase();
  if (!client) {
    return getDemoAgents()
      .filter((agent) => agent.creator_wallet.toLowerCase() === lowerWallet)
  }

  const { data, error } = await client
    .from("agents")
    .select("*")
    .eq("creator_wallet", lowerWallet)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeAgent);
}

export async function updateAgentReputation(id: string, score: number) {
  const client = getSupabase();
  if (!client) {
    const agents = getStoredDemoAgents();
    const current = getDemoAgents().find((agent) => agent.id === id || agent.onchain_id === id || agent.onchain_agent_id === id);
    if (!current) return;
    const updated = normalizeAgent({ ...current, reputation_score: score });
    saveStoredDemoAgents([updated, ...agents.filter((agent) => agent.id !== updated.id)]);
    return;
  }

  const { error } = await client
    .from("agents")
    .update({ reputation_score: score })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function incrementJobsCompleted(id: string) {
  const client = getSupabase();
  if (!client) {
    const agents = getStoredDemoAgents();
    const current = getDemoAgents().find((agent) => agent.id === id || agent.onchain_id === id || agent.onchain_agent_id === id);
    if (!current) return;
    const updated = normalizeAgent({ ...current, jobs_completed: (current.jobs_completed ?? 0) + 1 });
    saveStoredDemoAgents([updated, ...agents.filter((agent) => agent.id !== updated.id)]);
    return;
  }

  const { data: agent } = await client.from("agents").select("jobs_completed").eq("id", id).single();
  const { error } = await client
    .from("agents")
    .update({ jobs_completed: (agent?.jobs_completed ?? 0) + 1 })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
