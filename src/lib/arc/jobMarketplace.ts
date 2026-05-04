import type { WalletClient } from "viem";
import { getJobById as getJobRecordById } from "@/lib/db/jobs";
import { spendFromUnifiedBalance } from "@/lib/arc/unifiedBalance";
import { ARC_TESTNET, isArcMockMode, mockTxHash } from "@/lib/arc/appKit";

type WalletAction = { walletClient?: WalletClient | null };

export async function createJob({
  walletClient,
  providerAddress,
  description,
  budgetUsdc,
  expiryHours = 72,
}: WalletAction & {
  providerAddress: string;
  description: string;
  budgetUsdc: string;
  expiryHours?: number;
}): Promise<{ txHash: `0x${string}`; jobId: string; explorerUrl: string; mode: "mock" | "live" }> {
  if (isArcMockMode() || !walletClient) {
    const txHash = mockTxHash(`create-job-${description}`);
    return {
      txHash,
      jobId: `8183-${Math.floor(1000 + Math.random() * 8999)}`,
      explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`,
      mode: "mock",
    };
  }

  const { createPublicClient, decodeEventLog, http, parseAbi } = await import("viem");
  const { arcTestnet } = await import("viem/chains");
  const address = process.env.NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS as `0x${string}`;
  const abi = parseAbi([
    "function createJob(address provider,address client,uint256 expiredAt,string description,address hook) returns (uint256)",
    "event JobCreated(uint256 indexed jobId,address indexed client,address indexed provider)",
  ]);
  const [account] = await walletClient.getAddresses();
  const publicClient = createPublicClient({ chain: arcTestnet, transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL) });
  const block = await publicClient.getBlock();
  const txHash = await walletClient.writeContract({
    address,
    abi,
    functionName: "createJob",
    args: [
      providerAddress as `0x${string}`,
      account,
      block.timestamp + BigInt(expiryHours * 3600),
      `${description}\nBudget: ${budgetUsdc} USDC`,
      "0x0000000000000000000000000000000000000000",
    ],
    account,
    chain: arcTestnet,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const created = receipt.logs.flatMap((log) => {
    try {
      const decoded = decodeEventLog({ abi, data: log.data, topics: log.topics });
      return decoded.eventName === "JobCreated" ? [(decoded.args as any).jobId.toString()] : [];
    } catch {
      return [];
    }
  })[0];

  return { txHash, jobId: created ?? receipt.transactionIndex.toString(), explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, mode: "live" };
}

export async function fundEscrow({
  walletClient,
  jobId,
  budgetUsdc,
  recipientAddress,
}: WalletAction & {
  jobId: string;
  budgetUsdc: string;
  recipientAddress?: string;
}) {
  const recipient = recipientAddress ?? process.env.NEXT_PUBLIC_ARC_ESCROW_VAULT_ADDRESS ?? "0x0000000000000000000000000000000000000000";
  return spendFromUnifiedBalance({ walletClient, amount: budgetUsdc, recipientAddress: recipient, jobId });
}

export async function acceptJob({ jobId }: WalletAction & { jobId: string }) {
  const txHash = mockTxHash(`accept-${jobId}`);
  return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId };
}

export async function submitDeliverable({
  jobId,
  deliverableHash,
  deliverableDescription,
}: WalletAction & {
  jobId: string;
  deliverableHash?: string;
  deliverableDescription?: string;
}) {
  const source = deliverableDescription ?? jobId;
  const encoded = Array.from(source).map((char) => char.charCodeAt(0).toString(16)).join("").slice(0, 42);
  const hash = deliverableHash ?? `ipfs://${encoded.padEnd(42, "0")}`;
  const txHash = mockTxHash(`submit-${jobId}-${hash}`);
  return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId, deliverableHash: hash };
}

export async function approveAndPay({ jobId }: WalletAction & { jobId: string }) {
  const txHash = mockTxHash(`approve-pay-${jobId}`);
  return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId };
}

export async function refundEscrow({ jobId }: WalletAction & { jobId: string }) {
  const txHash = mockTxHash(`refund-${jobId}`);
  return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId };
}

export async function getJobById(jobId: string) {
  return getJobRecordById(jobId);
}

export const setBudget = async ({ jobId, budgetUsdc }: { walletClient?: WalletClient | null; jobId: string; budgetUsdc: string }) => ({
  txHash: mockTxHash(`budget-${jobId}-${budgetUsdc}`),
});

export const approveAndFundEscrow = fundEscrow;
export const completeJob = approveAndPay;
