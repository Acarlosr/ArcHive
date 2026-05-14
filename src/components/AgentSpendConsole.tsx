"use client";

import { useMemo, useState } from "react";
import {
  agentPaidTools,
  buildToolSpendReceipts,
  createDemoSpendPolicy,
  estimateToolSpend,
  type ToolSpendReceipt,
} from "@/lib/agentSpend";

type SpendRunState = "idle" | "loading" | "success" | "error";

const demoJob = {
  id: "job_8183_001",
  agentId: "agt_01",
  budgetUsdc: "2400.00",
};

export function AgentSpendConsole() {
  const [selectedToolIds, setSelectedToolIds] = useState(["summarize-pdf", "extract-json", "score-deliverable"]);
  const [state, setState] = useState<SpendRunState>("idle");
  const [message, setMessage] = useState("Ready to authorize job-linked tool calls.");
  const [receipts, setReceipts] = useState<ToolSpendReceipt[]>([]);

  const policy = useMemo(
    () =>
      createDemoSpendPolicy({
        jobId: demoJob.id,
        agentId: demoJob.agentId,
        jobBudgetUsdc: demoJob.budgetUsdc,
      }),
    [],
  );

  const estimate = useMemo(
    () => estimateToolSpend({ policy, toolIds: selectedToolIds }),
    [policy, selectedToolIds],
  );

  function toggleTool(toolId: string) {
    setSelectedToolIds((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId],
    );
  }

  async function runSpendSimulation() {
    setState("loading");
    setMessage("Authorizing x402 calls against the job spend policy.");
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    if (!estimate.withinPolicy) {
      setState("error");
      setMessage(estimate.blockedReasons[0] ?? "Spend request blocked by policy.");
      return;
    }

    setReceipts(
      buildToolSpendReceipts({
        jobId: demoJob.id,
        agentId: demoJob.agentId,
        toolIds: selectedToolIds,
      }),
    );
    setState("success");
    setMessage("Tool calls settled and receipts attached to the job ledger.");
  }

  return (
    <section className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <div className="label-field mb-2">Spend router</div>
          <h2 className="font-display text-2xl font-bold text-arc-text">
            Job-linked nanopayments
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-arc-muted">
            Demo job {demoJob.id} lets an agent buy metered tools while every call remains capped,
            receipted, and tied back to escrow-funded work.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <PolicyStat label="max per call" value={policy.maxPerCallUsdc} />
          <PolicyStat label="remaining" value={policy.remainingUsdc} />
          <PolicyStat label="selected" value={estimate.totalUsdc} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-3 md:grid-cols-2">
          {agentPaidTools.map((tool) => {
            const checked = selectedToolIds.includes(tool.id);

            return (
              <label
                key={tool.id}
                className={`flex min-h-[150px] cursor-pointer flex-col rounded-lg border p-4 transition-colors ${
                  checked
                    ? "border-arc-cyan/45 bg-arc-cyan/10"
                    : "border-arc-border bg-arc-surface/70 hover:border-arc-cyan/25"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-base font-semibold text-arc-text">{tool.name}</div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.14em] text-arc-dim">
                      {tool.method} {tool.endpoint}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTool(tool.id)}
                    className="mt-1 h-4 w-4 accent-cyan-400"
                  />
                </div>
                <p className="text-sm leading-6 text-arc-muted">{tool.description}</p>
                <div className="mt-auto pt-4 font-mono text-xs text-arc-green">
                  {tool.priceUsdc} USDC
                </div>
              </label>
            );
          })}
        </div>

        <aside className="rounded-lg border border-arc-border bg-arc-bg/55 p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="label-field mb-2">Authorization</div>
              <h3 className="font-display text-lg font-semibold text-arc-text">Spend state</h3>
            </div>
            <span className={statusClassName(state)}>{state}</span>
          </div>

          <p className="text-sm leading-6 text-arc-muted">{message}</p>

          {!estimate.withinPolicy ? (
            <div className="mt-4 rounded-md border border-arc-red/25 bg-arc-red/10 p-3 text-sm text-arc-red">
              {estimate.blockedReasons.join(" ")}
            </div>
          ) : null}

          <button
            type="button"
            onClick={runSpendSimulation}
            disabled={state === "loading" || selectedToolIds.length === 0}
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-arc-green/30 bg-arc-green/10 px-4 py-2.5 text-sm font-semibold text-arc-green transition-colors hover:bg-arc-green hover:text-arc-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === "loading" ? "Authorizing..." : "Run agent spend"}
          </button>

          <div className="mt-5 rounded-md border border-arc-border bg-arc-surface/70 p-3">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">
              Receipts
            </div>
            {receipts.length > 0 ? (
              <div className="space-y-2">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="rounded border border-arc-border bg-arc-bg/70 p-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-arc-muted">{receipt.toolName}</span>
                      <span className="font-mono text-arc-green">{receipt.amountUsdc}</span>
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] text-arc-dim">{receipt.txHash}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs leading-5 text-arc-muted">
                No receipts in this session yet.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function PolicyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-arc-border bg-arc-surface/70 p-3">
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{label}</div>
      <div className="mt-1 font-display text-xl font-bold text-arc-text">{value}</div>
      <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">USDC</div>
    </div>
  );
}

function statusClassName(state: SpendRunState) {
  const base = "rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.12em]";
  if (state === "success") return `${base} border-arc-green/30 bg-arc-green/10 text-arc-green`;
  if (state === "error") return `${base} border-arc-red/30 bg-arc-red/10 text-arc-red`;
  if (state === "loading") return `${base} border-arc-cyan/30 bg-arc-cyan/10 text-arc-cyan`;
  return `${base} border-arc-border bg-arc-surface text-arc-dim`;
}
