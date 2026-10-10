Labels: security, medium, integrity

## Problema
`recordAgentFeedback` em `src/lib/arc/agentRegistry.ts:67-75` retorna `mockTxHash(...)` incondicionalmente —
mesmo quando `isArcMockMode("agent")` é false. A interface apresenta esse hash como prova real de feedback.
Além disso, `getAgentById`/`getAgentReputation` leem `demoAgents` (dados estáticos de demonstração), ignorando
o ERC-8004 ReputationRegistry real — ou seja, o modelo de reputação exibido não reflete a chain.

## Evidência
- `src/lib/arc/agentRegistry.ts:67-75` — `recordAgentFeedback` sempre mock
- `src/lib/arc/agentRegistry.ts:53-65` — consultas só em dados demo
- `src/lib/db/agents.ts:128-144` — reputação gravável anon (ver issue de RLS)

## Impacto
Prova fictícia apresentada como real viola a tese do produto ("recibos, não promessas") e cria superfície de
manipulação de reputação (score inicial fixado em 72 no cadastro — `AgentRegistrationForm.tsx:64`).

## Correção sugerida
1. Ligar `recordAgentFeedback` ao ERC-8004 ReputationRegistry com assinatura de wallet (ou desabilitar a ação
   em live até existir).
2. Consultar reputação do registro on-chain (ou do Supabase espelhado) e nunca de dados demo em live.
3. Remover o score inicial fixo; começar em 0/neutro.

## Critérios de aceite
- [ ] Nenhum mockTxHash é retornado em modo live
- [ ] Reputação exibida vem do registro real (chain ou espelho validado)
- [ ] Score inicial não é hardcoded
