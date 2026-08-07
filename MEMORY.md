# MEMORY.md — Estado do projeto ArcHive

> Contexto para qualquer agente de IA continuar o trabalho. Leia junto com AGENTS.md.
> Última atualização: 2026-07-15 (sessão Claude/Cowork, noite).

## ⭐ COMECE AQUI AMANHÃ (handoff 2026-07-15 → 2026-07-16)

### O que já está FUNCIONANDO
- **Local (`localhost:3000`)**: tudo ok. Login Dynamic por email funciona, modo demo (MOCK_MODE=true), hero redesenhado.
- **Produção (`www.archivearc.xyz`)**: deploy no ar com o novo hero + login Dynamic **funcionando** (botão "Entrar" abre a modal). Commit `ac3b4f0` no GitHub, buildou no Vercel sem erro (isso validou o fix do provider em SSR).
- Trabalho desta sessão está **commitado e pushado** (Dynamic migration + timelock/refund + hero redesign).

### BLOQUEIO ATUAL (retomar aqui) — cadastro de agente na PRODUÇÃO
Ao registrar agente em produção, erro no console: `net::ERR_NAME_NOT_RESOLVED` numa chamada ao Supabase (`ibhrrxqjxojzfrprinbq.supabase.co/agents`).
- Causa provável: **quebra de linha/espaço invisível** no valor de `NEXT_PUBLIC_SUPABASE_URL` no Vercel (mesmo padrão que já quebrou o Dynamic ID com `%0A` e o MOCK_MODE).
- **Fix pendente**: no Vercel, editar `NEXT_PUBLIC_SUPABASE_URL` = `https://ibhrrxqjxojzfrprinbq.supabase.co` (sem nada depois), conferir também `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sem linha em branco no fim), **Redeploy**.
- `isDemoMode()` (em `src/lib/demoData.ts`) = true só se faltar SUPABASE_URL ou ANON_KEY. Em produção os dois estão setados → usa Supabase de verdade → por isso o DNS quebrado derruba o cadastro. `isArcMockMode` (blockchain) é flag separada de `isDemoMode` (banco).

### PADRÃO RECORRENTE a vigiar
Toda variável colada na caixa "Value" do Vercel corre risco de levar um `\n`/espaço no fim. Já quebrou: Dynamic ID (`%0A`), e provavelmente SUPABASE_URL. **Ação sugerida amanhã**: revisar TODAS as env vars do Vercel e limpar o fim de cada uma. Vars que o app usa em produção: `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` (ok, corrigido), `NEXT_PUBLIC_ARC_MOCK_MODE=true` (usuário editou; conferir se ficou exatamente `true`), `NEXT_PUBLIC_SUPABASE_URL` (corrigir), `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, e os `NEXT_PUBLIC_ARC_*` (addresses).

### DEPOIS DO BLOQUEIO (próximos passos)
1. Testar fluxo completo em produção: registrar agente `PayScope` (Finance) → criar job "Reconciliar payouts USDC de julho", 120 USDC → ver escrow/timelock.
2. Testar timelock de aprovação: abrir job demo "Reconcile agent payouts for April cohort" (já em submitted) mostra a contagem. Para exercitar lado prestador/auto-release precisa de 2ª carteira (2º email no Dynamic).
3. Pendência antiga: `next@14.2.0` tem CVE — atualizar num momento tranquilo (mexe no framework, testar).
4. Usuário é NÃO-técnico: dar comandos prontos para copiar/colar, um passo de cada vez.


## O que é o projeto
ArcHive (www.archivearc.xyz) — marketplace de jobs para AI agents na **Arc Testnet** (L1 da Circle, chain ID **5042002**, gás em USDC, RPC `https://rpc.testnet.arc.network`, explorer testnet.arcscan.app, faucet faucet.circle.com). Fluxo: humano posta job → agente aceita → escrow USDC → prova de entrega → aprovação → payout. Stack: Next.js 14 App Router + TypeScript + Tailwind + wagmi/viem + Supabase + Circle App Kit. Padrões: ERC-8004 (identidade), ERC-8183 (jobs), x402 (tools medidas).

## Sessão 2026-07-15 — Migração RainbowKit → Dynamic (CONCLUÍDA no código)

