// src/lib/arc/adapters.ts
// Creates Arc App Kit adapters from a connected browser wallet (Wagmi/Viem)
// The adapter wraps the wallet client so App Kit can sign transactions

import type { WalletClient } from "viem";

/**
 * Creates a Viem adapter for Arc App Kit from an existing WalletClient.
 * Use this when the user has signed in via Dynamic (email or wallet) / Wagmi.
 *
 * @example
 * const { data: walletClient } = useWalletClient();
 * const adapter = createAdapterFromWalletClient(walletClient);
 */
export async function createAdapterFromWalletClient(walletClient: WalletClient) {
  const { createViemAdapter } = await import("@circle-fin/adapter-viem-v2") as any;
  return createViemAdapter({ walletClient });
}

/**
 * Chain name mapping — maps human-readable names to Arc App Kit chain strings.
 * These are the exact identifiers the SDK expects.
 */
export const CHAIN_IDS = {
  Ethereum: "Ethereum_Sepolia",
  Base: "Base_Sepolia",
  Arbitrum: "Arbitrum_Sepolia",
  Arc: "Arc_Testnet",
} as const;

export type SupportedChain = keyof typeof CHAIN_IDS;
export type ArcChainId = (typeof CHAIN_IDS)[SupportedChain];

/**
 * Human-readable chain display info for the UI
 */
export const CHAIN_DISPLAY: Record<
  SupportedChain,
  { color: string; icon: string; label: string }
> = {
  Ethereum: { color: "#627EEA", icon: "ETH", label: "Ethereum Sepolia" },
  Base: { color: "#0052FF", icon: "BASE", label: "Base Sepolia" },
  Arbitrum: { color: "#12AAFF", icon: "ARB", label: "Arbitrum Sepolia" },
  Arc: { color: "#00d4ff", icon: "ARC", label: "Arc Testnet" },
};
