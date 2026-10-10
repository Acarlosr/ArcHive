Labels: security, medium, api, payments

## Problema
O "Agent Spend Router" promete caps por chamada e total por job (`src/lib/agentSpend.ts:148-158`), mas a
checagem roda apenas no navegador. O seller x402 (`services/nanopayments-seller/server.ts`) não tem conceito de
job ou limite: cada chamada com pagamento válido é atendida. Um agente pode exceder o orçamento do job pagando
chamadas repetidas; o "policy" exibido ao cliente é cosmético.

## Evidência
- `src/lib/agentSpend.ts:148-158` — caps avaliados client-side
- `services/nanopayments-seller/server.ts:133-174` — endpoints pagos sem ledger/caps por job

## Impacto
Gasto acima do orçamento prometido (limitado ao preço por chamada, mas ilimitado no total); expectativa de
controle que não existe — risco de reputação e de disputa.

## Correção sugerida
1. Implementar ledger por job no seller (jobId, total acumulado, limite) rejeitando chamadas além do cap.
2. Alternativa mínima: rotular claramente na UI que o cap é informativo/simulado enquanto o ledger não existe.

## Critérios de aceite
- [ ] Seller rejeita chamada que exceda o cap do job (ou UI honesta sobre a limitação)
- [ ] Recibos vinculados a jobId mantêm o total acumulado
- [ ] Documentação alinhada com o comportamento real
