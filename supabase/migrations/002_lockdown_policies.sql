-- ============================================================
-- ArcHive — Policy lockdown, part 2 (completes 001_enable_rls.sql)
-- Run in the Supabase SQL editor (whole file, once).
--
-- Why this exists: 001 enabled RLS and created public read policies,
-- but only dropped legacy permissive policies on pay_links. Legacy
-- "anyone can insert/update" policies on agents/jobs (and possibly
-- other tables) survived 001 and still let the anon key write.
--
-- What this file does:
--   1. Drops EVERY policy on the app tables (clean slate, idempotent).
--   2. Re-enables RLS everywhere (idempotent).
--   3. Recreates ONLY public read policies (browser is read-only).
--   4. Creates explicit service_role policies (the API routes write
--      with the service role key; explicit policies guarantee writes
--      keep working even if service_role is RLS-bound in this project).
--   5. Prints a diagnostic of remaining policies + triggers on the
--      app tables (shown as the query result).
--
-- Model after this file: the browser READS public data with the anon
-- key; ALL writes happen server-side via the service role key
-- (src/lib/db/server.ts). Note: the dead policy "public_insert_users"
-- from 001 is intentionally NOT recreated (no code path writes the
-- users table client-side).
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Drop every policy on the app tables
-- ─────────────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'users', 'agents', 'jobs', 'job_deliverables', 'escrow_events',
        'agent_tool_spend_events', 'gateway_webhook_notifications',
        'activity_events', 'pay_links'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- 2. RLS enabled everywhere (idempotent)
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

-- ─────────────────────────────────────────────
-- 3. Public read policies (browser-safe with anon key)
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

-- gateway_webhook_notifications and users: intentionally NO public
-- policy. Webhook payloads and the users table are server-side only.

-- ─────────────────────────────────────────────
-- 4. Explicit service_role policies (API routes)
-- FOR ALL covers SELECT/INSERT/UPDATE/DELETE.
-- ─────────────────────────────────────────────
CREATE POLICY "service_role_full_users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_agents" ON agents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_jobs" ON jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_job_deliverables" ON job_deliverables FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_escrow_events" ON escrow_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_tool_spend" ON agent_tool_spend_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_gateway_webhooks" ON gateway_webhook_notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_activity" ON activity_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_pay_links" ON pay_links FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 4b. Remove the 3 diagnostic probe rows created during the
-- security verification on 2026-10-10 (RLS test writes).
-- Safe to run: they only match these exact test rows.
-- ─────────────────────────────────────────────
DELETE FROM agents
WHERE creator_wallet = '0x0000000000000000000000000000000000000001'
  AND name IN ('rls-test-hacker', 'anon-could-change-this', 'svc-insert-probe');
DELETE FROM jobs
WHERE client_wallet = '0x0000000000000000000000000000000000000001'
  AND title = 'hacker';

-- ─────────────────────────────────────────────
-- 5. Diagnostic (this is the result you see in the SQL editor):
-- every remaining policy and every trigger on the app tables.
-- Expected policies: 7 "public_read_*" + 9 "service_role_full_*".
-- Unexpected BEFORE DELETE triggers here would explain silent
-- no-op deletes (0 rows) and should be investigated before dropping.
-- ─────────────────────────────────────────────
SELECT 'policy' AS kind,
       tablename AS object,
       policyname AS name,
       roles::text AS roles,
       cmd AS detail
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users','agents','jobs','job_deliverables','escrow_events',
                    'agent_tool_spend_events','gateway_webhook_notifications',
                    'activity_events','pay_links')
UNION ALL
SELECT 'trigger',
       event_object_table,
       trigger_name,
       '',
       action_timing || ' ' || event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('users','agents','jobs','job_deliverables','escrow_events',
                             'agent_tool_spend_events','gateway_webhook_notifications',
                             'activity_events','pay_links')
ORDER BY 1, 2, 3;
