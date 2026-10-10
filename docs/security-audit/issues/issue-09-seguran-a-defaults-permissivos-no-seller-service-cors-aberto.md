Labels: security, low, config

## Problema
`services/nanopayments-seller/server.ts` tem defaults que viram configuração real se os env não forem
definidos: `ALLOWED_ORIGIN ?? "*"` (CORS aberto, linha 33) e `FACILITATOR_URL` com default do gateway de
testnet (linhas 23-25). Publicar esse serviço na mainnet sem env explícito faria ele validar pagamentos na
rede errada — o oposto de ACCEPT_ARC_ONLY.

## Evidência
- `services/nanopayments-seller/server.ts:23-25` — facilitator default testnet
- `services/nanopayments-seller/server.ts:33` — CORS com wildcard default

## Impacto
Baixo hoje (testnet), mas é uma armadilha de migração mainnet e amplifica qualquer CSRF do app contra os
endpoints pagos.

## Correção sugerida
1. Exigir ALLOWED_ORIGIN explícito (falhar no startup sem ele).
2. Amarrar FACILITATOR_URL à rede escolhida (um único env ARC_NETWORK resolve ambos).
3. Rate limit básico nos endpoints.

## Critérios de aceite
- [ ] Startup falha sem ALLOWED_ORIGIN/ARC_NETWORK explícitos
- [ ] CORS restrito ao domínio do app
- [ ] Rate limit ativo nos endpoints pagos
