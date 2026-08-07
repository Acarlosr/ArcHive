import type { WalletClient } from "viem";
import { ARC_TESTNET, assertWalletClientReady, getArcAppKit, isArcMockMode, mockTxHash } from "@/lib/arc/appKit";
import { CHAIN_IDS, type SupportedChain } from "@/lib/arc/adapters";

export interface DepositParams {
  walletClient?: WalletClient | null;
  chain: SupportedChain;
  amount: string;
}

export interface UnifiedBalance {
  chain: string;
  confirmedUsdc: string;
  pendingUsdc: string;
}

export interface FundingEstimate {
  amountIn: string;
  gatewayFee: string;
  marketplaceFee: string;
  totalFee: string;
  totalFundingRequired: string;
  settlementChain: string;
}

export interface SpendEstimate {
  amountIn: string;
  fees: {
    gatewayFee: string;
    customFee: string;
    totalFee: string;
  };
  totalYouPay: string;
}

export interface SpendParams {
  walletClient?: WalletClient | null;
  amount: string;
  recipientAddress: string;
  jobId?: string;
  feeRecipient?: string;
  feeBps?: number;
}

export interface SpendResult {
  txHash: `0x${string}`;
  explorerUrl: string;
  amount: string;
  recipient: string;
  mode: "mock" | "live";
}

export async function depositToUnifiedBalance(params: DepositParams) {
  if (isArcMockMode()) {
    return {
      txHash: mockTxHash(`deposit-${params.amount}`),
      explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${mockTxHash("deposit")}`,
      amount: params.amount,
      chain: CHAIN_IDS[params.chain],
      mode: "mock" as const,
    };
  }
  assertWalletClientReady(params.walletClient);

  const [adapterModule, kit] = await Promise.all([
    import("@circle-fin/adapter-viem-v2"),
    Promise.resolve(getArcAppKit()),
  ]);
  const { createViemAdapter } = adapterModule as any;
  const adapter = createViemAdapter({ walletClient: params.walletClient });
  const result = await kit.unifiedBalance.deposit({
    from: { adapter, chain: CHAIN_IDS[params.chain] },
    amount: params.amount,
    token: "USDC",
  });

  return {
    txHash: result.txHash,
    explorerUrl: result.explorerUrl,
    amount: result.amount,
    chain: CHAIN_IDS[params.chain],
    mode: "live" as const,
  };
}

export async function getUnifiedBalances(walletClients: WalletClient[] = []): Promise<{
  totalConfirmedBalance: string;
  totalPendingBalance: string;
  token: "USDC";
  breakdown: UnifiedBalance[];
}> {
  if (isArcMockMode() || walletClients.length === 0) {
    return {
      totalConfirmedBalance: "5270.60",
      totalPendingBalance: "320.00",
      token: "USDC",
      breakdown: [
        { chain: "Arc Testnet", confirmedUsdc: "3820.42", pendingUsdc: "0.00" },
        { chain: "Base Sepolia", confirmedUsdc: "940.00", pendingUsdc: "120.00" },
        { chain: "Ethereum Sepolia", confirmedUsdc: "510.18", pendingUsdc: "200.00" },
      ],
    };
  }

  const [adapterModule, kit] = await Promise.all([
    import("@circle-fin/adapter-viem-v2"),
    Promise.resolve(getArcAppKit()),
  ]);
  const { createViemAdapter } = adapterModule as any;
  const sources = walletClients.map((walletClient) => ({ adapter: createViemAdapter({ walletClient }) }));
  const result = await kit.unifiedBalance.getBalances({
    sources,
    networkType: "testnet",
    includePending: true,
  });

  return {
    totalConfirmedBalance: result.totalConfirmedBalance,
    totalPendingBalance: result.totalPendingBalance ?? "0.00",
    token: "USDC",
    breakdown: (result.breakdown ?? []).map((item: any) => ({
      chain: item.chain ?? "Unknown",
      confirmedUsdc: item.totalConfirmed ?? "0.00",
      pendingUsdc: item.totalPending ?? "0.00",
    })),
  };
}

export async function estimateJobFunding({
  amount,
  feeBps = 25,
}: {
  amount: string;
  feeBps?: number;
}): Promise<FundingEstimate> {
  const value = Number(amount || 0);
  const gatewayFee = value > 0 ? 0.08 : 0;
  const marketplaceFee = value * (feeBps / 10000);
  const totalFee = gatewayFee + marketplaceFee;

  return {
    amountIn: value.toFixed(2),
    gatewayFee: gatewayFee.toFixed(2),
    marketplaceFee: marketplaceFee.toFixed(2),
    totalFee: totalFee.toFixed(2),
    totalFundingRequired: (value + totalFee).toFixed(2),
    settlementChain: ARC_TESTNET.name,
  };
}

export async function estimateSpend({
  amount,
  feeBps = 50,
}: {
  walletClient?: WalletClient | null;
  amount: string;
  recipientAddress?: string;
  feeRecipient?: string;
  feeBps?: number;
}): Promise<SpendEstimate> {
  const estimate = await estimateJobFunding({ amount, feeBps });
  return {
    amountIn: estimate.amountIn,
    fees: {
      gatewayFee: estimate.gatewayFee,
      customFee: estimate.marketplaceFee,
      totalFee: estimate.totalFee,
    },
    totalYouPay: estimate.totalFundingRequired,
  };
}

export async function spendFromUnifiedBalance(params: SpendParams): Promise<SpendResult> {
  if (isArcMockMode()) {
    const txHash = mockTxHash(`spend-${params.jobId ?? params.recipientAddress}`);
    return {
      txHash,
      explorerUrl: `${ARC_TESTNET.explorerUrl}/tx/${txHash}`,
      amount: params.amount,
      recipient: params.recipientAddress,
      mode: "mock" as const,
    };
  }
  assertWalletClientReady(params.walletClient);

  const [adapterModule, kit] = await Promise.all([
    import("@circle-fin/adapter-viem-v2"),
    Promise.resolve(getArcAppKit()),
  ]);
  const { createViemAdapter } = adapterModule as any;
  const adapter = createViemAdapter({ walletClient: params.walletClient });
  const result = await kit.unifiedBalance.spend({
    amount: params.amount,
    token: "USDC",
    from: [{ adapter }],
    to: {
      adapter,
      chain: "Arc_Testnet",
      recipientAddress: params.recipientAddress as `0x${string}`,
    },
  });

  const spendResult = result as any;
  return {
    txHash: spendResult.txHash as `0x${string}`,
    explorerUrl: spendResult.explorerUrl ?? `${ARC_TESTNET.explorerUrl}/tx/${spendResult.txHash}`,
    amount: spendResult.amount ?? params.amount,
    recipient: params.recipientAddress,
    mode: "live" as const,
  };
}
