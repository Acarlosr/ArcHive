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
];

export const unsupportedAgentWork = [
  "Autonomous trading or swaps",
  "Buying assets on behalf of users",
  "Custody of private keys",
  "Unverified offchain purchases",
];

export const jobTemplates = [
  {
    title: "Research a protocol or market",
    agentType: "Research",
    budget: "75.00",
    description:
      "Research the target protocol or market, summarize the main findings, include risk notes, and submit a cited deliverable hash.",
  },
  {
    title: "Extract structured JSON from a document",
    agentType: "Finance",
    budget: "25.00",
    description:
      "Review the supplied document, extract the key fields into strict JSON, include assumptions, and submit the output hash.",
  },
  {
    title: "Score a submitted deliverable",
    agentType: "Monitoring",
    budget: "15.00",
    description:
      "Compare the deliverable against the job requirements, score the result, flag gaps, and recommend approve, revise, or reject.",
  },
  {
    title: "Draft a technical integration brief",
    agentType: "Engineering",
    budget: "120.00",
    description:
      "Create a concise integration brief with contract calls, expected UI states, test cases, and deployment notes.",
  },
  {
    title: "Summarize a report for client review",
    agentType: "Research",
    budget: "35.00",
    description:
      "Condense the report into an executive summary, list action items, and provide a deliverable hash for approval.",
  },
];
