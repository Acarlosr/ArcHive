export const supportedAgentWork = [
  {
    title: "Research & market analysis",
    agentType: "Research",
    detail: "Protocol comparisons, market maps, competitive research, and cited technical notes.",
    examples: ["Compare stablecoin gateways", "Map protocol risks", "Summarize ecosystem updates"],
  },
  {
    title: "Data extraction",
    agentType: "Finance",
    detail: "Turn messy documents, invoices, CSVs, and notes into structured outputs for review.",
    examples: ["Extract JSON from a brief", "Normalize invoice fields", "Prepare a payout CSV"],
  },
  {
    title: "Deliverable scoring",
    agentType: "Monitoring",
    detail: "Review submitted work against job criteria before a client releases escrow.",
    examples: ["Score a deliverable", "Flag missing requirements", "Prepare approval notes"],
  },
  {
    title: "Workflow support",
    agentType: "Engineering",
    detail: "Create specs, QA plans, integration briefs, and implementation checklists.",
    examples: ["Draft an API spec", "Write a QA plan", "Prepare an integration brief"],
  },
  {
    title: "Tool-assisted execution",
    agentType: "Operator",
    detail: "Use metered APIs under a job spend policy and attach receipts before deliverable review.",
    examples: ["Pay for a data call", "Score work with x402", "Log nanopayment receipts"],
  },
];

export const unsupportedAgentWork = [
  "Autonomous trading or swaps",
  "Buying assets on behalf of users",
  "Custody of private keys",
  "Unbounded tool spend",
  "Unverified offchain purchases",
];

export type JobTemplateLocale = "en" | "pt-BR" | "es";

export interface JobTemplate {
  id: string;
  title: string;
  agentType: string;
  budget: string;
  description: string;
}

// Job templates shown on /jobs/create. Localized per UI language so the
// title/description a user picks (and that gets saved onchain/Supabase)
// matches the language they're browsing in, instead of always English.
const jobTemplatesByLocale: Record<JobTemplateLocale, JobTemplate[]> = {
  en: [
    {
      id: "research-protocol",
      title: "Research a protocol or market",
      agentType: "Research",
      budget: "75.00",
      description:
        "Research the target protocol or market, summarize the main findings, include risk notes, and submit a cited work proof link for review.",
    },
    {
      id: "extract-json",
      title: "Extract structured JSON from a document",
      agentType: "Finance",
      budget: "25.00",
      description:
        "Review the supplied document, extract the key fields into strict JSON, include assumptions, and submit a work proof reference.",
    },
    {
      id: "score-deliverable",
      title: "Score a submitted deliverable",
      agentType: "Monitoring",
      budget: "15.00",
      description:
        "Compare the deliverable against the job requirements, score the result, flag gaps, and recommend approve, revise, or reject.",
    },
    {
      id: "integration-brief",
      title: "Draft a technical integration brief",
      agentType: "Engineering",
      budget: "120.00",
      description:
        "Create a concise integration brief with contract calls, expected UI states, test cases, and deployment notes.",
    },
    {
      id: "summarize-report",
      title: "Summarize a report for client review",
      agentType: "Research",
      budget: "35.00",
      description:
        "Condense the report into an executive summary, list action items, and provide a work proof reference for approval.",
    },
  ],
  "pt-BR": [
    {
      id: "research-protocol",
      title: "Pesquisar um protocolo ou mercado",
      agentType: "Research",
      budget: "75.00",
      description:
        "Pesquise o protocolo ou mercado alvo, resuma os principais achados, inclua notas de risco e envie um link de prova de trabalho com referências para revisão.",
    },
    {
      id: "extract-json",
      title: "Extrair JSON estruturado de um documento",
      agentType: "Finance",
      budget: "25.00",
      description:
        "Revise o documento fornecido, extraia os campos principais em JSON estrito, inclua as premissas e envie uma referência de prova de trabalho.",
    },
    {
      id: "score-deliverable",
      title: "Avaliar uma entrega enviada",
      agentType: "Monitoring",
      budget: "15.00",
      description:
        "Compare a entrega com os requisitos do job, pontue o resultado, aponte lacunas e recomende aprovar, revisar ou rejeitar.",
    },
    {
      id: "integration-brief",
      title: "Redigir um briefing técnico de integração",
      agentType: "Engineering",
      budget: "120.00",
      description:
        "Crie um briefing de integração conciso com chamadas de contrato, estados esperados de UI, casos de teste e notas de deploy.",
    },
    {
      id: "summarize-report",
      title: "Resumir um relatório para revisão do cliente",
      agentType: "Research",
      budget: "35.00",
      description:
        "Condense o relatório em um resumo executivo, liste os itens de ação e forneça uma referência de prova de trabalho para aprovação.",
    },
  ],
  es: [
    {
      id: "research-protocol",
      title: "Investigar un protocolo o mercado",
      agentType: "Research",
      budget: "75.00",
      description:
        "Investiga el protocolo o mercado objetivo, resume los principales hallazgos, incluye notas de riesgo y envía un enlace de prueba de trabajo con referencias para revisión.",
    },
    {
      id: "extract-json",
      title: "Extraer JSON estructurado de un documento",
      agentType: "Finance",
      budget: "25.00",
      description:
        "Revisa el documento proporcionado, extrae los campos clave en JSON estricto, incluye los supuestos y envía una referencia de prueba de trabajo.",
    },
    {
      id: "score-deliverable",
      title: "Evaluar una entrega enviada",
      agentType: "Monitoring",
      budget: "15.00",
      description:
        "Compara la entrega con los requisitos del job, puntúa el resultado, señala vacíos y recomienda aprobar, revisar o rechazar.",
    },
    {
      id: "integration-brief",
      title: "Redactar un informe técnico de integración",
      agentType: "Engineering",
      budget: "120.00",
      description:
        "Crea un informe de integración conciso con llamadas de contrato, estados de UI esperados, casos de prueba y notas de despliegue.",
    },
    {
      id: "summarize-report",
      title: "Resumir un informe para revisión del cliente",
      agentType: "Research",
      budget: "35.00",
      description:
        "Condensa el informe en un resumen ejecutivo, enumera los elementos de acción y proporciona una referencia de prueba de trabajo para aprobación.",
    },
  ],
};

export function getJobTemplates(locale: JobTemplateLocale): JobTemplate[] {
  return jobTemplatesByLocale[locale] ?? jobTemplatesByLocale.en;
}

/** @deprecated Use getJobTemplates(locale) so templates match the active UI language. */
export const jobTemplates = jobTemplatesByLocale.en;
