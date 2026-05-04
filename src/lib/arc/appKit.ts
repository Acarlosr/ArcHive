import { AppKit } from "@circle-fin/app-kit";

let appKit: AppKit | null = null;

export function isArcMockMode() {
  return (
    process.env.NEXT_PUBLIC_ARC_MOCK_MODE === "true" ||
    !process.env.NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS ||
    !process.env.NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS
  );
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
  id: 2810,
  name: "Arc Testnet",
  explorerUrl: "https://testnet.arcscan.app",
  settlementAsset: "USDC",
} as const;
