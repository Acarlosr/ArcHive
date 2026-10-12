// src/lib/arc/receipts.ts
// Shared receipt waiting for Arc transactions.
// Arc mempool inclusion can take minutes under congestion; viem's
// waitForTransactionReceipt defaults to a 180s timeout, which once made the
// app report a failure for a transaction that later succeeded on-chain
// (agent registration, token 2376). All receipt waits go through here with a
// generous timeout and one final direct receipt lookup before giving up.

import type { Hash } from "viem";

// 10 min: covers slow mempool inclusion without hanging the UI forever.
const RECEIPT_TIMEOUT_MS = 10 * 60 * 1000;
const RECEIPT_POLLING_MS = 4_000;

type ReceiptWaiter<TReturn> = {
  waitForTransactionReceipt: (args: {
    hash: Hash;
    timeout?: number;
    pollingInterval?: number;
  }) => Promise<TReturn>;
  getTransactionReceipt: (args: { hash: Hash }) => Promise<TReturn>;
};

export async function waitForArcReceipt<TReturn>(
  client: ReceiptWaiter<TReturn>,
  hash: Hash,
): Promise<TReturn> {
  try {
    return await client.waitForTransactionReceipt({
      hash,
      timeout: RECEIPT_TIMEOUT_MS,
      pollingInterval: RECEIPT_POLLING_MS,
    });
  } catch {
    // Timeout or transient failure: the tx may still have been included.
    // One final direct check before reporting the failure upward.
    try {
      return await client.getTransactionReceipt({ hash });
    } catch {
      throw new Error(
        `Timed out waiting for transaction ${hash}. It may still confirm — check the explorer before retrying, to avoid a duplicate action.`,
      );
    }
  }
}
