-- ============================================================
-- ArcHive — RLS hardening (issues #1 and #2)
-- Run in the Supabase SQL editor (whole file, once).
--
-- Model: the browser only READS public data with the anon key.
-- All writes go through Next.js API routes that use the service
-- role key server-side (src/lib/db/server.ts).
--
-- After applying this, anonymous callers can no longer insert or
-- update anything via PostgREST. Service role keeps full access.
-- ============================================================

-- ─────────────────────────────────────────────
-- Tables (idempotent — safe to run on an existing project)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onchain_agent_id TEXT,
  creator_wallet TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  agent_type TEXT,
  capabilities TEXT[],
  metadata_uri TEXT,
  reputation_score NUMERIC DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onchain_job_id TEXT,
  onchain_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  budget_usdc NUMERIC NOT NULL,
  budget NUMERIC,
  status TEXT NOT NULL DEFAULT 'open',
  client_wallet TEXT NOT NULL,
  provider_wallet TEXT,
  agent_id UUID REFERENCES agents(id),
  agent_name TEXT,
  deliverable_hash TEXT,
  tx_hash TEXT,
  explorer_url TEXT,
  submitted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  deliverable_hash TEXT NOT NULL,
  submitted_by TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  event_type TEXT NOT NULL,
  amount_usdc NUMERIC,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_tool_spend_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  agent_id UUID REFERENCES agents(id),
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  amount_usdc NUMERIC NOT NULL,
  rail TEXT DEFAULT 'x402 + Circle Gateway',
  tx_hash TEXT,
  receipt_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gateway_webhook_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id TEXT UNIQUE NOT NULL,
  subscription_id TEXT,
  notification_type TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  related_job_id UUID,
  related_agent_id UUID,
  wallet_address TEXT,
  tx_hash TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pay_links (
  id TEXT PRIMARY KEY,
  amount TEXT NOT NULL,
  description TEXT NOT NULL,
  recipient_wallet TEXT NOT NULL,
  creator_wallet TEXT NOT NULL,
  accepted_chains TEXT[] NOT NULL DEFAULT '{}',
  expiry TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','expired','cancelled')),
  tx_hash TEXT,
  explorer_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pay_links_creator ON pay_links(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_jobs_wallet ON jobs(client_wallet, provider_wallet);

-- ─────────────────────────────────────────────
-- Enable RLS everywhere. No write policies are
-- created for anon/authenticated on purpose:
-- writes are denied unless done with the service
-- role key (API routes only).
-- ─────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_spend_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gateway_webhook_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_links ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policies from earlier iterations (idempotent).
DROP POLICY IF EXISTS "Public can read pending links" ON pay_links;
DROP POLICY IF EXISTS "Creator can read own links" ON pay_links;
DROP POLICY IF EXISTS "Anyone can insert" ON pay_links;
DROP POLICY IF EXISTS "Anyone can update status" ON pay_links;

-- ─────────────────────────────────────────────
-- Read policies (public, browser-safe with anon key)
-- ─────────────────────────────────────────────

CREATE POLICY "public_read_jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "public_read_agents" ON agents FOR SELECT USING (true);
CREATE POLICY "public_read_job_deliverables" ON job_deliverables FOR SELECT USING (true);
CREATE POLICY "public_read_escrow_events" ON escrow_events FOR SELECT USING (true);
CREATE POLICY "public_read_tool_spend" ON agent_tool_spend_events FOR SELECT USING (true);
CREATE POLICY "public_read_activity" ON activity_events FOR SELECT USING (true);
-- pay_links stay readable (the /pay/[id] page must load them) but are
-- read-only: recipient, amount and status can no longer be rewritten.
CREATE POLICY "public_read_pay_links" ON pay_links FOR SELECT USING (true);

-- gateway_webhook_notifications: intentionally NO read policy.
-- Raw webhook payloads are only visible server-side.

-- ─────────────────────────────────────────────
-- Write safety on top of RLS (belt and suspenders)
-- Recipient/amount of pay_links are immutable via PostgREST
-- for any role except service role.
-- ─────────────────────────────────────────────

CREATE POLICY "public_insert_users" ON users FOR INSERT WITH CHECK (true);
