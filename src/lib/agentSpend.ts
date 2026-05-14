export type PaidToolMethod = "GET" | "POST";

export type SpendPolicyStatus = "draft" | "active" | "paused";

export type ToolSpendReceiptStatus = "authorized" | "settled" | "blocked";

export interface AgentPaidTool {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: "research" | "data" | "review" | "memory";
  endpoint: string;
  method: PaidToolMethod;
  priceUsdc: string;
  rail: "x402 + Circle Gateway";
  network: "Arc Testnet";
}

export interface AgentSpendPolicy {
  id: string;
  jobId: string;
  agentId: string;
  status: SpendPolicyStatus;
  maxPerCallUsdc: string;
  maxTotalUsdc: string;
  spentUsdc: string;
  remainingUsdc: string;
  allowedToolIds: string[];
  requireReceipt: boolean;
  settlementRail: "Circle Gateway Nanopayments";
}

export interface ToolSpendReceipt {
  id: string;
  jobId: string;
  agentId: string;
  toolId: string;
  toolName: string;
  amountUsdc: string;
  rail: "x402 + Circle Gateway";
  network: "Arc Testnet";
  txHash: `0x${string}`;
  status: ToolSpendReceiptStatus;
  purpose: string;
  createdAt: string;
}

export const agentPaidTools: AgentPaidTool[] = [
  {
    id: "summarize-pdf",
    name: "Summarize PDF",
    description: "Condense source material into an agent-readable brief for a funded job.",
    provider: "ArcHive Seller",
    category: "research",
    endpoint: "/tools/summarize",
    method: "POST",
    priceUsdc: "0.0010",
    rail: "x402 + Circle Gateway",
    network: "Arc Testnet",
  },
  {
    id: "extract-json",
    name: "Extract JSON",
    description: "Convert unstructured text into strict JSON for downstream job workflows.",
    provider: "ArcHive Seller",
    category: "data",
    endpoint: "/tools/extract-json",
    method: "POST",
    priceUsdc: "0.0005",
    rail: "x402 + Circle Gateway",
    network: "Arc Testnet",
  },
  {
    id: "score-deliverable",
    name: "Score Deliverable",
    description: "Evaluate submitted work against job requirements before approval.",
    provider: "ArcHive Seller",
    category: "review",
    endpoint: "/tools/score-deliverable",
    method: "POST",
    priceUsdc: "0.0020",
    rail: "x402 + Circle Gateway",
    network: "Arc Testnet",
  },
  {
    id: "agent-memory-lookup",
    name: "Agent Memory Lookup",
    description: "Retrieve compact context snippets for agents that need paid memory on demand.",
    provider: "ArcHive Seller",
    category: "memory",
    endpoint: "/premium-data",
    method: "GET",
    priceUsdc: "0.0010",
    rail: "x402 + Circle Gateway",
    network: "Arc Testnet",
  },
];

export function formatUsdc(value: string | number, precision = 4) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "0.0000";
  return amount.toFixed(precision);
}

export function createDemoSpendPolicy({
  jobId,
  agentId,
  jobBudgetUsdc,
  spentUsdc = "0.0035",
  status = "active",
}: {
  jobId: string;
  agentId: string;
  jobBudgetUsdc: string;
  spentUsdc?: string;
  status?: SpendPolicyStatus;
}): AgentSpendPolicy {
  const budget = Number(jobBudgetUsdc || 0);
  const maxTotal = Math.min(Math.max(budget * 0.03, 0.01), 25);
  const spent = Number(spentUsdc || 0);
  const remaining = Math.max(maxTotal - spent, 0);

  return {
    id: `policy-${jobId}`,
    jobId,
    agentId,
    status,
    maxPerCallUsdc: "0.0100",
    maxTotalUsdc: maxTotal.toFixed(2),
    spentUsdc: formatUsdc(spent),
    remainingUsdc: formatUsdc(remaining),
    allowedToolIds: agentPaidTools.map((tool) => tool.id),
    requireReceipt: true,
    settlementRail: "Circle Gateway Nanopayments",
  };
}

export function estimateToolSpend({
  policy,
  toolIds,
}: {
  policy: AgentSpendPolicy;
  toolIds: string[];
}) {
  const selectedTools = agentPaidTools.filter((tool) => toolIds.includes(tool.id));
  const total = selectedTools.reduce((sum, tool) => sum + Number(tool.priceUsdc), 0);
  const maxPerCall = Number(policy.maxPerCallUsdc);
  const remaining = Number(policy.remainingUsdc);
  const blockedReasons: string[] = [];

  const unauthorized = selectedTools.filter((tool) => !policy.allowedToolIds.includes(tool.id));
  if (unauthorized.length > 0) {
    blockedReasons.push("One or more tools are outside this job policy.");
  }

  if (selectedTools.some((tool) => Number(tool.priceUsdc) > maxPerCall)) {
    blockedReasons.push("At least one tool exceeds the per-call cap.");
  }

  if (total > remaining) {
    blockedReasons.push("Selected calls exceed the remaining job spend budget.");
  }

  if (policy.status !== "active") {
    blockedReasons.push("The spend policy is not active.");
  }

  return {
    selectedTools,
    totalUsdc: formatUsdc(total),
    remainingAfterUsdc: formatUsdc(Math.max(remaining - total, 0)),
    withinPolicy: blockedReasons.length === 0,
    blockedReasons,
  };
}

export function buildToolSpendReceipts({
  jobId,
  agentId,
  toolIds,
  startedAt = new Date().toISOString(),
}: {
  jobId: string;
  agentId: string;
  toolIds: string[];
  startedAt?: string;
}): ToolSpendReceipt[] {
  const started = new Date(startedAt);

  return agentPaidTools
    .filter((tool) => toolIds.includes(tool.id))
    .map((tool, index) => ({
      id: `receipt-${jobId}-${tool.id}`,
      jobId,
      agentId,
      toolId: tool.id,
      toolName: tool.name,
      amountUsdc: tool.priceUsdc,
      rail: tool.rail,
      network: tool.network,
      txHash: deterministicHash(`${jobId}-${agentId}-${tool.id}-${index}`),
      status: "settled",
      purpose: `${tool.category} call for ${jobId}`,
      createdAt: new Date(started.getTime() + index * 18000).toISOString(),
    }));
}

export function getDemoSpendReceipts(jobId: string, agentId = "agt_01") {
  const receiptMap: Record<string, string[]> = {
    job_8183_001: ["summarize-pdf", "extract-json", "agent-memory-lookup"],
    job_8183_002: ["extract-json", "score-deliverable"],
    job_8183_004: ["agent-memory-lookup", "summarize-pdf"],
  };

  return buildToolSpendReceipts({
    jobId,
    agentId,
    toolIds: receiptMap[jobId] ?? [],
    startedAt: "2026-04-29T09:20:00.000Z",
  });
}

function deterministicHash(seed: string): `0x${string}` {
  const hex = Array.from(seed)
    .map((char, index) => ((char.charCodeAt(0) + index) % 256).toString(16).padStart(2, "0"))
    .join("")
    .padEnd(64, "0")
    .slice(0, 64);

  return `0x${hex}`;
}
