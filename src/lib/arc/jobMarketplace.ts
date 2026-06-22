import type { Hex, WalletClient } from "viem";
import { getJobById as getJobRecordById } from "@/lib/db/jobs";
import { spendFromUnifiedBalance } from "@/lib/arc/unifiedBalance";
import { ARC_TESTNET, isArcMockMode, mockTxHash } from "@/lib/arc/appKit";
import { agenticCommerceAbi, erc20Abi, USDC_CONTRACT } from "@/lib/arc/contracts";
import { callWithMemo, arcScanUrl } from "@/lib/arc/memo";

type WalletAction = { walletClient?: WalletClient | null };
type TxResult = { txHash: `0x${string}`; explorerUrl: string; jobId: string; mode: "mock" | "live" };

const zeroAddress = "0x0000000000000000000000000000000000000000" as const;

function getJobMarketplaceAddress() {
  const address = process.env.NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS;
  if (!address) throw new Error("NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS is required for live ERC-8183 actions.");
  return address as `0x${string}`;
}

async function getLiveClients(walletClient: WalletClient) {
  const { createPublicClient, http } = await import("viem");
  const { arcTestnet } = await import("viem/chains");
  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error("No wallet account is connected.");
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.network"),
  });
  return { account, arcTestnet, publicClient };
}

function assertSuccessfulReceipt(receipt: { status: "success" | "reverted"; transactionHash: `0x${string}` }, action: string) {
  if (receipt.status === "reverted") {
    throw new Error(`${action} transaction reverted on Arc Testnet: ${receipt.transactionHash}`);
  }
}

function toBytes32(value: string) {
  if (/^0x[a-fA-F0-9]{64}$/.test(value)) return value as Hex;
  return null;
}

