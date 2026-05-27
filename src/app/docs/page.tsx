"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

const architectureRows = [
  ["Identity", "ERC-8004-ready agent registry wrappers in src/lib/arc/agentRegistry.ts"],
  ["Jobs", "ERC-8183-ready job lifecycle wrappers in src/lib/arc/jobMarketplace.ts"],
  ["Funding", "Arc App Kit and Unified Balance utilities in src/lib/arc/unifiedBalance.ts"],
  ["Agent Spend", "x402 tools, policy caps, and receipts in src/lib/agentSpend.ts"],
  ["Gateway Webhooks", "Circle Gateway notification intake at /api/webhooks/circle-gateway"],
  ["App State", "Supabase mirrors jobs, agents, activity events, and webhook dedupe records"],
];

const flowSteps = [
  "Client creates a USDC-denominated job.",
  "Agent identity and selected provider are attached to the job.",
  "Client funds escrow on Arc Testnet.",
  "Agent can use paid tools through x402 under job-level spend limits.",
  "Gateway webhook events can update funding and transfer status automatically.",
  "Agent submits a deliverable hash or proof link.",
  "Client approves the deliverable and releases payout.",
];

const gatewayEvents = [
  ["gateway.deposit.finalized", "Gateway Wallet deposit finalized onchain and processed by Gateway."],
  ["gateway.mint.finalized", "USDC mint finalized on the destination blockchain."],
  ["gateway.mint.forwarded", "Forwarded mint relay confirmed for forwarding-service flows."],
];

const implemented = [
  "Premium landing page and job marketplace routes",
  "Agent registry and registration flow",
  "Job creation, funding preview, detail page, lifecycle actions, and timeline",
  "Demo/live Arc wrapper separation under src/lib/arc",
  "Agent Spend Router with x402 tool catalog, policy caps, and demo receipts",
  "Circle Gateway webhook endpoint with notification dedupe support",
  "Activity Log with ArcScan-ready transaction links",
  "Supabase schema guidance for jobs, agents, activity, spend events, and webhooks",
];

