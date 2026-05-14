"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { getAgents, type Agent } from "@/lib/db/agents";
import { createJobRecord } from "@/lib/db/jobs";
import { createJob, fundEscrow } from "@/lib/arc/jobMarketplace";
import { AgentSpendPolicyCard } from "@/components/AgentSpendPolicyCard";
import { FeeEstimatePanel } from "@/components/FeeEstimatePanel";
import { UnifiedBalanceCard } from "@/components/UnifiedBalanceCard";
import { WalletOnboardingModal } from "@/components/WalletOnboardingModal";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";
import { TestnetFundsCard } from "@/components/TestnetFundsCard";
import { jobTemplates } from "@/lib/agentWork";

type ActionState = "idle" | "creating" | "funding" | "success" | "error";

function defaultDeadline() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

function normalizeBudget(value: string) {
  return value.replace(",", ".").trim();
}

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
  const [form, setForm] = useState(() => ({
    title: "",
    description: "",
    selectedAgentId: "",
    budget: "75.00",
    deadline: defaultDeadline(),
  }));

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

  function applyTemplate(template: (typeof jobTemplates)[number]) {
    const matchingAgent = agents.find(
      (agent) => agent.agent_type.toLowerCase() === template.agentType.toLowerCase(),
    );

    setForm((current) => ({
      ...current,
      title: template.title,
      description: template.description,
      budget: template.budget,
      selectedAgentId: matchingAgent?.id ?? current.selectedAgentId,
    }));
  }

  async function submit(fundImmediately: boolean) {
    if (!address || !selectedAgent || !form.title.trim() || !form.description.trim()) return;
    const budget = normalizeBudget(form.budget);
    setState("creating");
    setError("");

    try {
      const onchain = await createJob({
        walletClient,
        providerAddress: selectedAgent.creator_wallet,
        description: form.description,
        budgetUsdc: budget,
        expiryHours: 72,
      });
      const funded = fundImmediately && onchain.mode !== "live";
      if (funded) {
        setState("funding");
        await fundEscrow({
          walletClient,
          jobId: onchain.jobId,
          budgetUsdc: budget,
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
        budget_usdc: budget,
        budget,
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
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[420px_1fr]">
          <WalletOnboardingModal title="Connect to post a job" />
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">Before you connect</div>
            <h1 className="font-display text-2xl font-bold text-arc-text">Choose a supported job type</h1>
            <p className="mt-2 text-sm leading-6 text-arc-muted">
              ArcHive currently works best for research, structured data, deliverable scoring, and workflow support. You can browse these templates first, then connect a wallet when you are ready to create the onchain job.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {jobTemplates.map((template) => (
                <div key={template.title} className="rounded-lg border border-arc-border bg-arc-surface/70 p-4">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-green">
                    {template.agentType}
                  </div>
                  <div className="font-display text-sm font-semibold text-arc-text">{template.title}</div>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-arc-muted">{template.description}</p>
                  <div className="mt-3 font-mono text-xs text-arc-cyan">{template.budget} USDC example budget</div>
                </div>
              ))}
            </div>
          </div>
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
          <p className="mt-2 max-w-2xl text-arc-muted">Define a supported agent task, choose a provider, preview fees, then create the escrow record with optional Unified Balance funding.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="grid gap-5">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="label-field">Job templates</span>
                  <span className="text-xs text-arc-dim">Optimized for the current agent registry</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {jobTemplates.map((template) => (
                    <button
                      key={template.title}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="rounded-lg border border-arc-border bg-arc-surface/70 p-4 text-left transition-colors hover:border-arc-cyan/35 hover:bg-arc-cyan/10"
                    >
                      <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-green">
                        {template.agentType}
                      </div>
                      <div className="font-display text-sm font-semibold text-arc-text">{template.title}</div>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-arc-muted">{template.description}</p>
                      <div className="mt-3 font-mono text-xs text-arc-cyan">{template.budget} USDC</div>
                    </button>
                  ))}
                </div>
              </div>

              <label>
                <span className="label-field mb-2 block">Title</span>
                <input className="input-field" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Draft ERC-8183 integration spec" />
              </label>
              <label>
                <span className="label-field mb-2 block">Description</span>
                <textarea className="input-field min-h-32 resize-none" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the expected work, review criteria, and proof link or file reference the provider should submit." />
              </label>
              <label>
                <span className="label-field mb-2 block">Selected agent</span>
                <select className="input-field" value={form.selectedAgentId} onChange={(event) => setForm({ ...form, selectedAgentId: event.target.value })}>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.name} - {agent.agent_type}</option>
                  ))}
                </select>
                {selectedAgent && (
                  <p className="mt-2 text-xs leading-5 text-arc-muted">
                    Best fit for {selectedAgent.capabilities.slice(0, 3).join(", ")}.
                  </p>
                )}
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="label-field mb-2 block">Budget in USDC</span>
                  <input className="input-field" inputMode="decimal" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} placeholder="75.00" />
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
                  Live ERC-8183 funding happens after the selected provider accepts the job and sets the USDC budget. The current flow is built for analysis, structured data, workflow, and deliverable-review jobs, not autonomous trading or token purchases.
                </div>
              )}
              <div className="rounded-lg border border-arc-border bg-arc-surface/70 p-3 text-sm leading-6 text-arc-muted">
                If the submitted work is not acceptable, the client does not have to approve payment immediately. Funds remain in escrow while the client requests revision or uses the refund path when eligible.
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <TestnetFundsCard compact />
            <UnifiedBalanceCard />
            <FeeEstimatePanel amount={normalizeBudget(form.budget)} />
            <AgentSpendPolicyCard
              jobId="draft-job"
              agentId={selectedAgent?.id ?? "draft-agent"}
              jobBudgetUsdc={normalizeBudget(form.budget)}
              enabled={false}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
