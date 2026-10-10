// src/lib/arc/network.ts
// Single source of truth for which Arc network the app is pointed at.
// Selected by NEXT_PUBLIC_ARC_NETWORK ("mainnet" | "testnet"); anything else
// falls back to testnet so local dev and demo mode keep working.

import { defineChain, type Chain } from "viem";

export type ArcNetwork = "mainnet" | "testnet";

export interface ArcChainInfo {
  id: number;
  name: string;
  explorerUrl: string;
  testnet: boolean;
}

// Arc Mainnet — https://docs.arc.io/arc/references/connect-to-arc
export const ARC_MAINNET: ArcChainInfo = {
  id: 5042,
  name: "Arc",
  explorerUrl: "https://explorer.arc.io",
  testnet: false,
};

// Arc Testnet — same reference
export const ARC_TESTNET: ArcChainInfo = {
  id: 5042002,
  name: "Arc Testnet",
  explorerUrl: "https://explorer.testnet.arc.io",
  testnet: true,
};

const raw = (process.env.NEXT_PUBLIC_ARC_NETWORK ?? "").trim().toLowerCase();

export const ARC_NETWORK: ArcNetwork = raw === "mainnet" ? "mainnet" : "testnet";

export const ARC_CHAIN: ArcChainInfo = ARC_NETWORK === "mainnet" ? ARC_MAINNET : ARC_TESTNET;

export const ARC_CHAIN_ID = ARC_CHAIN.id;
export const ARC_CHAIN_LABEL = ARC_CHAIN.name;

// CAIP-2 identifier (wallet metadata, seller service)
export const ARC_CAIP_ID = `eip155:${ARC_CHAIN.id}` as const;

// Identifier the Circle App Kit expects for this network
export const ARC_KIT_CHAIN = ARC_NETWORK === "mainnet" ? "Arc" : "Arc_Testnet";

// Primary RPC per network (failover list lives in src/lib/arc/rpc.ts)
const ARC_RPC_PRIMARY =
  ARC_NETWORK === "mainnet" ? "https://rpc.mainnet.arc.network" : "https://rpc.testnet.arc.network";

// viem chain object for the active Arc network. Public clients always pass an
// explicit transport (arcTransport), so the rpcUrls entry here is a fallback.
export const arcChain: Chain = defineChain({
  id: ARC_CHAIN.id,
  name: ARC_CHAIN.name,
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: [ARC_RPC_PRIMARY] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: ARC_CHAIN.explorerUrl },
  },
  testnet: ARC_CHAIN.testnet,
});
