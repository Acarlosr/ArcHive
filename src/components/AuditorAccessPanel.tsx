"use client";

import { useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";
import { ExplorerLink } from "@/components/ExplorerLink";
import {
  AUDITOR_ACCESS_DOMAIN,
  AUDITOR_ACCESS_TYPES,
  buildAccessRequest,
  DEMO_AUDITOR_WALLET,
  verifyAuditorSignature,
  visiblePacksForAuditor,
} from "@/lib/auditorAccess";
import type { ProofPack } from "@/lib/proofPacks";

export function AuditorAccessPanel({ packs, isPt }: { packs: ProofPack[]; isPt: boolean }) {
  return (
    <WalletProviderIsland>
      <AuditorAccessPanelInner packs={packs} isPt={isPt} />
    </WalletProviderIsland>
  );
}

type AccessState =
  | { status: "locked" }
  | { status: "verifying" }
  | { status: "denied"; reason: string }
  | { status: "granted"; auditor: string; demo: boolean };

function AuditorAccessPanelInner({ packs, isPt }: { packs: ProofPack[]; isPt: boolean }) {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [access, setAccess] = useState<AccessState>({ status: "locked" });

  async function requestAccess() {
    if (!address) return;
    setAccess({ status: "verifying" });
    try {
      const request = buildAccessRequest(address);
      const signature = await signTypedDataAsync({
        domain: AUDITOR_ACCESS_DOMAIN,
        types: AUDITOR_ACCESS_TYPES,
        primaryType: "AuditorAccessRequest",
        message: request,
      });
      const valid = await verifyAuditorSignature(request, signature);
      if (!valid) {
        setAccess({
          status: "denied",
          reason: isPt ? "Assinatura inválida." : "Invalid signature.",
        });
        return;
      }
      const visible = visiblePacksForAuditor(address, packs);
      if (visible.length === 0) {
        setAccess({
          status: "denied",
          reason: isPt
            ? "Assinatura verificada, mas esta carteira não está na lista de acesso de nenhum job."
            : "Signature verified, but this wallet is not on any job's access list.",
        });
        return;
      }
      setAccess({ status: "granted", auditor: address, demo: false });
    } catch {
      setAccess({
        status: "denied",
        reason: isPt ? "Assinatura cancelada." : "Signature rejected.",
      });
    }
  }

  function demoAccess() {
    setAccess({ status: "granted", auditor: DEMO_AUDITOR_WALLET, demo: true });
  }

  const granted = access.status === "granted";
  const visiblePacks = granted ? visiblePacksForAuditor(access.auditor, packs) : [];

  return (
    <section className="mb-8 rounded-lg border border-arc-cyan/25 bg-arc-card/85 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label-field mb-2">{isPt ? "Visibilidade governada" : "Governed visibility"}</div>
          <h2 className="font-display text-2xl font-bold text-arc-text">
            {isPt ? "Visão de auditor" : "Auditor view"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-arc-muted">
            {isPt
              ? "O público vê provas hash-only. Quem prova identidade com uma assinatura EIP-712 e está na lista de acesso vê o detalhe completo — o modelo de queries autorizadas do whitepaper de privacidade da Arc, em versão app-level."
              : "The public sees hash-only proofs. Whoever proves identity with an EIP-712 signature and is on the access list sees full detail — the authorized-query model from Arc's privacy whitepaper, app-level today."}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {!granted ? (
            <>
              <button
                type="button"
                onClick={requestAccess}
                disabled={!isConnected || access.status === "verifying"}
                className="rounded-lg border border-arc-cyan/40 bg-arc-cyan/10 px-4 py-2 text-sm font-medium text-arc-cyan transition-all hover:bg-arc-cyan/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {access.status === "verifying"
                  ? isPt ? "Verificando..." : "Verifying..."
                  : isPt ? "Assinar como auditor (EIP-712)" : "Sign as auditor (EIP-712)"}
              </button>
              <button
                type="button"
                onClick={demoAccess}
                className="rounded-lg border border-arc-border px-4 py-2 text-xs font-medium text-arc-muted transition-all hover:border-arc-cyan/30 hover:text-arc-cyan"
              >
                {isPt ? "Ver como auditor demo" : "View as demo auditor"}
              </button>
              {!isConnected ? (
                <span className="text-center text-[11px] text-arc-dim">
                  {isPt ? "Conecte a carteira para assinar" : "Connect wallet to sign"}
                </span>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setAccess({ status: "locked" })}
              className="rounded-lg border border-arc-border px-4 py-2 text-sm font-medium text-arc-muted transition-all hover:text-arc-text"
            >
              {isPt ? "Bloquear visão" : "Lock view"}
            </button>
          )}
        </div>
      </div>

      {access.status === "denied" ? (
        <div className="mt-4 rounded-md border border-arc-red/30 bg-arc-red/10 p-3 text-sm text-arc-red">
          {access.reason}
        </div>
      ) : null}

      {granted ? (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-arc-muted">
            <span className="rounded-full border border-arc-green/35 bg-arc-green/10 px-2 py-0.5 font-mono text-[10px] uppercase text-arc-green">
              {isPt ? "acesso concedido" : "access granted"}
            </span>
            <span className="font-mono">{access.auditor}</span>
            {access.demo ? (
              <span className="rounded-full border border-arc-gold/35 bg-arc-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase text-arc-gold">
                demo
              </span>
            ) : null}
            <span>
              {isPt
                ? `${visiblePacks.length} de ${packs.length} packs visíveis para esta identidade`
                : `${visiblePacks.length} of ${packs.length} packs visible to this identity`}
            </span>
          </div>

          <div className="space-y-3">
            {visiblePacks.map((pack) => (
              <div key={pack.id} className="rounded-md border border-arc-border bg-arc-bg/70 p-4">
                <div className="font-display text-sm font-semibold text-arc-text">{pack.job.title}</div>
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                  <AuditorField
                    label={isPt ? "Cliente (completo)" : "Client (full)"}
                    value={pack.job.client_wallet}
                  />
                  <AuditorField
                    label={isPt ? "Prestador (completo)" : "Provider (full)"}
                    value={pack.job.provider_wallet}
                  />
                  <AuditorField label={isPt ? "Orçamento" : "Budget"} value={`${pack.job.budget_usdc} USDC`} />
                  <AuditorField
                    label={isPt ? "Hash da entrega" : "Deliverable hash"}
                    value={pack.job.deliverable_hash ?? (isPt ? "ainda não enviada" : "not submitted yet")}
                  />
                </dl>
                {pack.receipts.length > 0 ? (
                  <div className="mt-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-arc-dim">
                      {isPt ? "recibos x402" : "x402 receipts"}
                    </div>
                    <div className="mt-1 space-y-1">
                      {pack.receipts.map((receipt) => (
                        <div key={receipt.id} className="flex flex-wrap items-center gap-2 text-xs text-arc-muted">
                          <span>{receipt.toolName}</span>
                          <span className="text-arc-text">{receipt.amountUsdc} USDC</span>
                          <ExplorerLink txHash={receipt.txHash} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AuditorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-arc-dim">{label}</dt>
      <dd className="mt-0.5 break-all font-mono text-arc-text">{value}</dd>
    </div>
  );
}
