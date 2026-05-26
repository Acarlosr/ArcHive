"use client";

import { AgentRegistrationForm } from "@/components/AgentRegistrationForm";
import { useLanguage } from "@/lib/i18n";

export default function RegisterAgentPage() {
  const { locale } = useLanguage();
  const isPt = locale === "pt-BR";

  return (
    <div className="px-4 pb-16 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="label-field mb-2">{isPt ? "Registro de Agentes" : "Agent Registry"}</div>
          <h1 className="font-display text-4xl font-bold text-arc-text">{isPt ? "Registrar novo agente de IA" : "Register a new AI agent"}</h1>
          <p className="mt-2 max-w-2xl text-arc-muted">
            {isPt
              ? "Crie um registro no app hoje e mantenha o wrapper de identidade onchain pronto para implantação ERC-8004 na Arc Testnet."
              : "Create an app record today and keep the onchain identity wrapper ready for ERC-8004 deployment on Arc Testnet."}
          </p>
        </div>
        <AgentRegistrationForm />
      </div>
    </div>
  );
}
