// src/lib/verifyPayment.ts
// Server-side on-chain confirmation for payments (pay_links).
// Never trust the browser: a link can only be marked "paid" when the
// Arc receipt shows a real USDC transfer to the link's recipient.

import { createPublicClient, formatUnits, type Address, type Log } from "viem";
import { arcChain } from "@/lib/arc/network";
import { arcTransport } from "@/lib/arc/rpc";

const TRANSFER_EVENT = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
// 50 bps platform fee + rounding; anything below this is not the expected payment.
const ACCEPT_TOLERANCE = 0.99;

export interface VerifiedPayment {
  ok: boolean;
  reason?: string;
  amountTransferred?: string;
}

export async function verifyUsdcPayment(params: {
  txHash: string;
  recipient: string;
  expectedAmount: string; // decimal string, e.g. "100.00"
}): Promise<VerifiedPayment> {
  const { txHash, recipient, expectedAmount } = params;
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) return { ok: false, reason: "invalid tx hash" };

  const client = createPublicClient({ chain: arcChain, transport: arcTransport() });

  const receipt = await client
    .getTransactionReceipt({ hash: txHash as `0x${string}` })
    .catch(() => null);

  if (!receipt) return { ok: false, reason: "transaction not found (yet). Try again in a moment." };
  if (receipt.status !== "success") return { ok: false, reason: "transaction reverted" };

  const recipientTopic = `0x${recipient.toLowerCase().replace(/^0x/, "").padStart(64, "0")}`;
  let total = BigInt(0);

  for (const log of receipt.logs) {
    const topics = (log as Log).topics ?? [];
    if (topics.length < 3) continue;
    if (topics[0] !== TRANSFER_EVENT) continue;
    if ((log.address as string).toLowerCase() !== USDC_ADDRESS.toLowerCase()) continue;
    const toTopic = topics[2];
    if (!toTopic || toTopic.toLowerCase() !== recipientTopic) continue;
    total += BigInt(log.data);
  }

  const expected = BigInt(Math.round(parseFloat(expectedAmount) * 1e6));
  if (total < (expected * BigInt(99)) / BigInt(100)) {
    return {
      ok: false,
      reason: "no sufficient USDC transfer to the link recipient found in this transaction",
    };
  }

  return { ok: true, amountTransferred: formatUnits(total, 6) };
}
