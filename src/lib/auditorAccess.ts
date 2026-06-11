import { recoverTypedDataAddress, type Hex } from "viem";
import { demoJobs } from "@/lib/demoData";
import type { ProofPack } from "@/lib/proofPacks";

/**
 * App-level implementation of Arc's "governed visibility" model
 * (authorized queries, Arc Privacy whitepaper §query model):
 * the public surface stays hash-only; full detail is revealed only to
 * callers who prove identity with an EIP-712 signature and appear in
 * the access list for that job. When Arc's private EVM ships, the same
 * request/verify flow moves onchain.
 */

export const AUDITOR_ACCESS_DOMAIN = {
  name: "ArcHive Governed Visibility",
  version: "1",
  chainId: 5042002, // Arc testnet
} as const;

export const AUDITOR_ACCESS_TYPES = {
  AuditorAccessRequest: [
    { name: "auditor", type: "address" },
    { name: "scope", type: "string" },
    { name: "issuedAt", type: "string" },
  ],
} as const;

export interface AuditorAccessRequest {
  auditor: `0x${string}`;
  scope: string;
  issuedAt: string;
}

export const AUDITOR_SCOPE = "proof-packs:full";

/** Demo auditor that always has access (for demo mode walkthroughs). */
export const DEMO_AUDITOR_WALLET = "0xAud1700000000000000000000000000000000001";

/**
 * Access list: in demo mode, every job client can audit their own job,
 * and the demo auditor can audit everything. Live mode would read this
 * from the contract / Supabase.
 */
export function isAuthorizedAuditor(address: string, pack?: ProofPack): boolean {
  const normalized = address.toLowerCase();
  if (normalized === DEMO_AUDITOR_WALLET.toLowerCase()) return true;
  if (pack) return pack.job.client_wallet.toLowerCase() === normalized;
  return demoJobs.some((job) => job.client_wallet.toLowerCase() === normalized);
}

export function buildAccessRequest(auditor: `0x${string}`): AuditorAccessRequest {
  return {
    auditor,
    scope: AUDITOR_SCOPE,
    issuedAt: new Date().toISOString(),
  };
}

/** Recover the signer and check it matches the claimed auditor address. */
export async function verifyAuditorSignature(
  request: AuditorAccessRequest,
  signature: Hex,
): Promise<boolean> {
  try {
    const recovered = await recoverTypedDataAddress({
      domain: AUDITOR_ACCESS_DOMAIN,
      types: AUDITOR_ACCESS_TYPES,
      primaryType: "AuditorAccessRequest",
      message: request,
      signature,
    });
    return recovered.toLowerCase() === request.auditor.toLowerCase();
  } catch {
    return false;
  }
}

/** Which packs a verified auditor is allowed to see in full. */
export function visiblePacksForAuditor(address: string, packs: ProofPack[]): ProofPack[] {
  if (address.toLowerCase() === DEMO_AUDITOR_WALLET.toLowerCase()) return packs;
  return packs.filter((pack) => isAuthorizedAuditor(address, pack));
}
