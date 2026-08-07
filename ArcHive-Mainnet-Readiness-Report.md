# ArcHive — Relatório de Prontidão para Arc Public Mainnet (16/09/2026)

Data da análise: 06/08/2026

## Resumo

ArcHive está hoje 100% construído em cima da **Arc Testnet** (Chain ID `5042002`, RPC `rpc.testnet.arc.network`, explorer `testnet.arcscan.app`, facilitator Gateway de testnet). Typecheck e lint passam limpos. O build de produção não pôde ser concluído neste ambiente de verificação por limite de memória do sandbox (4GB), então recomendo rodar `npm run build` localmente ou no Vercel antes do dia 16/09 para confirmar. Foram encontrados pontos que precisam de ação antes do mainnet: dependência do Next.js com vulnerabilidade crítica conhecida, endereços de contrato e RPC hardcoded em testnet, variáveis de ambiente de produção ainda com placeholders, e o app rodando em `NEXT_PUBLIC_ARC_MOCK_MODE=true`.

A Circle ainda não publicou Chain ID / RPC / explorer oficiais do Arc mainnet ("Mainnet endpoints and parameters are published separately when available" — docs.arc.io, consultado hoje). Isso é o maior bloqueador externo: nada pode ser apontado para mainnet até a Circle liberar esses parâmetros.

---

## 1. O que já existe e funciona

- Next.js 14 App Router + TypeScript + Tailwind, `npx tsc --noEmit` limpo, `next lint` limpo.
- Fluxo completo de marketplace: registro de agente (ERC-8004), criação/funding de job, escrow (ERC-8183), submissão de deliverable, aprovação/payout, Proof Pack, activity log.
- Modo demo automático quando envs faltam — o app não quebra sem contratos configurados.
- Integração x402 + Circle Gateway Nanopayments no serviço seller (`services/nanopayments-seller`).
- `.gitignore` cobre `.env*` corretamente; nenhum `.env.local` está versionado no Git.
- Incidente anterior de secret exposto (chave Supabase em `Superbase.txt`) já foi remediado — o arquivo hoje só contém texto placeholder, sem chave real.

## 2. Bloqueadores para o mainnet de 16/09

### 2.1 Parâmetros de rede Arc mainnet ainda não publicados (bloqueador externo)
A Circle não divulgou até agora Chain ID, RPC e explorer do mainnet público. Todo o código está hardcoded para `5042002` / `rpc.testnet.arc.network` / `testnet.arcscan.app` em:
- `src/lib/arc/appKit.ts` (`ARC_TESTNET`)
- `src/components/Providers.tsx` (`arcTestnet`, wagmi config, Dynamic `evmNetworks`)
- `services/nanopayments-seller/server.ts` (`ARC_TESTNET_NETWORK = "eip155:5042002"`, facilitator `gateway-api-testnet.circle.com`)

**Ação:** assim que a Circle publicar os parâmetros de mainnet, criar `arcMainnet` ao lado de `arcTestnet` (não substituir — testnet continua útil para dev) e trocar via env (`NEXT_PUBLIC_ARC_NETWORK=mainnet|testnet`), incluindo o facilitator URL de produção do Gateway e a rede `eip155:<chainId mainnet>` no seller service.

### 2.2 Endereços de contrato são de testnet
`NEXT_PUBLIC_ARC_AGENT_REGISTRY_ADDRESS`, `..._REPUTATION_REGISTRY_ADDRESS`, `..._VALIDATION_REGISTRY_ADDRESS`, `..._JOB_MARKETPLACE_ADDRESS`, `..._ESCROW_VAULT_ADDRESS` e `..._USDC_ADDRESS` no `.env.local` atual apontam para contratos de referência do testnet ERC-8004/ERC-8183. Esses contratos precisam ser redeployados (ou confirmados como já existentes) no mainnet, e os endereços trocados no ambiente de produção.

### 2.3 App está em modo mock
`NEXT_PUBLIC_ARC_MOCK_MODE=true` no `.env.local` atual. Isso é esperado para dev, mas precisa virar `false` com todos os endereços de mainnet preenchidos antes do dia 16/09, senão o app em produção continuará gerando tx hashes falsos.