### Decisão de arquitetura
Substituído RainbowKit por **Dynamic (dynamic.xyz)** para login com **email/social/passkey + embedded wallet MPC não-custodial**. Motivos: mantém wagmi intacto (DynamicWagmiConnector sincroniza a sessão com todos os hooks wagmi existentes), não-custodial (sem responsabilidade de custódia), rota endossada pela Arc (parceria Arc×Dynamic, receita Dynamic+Circle Gateway). Alternativa descartada: Circle Developer-Controlled Wallets (exigiria backend custodial completo).

### Arquivos alterados
- `src/components/Providers.tsx` — reescrito. `DynamicContextProvider` + `WagmiProvider` + `DynamicWagmiConnector`. Arc Testnet como rede custom via `overrides.evmNetworks`. Exporta `arcTestnet` e `hasDynamicAuth`. **Modo demo**: sem `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID`, cai em wagmi puro com connector `injected()` (regra AGENTS.md preservada).
- `src/components/WalletConnectCTAClient.tsx` — reescrito. `DynamicCTA` (setShowAuthFlow para login; setShowDynamicUserProfile + `<DynamicUserProfile/>` quando conectado; switchChain se fora da Arc) e `FallbackCTA` (modo demo, injected only).
- `src/components/WalletConnectCTA.tsx` — placeholder de loading: "Connect Wallet" → "Sign in".
- `package.json` — removido `@rainbow-me/rainbowkit`; adicionados `@dynamic-labs/sdk-react-core@^4`, `@dynamic-labs/ethereum@^4`, `@dynamic-labs/wagmi-connector@^4`.
- `.env.example` — nova var `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` (comentada; WalletConnect marcado como legacy).
- `src/app/guide/page.tsx` — passo 01 (EN+PT): "entre com email, wallet criada automaticamente; wallet própria continua opcional".
- `src/lib/arc/adapters.ts` — comentário atualizado (RainbowKit → Dynamic).

### Validação feita
- API verificada contra o pacote real `@dynamic-labs/sdk-react-core@4.92.3`: `useDynamicContext`, `setShowAuthFlow`, `setShowDynamicUserProfile`, `sdkHasLoaded`, `DynamicUserProfile`, `DynamicContextProvider`, `initialAuthenticationMode`, `overrides.evmNetworks` — todos existem.
- Typecheck isolado (tsc strict) dos dois arquivos reescritos: **0 erros**.
- `npm install` completo NÃO rodou no sandbox (filesystem montado bloqueia deleções; proxy lento). **node_modules local pode estar inconsistente** — rodar `npm install` limpo na máquina do dev.

### Status Dynamic — TESTADO E FUNCIONANDO (2026-07-15, sessão Cowork tarde)
- Environment Dynamic criado (projeto "Archive", env **Sandbox**). Environment ID: `1b8c6901-2a29-4ded-b983-75b0b4ab25f5` (Organization ID `f8665f7d-7a74-4d04-a5f7-a3a1972ff12d` NÃO é usado pelo SDK).
- Habilitados: Email (log in & signup, OTP, uniqueness), Passkey, Wallet Login, Multi-Wallet, WalletConnect. Social: nenhum (decisão do dev). CORS origin setado (localhost:3000 + archivearc.xyz).
- `.env.local` já tem `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` correto. **Cuidado histórico**: o valor colado vinha com um caractere de controle invisível (`^P`) após o `=` e um `d` extra no fim — corrigido. Se o login falhar no futuro, checar `cat -A .env.local`.
- node_modules já tinha `@dynamic-labs/*` instalado, `@rainbow-me` removido, nenhum import de rainbowkit no src, `tsc --noEmit` = 0 erros. `npm install` limpo NÃO é mais bloqueante.
- **Fluxo validado pelo dev: Sign in funcionando ("funcionou").**

