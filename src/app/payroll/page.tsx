"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExplorerLink } from "@/components/ExplorerLink";
import { formatWallet } from "@/lib/demoData";
import {
  getAgentForStream,
  getDemoPayrollStreams,
  getStreamCycleEvents,
  streamPaidUsdc,
  streamProgress,
  streamRemainingUsdc,
  type PayrollCadence,
  type PayrollStream,
  type PayrollStreamStatus,
} from "@/lib/payroll";
import { useLanguage } from "@/lib/i18n";

const initialStreams = getDemoPayrollStreams();

function cadenceLabel(cadence: PayrollCadence, isPt: boolean) {
  if (cadence === "weekly") return isPt ? "semanal" : "weekly";
  if (cadence === "biweekly") return isPt ? "quinzenal" : "biweekly";
  return isPt ? "mensal" : "monthly";
}

function statusTone(status: PayrollStreamStatus) {
  if (status === "active") return "border-arc-green/35 bg-arc-green/10 text-arc-green";
  if (status === "paused") return "border-arc-gold/35 bg-arc-gold/10 text-arc-gold";
  return "border-arc-border bg-arc-surface text-arc-muted";
}

function statusLabel(status: PayrollStreamStatus, isPt: boolean) {
  if (status === "active") return isPt ? "ativo" : "active";
  if (status === "paused") return isPt ? "pausado" : "paused";
  return isPt ? "concluído" : "completed";
}

const streamLabelPt: Record<string, string> = {
  pay_stream_001: "VectorOps — retainer de pesquisa",
  pay_stream_002: "LedgerPilot — reconciliação mensal",
  pay_stream_003: "SignalClerk — digest de monitoramento",
  pay_stream_004: "SpecForge — sprint de specs (pausado)",
};

