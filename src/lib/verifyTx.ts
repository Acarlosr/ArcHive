// src/lib/verifyTx.ts
// Server-side proof that a transaction really happened on Arc and touched the
// ArcHive ERC-8183 marketplace. Used before any financial state change is
// accepted from the browser (job funded/completed/refunded, activity events).
//
// Mock mode (NEXT_PUBLIC_ARC_MOCK_MODE=true) skips the check: mock tx hashes
// do not exist on-chain. Production MUST run with MOCK_MODE=false.

import { createPublicClient, type Log } from "viem";
import { arcChain } from "@/lib/arc/network";
import { arcTransport } from "@/lib/arc/rpc";

const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

export interface VerifiedTx {
  ok: boolean;
  reason?: string;
  blockTimestamp?: number; // unix seconds
}

function isMockMode() {
  return (process.env.NEXT_PUBLIC_ARC_MOCK_MODE ?? "").trim().toLowerCase() === "true";
}

export async function verifyMarketplaceTx(
  txHash: string,
  opts: { onchainJobId?: string | null } = {},
): Promise<VerifiedTx> {
  if (isMockMode()) return { ok: true };
  if (!TX_HASH_RE.test(txHash)) return { ok: false, reason: "invalid tx hash" };

  const marketplace = (process.env.NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS ?? "").toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(marketplace)) {
    return { ok: false, reason: "marketplace address not configured" };
  }

  const client = createPublicClient({ chain: arcChain, transport: arcTransport() });
  const receipt = await client
    .getTransactionReceipt({ hash: txHash as `0x${string}` })
    .catch(() => null);
  if (!receipt) return { ok: false, reason: "transaction not found yet; try again in a moment" };
  if (receipt.status !== "success") return { ok: false, reason: "transaction reverted" };

  const logs = (receipt.logs as Log[]).filter(
    (log) => (log.address as string).toLowerCase() === marketplace,
  );
  if (logs.length === 0) return { ok: false, reason: "transaction did not touch the ArcHive marketplace" };

  if (opts.onchainJobId) {
    let wanted: bigint;
    try {
      wanted = BigInt(opts.onchainJobId);
    } catch {
      return { ok: false, reason: "invalid on-chain job id" };
    }
    // Every ERC-8183 job event indexes jobId as topic 1.
    const matches = logs.some((log) => {
      const topic = log.topics?.[1];
      return topic ? BigInt(topic) === wanted : false;
    });
    if (!matches) return { ok: false, reason: "transaction does not belong to this job" };
  }

  const block = await client.getBlock({ blockHash: receipt.blockHash }).catch(() => null);
  return { ok: true, blockTimestamp: block ? Number(block.timestamp) : undefined };
}
