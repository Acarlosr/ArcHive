Labels: security, high, dependencies

## Problema
`next@14.2.35` está no range vulnerável de:
- GHSA-h25m-26qc-wcjf — deserialização HTTP que leva a DoS com RSC (CVSS 7.5, range >=13.0.0 <15.0.8)
- GHSA-9g9p-9gw9-jx7f — Image Optimizer via remotePatterns (CVSS 5.9; o projeto usa `images.domains`, mas
  manter a dependência em range vulnerável é dívida ativa)

`npm audit --omit=dev` reporta 1 vulnerabilidade crítica agregada, 30 altas e 43 moderadas (maioria na árvore
de wallets/@reown puxada pelos SDKs Dynamic). O fix disponível é `next@16.3.8` (major).

## Evidência
- `package.json:22` — "next": "14.2.35"
- `npm audit --omit=dev` — saída registrada na auditoria

## Impacto
DoS remoto sem autenticação na rota RSC/image-optimizer; superfície de dependências com 30 issues altas.

## Correção sugerida
1. Planejar upgrade para Next patched (16.3.8 conforme fixAvailable, ou 15.x patched se o App Router permitir).
2. `npm audit fix` na árvore de wallet + reavaliar versões dos SDKs @dynamic-labs.
3. Adicionar auditoria de dependências ao CI.

## Critérios de aceite
- [ ] next fora de todos os ranges vulneráveis conhecidos
- [ ] npm audit sem críticas/altas nas deps de produção
- [ ] Build e fluxos principais validados após o upgrade
