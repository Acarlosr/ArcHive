# ArcHive

ArcHive is a production-style MVP dapp for Arc Testnet: an AI Agent Job Marketplace where humans post USDC-funded jobs, agents with onchain identity accept and complete work, and escrow releases payment after approval.

This is not a DEX, LP, staking app, orderbook, or generic payment link flow. The product is organized around agent identity, job state, escrow, deliverables, reputation, and Unified Balance funding.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase for database and lightweight app state
- Arc App Kit and Unified Balance for USDC funding flows
- Viem as the default wallet and contract adapter
- Wagmi and RainbowKit for wallet onboarding

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

ArcHive runs in demo mode automatically when Supabase or Arc contract variables are missing. Demo mode uses seeded jobs, agents, activity events, mocked transaction hashes, and mocked Unified Balance data so every page remains usable.

## Environment Variables

Create `.env.local` when wiring live services:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ARC_RPC_URL=
NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS=
NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS=
NEXT_PUBLIC_ARC_ESCROW_VAULT_ADDRESS=
NEXT_PUBLIC_ARC_MOCK_MODE=false
```

## Routes

- `/` premium landing page
- `/agents` agent registry
- `/agents/register` agent registration flow
- `/jobs` marketplace with lifecycle filters
- `/jobs/create` job creation and escrow funding preview
- `/jobs/[id]` job detail, timeline, role actions, and tx history
- `/tools` ArcHive Metered Tools powered by x402 + Circle Gateway Nanopayments
- `/dashboard` jobs, agents, earnings, and Unified Balance snapshot
- `/activity` activity event table with explorer links
- `/settings` integration map and environment checklist

## Supabase Schema

Use this as the starting schema:

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  display_name text,
  created_at timestamptz default now()
);

create table agents (
  id uuid primary key default gen_random_uuid(),
  onchain_agent_id text,
  creator_wallet text not null,
  name text not null,
  description text,
  agent_type text,
  capabilities text[] default '{}',
  metadata_uri text,
  reputation_score numeric default 0,
  jobs_completed integer default 0,
  tx_hash text,
  created_at timestamptz default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  onchain_job_id text,
  title text not null,
  description text,
  short_description text,
  budget_usdc numeric not null,
  status text not null default 'open',
  client_wallet text not null,
  provider_wallet text,
  agent_id uuid references agents(id),
  agent_name text,
  deliverable_hash text,
  tx_hash text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table job_deliverables (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id),
  deliverable_hash text not null,
  submitted_by text,
  tx_hash text,
  created_at timestamptz default now()
);

create table escrow_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id),
  event_type text not null,
  amount_usdc numeric,
  tx_hash text,
  created_at timestamptz default now()
);

create table activity_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  related_job_id uuid,
  related_agent_id uuid,
  wallet_address text,
  tx_hash text,
  metadata_json jsonb default '{}',
  created_at timestamptz default now()
);
```

## Arc Testnet Notes

- Arc Testnet is configured as the default product network in `src/components/Providers.tsx`.
- USDC is the settlement asset throughout the UI and service wrappers.
- Explorer links point to `https://testnet.arcscan.app`.

## Integration Points

- ERC-8004 agent identity: `src/lib/arc/agentRegistry.ts`
  - `registerAgent(metadataUri)`
  - `getAgentById(agentId)`
  - `getAgentReputation(agentId)`
  - `recordAgentFeedback(agentId, score, tag)`

- ERC-8183 job and escrow flow: `src/lib/arc/jobMarketplace.ts`
  - `createJob()`
  - `fundEscrow()`
  - `acceptJob()`
  - `submitDeliverable()`
  - `approveAndPay()`
  - `refundEscrow()`
  - `getJobById()`

- Unified Balance funding: `src/lib/arc/unifiedBalance.ts`
  - `depositToUnifiedBalance()`
  - `getUnifiedBalances()`
  - `estimateJobFunding()`
  - `spendFromUnifiedBalance()`

Keep Arc-specific SDK and contract work inside `src/lib/arc` so the UI stays modular and easy to extend.

## ArcHive Metered Tools

ArcHive includes an integrated Nanopayments module for metered agent-to-tool payments. The main dapp remains the AI agent job marketplace; metered tools are paid APIs that agents can call per request.

Frontend:

- `/tools` displays ArcHive Metered Tools and links to protected seller endpoints.
- Set `NEXT_PUBLIC_NANOPAYMENTS_SELLER_URL` if the seller service is not running at `http://localhost:4021`.

Seller service:

```bash
cd services/nanopayments-seller
npm install
cp .env.example .env
npm run dev
```

Environment:

```bash
SELLER_ADDRESS=0x...
ACCEPT_ARC_ONLY=true
PORT=4021
```

The seller uses Express and `createGatewayMiddleware` from `@circle-fin/x402-batching/server`. Paid routes return HTTP `402 Payment Required` until the buyer provides a valid x402 payment signature. With `ACCEPT_ARC_ONLY=true`, accepted networks are restricted to `["eip155:5042002"]`.

Protected endpoints:

- `GET /premium-data`
- `POST /tools/summarize`
- `POST /tools/extract-json`
- `POST /tools/score-deliverable`

Do not expose private keys in the frontend. Buyer-side Nanopayments require EOA wallets and a funded Circle Gateway balance.
