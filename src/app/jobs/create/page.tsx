"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { getAgents, type Agent } from "@/lib/db/agents";
import { createJobRecord } from "@/lib/db/jobs";
import { createJob, fundEscrow } from "@/lib/arc/jobMarketplace";
import { FeeEstimatePanel } from "@/components/FeeEstimatePanel";
import { UnifiedBalanceCard } from "@/components/UnifiedBalanceCard";
import { WalletOnboardingModal } from "@/components/WalletOnboardingModal";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";

type ActionState = "idle" | "creating" | "funding" | "success" | "error";

export default function CreateJobPage() {
  return (
    <WalletProviderIsland>
      <CreateJobContent />
    </WalletProviderIsland>
  );
}

function CreateJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedAgent = searchParams.get("agent");
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [state, setState] = useState<ActionState>("idle");
  const [error, setError] = useState("");
  const isLiveArcMode = process.env.NEXT_PUBLIC_ARC_MOCK_MODE === "false";
  const [form, setForm] = useState({
    title: "",
    description: "",
    selectedAgentId: "",
    budget: "1250.00",
    deadline: "2026-05-06",
  });

  useEffect(() => {
    getAgents().then((items) => {
      setAgents(items);
      const preferred = requestedAgent ? items.find((agent) => agent.name === requestedAgent) : items[0];
      if (preferred) setForm((current) => ({ ...current, selectedAgentId: preferred.id }));
    });
  }, [requestedAgent]);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === form.selectedAgentId) ?? null,
    [agents, form.selectedAgentId],
  );

  async function submit(fundImmediately: boolean) {
    if (!address || !selectedAgent || !form.title.trim() || !form.description.trim()) return;
    setState("creating");
    setError("");

    try {
      const onchain = await createJob({
        walletClient,
        providerAddress: selectedAgent.creator_wallet,
        description: form.description,
        budgetUsdc: form.budget,
        expiryHours: 72,
      });
      const funded = fundImmediately && onchain.mode !== "live";
      if (funded) {
        setState("funding");
        await fundEscrow({
          walletClient,
          jobId: onchain.jobId,
          budgetUsdc: form.budget,
          recipientAddress: selectedAgent.creator_wallet,
        });
      }

      const job = await createJobRecord({
        id: "",
        onchain_job_id: onchain.jobId,
        onchain_id: onchain.jobId,
        title: form.title.trim(),
        description: form.description.trim(),
        short_description: form.description.trim().slice(0, 140),
        budget_usdc: form.budget,
        budget: form.budget,
        status: funded ? "funded" : "open",
        client_wallet: address.toLowerCase(),
        provider_wallet: selectedAgent.creator_wallet,
        agent_id: selectedAgent.id,
        agent_name: selectedAgent.name,
        tx_hash: onchain.txHash,
        expires_at: new Date(form.deadline).toISOString(),
      } as any);

      setState("success");
      router.push(`/jobs/${job.id}`);
    } catch (err: any) {
      setError(err?.message ?? "Could not create job");
      setState("error");
    }
  }

  if (!isConnected) {
    return (
      <div className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-xl">
          <WalletOnboardingModal title="Connect to post a job" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="label-field mb-2">Create job</div>
          <h1 className="font-display text-4xl font-bold text-arc-text">Post USDC-funded work</h1>
          <p className="mt-2 max-w-2xl text-arc-muted">Define the job, choose an agent, preview fees, then create the escrow record with optional Unified Balance funding.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="grid gap-5">
              <label>
                <span className="label-field mb-2 block">Title</span>
                <input className="input-field" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Draft ERC-8183 integration spec" />
              </label>
              <label>
                <span className="label-field mb-2 block">Description</span>
                <textarea className="input-field min-h-32 resize-none" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the expected deliverable, review criteria, and output hash format." />
              </label>
              <label>
                <span className="label-field mb-2 block">Selected agent</span>
                <select className="input-field" value={form.selectedAgentId} onChange={(event) => setForm({ ...form, selectedAgentId: event.target.value })}>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.name} - {agent.agent_type}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="label-field mb-2 block">Budget in USDC</span>
                  <input className="input-field" type="number" min="1" step="0.01" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} />
                </label>
                <label>
                  <span className="label-field mb-2 block">Deadline</span>
                  <input className="input-field" type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
                </label>
              </div>

              {error && <div className="rounded-lg border border-arc-red/25 bg-arc-red/10 p-3 text-sm text-arc-red">{error}</div>}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={() => submit(false)} disabled={state === "creating" || state === "funding"} className="btn-secondary flex-1">
                  {state === "creating" ? "Creating..." : "Create Job"}
                </button>
                <button onClick={() => submit(true)} disabled={state === "creating" || state === "funding" || isLiveArcMode} className="btn-primary flex-1">
                  {state === "funding" ? "Funding Escrow..." : isLiveArcMode ? "Fund after Provider Accepts" : "Create + Fund Escrow"}
                </button>
              </div>
              {isLiveArcMode && (
                <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/10 p-3 text-sm leading-6 text-arc-muted">
                  Live ERC-8183 funding happens after the selected provider accepts the job and sets the USDC budget.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <UnifiedBalanceCard />
            <FeeEstimatePanel amount={form.budget} />
          </aside>
        </div>
      </div>
    </div>
  );
}
