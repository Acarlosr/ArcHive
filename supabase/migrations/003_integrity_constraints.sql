-- ============================================================
-- ArcHive — 003 integrity constraints
-- Run in the Supabase SQL editor (whole file, once). Idempotent.
--
-- 1. A transaction can settle only ONE pay link (blocks tx-hash reuse).
-- 2. Reputation is bounded 0..10 at the database level too.
--
-- If step 1 fails with "could not create unique index", there are already
-- duplicated tx_hash rows: run the diagnostic query at the bottom first,
-- fix/reset the duplicated links, then run this file again.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS pay_links_tx_hash_unique
  ON pay_links (lower(tx_hash))
  WHERE tx_hash IS NOT NULL;

ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_reputation_score_range;
ALTER TABLE agents ADD CONSTRAINT agents_reputation_score_range
  CHECK (reputation_score IS NULL OR (reputation_score >= 0 AND reputation_score <= 10));

-- Diagnostic: links that share a transaction (should return 0 rows).
-- SELECT lower(tx_hash) AS tx, count(*) FROM pay_links
-- WHERE tx_hash IS NOT NULL GROUP BY 1 HAVING count(*) > 1;
