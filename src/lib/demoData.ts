export type JobStatus = "open" | "funded" | "accepted" | "submitted" | "approved" | "paid" | "completed" | "refunded" | "expired";

export type ActivityType =
  | "agent_registered"
  | "job_created"
  | "escrow_funded"
  | "job_accepted"
  | "gateway_deposit_finalized"
  | "gateway_mint_finalized"
  | "gateway_mint_forwarded"
  | "tool_call_paid"
  | "deliverable_submitted"
  | "work_approved"
  | "payout_released";

export type AgentStatus = "live" | "dev";

export interface DemoAgent {
  id: string;
  onchain_agent_id: string;
  creator_wallet: string;
  name: string;
  description: string;
  agent_type: string;
  capabilities: string[];
  metadata_uri: string;
  reputation_score: number;
  jobs_completed: number;
  created_at: string;
  agent_status?: AgentStatus;
}

export interface DemoJob {
  id: string;
  onchain_job_id: string | null;
  title: string;
  description: string;
  short_description: string;
  budget_usdc: string;
  status: JobStatus;
  client_wallet: string;
  provider_wallet: string;
  agent_id: string;
  agent_name: string;
  deliverable_hash: string | null;
  tx_hash: string | null;
  expires_at: string;
  created_at: string;
  /** When the provider submitted the deliverable; drives the approval timelock. */
  submitted_at?: string | null;
}

export interface DemoActivityEvent {
  id: string;
  event_type: ActivityType;
  related_job_id: string | null;
  related_agent_id: string | null;
  wallet_address: string;
  tx_hash: string;
  metadata_json: Record<string, string | number | boolean | null>;
  created_at: string;
}

export const demoAgents: DemoAgent[] = [
  {
    id: "agt_01",
    onchain_agent_id: "8004-1482",
    creator_wallet: "0x8A73B7f22A0191E2cF1d8D3989C8D9c662A4f301",
    name: "VectorOps",
    description: "Autonomous research agent for protocol analysis, market maps, and technical due diligence.",
    agent_type: "Research",
    capabilities: ["Protocol research", "Risk scoring", "Data room summaries", "Citation trails"],
    metadata_uri: "ipfs://bafybeihive-vectorops",
    reputation_score: 96,
    jobs_completed: 28,
    created_at: "2026-04-23T10:18:00.000Z",
    agent_status: "live",
  },
  {
    id: "agt_02",
    onchain_agent_id: "8004-2097",
    creator_wallet: "0x4dB54399A9b8f53e22aF8A0039A0F9F2B8269912",
    name: "LedgerPilot",
    description: "Fintech operations agent that reconciles payments, validates invoices, and prepares settlement reports.",
    agent_type: "Finance",
    capabilities: ["USDC reconciliation", "Invoice review", "Revenue ops", "CSV transforms"],
    metadata_uri: "ipfs://bafybeihive-ledgerpilot",
    reputation_score: 91,
    jobs_completed: 17,
    created_at: "2026-04-24T15:42:00.000Z",
    agent_status: "live",
  },
  {
    id: "agt_03",
    onchain_agent_id: "8004-3771",
    creator_wallet: "0x91E48F41a0F77c5cE75dE87f84cC8865A74C7D58",
    name: "SpecForge",
    description: "Product and engineering agent for PRDs, API specs, test plans, and implementation briefs.",
    agent_type: "Engineering",
    capabilities: ["PRD drafting", "API design", "QA plans", "Code review"],
    metadata_uri: "ipfs://bafybeihive-specforge",
    reputation_score: 88,
    jobs_completed: 22,
    created_at: "2026-04-25T09:10:00.000Z",
    agent_status: "live",
  },
  {
    id: "agt_04",
    onchain_agent_id: "8004-4219",
    creator_wallet: "0x0191C58B76CBA778B1C1C570DE5fB4B3B50346cD",
    name: "SignalClerk",
    description: "Monitoring agent for onchain events, governance updates, and operational incident summaries.",
    agent_type: "Monitoring",
    capabilities: ["Alert triage", "Governance tracking", "Incident briefs", "Explorer analysis"],
    metadata_uri: "ipfs://bafybeihive-signalclerk",
    reputation_score: 84,
    jobs_completed: 13,
    created_at: "2026-04-26T12:22:00.000Z",
    agent_status: "live",
  },
  {
    id: "agt_05",
    onchain_agent_id: "8004-0000",
    creator_wallet: "0x0000000000000000000000000000000000000000",
    name: "MemoTracer",
    description: "Indexes Arc Transaction Memo events to generate settlement reports, reconcile escrow flows, and map job payouts to offchain references.",
    agent_type: "Finance",
    capabilities: ["Memo event indexing", "Escrow reconciliation", "Payout attribution", "Settlement reports"],
    metadata_uri: "ipfs://bafybeihive-memotracer",
    reputation_score: 0,
    jobs_completed: 0,
    created_at: "2026-06-21T00:00:00.000Z",
    agent_status: "dev",
  },
];

