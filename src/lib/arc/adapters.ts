// src/lib/arc/adapters.ts
// Creates Arc App Kit adapters from a connected browser wallet (Wagmi/Viem)
// The adapter wraps the wallet client so App Kit can sign transactions

import type { WalletClient } from "viem";
import { ARC_CHAIN_LABEL, ARC_NETWORK } from "@/lib/arc/network";

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
 * Mainnet sources resolve to mainnet chains; testnet to Sepolia variants.
 */
const CHAIN_IDS_MAINNET = {
  Ethereum: "Ethereum",
  Base: "Base",
  Arbitrum: "Arbitrum",
  Arc: "Arc",
} as const;

const CHAIN_IDS_TESTNET = {
  Ethereum: "Ethereum_Sepolia",
  Base: "Base_Sepolia",
  Arbitrum: "Arbitrum_Sepolia",
  Arc: "Arc_Testnet",
} as const;

export const CHAIN_IDS = ARC_NETWORK === "mainnet" ? CHAIN_IDS_MAINNET : CHAIN_IDS_TESTNET;

export type SupportedChain = keyof typeof CHAIN_IDS;
export type ArcChainId = (typeof CHAIN_IDS)[SupportedChain];

/**
 * Human-readable chain display info for the UI
 */
export const CHAIN_DISPLAY: Record<
  SupportedChain,
  { color: string; icon: string; label: string }
> = {
  Ethereum: {
    color: "#627EEA",
    icon: "ETH",
    label: ARC_NETWORK === "mainnet" ? "Ethereum" : "Ethereum Sepolia",
  },
  Base: { color: "#0052FF", icon: "BASE", label: ARC_NETWORK === "mainnet" ? "Base" : "Base Sepolia" },
  Arbitrum: {
    color: "#12AAFF",
    icon: "ARB",
    label: ARC_NETWORK === "mainnet" ? "Arbitrum One" : "Arbitrum Sepolia",
  },
  Arc: { color: "#00d4ff", icon: "ARC", label: ARC_CHAIN_LABEL },
};
