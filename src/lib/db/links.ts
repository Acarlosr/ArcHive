// src/lib/db/links.ts
// Supabase CRUD for PayVeil payment links.
// Links live in the DB; the actual payment execution happens onchain via Arc.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type LinkStatus = "pending" | "paid" | "expired" | "cancelled";

export interface PayLink {
  id: string;             // 8-char slug, URL-safe
  amount: string;         // "100.00"
  description: string;
  recipient_wallet: string; // 0x... — funds go here on Arc
  creator_wallet: string;   // who created the link
  accepted_chains: string[]; // ["Ethereum","Base","Arc"]
  expiry: string | null;     // ISO date or null
  status: LinkStatus;
  tx_hash: string | null;    // filled after payment
  explorer_url: string | null;
  created_at: string;
}

export type CreateLinkInput = Omit<
  PayLink,
  "id" | "status" | "tx_hash" | "explorer_url" | "created_at"
>;

// ─────────────────────────────────────────────
// GENERATE ID
// ─────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createLink(input: CreateLinkInput): Promise<PayLink> {
  const id = generateId();

  const { data, error } = await supabase
    .from("pay_links")
    .insert({
      id,
      ...input,
      status: "pending",
      tx_hash: null,
      explorer_url: null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create link: ${error.message}`);
  return data as PayLink;
}

// ─────────────────────────────────────────────
// GET BY ID (public — used in /pay/[id])
// ─────────────────────────────────────────────

export async function getLinkById(id: string): Promise<PayLink | null> {
  const { data, error } = await supabase
    .from("pay_links")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as PayLink;
}

// ─────────────────────────────────────────────
// GET BY CREATOR (used in /app dashboard)
// ─────────────────────────────────────────────

export async function getLinksByCreator(
  creatorWallet: string
): Promise<PayLink[]> {
  const { data, error } = await supabase
    .from("pay_links")
    .select("*")
    .eq("creator_wallet", creatorWallet.toLowerCase())
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch links: ${error.message}`);
  return (data ?? []) as PayLink[];
}

// ─────────────────────────────────────────────
// MARK AS PAID (called after successful spend())
// ─────────────────────────────────────────────

export async function markLinkPaid(
  id: string,
  txHash: string,
  explorerUrl: string
): Promise<void> {
  const { error } = await supabase
    .from("pay_links")
    .update({
      status: "paid",
      tx_hash: txHash,
      explorer_url: explorerUrl,
    })
    .eq("id", id);

  if (error) throw new Error(`Failed to mark link as paid: ${error.message}`);
}

// ─────────────────────────────────────────────
// SUPABASE SQL MIGRATION (run once in Supabase SQL editor)
// ─────────────────────────────────────────────
/*
CREATE TABLE pay_links (
  id                TEXT PRIMARY KEY,
  amount            TEXT NOT NULL,
  description       TEXT NOT NULL,
  recipient_wallet  TEXT NOT NULL,
  creator_wallet    TEXT NOT NULL,
  accepted_chains   TEXT[] NOT NULL DEFAULT '{}',
  expiry            TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','expired','cancelled')),
  tx_hash           TEXT,
  explorer_url      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for dashboard queries by creator
CREATE INDEX idx_pay_links_creator ON pay_links(creator_wallet);

-- Row Level Security: anyone can read pending links (for /pay/[id])
ALTER TABLE pay_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pending links"
  ON pay_links FOR SELECT
  USING (status = 'pending');

CREATE POLICY "Creator can read own links"
  ON pay_links FOR SELECT
  USING (creator_wallet = current_user);

CREATE POLICY "Anyone can insert"
  ON pay_links FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update status"
  ON pay_links FOR UPDATE
  USING (true);
*/