export const demoJobs: DemoJob[] = [
  {
    id: "job_8183_001",
    onchain_job_id: "8183-9201",
    title: "Map stablecoin gateway competitors",
    description: "Produce a cited comparison of cross-chain USDC funding flows, including user steps, settlement time, and risk notes.",
    short_description: "Stablecoin gateway competitor map with settlement and risk notes.",
    budget_usdc: "2400.00",
    status: "funded",
    client_wallet: "0xA71ce00000000000000000000000000000000001",
    provider_wallet: demoAgents[0].creator_wallet,
    agent_id: "agt_01",
    agent_name: "VectorOps",
    deliverable_hash: null,
    tx_hash: "0x88b4f1f7b51ce2c4a7fa1e4d8e1d32b87161f9f5cc9304a7777489f1aaa0c101",
    expires_at: "2026-05-04T18:00:00.000Z",
    created_at: "2026-04-28T16:05:00.000Z",
  },
  {
    id: "job_8183_002",
    onchain_job_id: "8183-9202",
    title: "Reconcile agent payouts for April cohort",
    description: "Review payout CSVs, flag discrepancies, and prepare a USDC settlement report for the April agent cohort.",
    short_description: "USDC payout reconciliation for April agent cohort.",
    budget_usdc: "850.00",
    status: "submitted",
    client_wallet: "0xA71ce00000000000000000000000000000000002",
    provider_wallet: demoAgents[1].creator_wallet,
    agent_id: "agt_02",
    agent_name: "LedgerPilot",
    deliverable_hash: "ipfs://bafybeihive-deliverable-9202",
    tx_hash: "0x23dc57305a8de8716c1558b70ff0b965ddf5236d46727cc01a1a7440474ea902",
    expires_at: "2026-05-02T14:00:00.000Z",
    created_at: "2026-04-27T11:18:00.000Z",
  },
  {
    id: "job_8183_003",
    onchain_job_id: "8183-9203",
    title: "Draft ERC-8183 integration spec",
    description: "Turn escrow lifecycle requirements into a typed integration plan with contract calls, event indexing, and UI states.",
    short_description: "Typed integration plan for ERC-8183 escrow lifecycle.",
    budget_usdc: "1250.00",
    status: "open",
    client_wallet: "0xA71ce00000000000000000000000000000000003",
    provider_wallet: demoAgents[2].creator_wallet,
    agent_id: "agt_03",
    agent_name: "SpecForge",
    deliverable_hash: null,
    tx_hash: null,
    expires_at: "2026-05-06T20:00:00.000Z",
    created_at: "2026-04-29T08:35:00.000Z",
  },
  {
    id: "job_8183_004",
    onchain_job_id: "8183-9204",
    title: "Monitor Arc Testnet agent registrations",
    description: "Prepare a daily activity digest of new agent identities, metadata URI changes, and reputation events.",
    short_description: "Daily digest for Arc Testnet agent identity activity.",
    budget_usdc: "420.00",
    status: "completed",
    client_wallet: "0xA71ce00000000000000000000000000000000004",
    provider_wallet: demoAgents[3].creator_wallet,
    agent_id: "agt_04",
    agent_name: "SignalClerk",
    deliverable_hash: "ipfs://bafybeihive-deliverable-9204",
    tx_hash: "0xc8e57d31b9c6ed24f41c7710c8ad6f5a16cad4a2b0ee096bc2ab410f17959e00",
    expires_at: "2026-04-30T18:00:00.000Z",
    created_at: "2026-04-25T19:40:00.000Z",
  },
];

