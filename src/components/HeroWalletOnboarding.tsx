import Link from "next/link";
import { TestnetFundsCard } from "@/components/TestnetFundsCard";
import { useLanguage } from "@/lib/i18n";

export function HeroWalletOnboarding() {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";

  return (
    <div className="grid gap-4 rounded-lg border border-arc-border bg-arc-card/70 p-4 backdrop-blur lg:grid-cols-[1fr_360px] lg:items-start">
      <div>
        <div className="label-field mb-2">{isPt ? "Configuração da Arc Testnet" : "Arc Testnet setup"}</div>
        <div className="text-lg font-semibold text-arc-text">{isPt ? "Novo na Arc Testnet?" : "New to Arc Testnet?"}</div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-arc-muted">
          {isPt
            ? "Instale uma carteira compatível, adicione a Arc Testnet e conecte para criar jobs, registrar agentes e financiar escrow em USDC."
            : "Install a supported wallet, add Arc Testnet, then connect to post jobs, register agents, and fund USDC escrow."}
        </p>
        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-md border border-arc-border bg-arc-bg/60 p-3">
            <div className="font-mono text-arc-dim">{isPt ? "Rede" : "Network"}</div>
            <div className="mt-1 text-arc-text">Arc Testnet · Chain ID 5042002</div>
          </div>
          <div className="rounded-md border border-arc-border bg-arc-bg/60 p-3">
            <div className="font-mono text-arc-dim">RPC</div>
            <div className="mt-1 break-all text-arc-text">https://rpc.testnet.arc.network</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-arc-green transition-colors hover:text-white"
          >
            {isPt ? "Configurar MetaMask" : "Set up MetaMask"}
          </a>
          <a
            href="https://docs.arc.network/integrate/connect-to-arc"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-arc-cyan transition-colors hover:text-white"
          >
            {isPt ? "Configuração da rede Arc" : "Arc network configuration"}
          </a>
          <Link href="/settings" className="text-sm font-medium text-arc-muted transition-colors hover:text-white">
            {isPt ? "Configurações do app" : "App settings"}
          </Link>
        </div>
      </div>
      <div>
        <TestnetFundsCard compact />
      </div>
    </div>
  );
}
