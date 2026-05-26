"use client";

import { useMemo, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createAgent } from "@/lib/db/agents";
import { registerAgent } from "@/lib/arc/agentRegistry";
import { WalletOnboardingModal } from "@/components/WalletOnboardingModal";
import { WalletProviderIsland } from "@/components/WalletProviderIsland";
import { useLanguage } from "@/lib/i18n";

type SubmitState = "idle" | "loading" | "success" | "error";

export function AgentRegistrationForm() {
  return (
    <WalletProviderIsland>
      <AgentRegistrationFormInner />
    </WalletProviderIsland>
  );
}

function AgentRegistrationFormInner() {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<SubmitState>("idle");
  const [resultId, setResultId] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    agentType: "Research",
    capabilities: "Protocol research, Risk scoring",
    metadataUri: "ipfs://bafybeihive-agent-metadata",
  });

  const capabilityList = useMemo(
    () => form.capabilities.split(",").map((item) => item.trim()).filter(Boolean),
    [form.capabilities],
  );

  if (!isConnected) return <WalletOnboardingModal title={isPt ? "Conecte para registrar um agente" : "Connect to register an agent"} />;

  async function handleSubmit() {
    if (!address || !form.name.trim() || !form.description.trim()) return;
    setState("loading");
    setError("");

    try {
      const onchain = await registerAgent({
        walletClient,
        metadataUri: form.metadataUri,
      });

      const agent = await createAgent({
        onchain_agent_id: onchain.agentId,
        onchain_id: onchain.agentId,
        creator_wallet: address.toLowerCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        agent_type: form.agentType,
        capabilities: capabilityList,
        metadata_uri: form.metadataUri,
        reputation_score: 72,
        tx_hash: onchain.txHash,
      });

      setResultId(agent.onchain_agent_id);
      setState("success");
    } catch (err: any) {
      setError(err?.message ?? (isPt ? "Não foi possível registrar o agente" : "Could not register agent"));
      setState("error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
      <div className="rounded-lg border border-arc-border bg-arc-card/85 p-6">
        <div className="grid gap-5">
          <label>
            <span className="label-field mb-2 block">{isPt ? "Nome do agente" : "Agent name"}</span>
            <input className="input-field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="VectorOps" />
          </label>
          <label>
            <span className="label-field mb-2 block">{isPt ? "Descrição" : "Description"}</span>
            <textarea className="input-field min-h-28 resize-none" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder={isPt ? "O que este agente consegue entregar com confiança para clientes." : "What this agent can reliably complete for clients."} />
          </label>
          <label>
            <span className="label-field mb-2 block">{isPt ? "Tipo de agente" : "Agent type"}</span>
            <select className="input-field" value={form.agentType} onChange={(event) => setForm({ ...form, agentType: event.target.value })}>
              <option>Research</option>
              <option>Finance</option>
              <option>Engineering</option>
              <option>Monitoring</option>
              <option>Creative</option>
            </select>
          </label>
          <label>
            <span className="label-field mb-2 block">{isPt ? "Capacidades" : "Capabilities"}</span>
            <input className="input-field" value={form.capabilities} onChange={(event) => setForm({ ...form, capabilities: event.target.value })} placeholder={isPt ? "Capacidades separadas por vírgula" : "Comma separated capabilities"} />
          </label>
          <label>
            <span className="label-field mb-2 block">Metadata URI</span>
            <input className="input-field" value={form.metadataUri} onChange={(event) => setForm({ ...form, metadataUri: event.target.value })} placeholder="ipfs://..." />
          </label>

          {error && <div className="rounded-lg border border-arc-red/25 bg-arc-red/10 p-3 text-sm text-arc-red">{error}</div>}
          {state === "success" && (
            <div className="rounded-lg border border-arc-green/25 bg-arc-green/10 p-4 text-sm text-arc-green">
              {isPt ? "Agente registrado. ID do agente:" : "Agent registered. Resulting agent ID:"} <span className="font-mono">{resultId}</span>
            </div>
          )}

          <button onClick={handleSubmit} disabled={state === "loading" || !form.name.trim() || !form.description.trim()} className="btn-primary w-full py-4">
            {state === "loading" ? (isPt ? "Registrando identidade..." : "Registering identity...") : (isPt ? "Registrar Agente" : "Register Agent")}
          </button>
        </div>
      </div>

      <aside className="rounded-lg border border-arc-border bg-arc-surface/70 p-6">
        <div className="label-field mb-3">{isPt ? "Preparação ERC-8004" : "ERC-8004 preparation"}</div>
        <h2 className="font-display text-xl font-semibold text-arc-text">{isPt ? "Identidade primeiro, automação depois." : "Identity first, automation second."}</h2>
        <p className="mt-3 text-sm leading-6 text-arc-muted">
          {isPt
            ? "Este formulário salva metadados no app agora e chama o wrapper isolado de registro quando os contratos da Arc estão configurados. Reputação e feedback ficam separados para que o histórico acompanhe a identidade."
            : "This form stores app metadata now and calls the isolated registry wrapper when Arc contracts are configured. Reputation and feedback are intentionally separate so the agent history can follow the identity."}
        </p>
        <div className="mt-5 space-y-2">
          {capabilityList.map((capability) => (
            <div key={capability} className="rounded-md border border-arc-border bg-arc-card px-3 py-2 text-sm text-arc-muted">
              {capability}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
