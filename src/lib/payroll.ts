import { demoAgents, type DemoAgent } from "@/lib/demoData";

export type PayrollCadence = "weekly" | "biweekly" | "monthly";
export type PayrollStreamStatus = "active" | "paused" | "completed";

export interface PayrollStream {
  id: string;
  onchain_stream_id: string;
  label: string;
  employer_wallet: string;
  agent_id: string;
  recipient_wallet: string;
  amount_per_cycle_usdc: string;
  cadence: PayrollCadence;
  cycles_total: number;
  cycles_paid: number;
  escrow_funded_usdc: string;
  status: PayrollStreamStatus;
  next_payout_at: string | null;
  last_tx_hash: string | null;
  auditor_access: boolean;
  created_at: string;
}

export interface PayrollCycleEvent {
  id: string;
  stream_id: string;
  cycle: number;
  amount_usdc: string;
  tx_hash: string;
  paid_at: string;
}

export const demoPayrollStreams: PayrollStream[] = [
  {
    id: "pay_stream_001",
    onchain_stream_id: "8183-PR-001",
    label: "VectorOps — research retainer",
    employer_wallet: "0xA71ce00000000000000000000000000000000001",
    agent_id: "agt_01",
    recipient_wallet: demoAgents[0].creator_wallet,
    amount_per_cycle_usdc: "600.00",
    cadence: "weekly",
    cycles_total: 8,
    cycles_paid: 3,
    escrow_funded_usdc: "4800.00",
    status: "active",
    next_payout_at: "2026-06-15T12:00:00.000Z",
    last_tx_hash: "0x7061795f73747265616d5f3030315f6379636c655f33000000000000000000aa",
    auditor_access: true,
    created_at: "2026-05-18T10:00:00.000Z",
  },
  {
    id: "pay_stream_002",
    onchain_stream_id: "8183-PR-002",
    label: "LedgerPilot — monthly reconciliation",
    employer_wallet: "0xA71ce00000000000000000000000000000000002",
    agent_id: "agt_02",
    recipient_wallet: demoAgents[1].creator_wallet,
    amount_per_cycle_usdc: "850.00",
    cadence: "monthly",
    cycles_total: 6,
    cycles_paid: 1,
    escrow_funded_usdc: "5100.00",
    status: "active",
    next_payout_at: "2026-07-01T12:00:00.000Z",
    last_tx_hash: "0x7061795f73747265616d5f3030325f6379636c655f31000000000000000000bb",
    auditor_access: true,
    created_at: "2026-05-28T15:30:00.000Z",
  },
  {
    id: "pay_stream_003",
    onchain_stream_id: "8183-PR-003",
    label: "SignalClerk — monitoring digest",
    employer_wallet: "0xA71ce00000000000000000000000000000000004",
    agent_id: "agt_04",
    recipient_wallet: demoAgents[3].creator_wallet,
    amount_per_cycle_usdc: "120.00",
    cadence: "biweekly",
    cycles_total: 10,
    cycles_paid: 10,
    escrow_funded_usdc: "1200.00",
    status: "completed",
    next_payout_at: null,
    last_tx_hash: "0x7061795f73747265616d5f3030335f6379636c655f3130000000000000000cc0",
    auditor_access: false,
    created_at: "2026-02-02T09:00:00.000Z",
  },
  {
    id: "pay_stream_004",
    onchain_stream_id: "8183-PR-004",
    label: "SpecForge — spec sprint (paused)",
    employer_wallet: "0xA71ce00000000000000000000000000000000003",
    agent_id: "agt_03",
    recipient_wallet: demoAgents[2].creator_wallet,
    amount_per_cycle_usdc: "400.00",
    cadence: "weekly",
    cycles_total: 4,
    cycles_paid: 2,
    escrow_funded_usdc: "1600.00",
    status: "paused",
    next_payout_at: null,
    last_tx_hash: "0x7061795f73747265616d5f3030345f6379636c655f32000000000000000000dd",
    auditor_access: true,
    created_at: "2026-05-25T08:20:00.000Z",
  },
];

export const demoPayrollCycleEvents: PayrollCycleEvent[] = [
  {
    id: "payevt_001",
    stream_id: "pay_stream_001",
    cycle: 3,
    amount_usdc: "600.00",
    tx_hash: "0x7061795f73747265616d5f3030315f6379636c655f33000000000000000000aa",
    paid_at: "2026-06-08T12:00:11.000Z",
  },
  {
    id: "payevt_002",
    stream_id: "pay_stream_002",
    cycle: 1,
    amount_usdc: "850.00",
    tx_hash: "0x7061795f73747265616d5f3030325f6379636c655f31000000000000000000bb",
    paid_at: "2026-06-01T12:00:05.000Z",
  },
  {
    id: "payevt_003",
    stream_id: "pay_stream_001",
    cycle: 2,
    amount_usdc: "600.00",
    tx_hash: "0x7061795f73747265616d5f3030315f6379636c655f32000000000000000000a2",
    paid_at: "2026-06-01T12:00:09.000Z",
  },
  {
    id: "payevt_004",
    stream_id: "pay_stream_004",
    cycle: 2,
    amount_usdc: "400.00",
    tx_hash: "0x7061795f73747265616d5f3030345f6379636c655f32000000000000000000dd",
    paid_at: "2026-06-04T12:00:14.000Z",
  },
];

export function getAgentForStream(stream: PayrollStream): DemoAgent | null {
  return demoAgents.find((agent) => agent.id === stream.agent_id) ?? null;
}

export function streamPaidUsdc(stream: PayrollStream): number {
  return Number(stream.amount_per_cycle_usdc) * stream.cycles_paid;
}

export function streamRemainingUsdc(stream: PayrollStream): number {
  return Number(stream.escrow_funded_usdc) - streamPaidUsdc(stream);
}

export function streamProgress(stream: PayrollStream): number {
  if (stream.cycles_total === 0) return 0;
  return Math.round((stream.cycles_paid / stream.cycles_total) * 100);
}

export function getDemoPayrollStreams(): PayrollStream[] {
  const order: Record<PayrollStreamStatus, number> = { active: 0, paused: 1, completed: 2 };
  return [...demoPayrollStreams].sort((a, b) => order[a.status] - order[b.status]);
}

export function getStreamCycleEvents(streamId: string): PayrollCycleEvent[] {
  return demoPayrollCycleEvents
    .filter((event) => event.stream_id === streamId)
    .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());
}
