// src/lib/db/links.ts
// Supabase for PayVeil payment links.
// Reads use the anon key (RLS: read-only). All writes go through the
// Next.js API routes with a wallet-signed header — the browser can no
// longer create links or mark payments directly (issues #1 and #2).

import { createClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/demoData";
import type { WalletClient } from "viem";
import { postToApi, walletAuthHeaders } from "@/lib/clientWalletAuth";
import { explorerTxUrl } from "@/lib/safeUrls";

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
// DEMO MODE (no envs): links live in localStorage
// ─────────────────────────────────────────────

const DEMO_LINKS_STORAGE_KEY = "archve.demo.links";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getDemoLinkById(id: string): PayLink | null {
  if (!canUseLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(DEMO_LINKS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as PayLink[]) : [];
    return parsed.find((link) => link.id === id) ?? null;
  } catch {
    return null;
  }
}

function saveDemoLink(link: PayLink) {
  if (!canUseLocalStorage()) return;
  const raw = window.localStorage.getItem(DEMO_LINKS_STORAGE_KEY);
  const parsed = raw ? (JSON.parse(raw) as PayLink[]) : [];
  const next = [link, ...parsed.filter((item) => item.id !== link.id)];
  window.localStorage.setItem(DEMO_LINKS_STORAGE_KEY, JSON.stringify(next));
}

// ─────────────────────────────────────────────
// CREATE (server-side via /api/links)
// ─────────────────────────────────────────────

export async function createLink(
  input: CreateLinkInput,
  walletClient?: WalletClient | null
): Promise<PayLink> {
  if (isDemoMode()) {
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    return {
      id,
      ...input,
      status: "pending",
      tx_hash: null,
      explorer_url: null,
      created_at: new Date().toISOString(),
    };
  }

  const headers = await walletAuthHeaders("create_link", walletClient ?? null);
  const response = await postToApi("/api/links", input, headers);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error ?? `Failed to create link (${response.status})`);
  }
  return payload.link as PayLink;
}

// ─────────────────────────────────────────────
// GET BY ID (public — used in /pay/[id])
// ─────────────────────────────────────────────

export async function getLinkById(id: string): Promise<PayLink | null> {
  if (isDemoMode()) return getDemoLinkById(id);
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
// MARK AS PAID (server-side via /api/links/[id]/paid)
// The server verifies the on-chain receipt: a real USDC transfer to the
// link's recipient is required before status flips to "paid".
// ─────────────────────────────────────────────

export async function markLinkPaid(
  id: string,
  txHash: string,
  walletClient?: WalletClient | null
): Promise<void> {
  if (isDemoMode()) {
    const link = getDemoLinkById(id);
    if (!link) throw new Error("Link not found");
    saveDemoLink({
      ...link,
      status: "paid",
      tx_hash: /^0x[0-9a-fA-F]{64}$/.test(txHash) ? txHash : null,
      explorer_url: explorerTxUrl(txHash),
    });
    return;
  }

  const headers = await walletAuthHeaders("pay_link", walletClient ?? null);
  const response = await postToApi(`/api/links/${encodeURIComponent(id)}/paid`, { tx_hash: txHash }, headers);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error ?? `Failed to confirm payment (${response.status})`);
  }
}

// Migration: supabase/migrations/001_enable_rls.sql (RLS + read-only pay_links).
