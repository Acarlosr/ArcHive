// src/lib/arc/memo.ts
// Helper para envolver qualquer call de contrato com Arc Transaction Memos.
// Docs: https://docs.arc.io/arc/concepts/transaction-memos

import type { WalletClient } from "viem";
import { MEMO_CONTRACT, memoAbi } from "@/lib/arc/contracts";
import { ARC_TESTNET } from "@/lib/arc/appKit";

// ── Tipos de payload de memo por fluxo do ArcHive ──

export interface FundEscrowMemo {
  event: "escrow_funded";
  jobId: string;
  clientId: string;
  usdcAmount: string;
  currency: "USDC";
}

export interface SubmitDeliverableMemo {
  event: "deliverable_submitted";
  jobId: string;
  agentId: string;
  deliverableCID: string;
}

export interface ApprovePayMemo {
  event: "job_completed";
  jobId: string;
  payoutRecipient: string;
  invoiceRef: string;
}

export interface ToolCallMemo {
  event: "tool_call";
  jobId: string;
  agentId: string;
  toolId: string;
  callIndex: number;
}

export type ArcHiveMemoPayload =
  | FundEscrowMemo
  | SubmitDeliverableMemo
  | ApprovePayMemo
  | ToolCallMemo;

// ── Utilitários ──

/** Converte um payload em bytes para o campo memoData */
function encodeMemoData(payload: ArcHiveMemoPayload): `0x${string}` {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Chama Memo.memo() envolvendo qualquer calldata com metadados estruturados.
 *
 * O contrato Memo preserva msg.sender original, emite eventos Memo indexados
 * por memoId e só emite após o sucesso da call interna — sinal limpo para
 * reconciliação offchain.
 */
export async function callWithMemo({
  walletClient,
  target,
  calldata,
  memoPayload,
}: {
  walletClient: WalletClient;
  target: `0x${string}`;
  calldata: `0x${string}`;
  memoPayload: ArcHiveMemoPayload;
}): Promise<`0x${string}`> {
  const { createPublicClient, http, keccak256, toHex } = await import("viem");
  const { arcTestnet } = await import("viem/chains");

  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error("No wallet account connected.");

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.io"),
  });

  // memoId = keccak256 do evento + jobId — único e lookupável por indexadores
  const memoId = keccak256(
    toHex(`${memoPayload.event}:${"jobId" in memoPayload ? memoPayload.jobId : ""}`)
  );
  const memoData = encodeMemoData(memoPayload);

  const txHash = await walletClient.writeContract({
    address: MEMO_CONTRACT,
    abi: memoAbi,
    functionName: "memo",
    args: [target, calldata, memoId, memoData],
    account,
    chain: arcTestnet,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") {
    throw new Error(`Memo transaction reverted: ${txHash}`);
  }

  return txHash;
}

/** URL do ArcScan para um txHash */
export function arcScanUrl(txHash: string): string {
  return `${ARC_TESTNET.explorerUrl}/tx/${txHash}`;
}