export const demoActivityEvents: DemoActivityEvent[] = [
  {
    id: "evt_gateway_001",
    event_type: "gateway_deposit_finalized",
    related_job_id: "job_8183_001",
    related_agent_id: "agt_01",
    wallet_address: "0xA71ce00000000000000000000000000000000001",
    tx_hash: "0x676174657761795f6465706f7369745f66696e616c697a65645f303031000000",
    metadata_json: {
      amount: "2400.000000",
      domain: "26",
      env: "testnet",
      notificationId: "demo-gateway-deposit-finalized",
    },
    created_at: "2026-04-29T09:35:00.000Z",
  },
  {
    id: "evt_000",
    event_type: "tool_call_paid",
    related_job_id: "job_8183_001",
    related_agent_id: "agt_01",
    wallet_address: demoAgents[0].creator_wallet,
    tx_hash: "0x6a70625f383138335f3030315f73756d6d6172697a655f706466000000000000",
    metadata_json: { tool: "Summarize PDF", amount: "0.0010", rail: "x402 + Circle Gateway" },
    created_at: "2026-04-29T09:27:00.000Z",
  },
  {
    id: "evt_001",
    event_type: "payout_released",
    related_job_id: "job_8183_004",
    related_agent_id: "agt_04",
    wallet_address: demoAgents[3].creator_wallet,
    tx_hash: "0xc8e57d31b9c6ed24f41c7710c8ad6f5a16cad4a2b0ee096bc2ab410f17959e00",
    metadata_json: { amount: "420.00", token: "USDC" },
    created_at: "2026-04-29T12:02:00.000Z",
  },
  {
    id: "evt_002",
    event_type: "deliverable_submitted",
    related_job_id: "job_8183_002",
    related_agent_id: "agt_02",
    wallet_address: demoAgents[1].creator_wallet,
    tx_hash: "0x23dc57305a8de8716c1558b70ff0b965ddf5236d46727cc01a1a7440474ea902",
    metadata_json: { deliverable: "ipfs://bafybeihive-deliverable-9202" },
    created_at: "2026-04-29T10:46:00.000Z",
  },
  {
    id: "evt_003",
    event_type: "escrow_funded",
    related_job_id: "job_8183_001",
    related_agent_id: "agt_01",
    wallet_address: "0xA71ce00000000000000000000000000000000001",
    tx_hash: "0x88b4f1f7b51ce2c4a7fa1e4d8e1d32b87161f9f5cc9304a7777489f1aaa0c101",
    metadata_json: { amount: "2400.00", rail: "Unified Balance" },
    created_at: "2026-04-28T16:12:00.000Z",
  },
  {
    id: "evt_004",
    event_type: "job_created",
    related_job_id: "job_8183_003",
    related_agent_id: "agt_03",
    wallet_address: "0xA71ce00000000000000000000000000000000003",
    tx_hash: "0x9fb8b6f4a229d737c74b1412a07146f9ef82509ee65f4f72bf3c651a86e2f203",
    metadata_json: { budget: "1250.00", token: "USDC" },
    created_at: "2026-04-29T08:35:00.000Z",
  },
  {
    id: "evt_005",
    event_type: "agent_registered",
    related_job_id: null,
    related_agent_id: "agt_04",
    wallet_address: demoAgents[3].creator_wallet,
    tx_hash: "0x77f0c8bb7fd39371a4f2b4afe33ca265c3a2d0bc58951a26a7621595ca24cf95",
    metadata_json: { standard: "ERC-8004", metadata: "ipfs://bafybeihive-signalclerk" },
    created_at: "2026-04-26T12:22:00.000Z",
  },
];

export function explorerTxUrl(txHash: string) {
  return `https://testnet.arcscan.app/tx/${txHash}`;
}

export function formatWallet(address: string) {
  if (!address) return "Not assigned";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isDemoMode() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
