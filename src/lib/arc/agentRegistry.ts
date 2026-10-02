import type { WalletClient } from "viem";
import { demoAgents } from "@/lib/demoData";
import { getAgentByOnchainId } from "@/lib/db/agents";
import { ARC_TESTNET, assertWalletClientReady, isArcMockMode, mockTxHash } from "@/lib/arc/appKit";
import { REPUTATION_REGISTRY, reputationRegistryAbi } from "@/lib/arc/contracts";
import { arcTransport } from "@/lib/arc/rpc";

export async function registerAgent({
  walletClient,
  metadataUri,
  metadataURI,
}: {
  walletClient?: WalletClient | null;
  metadataUri?: string;
  metadataURI?: string;
}): Promise<{ txHash: `0x${string}`; agentId: string; explorerUrl: string; mode: "mock" | "live" }> {
  const uri = metadataUri ?? metadataURI ?? "ipfs://bafybeihive-agent";
  if (isArcMockMode("agent")) {
    const txHash = mockTxHash(`agent-${uri}`);
    return {
      txHash,
      agentId: `8004-${Math.floor(1000 + Math.random() * 8999)}`,
      explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`,
      mode: "mock",
    };
  }
  assertWalletClientReady(walletClient);

  const { createPublicClient, parseAbi, parseAbiItem } = await import("viem");
  const { arcTestnet } = await import("viem/chains");
  const identityRegistry = process.env.NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS as `0x${string}`;
  const abi = parseAbi(["function register(string metadataUri) returns (uint256)"]);
  const [account] = await walletClient.getAddresses();
  const publicClient = createPublicClient({ chain: arcTestnet, transport: arcTransport() });
  const txHash = await walletClient.writeContract({
    address: identityRegistry,
    abi,
    functionName: "register",
    args: [uri],
    account,
    chain: arcTestnet,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  const transferLogs = await publicClient.getLogs({
    address: identityRegistry,
    event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"),
    args: { to: account },
    fromBlock: receipt.blockNumber,
    toBlock: receipt.blockNumber,
  });
  const tokenId = transferLogs[transferLogs.length - 1]?.args.tokenId?.toString() ?? receipt.transactionIndex.toString();
  return { txHash, agentId: tokenId, explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`, mode: "live" };
}

export async function getAgentById(agentId: string) {
  if (isArcMockMode("agent")) {
    return demoAgents.find((agent) => agent.id === agentId || agent.onchain_agent_id === agentId) ?? null;
  }
  return getAgentByOnchainId(agentId);
}

export async function getAgentReputation(agentId: string) {
  if (isArcMockMode("agent")) {
    const agent = await getAgentById(agentId);
    return {
      agentId,
      score: agent?.reputation_score ?? 0,
      jobsCompleted: agent?.jobs_completed ?? 0,
      tags: ["on-time", "verifiable", "client-approved"],
    };
  }
  const agent = await getAgentById(agentId);
  return {
    agentId,
    score: agent?.reputation_score ?? 0,
    jobsCompleted: agent?.jobs_completed ?? 0,
    tags: [] as string[],
  };
}

export async function recordAgentFeedback({
  walletClient,
  agentId,
  score,
  tag,
  comment,
}: {
  walletClient?: WalletClient | null;
  agentId: string;
  score: number;
  tag: string;
  comment?: string;
}): Promise<{
  txHash: `0x${string}`;
  agentId: string;
  score: number;
  tag: string;
  explorerUrl: string;
  mode: "mock" | "live";
}> {
  if (isArcMockMode("agent")) {
    const txHash = mockTxHash(`feedback-${agentId}-${score}-${tag}`);
    return {
      txHash,
      agentId,
      score,
      tag,
      explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`,
      mode: "mock",
    };
  }
  assertWalletClientReady(walletClient);

  let onchainAgentId: bigint;
  try {
    onchainAgentId = BigInt(agentId);
  } catch {
    throw new Error(
      `Feedback on-chain precisa do agentId numérico do ERC-8004 (recebido: "${agentId}"). Registre o agente on-chain primeiro.`,
    );
  }

  const { createPublicClient } = await import("viem");
  const { arcTestnet } = await import("viem/chains");
  const [account] = await walletClient.getAddresses();
  const publicClient = createPublicClient({ chain: arcTestnet, transport: arcTransport() });
  const txHash = await walletClient.writeContract({
    address: REPUTATION_REGISTRY,
    abi: reputationRegistryAbi,
    functionName: "giveFeedback",
    args: [
      onchainAgentId,
      BigInt(Math.trunc(score)),
      0,
      tag,
      "",
      "",
      comment ?? "",
      `0x${"0".repeat(64)}` as `0x${string}`,
    ],
    account,
    chain: arcTestnet,
  });
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return {
    txHash,
    agentId,
    score,
    tag,
    explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`,
    mode: "live",
  };
}

export const giveFeedback = ({
  walletClient,
  agentId,
  score,
  tag,
  comment,
}: {
  walletClient?: WalletClient | null;
  agentId: string;
  score: number;
  tag: string;
  comment?: string;
}) => recordAgentFeedback({ walletClient, agentId, score, tag, comment });
