// src/lib/arc/contracts.ts
// Deployed Arc contract addresses and ABIs for ArcHive.
// Mainnet addresses come from https://docs.arc.io/arc/references/contract-addresses
// and are selected by NEXT_PUBLIC_ARC_NETWORK (see src/lib/arc/network.ts).

import type { Address } from "viem";
import { getAddress } from "viem";
import { ARC_NETWORK } from "@/lib/arc/network";

// ── Contract Addresses ──
// ERC-8004 registries differ per network.
const IDENTITY_REGISTRY_BY_NETWORK = {
  mainnet: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
  testnet: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
} as const;

const REPUTATION_REGISTRY_BY_NETWORK = {
  mainnet: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63",
  testnet: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
} as const;

const VALIDATION_REGISTRY_BY_NETWORK = {
  mainnet: "0x8004Cc8439f36fd5F9F049D9fF86523Df6dAAB58",
  testnet: "0x8004Cb1BF31DAf7788923b405b754f57acEB4272",
} as const;

export const IDENTITY_REGISTRY: Address =
  IDENTITY_REGISTRY_BY_NETWORK[ARC_NETWORK];
export const REPUTATION_REGISTRY: Address =
  REPUTATION_REGISTRY_BY_NETWORK[ARC_NETWORK];
export const VALIDATION_REGISTRY: Address =
  VALIDATION_REGISTRY_BY_NETWORK[ARC_NETWORK];

// ERC-8183: Arc only publishes a reference implementation on Testnet.
// On Mainnet, ArcHive deploys its own copy (see contracts/erc8183/).
const AGENTIC_COMMERCE_BY_NETWORK: Record<"mainnet" | "testnet", Address> = {
  // ArcHive mainnet deployment, 2026-10-10: implementation behind UUPS proxy.
  mainnet: "0x172c7f69a802ae1e019ba4c4a7f20e874b120681",
  testnet: "0x0747EEf0706327138c69792bF28Cd525089e4583",
};

export const AGENTIC_COMMERCE: Address = AGENTIC_COMMERCE_BY_NETWORK[ARC_NETWORK];

/**
 * Resolves an address from an env var with the in-repo constant as fallback.
 * A malformed env value (typo, truncated paste, bad checksum) must never break
 * live mode: it is ignored and the verified constant wins instead.
 */
export function resolveAddress(envValue: string | undefined, fallback: Address): Address {
  if (!envValue || !envValue.trim()) return fallback;
  try {
    return getAddress(envValue.trim());
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[arc] Ignoring invalid address env override: ${envValue.slice(0, 12)}…`);
    }
    return fallback;
  }
}

// Same address on both networks (docs.arc.io/arc/references/contract-addresses).
export const USDC_CONTRACT: Address = "0x3600000000000000000000000000000000000000";
// Arc Transaction Memos — https://docs.arc.io/arc/concepts/transaction-memos
export const MEMO_CONTRACT: Address = "0x5294E9927c3306DcBaDb03fe70b92e01cCede505";

// ── ERC-8004 Identity Registry ABI ──
export const identityRegistryAbi = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "metadataURI", type: "string" }],
    outputs: [],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

// ── ERC-8004 Reputation Registry ABI ──
export const reputationRegistryAbi = [
  {
    name: "giveFeedback",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "score", type: "int128" },
      { name: "feedbackType", type: "uint8" },
      { name: "tag", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "evidenceURI", type: "string" },
      { name: "comment", type: "string" },
      { name: "feedbackHash", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

// ── ERC-8183 Agentic Commerce ABI ──
export const agenticCommerceAbi = [
  {
    name: "createJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "provider", type: "address" },
      { name: "evaluator", type: "address" },
      { name: "expiredAt", type: "uint256" },
      { name: "description", type: "string" },
      { name: "hook", type: "address" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    name: "setBudget",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "fund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "submit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverable", type: "bytes32" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "complete",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "reason", type: "bytes32" },
      { name: "optParams", type: "bytes" },
    ],
    outputs: [],
  },
  {
    // Part of the ERC-8183 reference implementation; available on ArcHive's
    // own mainnet deployment, not on the official Testnet reference.
    name: "claimRefund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getJob",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "client", type: "address" },
          { name: "provider", type: "address" },
          { name: "evaluator", type: "address" },
          { name: "description", type: "string" },
          { name: "budget", type: "uint256" },
          { name: "expiredAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "hook", type: "address" },
        ],
      },
    ],
  },
  {
    name: "JobCreated",
    type: "event",
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "client", type: "address" },
      { indexed: true, name: "provider", type: "address" },
      { indexed: false, name: "evaluator", type: "address" },
      { indexed: false, name: "expiredAt", type: "uint256" },
      { indexed: false, name: "hook", type: "address" },
    ],
  },
] as const;

// ── ERC-20 USDC ABI (approve + balanceOf) ──
export const erc20Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// ── Transfer event for parsing agent registration ──
export const transferEventAbi = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
  },
] as const;

// ── Arc Memo Contract ABI ──
export const memoAbi = [
  {
    name: "memo",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "target", type: "address" },
      { name: "data", type: "bytes" },
      { name: "memoId", type: "bytes32" },
      { name: "memoData", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "BeforeMemo",
    anonymous: false,
    inputs: [{ indexed: true, name: "memoIndex", type: "uint256" }],
  },
  {
    type: "event",
    name: "Memo",
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: true, name: "target", type: "address" },
      { name: "callDataHash", type: "bytes32" },
      { indexed: true, name: "memoId", type: "bytes32" },
      { name: "memo", type: "bytes" },
      { name: "memoIndex", type: "uint256" },
    ],
  },
] as const;

// ── Job status names ──
export const JOB_STATUS_NAMES = [
  "Open",
  "Funded",
  "Submitted",
  "Completed",
  "Rejected",
  "Expired",
] as const;

export type JobStatus = (typeof JOB_STATUS_NAMES)[number];