### Pendências imediatas (fazer em seguida)
1. `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` também no Vercel (env de produção; lá `NEXT_PUBLIC_APP_URL` deve ser https://archivearc.xyz — no `.env.local` está localhost:3000). Para produção, considerar criar env **Live** no Dynamic (o atual é Sandbox).
2. Confirmar no Dynamic: Embedded Wallets → EVM ligado e Arc Testnet cadastrada como custom chain (necessário para o switch de rede in-app).
3. Commit LIMPO — adicionar SÓ os 7 arquivos da migração: `src/components/Providers.tsx`, `WalletConnectCTA.tsx`, `WalletConnectCTAClient.tsx`, `src/app/guide/page.tsx`, `src/lib/arc/adapters.ts`, `package.json`, `.env.example`. Ignorar deleções antigas (cpa-site/, curso-cpa-anbima/, material-entrega-aluno/) e ~40 arquivos "M" que são só mudança de permissão (0 linhas de diff). Há um `index.lock` preso no `.git` pelo filesystem montado do sandbox — commit tem que ser na máquina do dev.
4. Endereços de contrato já preenchidos no `.env.local` (agent/reputation/validation registry, job marketplace, escrow vault, USDC) mas `NEXT_PUBLIC_ARC_MOCK_MODE=true` — próximo passo real é ligar os contratos (roadmap item 2+).

## Sessão 2026-07-15 (tarde) — Timelock + refund (camada de app, item 2 parcial)
Decisão: caminho B (app-layer), sem novo contrato, sem tocar no ERC-8183 pré-implantado (que NÃO tem refund/timelock na ABI). Motivo do dev: "faça o que não quebre o dapp". Tudo roda em MOCK_MODE.
### Arquivos alterados/criados
- **NOVO** `src/lib/arc/timelock.ts` — funções puras: `getReviewWindowHours()` (env `NEXT_PUBLIC_ARC_REVIEW_WINDOW_HOURS`, padrão 72), `getAutoReleaseAt`, `getTimelockState` (single source of truth p/ UI), `formatCountdown`. Testadas isoladamente (8/8 casos: dentro/fora da janela, limite, sem submissão, data inválida).
- `src/lib/demoData.ts` — DemoJob ganhou `submitted_at?: string | null`.
- `src/lib/db/jobs.ts` — `normalizeJob` grava `submitted_at`; fallback recente (-6h) p/ jobs demo já "submitted" para o countdown renderizar vivo.
- `src/lib/arc/jobMarketplace.ts` — `refundEscrow` agora aceita `reason` (opcional, não-quebra); **NOVO** `autoReleaseEscrow` (mock; live reusa `complete` com reason "auto-release-timeout").
- `src/app/jobs/[id]/page.tsx` — tick de 1 min quando status=submitted; card de timelock com contagem regressiva; botão "Contestar e solicitar reembolso" (cliente, dentro da janela); "Reivindicar liberação automática" (prestador, após prazo); grava `submitted_at` no submit.
- `.env.example` — documentada `NEXT_PUBLIC_ARC_REVIEW_WINDOW_HOURS=72`.
### Validação: `tsc --noEmit` 0 erros; teste unitário puro 8/8. NÃO commitado (index.lock do sandbox — commitar na máquina do dev).
### Próximo passo natural: quando fizer o contrato de escrow real (item 2 "de verdade"), a UI já lê tudo de `getTimelockState` — só trocar o mock de `autoReleaseEscrow`/`refundEscrow` pela chamada on-chain.

## Sessão 2026-07-15 (tarde) — BUG de runtime corrigido: "DynamicContextProvider should not be nested"
Sintoma: ao rodar `npm run dev`, erro de runtime. Causa: arquitetura legada RainbowKit montava um `<Providers>` por componente (padrão "ilha" via `WalletProviderIsland` = `dynamic(ssr:false)`). RainbowKit tolerava múltiplos providers; Dynamic exige UM único `DynamicContextProvider` na árvore (Navbar CTA + hero CTA já eram dois).
### Correção (2 arquivos, sem mexer nos 7 consumidores)
- `src/components/Providers.tsx` — `Providers` agora é **reentrante**: context flag `WalletProvidersMountedContext`; se já há um Providers acima, retorna `<>{children}</>`. Ambos os ramos (Dynamic e demo/wagmi) embrulham em `.Provider value={true}`.
- `src/app/layout.tsx` — monta **um** `<Providers>` no root, envolvendo Navbar + main + Footer (padrão canônico do Dynamic p/ App Router). As ilhas internas (`WalletProviderIsland`) continuam existindo mas viram passthrough.
- Só `src/components/Providers.tsx` monta `DynamicContextProvider` (confirmado por grep).
### Validação: `tsc --noEmit` 0 erros. `next build` NÃO completou no sandbox (filesystem montado deixa o webpack lento demais, >8min sem output — limitação do ambiente, não do código). **Testar `npm run dev` na máquina do dev.**
### Trade-off/risco em aberto: root mount é SSR (import direto, não ssr:false). É o padrão oficial do Dynamic e deve ser SSR-safe; se der erro de SSR (window/indexedDB) no dev, trocar o mount root por client-only via `WalletProviderIsland` no layout (aceita render client-only do body; metadata/OG seguem SSR pelo export `metadata`).

## Sessão 2026-07-15 (tarde) — Redesign de marketing do hero da home
Motivo: análise de marketing apontou (1) excesso de jargão na 1ª dobra, (2) animação abstrata bonita mas ilegível, (3) falta de fluxo claro. Dev pediu para executar a recomendação (NÃO adicionar robôs — manter dark-neon).
### Mudanças
- `src/lib/i18n.tsx` (EN/PT/ES) — nova copy da 1ª dobra em linguagem simples: headline "Contrate um agente de IA. Só pague quando aprovar." + subheadline sem jargão. Novas chaves `home.story.*` (label, trust, 4 passos post/work/escrow/pay com tag/title/caption). Chaves antigas `home.route.*` continuam no dict (não removidas) mas não são mais usadas na home.
- `src/app/page.tsx` — `routeSteps` (barra 0–6) substituído por `storySteps` (4 passos com ícones SVG inline: doc, raio, cadeado, check). O orbe abstrato de 360px e a barra de ciclo foram removidos; no lugar, um **storyboard vertical legível** (rail com nó pulsando `agent-node-pulse` + conector com `route-spark`, cores rose→purple→gold→green) mantendo paleta e movimento. Mantidos: header do card, métricas (3 tiles). Novo: selo de confiança discreto no rodapé (`home.story.trust`: Arc · ERC-8004 · ERC-8183). Import `CSSProperties` p/ tipar `--node-delay`/`--spark-delay`.
### Validação: `tsc --noEmit` 0 erros. Preview real = recarregar a home no `npm run dev` (a ferramenta de visualização não reproduz o dark-neon).

## Roadmap acordado (análise de arquiteto, prioridade)
Princípio: complexidade no contrato/backend; UI só mostra o que o usuário decide agora.
1. ~~Onboarding email (Dynamic)~~ — feito no código (falta env ID + teste).
2. **Timelock de liberação + refund mínimo** no contrato: após submissão, cliente tem X dias para aprovar/contestar; sem ação, payout automático. Refund mútuo (2 assinaturas) + expiração de escrow. Referência: EIP-712 Refund Protocol no sample `circlefin/arc-escrow`.
3. **Validação de entrega por IA** (pré-aprovação): score do deliverable contra o job spec antes do release — padrão do `circlefin/arc-escrow` (OpenAI). UI mostra só "✓ atende / ⚠ pendências".
4. **ERC-8004/8183 reais** (hoje são wrappers "ready"): usar registries oficiais dos tutoriais Arc para reputação interoperável.
5. **Memo on-chain** no settlement: contrato pré-implantado `0x5294E9927c3306DcBaDb03fe70b92e01cCede505` para recibos auditáveis no ArcScan.
6. **Nanopayments/Gateway** para spend de tools (batching de intents assinados off-chain).
NÃO fazer: multi-chain agora, disputa com júri/staking, leilão de agentes, dashboards complexos.

## Contexto adicional da sessão (fora do repo)
- Relatório docx gerado (outputs da sessão Cowork): estudo do portal PSD2 da Airbnb Payments Luxembourg (Finologee, Berlin Group v1.3.6, AIS/CBPII, QWAC/mTLS, consentimento 180 dias) + guia de deploy na Arc Testnet. Conclusão: PSD2 é off-chain regulado; o que faz sentido é escrow/settlement on-chain — exatamente o que o ArcHive já faz.
- Contratos úteis Arc Testnet: USDC ERC-20 `0x3600...0000` (6 dec; nativo 18 dec — mesma balance), EURC `0x89B5...D72a`, Permit2 `0x0000...8BA3`, Multicall3 `0xcA11...CA11`, CREATE2 `0x4e59...956C`.
- Diferenças EVM da Arc que afetam contratos: PREVRANDAO=0, transferências podem reverter (blocklist/zero address/burn), SELFDESTRUCT move USDC, EIP-7708 emite Transfer nativo (18 dec), base fee não queimada, anvil local não reproduz essas regras — testar contra RPC real.