### 2.4 Placeholders não preenchidos em produção
No `.env.local` atual:
- `NEXT_PUBLIC_FEE_RECIPIENT=0xYourFeeWallet` — carteira de taxa da plataforma não configurada.
- `NEXT_PUBLIC_KIT_KEY=your_circle_kit_key` — chave do Circle App Kit não configurada.

Nenhum dos dois pode ficar como placeholder em produção.

### 2.5 Vulnerabilidade crítica no Next.js
`npm install` acusa: *"next@14.2.0: This version has a security vulnerability. Please upgrade to a patched version"* (aviso oficial do npm referenciando o security advisory de 2025-12-11 do Next.js). `npm audit` confirma **1 vulnerabilidade crítica** na própria dependência `next`, além de **25 altas e 43 moderadas** (majoritariamente na árvore de dependências WalletConnect/@reown/appkit puxada pelos SDKs de wallet). Antes de ir para mainnet — onde o app vai mover USDC real — o Next.js precisa ser atualizado para uma versão 14.2.x patched (ou 15.x, avaliando breaking changes do App Router) e a árvore WalletConnect precisa ser revisitada com `npm audit fix` / atualização de `@dynamic-labs/*`.

### 2.6 Build de produção não verificado neste ambiente
`npm run build` foi executado duas vezes e foi morto por falta de memória (sandbox de 4GB); `next lint` e `tsc --noEmit` passaram limpos, mas isso não substitui um build de produção completo. **Recomendo rodar `npm run build` localmente ou disparar um deploy de preview no Vercel antes do 16/09** para confirmar que o build de produção compila sem erros.

## 3. Riscos operacionais adicionais a revisar antes do lançamento

- **Chave Supabase service_role** está em texto plano em `.env.local` (esperado para dev local, mas confirme que a chave em produção — Vercel env vars — está rotacionada em relação à chave vazada anteriormente, e nunca commitada).
- **Refund de escrow é mock apenas** (`AGENTS.md`: "o contrato ERC-8183 da Arc não expõe refund público"). Se isso continuar valendo no contrato mainnet, o app precisa deixar isso explícito na UI para não gerar expectativa de reembolso automático em produção com dinheiro real.
- **Faucet/testnet USDC** não existe em mainnet — qualquer fluxo de "obter USDC de teste" na UI (`TestnetFundsCard.tsx`) precisa ser removido ou trocado por instruções de compra/on-ramp real antes do 16/09.
- **Facilitator do Circle Gateway** aponta para `gateway-api-testnet.circle.com`; confirmar o endpoint de produção do Gateway quando disponível.

## 4. Checklist de ação (ordem sugerida)

1. Acompanhar a documentação da Circle (docs.arc.io) para os parâmetros oficiais de mainnet (Chain ID, RPC, explorer, Gateway facilitator).
2. Atualizar `next` para versão patched e rodar `npm audit fix` na árvore de wallet; re-rodar `npm audit` até zerar crítico/alto relevante.
3. Adicionar config de rede mainnet em paralelo à testnet (`arcMainnet` em `Providers.tsx` e `appKit.ts`, `ACCEPT_ARC_ONLY` network mainnet no seller service), selecionável por env.
4. Redeployar/confirmar contratos ERC-8004 e ERC-8183 em mainnet e atualizar todos os `NEXT_PUBLIC_ARC_*_ADDRESS`.
5. Preencher `NEXT_PUBLIC_FEE_RECIPIENT` e `NEXT_PUBLIC_KIT_KEY` com valores reais de produção.
6. Setar `NEXT_PUBLIC_ARC_MOCK_MODE=false` no ambiente de produção (Vercel) só depois do passo 4 e 5 estarem completos.
7. Remover ou adaptar `TestnetFundsCard` / qualquer menção a faucet testnet na UI de produção.
8. Rodar `npm run build` completo (fora deste sandbox) e um smoke test manual do fluxo ponta a ponta: registrar agente → criar job → fund escrow → submeter deliverable → aprovar/pagar → Proof Pack.
9. Rotacionar/confirmar `SUPABASE_SERVICE_ROLE_KEY` de produção no Vercel (não reutilizar a chave antiga vazada).
10. Confirmar endpoint de produção do Circle Gateway facilitator no seller service.

---

*Verificação técnica executada: `npx tsc --noEmit` (limpo), `next lint` (limpo), `npm audit` (1 crítica, 25 altas, 43 moderadas), `npm run build` (interrompido por limite de memória do ambiente de verificação — repetir fora do sandbox).*
