import { AppKit } from "@circle-fin/app-kit";
import { AGENTIC_COMMERCE, IDENTITY_REGISTRY } from "@/lib/arc/contracts";

let appKit: AppKit | null = null;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function isArcMockMode(integration?: "agent" | "job" | "unifiedBalance") {
  if (process.env.NEXT_PUBLIC_ARC_MOCK_MODE === "true") return true;
  // Live readiness follows the address constants (the source of truth), not env
  // presence — a mistyped env must never silently flip actions back to mock.
  const agentLive = IDENTITY_REGISTRY !== ZERO_ADDRESS;
  const jobLive = AGENTIC_COMMERCE !== ZERO_ADDRESS;
  if (integration === "agent") return !agentLive;
  if (integration === "job") return !jobLive;
  return !agentLive || !jobLive;
}

/**
 * Guards every live (non-mock) action against a not-yet-ready wallet client.
 *
 * Callers used to fall back to a fabricated mock transaction whenever
 * `walletClient` was still `undefined` — e.g. the instant after connecting,
 * before wagmi/Dynamic finish resolving the signer. That silently recorded
 * a fake tx_hash as if it were a real onchain action, with no error shown.
 * Failing loudly here means a flaky wallet-client hook surfaces as a retry
 * prompt instead of phantom data.
 */
export function assertWalletClientReady(walletClient: unknown): asserts walletClient {
  if (!walletClient) {
    throw new Error(
      "Wallet is still connecting — this action was not sent onchain. Wait a moment after your wallet finishes connecting, then try again.",
    );
  }
}

export function getArcAppKit() {
  appKit ??= new AppKit();
  return appKit;
}

export function mockTxHash(seed = "archve"): `0x${string}` {
  const hex = Array.from(`${seed}-${Date.now()}`)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .padEnd(64, "0")
    .slice(0, 64);
  return `0x${hex}`;
}

export { ARC_MAINNET, ARC_TESTNET, ARC_CHAIN, ARC_CHAIN_ID, ARC_CHAIN_LABEL, ARC_CAIP_ID, ARC_KIT_CHAIN, ARC_NETWORK } from "./network";
export type { ArcNetwork } from "./network";