function formatUsdc(value: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(iso: string | null, isPt: boolean) {
  if (!iso) return isPt ? "—" : "—";
  return new Intl.DateTimeFormat(isPt ? "pt-BR" : "en-US", { dateStyle: "medium" }).format(new Date(iso));
}

export default function PayrollPage() {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const [createdStreams, setCreatedStreams] = useState<PayrollStream[]>([]);
  const streams = useMemo(() => [...createdStreams, ...initialStreams], [createdStreams]);

  const activeStreams = streams.filter((stream) => stream.status === "active").length;
  const totalEscrow = streams.reduce((sum, stream) => sum + Number(stream.escrow_funded_usdc), 0);
  const totalPaid = streams.reduce((sum, stream) => sum + streamPaidUsdc(stream), 0);
  const totalRemaining = streams.reduce((sum, stream) => sum + Math.max(streamRemainingUsdc(stream), 0), 0);

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <div className="label-field mb-2">ArcHive V2</div>
            <h1 className="font-display text-4xl font-bold text-arc-text sm:text-5xl">
              {isPt ? "Agent Payroll em USDC" : "Agent Payroll in USDC"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-arc-muted">
              {isPt
                ? "Pagamentos recorrentes para agentes e prestadores, em cima do mesmo escrow dos jobs. O empregador deposita o total do contrato, cada ciclo libera um payout em USDC na Arc, e o histórico inteiro fica verificável."
                : "Recurring payouts for agents and providers, built on the same escrow as jobs. The employer funds the full contract upfront, each cycle releases a USDC payout on Arc, and the entire history stays verifiable."}
            </p>
          </div>

          <div className="rounded-lg border border-arc-cyan/20 bg-arc-cyan/10 p-5">
            <div className="text-sm font-display font-semibold text-arc-text">
              {isPt ? "Pronto para o Arc Privacy" : "Arc Privacy ready"}
            </div>
            <p className="mt-2 text-sm leading-6 text-arc-muted">
              {isPt
                ? "Valores e destinatários podem migrar para o ambiente privado da Arc quando ele for lançado, mantendo acesso de auditor por permissão — o modelo de visibilidade governada do whitepaper."
                : "Amounts and recipients can migrate to Arc's private environment when it ships, keeping permissioned auditor access — the governed-visibility model from the whitepaper."}
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PayrollMetric label={isPt ? "streams ativos" : "active streams"} value={activeStreams.toString()} />
          <PayrollMetric label={isPt ? "USDC em escrow" : "USDC escrowed"} value={`$${formatUsdc(totalEscrow)}`} />
          <PayrollMetric label={isPt ? "USDC pago" : "USDC paid out"} value={`$${formatUsdc(totalPaid)}`} />
          <PayrollMetric label={isPt ? "USDC restante" : "USDC remaining"} value={`$${formatUsdc(totalRemaining)}`} />
        </section>

        <CreateStreamForm
          isPt={isPt}
          onCreate={(stream) => setCreatedStreams((prev) => [stream, ...prev])}
        />

        <section className="mb-8 rounded-lg border border-arc-border bg-arc-card/85 p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="label-field mb-2">{isPt ? "Folha agentic" : "Agentic payroll"}</div>
              <h2 className="font-display text-2xl font-bold text-arc-text">
                {isPt ? "Streams de pagamento" : "Payment streams"}
              </h2>
            </div>
            <Link href="/proof" className="text-sm font-medium text-arc-green hover:text-white">
              {isPt ? "Ver Proof Packs" : "View Proof Packs"}
            </Link>
          </div>

          <div className="space-y-4">
            {streams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} isPt={isPt} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">{isPt ? "Como funciona" : "How it works"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">
              {isPt ? "Escrow primeiro, payout por ciclo" : "Escrow first, payout per cycle"}
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-arc-muted">
              <li>
                1. {isPt
                  ? "O empregador cria um stream: destinatário, valor por ciclo, cadência e número de ciclos."
                  : "The employer creates a stream: recipient, amount per cycle, cadence, and number of cycles."}
              </li>
              <li>
                2. {isPt
                  ? "O total do contrato é depositado em escrow USDC — o mesmo cofre usado pelos jobs do ArcHive."
                  : "The full contract amount is deposited into USDC escrow — the same vault ArcHive jobs use."}
              </li>
              <li>
                3. {isPt
                  ? "A cada ciclo, o payout é liberado onchain com hash de transação verificável no explorer."
                  : "Each cycle, the payout is released onchain with a verifiable transaction hash on the explorer."}
              </li>
              <li>
                4. {isPt
                  ? "Pausar ou cancelar devolve o saldo não pago ao empregador. Nada fica preso."
                  : "Pausing or cancelling returns the unpaid balance to the employer. Nothing gets stuck."}
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
            <div className="label-field mb-2">{isPt ? "Visibilidade governada" : "Governed visibility"}</div>
            <h2 className="font-display text-2xl font-bold text-arc-text">
              {isPt ? "Privado para o mercado, aberto para o auditor" : "Private to the market, open to the auditor"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-arc-muted">
              {isPt
                ? "Folha de pagamento não pode ser um feed público de salários. O desenho do módulo segue o whitepaper de privacidade da Arc: o público vê que um stream existe e que os ciclos foram pagos; valores e identidades detalhadas ficam atrás de acesso autorizado (assinatura EIP-712). Hoje isso roda em nível de aplicação; quando o ambiente privado da Arc for lançado, a mesma lógica migra para o private EVM."
                : "Payroll cannot be a public salary feed. This module follows Arc's privacy whitepaper design: the public sees that a stream exists and that cycles were paid; amounts and detailed identities sit behind authorized access (EIP-712 signature). Today this runs at the application level; when Arc's private environment ships, the same logic migrates to the private EVM."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(isPt
                ? ["escrow USDC", "payout por ciclo", "acesso de auditor", "pronto p/ private EVM"]
                : ["USDC escrow", "per-cycle payout", "auditor access", "private-EVM ready"]
              ).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-arc-border px-3 py-1 text-[11px] font-mono uppercase tracking-[0.12em] text-arc-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StreamCard({ stream, isPt }: { stream: PayrollStream; isPt: boolean }) {
  const agent = getAgentForStream(stream);
  const progress = streamProgress(stream);
  const paid = streamPaidUsdc(stream);
  const remaining = Math.max(streamRemainingUsdc(stream), 0);
  const events = getStreamCycleEvents(stream.id);
  const label = isPt ? streamLabelPt[stream.id] ?? stream.label : stream.label;

  return (
    <div className="rounded-md border border-arc-border bg-arc-surface/70 p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_200px] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-arc-dim">
              {stream.onchain_stream_id}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase ${statusTone(stream.status)}`}>
              {statusLabel(stream.status, isPt)}
            </span>
            <span className="rounded-full border border-arc-border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-arc-muted">
              {cadenceLabel(stream.cadence, isPt)}
            </span>
            {stream.auditor_access ? (
              <span className="rounded-full border border-arc-cyan/30 bg-arc-cyan/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-arc-cyan">
                {isPt ? "auditor" : "auditor"}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 font-display text-xl font-bold text-arc-text">{label}</h3>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-arc-muted">
            <span>{isPt ? "Agente" : "Agent"}: {agent?.name ?? "—"}</span>
            <span>{isPt ? "Empregador" : "Employer"}: {formatWallet(stream.employer_wallet)}</span>
            <span>
              {stream.amount_per_cycle_usdc} USDC / {cadenceLabel(stream.cadence, isPt)}
            </span>
            <span>
              {isPt ? "Próximo payout" : "Next payout"}: {formatDate(stream.next_payout_at, isPt)}
            </span>
          </div>
          {events.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-arc-muted">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-arc-dim">
                {isPt ? "último ciclo" : "last cycle"}
              </span>
              <span>
                #{events[0].cycle} · {events[0].amount_usdc} USDC · {formatDate(events[0].paid_at, isPt)}
              </span>
              <ExplorerLink txHash={events[0].tx_hash as `0x${string}`} />
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-right font-display text-2xl font-bold text-arc-cyan">
            {stream.cycles_paid}/{stream.cycles_total}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-arc-bg">
            <div className="h-full rounded-full bg-arc-cyan" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-right text-xs text-arc-muted">
            {isPt ? "ciclos pagos" : "cycles paid"}
          </div>
          <div className="mt-3 space-y-1 text-right text-xs text-arc-muted">
            <div>
              {isPt ? "Pago" : "Paid"}: <span className="text-arc-text">${formatUsdc(paid)}</span>
            </div>
            <div>
              {isPt ? "Restante" : "Remaining"}: <span className="text-arc-text">${formatUsdc(remaining)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateStreamForm({
  isPt,
  onCreate,
}: {
  isPt: boolean;
  onCreate: (stream: PayrollStream) => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("100.00");
  const [cadence, setCadence] = useState<PayrollCadence>("weekly");
  const [cycles, setCycles] = useState(4);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const amountNumber = Number(amount);
    if (!label.trim()) {
      setError(isPt ? "Dê um nome ao stream." : "Give the stream a label.");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.trim())) {
      setError(isPt ? "Endereço do destinatário inválido (0x...)." : "Invalid recipient address (0x...).");
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError(isPt ? "Valor por ciclo inválido." : "Invalid amount per cycle.");
      return;
    }
    if (cycles < 1 || cycles > 52) {
      setError(isPt ? "Número de ciclos deve ficar entre 1 e 52." : "Cycles must be between 1 and 52.");
      return;
    }

    const total = amountNumber * cycles;
    const cadenceMs = cadence === "weekly" ? 7 : cadence === "biweekly" ? 14 : 30;
    onCreate({
      id: `pay_stream_local_${Date.now()}`,
      onchain_stream_id: `8183-PR-${String(Math.floor(Math.random() * 900) + 100)}`,
      label: label.trim(),
      employer_wallet: "0xA71ce00000000000000000000000000000000009",
      agent_id: "",
      recipient_wallet: recipient.trim(),
      amount_per_cycle_usdc: amountNumber.toFixed(2),
      cadence,
      cycles_total: cycles,
      cycles_paid: 0,
      escrow_funded_usdc: total.toFixed(2),
      status: "active",
      next_payout_at: new Date(Date.now() + cadenceMs * 24 * 60 * 60 * 1000).toISOString(),
      last_tx_hash: null,
      auditor_access: true,
      created_at: new Date().toISOString(),
    });
    setError(null);
    setOpen(false);
    setLabel("");
    setRecipient("");
  }

  const inputClass =
    "w-full rounded-md border border-arc-border bg-arc-bg/80 px-3 py-2 text-sm text-arc-text placeholder:text-arc-dim focus:border-arc-cyan/50 focus:outline-none";

  return (
    <section className="mb-8 rounded-lg border border-arc-border bg-arc-card/85 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label-field mb-2">{isPt ? "Novo stream" : "New stream"}</div>
          <h2 className="font-display text-2xl font-bold text-arc-text">
            {isPt ? "Criar pagamento recorrente" : "Create a recurring payout"}
          </h2>
          <p className="mt-2 text-sm text-arc-muted">
            {isPt
              ? "Demo mode: o stream é criado localmente. A versão onchain usará o escrow vault do ArcHive."
              : "Demo mode: the stream is created locally. The onchain version will use ArcHive's escrow vault."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-arc-cyan/40 bg-arc-cyan/10 px-4 py-2 text-sm font-medium text-arc-cyan transition-all hover:bg-arc-cyan/20"
        >
          {open ? (isPt ? "Fechar" : "Close") : `+ ${isPt ? "Novo stream" : "New stream"}`}
        </button>
      </div>

      {open ? (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <label className="label-field mb-1 block">{isPt ? "Nome" : "Label"}</label>
            <input
              className={inputClass}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={isPt ? "Ex.: Agente X — retainer mensal" : "e.g. Agent X — monthly retainer"}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-field mb-1 block">{isPt ? "Destinatário (0x...)" : "Recipient (0x...)"}</label>
            <input
              className={inputClass}
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="0x0000...0000"
            />
          </div>
          <div>
            <label className="label-field mb-1 block">{isPt ? "USDC por ciclo" : "USDC per cycle"}</label>
            <input
              className={inputClass}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
            />
          </div>
          <div>
            <label className="label-field mb-1 block">{isPt ? "Cadência" : "Cadence"}</label>
            <select
              className={inputClass}
              value={cadence}
              onChange={(event) => setCadence(event.target.value as PayrollCadence)}
            >
              <option value="weekly">{isPt ? "Semanal" : "Weekly"}</option>
              <option value="biweekly">{isPt ? "Quinzenal" : "Biweekly"}</option>
              <option value="monthly">{isPt ? "Mensal" : "Monthly"}</option>
            </select>
          </div>
          <div>
            <label className="label-field mb-1 block">{isPt ? "Ciclos" : "Cycles"}</label>
            <input
              className={inputClass}
              type="number"
              min={1}
              max={52}
              value={cycles}
              onChange={(event) => setCycles(Number(event.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-arc-cyan/90 px-4 py-2 text-sm font-semibold text-arc-bg transition-all hover:bg-arc-cyan"
            >
              {isPt
                ? `Financiar ${(Number(amount) * cycles || 0).toFixed(2)} USDC`
                : `Fund ${(Number(amount) * cycles || 0).toFixed(2)} USDC`}
            </button>
          </div>
          {error ? (
            <div className="md:col-span-2 xl:col-span-4 text-sm text-arc-red">{error}</div>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}

function PayrollMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-arc-border bg-arc-card/80 p-5">
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-arc-dim">{label}</div>
      <div className="mt-2 font-display text-xl font-bold text-arc-text">{value}</div>
    </div>
  );
}
