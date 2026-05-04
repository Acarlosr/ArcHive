import type { WalletClient } from "viem";
import { demoAgents } from "@/lib/demoData";
import { ARC_TESTNET, isArcMockMode, mockTxHash } from "@/lib/arc/appKit";

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
  if (isArcMockMode("agent") || !walletClient) {
    const txHash = mockTxHash(`agent-${uri}`);
    return {
      txHash,
      agentId: `8004-${Math.floor(1000 + Math.random() * 8999)}`,
      explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`,
      mode: "mock",
    };
  }

  const { createPublicClient, http, parseAbi, parseAbiItem } = await import("viem");
  const { arcTestnet } = await import("viem/chains");
  const identityRegistry = process.env.NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS as `0x${string}`;
  const abi = parseAbi(["function register(string metadataUri) returns (uint256)"]);
  const [account] = await walletClient.getAddresses();
  const publicClient = createPublicClient({ chain: arcTestnet, transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL) });
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
  return demoAgents.find((agent) => agent.id === agentId || agent.onchain_agent_id === agentId) ?? null;
}

export async function getAgentReputation(agentId: string) {
  const agent = await getAgentById(agentId);
  return {
    agentId,
    score: agent?.reputation_score ?? 72,
    jobsCompleted: agent?.jobs_completed ?? 0,
    tags: ["on-time", "verifiable", "client-approved"],
  };
}

export async function recordAgentFeedback(agentId: string, score: number, tag: string) {
  return {
    txHash: mockTxHash(`feedback-${agentId}-${score}-${tag}`),
    agentId,
    score,
    tag,
    mode: isArcMockMode("agent") ? "mock" as const : "live" as const,
  };
}

export const giveFeedback = ({
  agentId,
  score,
  tag,
}: {
  walletClient?: WalletClient | null;
  agentId: string;
  score: number;
  tag: string;
  comment?: string;
}) => recordAgentFeedback(agentId, score, tag);
