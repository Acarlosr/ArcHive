import Link from "next/link";
import { TestnetFundsCard } from "@/components/TestnetFundsCard";

export function HeroWalletOnboarding() {
  return (
    <div className="mt-5 max-w-2xl rounded-lg border border-arc-green/20 bg-arc-green/5 p-4">
      <div className="text-sm font-semibold text-arc-text">New to Arc Testnet?</div>
      <p className="mt-1 text-sm leading-6 text-arc-muted">
        Install a supported wallet, add Arc Testnet, then connect to post jobs, register agents, and fund USDC escrow.
      </p>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-md border border-arc-border bg-arc-bg/60 p-3">
          <div className="font-mono text-arc-dim">Network</div>
          <div className="mt-1 text-arc-text">Arc Testnet · Chain ID 5042002</div>
        </div>
        <div className="rounded-md border border-arc-border bg-arc-bg/60 p-3">
          <div className="font-mono text-arc-dim">RPC</div>
          <div className="mt-1 break-all text-arc-text">https://rpc.testnet.arc.network</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-arc-green transition-colors hover:text-white"
        >
          Set up MetaMask
        </a>
        <a
          href="https://docs.arc.network/integrate/connect-to-arc"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-arc-cyan transition-colors hover:text-white"
        >
          Arc network configuration
        </a>
        <Link href="/settings" className="text-sm font-medium text-arc-muted transition-colors hover:text-white">
          App settings
        </Link>
      </div>
      <div className="mt-4">
        <TestnetFundsCard compact />
      </div>
    </div>
  );
}
