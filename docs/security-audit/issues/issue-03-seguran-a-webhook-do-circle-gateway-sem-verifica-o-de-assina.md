Labels: security, high, api

## Problema
A única rota de API do app, `POST /api/webhooks/circle-gateway`, aceita qualquer payload sem verificar
assinatura, timestamp ou segredo compartilhado. Um chamador anônimo pode enviar eventos
`gateway.deposit.finalized` com `notificationId` novo (o dedupe só bloqueia replay exato do mesmo ID) e
`walletAddress`/`txHash`/`amount` arbitrários. A rota grava em `gateway_webhook_notifications` e em
`activity_events` (via service role), poluindo o feed público de atividade que o produto usa como prova social.

## Evidência
- `src/app/api/webhooks/circle-gateway/route.ts:5-27` — handler sem verificação de assinatura
- `src/lib/gatewayWebhooks.ts:38-95` — normalização aceita qualquer envelope com ID novo
- `src/lib/db/gatewayWebhooks.ts:34-46` — dedupe apenas por notification_id

## Impacto
- Envenenamento do activity log público (falsos "depósitos finalizados" com valores arbitrários)
- Poluição de dados usados em dashboards/métricas; confiança no produto degrada

## Correção sugerida
1. Validar a assinatura do webhook do Circle (header de assinatura + timestamp) antes de processar.
2. Alternativa/complemento: exigir segredo compartilhado no header (`X-Webhook-Secret`) e rejeitar sem ele.
3. Rejeitar eventos cuja txHash não exista/consista na chain (validação on-chain quando possível).

## Critérios de aceite
- [ ] POST sem assinatura válida retorna 401/403
- [ ] Replay de payload válido é deduplicado (mantém comportamento atual)
- [ ] Teste automatizado cobre payload falso, replay e payload assinado