async function hashToBytes32(value: string) {
  const { keccak256, toHex } = await import("viem");
  return keccak256(toHex(value));
}

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
  if (isArcMockMode("job") || !walletClient) {
    const txHash = mockTxHash(`create-job-${description}`);
    return {
      txHash,
      jobId: `8183-${Math.floor(1000 + Math.random() * 8999)}`,
      explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`,
      mode: "mock",
    };
  }

  const { decodeEventLog } = await import("viem");
  const { account, arcTestnet, publicClient } = await getLiveClients(walletClient);
  const block = await publicClient.getBlock();
  const address = getJobMarketplaceAddress();
  const txHash = await walletClient.writeContract({
    address,
    abi: agenticCommerceAbi,
    functionName: "createJob",
    args: [
      providerAddress as `0x${string}`,
      account,
      block.timestamp + BigInt(expiryHours * 3600),
      `${description}\nBudget: ${budgetUsdc} USDC`,
      zeroAddress,
    ],
    account,
    chain: arcTestnet,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  assertSuccessfulReceipt(receipt, "Create job");
  const created = receipt.logs.flatMap((log) => {
    try {
      const decoded = decodeEventLog({ abi: agenticCommerceAbi, data: log.data, topics: log.topics });
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
}): Promise<TxResult> {
  if (isArcMockMode("job") || !walletClient) {
    const recipient = recipientAddress ?? process.env.NEXT_PUBLIC_ARC_ESCROW_VAULT_ADDRESS ?? zeroAddress;
    const result = await spendFromUnifiedBalance({ walletClient, amount: budgetUsdc, recipientAddress: recipient, jobId });
    return { txHash: result.txHash, explorerUrl: result.explorerUrl, jobId, mode: "mock" };
  }

  const { parseUnits, encodeFunctionData } = await import("viem");
  const { account, arcTestnet, publicClient } = await getLiveClients(walletClient);
  const marketplaceAddress = getJobMarketplaceAddress();
  const amount = parseUnits(budgetUsdc, 6);

  // 1. Approve USDC para o marketplace (call direta — sem memo, não é o evento de negócio)
  const approveHash = await walletClient.writeContract({
    address: USDC_CONTRACT,
    abi: erc20Abi,
    functionName: "approve",
    args: [marketplaceAddress, amount],
    account,
    chain: arcTestnet,
  });
  const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash });
  assertSuccessfulReceipt(approveReceipt, "Approve USDC");

  // 2. Fund escrow via Memo — anexa jobId, clientId e valor para reconciliação offchain
  const fundCalldata = encodeFunctionData({
    abi: agenticCommerceAbi,
    functionName: "fund",
    args: [BigInt(jobId), "0x"],
  });
  const fundHash = await callWithMemo({
    walletClient,
    target: marketplaceAddress,
    calldata: fundCalldata,
    memoPayload: {
      event: "escrow_funded",
      jobId,
      clientId: account,
      usdcAmount: budgetUsdc,
      currency: "USDC",
    },
  });

  return { txHash: fundHash, explorerUrl: arcScanUrl(fundHash), jobId, mode: "live" };
}

export async function acceptJob({
  walletClient,
  jobId,
  budgetUsdc,
}: WalletAction & { jobId: string; budgetUsdc?: string }): Promise<TxResult> {
  if (isArcMockMode("job") || !walletClient) {
    const txHash = mockTxHash(`accept-${jobId}`);
    return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId, mode: "mock" };
  }

  if (!budgetUsdc) throw new Error("Provider budget is required before the client can fund escrow.");
  const { parseUnits } = await import("viem");
  const { account, arcTestnet, publicClient } = await getLiveClients(walletClient);
  const txHash = await walletClient.writeContract({
    address: getJobMarketplaceAddress(),
    abi: agenticCommerceAbi,
    functionName: "setBudget",
    args: [BigInt(jobId), parseUnits(budgetUsdc, 6), "0x"],
    account,
    chain: arcTestnet,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  assertSuccessfulReceipt(receipt, "Set budget");
  return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId, mode: "live" };
}

export async function submitDeliverable({
  walletClient,
  jobId,
  deliverableHash,
  deliverableDescription,
}: WalletAction & {
  jobId: string;
  deliverableHash?: string;
  deliverableDescription?: string;
}): Promise<TxResult & { deliverableHash: string }> {
  const source = deliverableDescription ?? jobId;
  const submittedHash = deliverableHash ?? source;

  if (isArcMockMode("job") || !walletClient) {
    const encoded = Array.from(source).map((char) => char.charCodeAt(0).toString(16)).join("").slice(0, 42);
    const hash = deliverableHash ?? `ipfs://${encoded.padEnd(42, "0")}`;
    const txHash = mockTxHash(`submit-${jobId}-${hash}`);
    return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId, deliverableHash: hash, mode: "mock" };
  }

  const { encodeFunctionData } = await import("viem");
  const { account } = await getLiveClients(walletClient);
  const marketplaceAddress = getJobMarketplaceAddress();
  const deliverableBytes32 = toBytes32(submittedHash) ?? await hashToBytes32(submittedHash);

  // Submit via Memo — anexa jobId, agentId e CID do deliverable para auditoria
  const submitCalldata = encodeFunctionData({
    abi: agenticCommerceAbi,
    functionName: "submit",
    args: [BigInt(jobId), deliverableBytes32, "0x"],
  });
  const txHash = await callWithMemo({
    walletClient,
    target: marketplaceAddress,
    calldata: submitCalldata,
    memoPayload: {
      event: "deliverable_submitted",
      jobId,
      agentId: account,
      deliverableCID: submittedHash,
    },
  });

  return { txHash, explorerUrl: arcScanUrl(txHash), jobId, deliverableHash: submittedHash, mode: "live" };
}

export async function approveAndPay({
  walletClient,
  jobId,
  reason = "deliverable-approved",
}: WalletAction & { jobId: string; reason?: string }): Promise<TxResult> {
  if (isArcMockMode("job") || !walletClient) {
    const txHash = mockTxHash(`approve-pay-${jobId}`);
    return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId, mode: "mock" };
  }

  const { encodeFunctionData } = await import("viem");
  const { account } = await getLiveClients(walletClient);
  const marketplaceAddress = getJobMarketplaceAddress();
  const reasonHash = toBytes32(reason) ?? await hashToBytes32(reason);

  // Complete via Memo — anexa jobId, recipient e invoiceRef para reconciliação de pagamento
  const completeCalldata = encodeFunctionData({
    abi: agenticCommerceAbi,
    functionName: "complete",
    args: [BigInt(jobId), reasonHash, "0x"],
  });
  const txHash = await callWithMemo({
    walletClient,
    target: marketplaceAddress,
    calldata: completeCalldata,
    memoPayload: {
      event: "job_completed",
      jobId,
      payoutRecipient: account,
      invoiceRef: `archv-${jobId}`,
    },
  });

  return { txHash, explorerUrl: arcScanUrl(txHash), jobId, mode: "live" };
}

export async function refundEscrow({ jobId }: WalletAction & { jobId: string }) {
  const txHash = mockTxHash(`refund-${jobId}`);
  return { txHash, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, jobId };
}

export async function getJobById(jobId: string) {
  return getJobRecordById(jobId);
}

export const setBudget = acceptJob;

export const approveAndFundEscrow = fundEscrow;
export const completeJob = approveAndPay;
