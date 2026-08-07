import { AppKit } from "@circle-fin/app-kit";

let appKit: AppKit | null = null;

export function isArcMockMode(integration?: "agent" | "job" | "unifiedBalance") {
  if (process.env.NEXT_PUBLIC_ARC_MOCK_MODE === "true") return true;
  if (integration === "agent") return !process.env.NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS;
  if (integration === "job") return !process.env.NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS;
  return (
    !process.env.NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS ||
    !process.env.NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS
  );
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

export const ARC_TESTNET = {
  id: 5042002,
  name: "Arc Testnet",
  explorerUrl: "https://testnet.arcscan.app",
  settlementAsset: "USDC",
} as const;