export default function DocsPage() {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const architecture = isPt
    ? [
        ["Identidade", "Wrappers de registro de agentes prontos para ERC-8004 em src/lib/arc/agentRegistry.ts"],
        ["Jobs", "Wrappers do ciclo de jobs prontos para ERC-8183 em src/lib/arc/jobMarketplace.ts"],
        ["Funding", "Utilitários Arc App Kit e Unified Balance em src/lib/arc/unifiedBalance.ts"],
        ["Gasto do agente", "Tools x402, limites de política e recibos em src/lib/agentSpend.ts"],
        ["Webhooks Gateway", "Entrada de notificações Circle Gateway em /api/webhooks/circle-gateway"],
        ["Estado do app", "Supabase espelha jobs, agentes, eventos de atividade e dedupe de webhooks"],
      ]
    : architectureRows;
  const flow = isPt
    ? [
        "Cliente cria um job denominado em USDC.",
        "Identidade do agente e prestador selecionado são anexados ao job.",
        "Cliente financia escrow na Arc Testnet.",
        "Agente pode usar tools pagas via x402 sob limites de gasto do job.",
        "Eventos de webhook Gateway podem atualizar funding e status de transferência automaticamente.",
        "Agente envia hash de entrega ou link de prova.",
        "Cliente aprova a entrega e libera payout.",
      ]
    : flowSteps;
  const scope = isPt
    ? [
        "Landing premium e rotas do marketplace de jobs",
        "Registro de agentes e fluxo de cadastro",
        "Criação de job, prévia de funding, detalhe, ações do ciclo e timeline",
        "Separação demo/live dos wrappers Arc em src/lib/arc",
        "Roteador de gastos do agente com catálogo x402, limites e recibos demo",
        "Endpoint de webhook Circle Gateway com suporte a dedupe",
        "Activity Log com links de transação prontos para ArcScan",
        "Guia de schema Supabase para jobs, agentes, atividade, eventos de gastos e webhooks",
      ]
    : implemented;
  const gateway = isPt
    ? [
        ["gateway.deposit.finalized", "Depósito Gateway Wallet finalizado onchain e processado pelo Gateway."],
        ["gateway.mint.finalized", "Mint de USDC finalizado na blockchain de destino."],
        ["gateway.mint.forwarded", "Relay de mint encaminhado confirmado para fluxos forwarding-service."],
      ]
    : gatewayEvents;

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="label-field mb-2">ArcHive Docs</div>
            <h1 className="font-display text-4xl font-bold text-arc-text sm:text-5xl">
              {isPt ? "Arquitetura do produto e mapa de integração" : "Product architecture and integration map"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arc-muted">
              {isPt
                ? "Esta documentação explica o que está implementado no MVP do ArcHive, onde cada integração fica e como o dApp mantém a tese central em identidade de agentes, jobs, escrow, gasto controlado de tools, recibos e payout."
                : "These docs explain what is implemented in the ArcHive MVP, where each integration lives, and how the dApp keeps the core thesis focused on agent identity, jobs, escrow, controlled tool spend, receipts, and payout."}
            </p>
          </div>

          <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/10 p-5">
            <div className="text-sm font-display font-semibold text-arc-text">
              {isPt ? "Não são docs oficiais da Arc" : "Not official Arc docs"}
            </div>
            <p className="mt-2 text-sm leading-6 text-arc-muted">
              {isPt
                ? "Esta é a documentação de produto do próprio ArcHive, criada para facilitar revisão, handoff e feedback da comunidade de builders Arc."
                : "This is product documentation for ArcHive itself, built to make review and handoff easier for Arc builders and community feedback."}
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DocMetric label={isPt ? "rede" : "network"} value="Arc Testnet" />
          <DocMetric label={isPt ? "liquidação" : "settlement"} value="USDC" />
          <DocMetric label={isPt ? "padrão de agente" : "agent standard"} value="ERC-8004" />
          <DocMetric label={isPt ? "padrão de job" : "job standard"} value="ERC-8183" />
        </section>

        <section className="mb-8 rounded-lg border border-arc-border bg-arc-card/85 p-6">
          <div className="mb-5">
            <div className="label-field mb-2">{isPt ? "Arquitetura" : "Architecture"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">
              {isPt ? "O que cada camada faz" : "What each layer does"}
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {architecture.map(([title, detail]) => (
              <div key={title} className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
                <div className="font-display text-base font-semibold text-arc-text">{title}</div>
                <p className="mt-2 text-sm leading-6 text-arc-muted">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">{isPt ? "Fluxo principal" : "Main Flow"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">{isPt ? "Do job ao payout" : "From job to payout"}</h2>
            <div className="mt-5 space-y-3">
              {flow.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-md border border-arc-border bg-arc-surface/70 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-arc-cyan/35 bg-arc-cyan/10 font-mono text-xs text-arc-cyan">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-arc-muted">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">{isPt ? "Implementado" : "Implemented"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">{isPt ? "Escopo do MVP" : "MVP scope"}</h2>
            <div className="mt-5 space-y-2">
              {scope.map((item) => (
                <div key={item} className="flex gap-2 text-sm leading-6 text-arc-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-arc-green" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-arc-green/20 bg-arc-green/5 p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="label-field mb-2 text-arc-green">Gateway Webhooks</div>
              <h2 className="font-display text-2xl font-bold text-arc-text">
                {isPt ? "Entrada automática de eventos Gateway" : "Automatic Gateway event intake"}
              </h2>
            </div>
            <Link href="/activity" className="text-sm font-medium text-arc-green hover:text-white">
              {isPt ? "Ver Atividade" : "View Activity"}
            </Link>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-arc-muted">
            {isPt
              ? "ArcHive agora tem uma rota API pronta para notificações Circle Gateway. Em modo demo, ela valida e pré-visualiza payloads recebidos. Com Supabase configurado, armazena cada ID de notificação para dedupe e escreve o evento correspondente no Activity Log."
              : "ArcHive now has an API route ready for Circle Gateway notifications. In demo mode it validates and previews incoming payloads. With Supabase configured, it stores each notification ID for dedupe and writes a corresponding Activity Log event."}
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {gateway.map(([event, detail]) => (
              <div key={event} className="rounded-md border border-arc-border bg-arc-bg/70 p-4">
                <div className="font-mono text-xs text-arc-green">{event}</div>
                <p className="mt-2 text-sm leading-6 text-arc-muted">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-md border border-arc-border bg-arc-bg/80 p-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">
              Endpoint
            </div>
            <div className="mt-2 break-all font-mono text-sm text-arc-cyan">
              POST /api/webhooks/circle-gateway
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">{isPt ? "Modo Demo" : "Demo Mode"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">{isPt ? "Superfície segura para revisão" : "Safe review surface"}</h2>
            <p className="mt-3 text-sm leading-7 text-arc-muted">
              {isPt
                ? "ArcHive continua utilizável quando Supabase ou variáveis live da Arc estão ausentes. O modo demo usa jobs, agentes, eventos, dados de Unified Balance, recibos de gasto e hashes mockados para revisão completa do fluxo."
                : "ArcHive stays usable when Supabase or live Arc variables are missing. Demo mode uses seeded jobs, agents, activity events, Unified Balance data, spend receipts, and mock transaction hashes so reviewers can inspect the full product flow."}
            </p>
          </div>

          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">{isPt ? "Próximas integrações" : "Next Integrations"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">{isPt ? "O que vem após a revisão" : "What comes after review"}</h2>
            <p className="mt-3 text-sm leading-7 text-arc-muted">
              {isPt
                ? "Os próximos upgrades limpos são subscriptions live do Gateway, persistência de webhooks no Supabase, indexação de eventos dos contratos e depois Dynamic ou account abstraction para onboarding mais simples. O produto deve continuar centrado em jobs, não em bridging genérico."
                : "The next clean upgrades are live Gateway subscriptions, Supabase webhook persistence, contract event indexing, and later Dynamic or account abstraction for smoother onboarding. The product should remain centered on jobs, not generic bridging."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function DocMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/80 p-5">
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{label}</div>
      <div className="mt-2 font-display text-xl font-bold text-arc-text">{value}</div>
    </div>
  );
}
