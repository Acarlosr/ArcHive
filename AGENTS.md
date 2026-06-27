# AGENTS.md

## Objetivo deste arquivo
Este arquivo orienta agentes de IA, copilots e automações que forem trabalhar neste repositório.
Leia antes de editar qualquer arquivo.

## Missão do repositório
Construir o **ArcHive**, um marketplace de jobs para AI agents na Arc Testnet com:
- identidade de agente
- criação de job
- escrow em USDC
- funding multichain via Unified Balance
- payout após aprovação
- Proof Packs para tornar cada job verificável

## Regra mais importante
**Não transformar este projeto em DEX, AMM, payment-link app ou dashboard genérico.**
Toda alteração deve reforçar a tese agentic economy.
V2 significa camada de prova para jobs de agentes: identidade, escrow, recibos x402, entrega hash-only, aprovação e payout.

## Escopo do MVP
### Deve existir
- landing page premium
- páginas de agentes
- páginas de jobs
- dashboard do usuário
- activity log
- Proof Packs
- wrappers Arc em `src/lib/arc`
- modo demo quando envs faltarem

### Não deve entrar no MVP
- staking
- pools
- swap UI como produto principal
- order book
- tokenomics
- rewards farming
- complexidade desnecessária de matching/autonomia

## Arquitetura esperada
### Frontend
- Next.js App Router
- TypeScript
- Tailwind
- componentes reutilizáveis
- loading/error/success states explícitos

### Dados
- Supabase para estado app/produto
- onchain para identidade/job/escrow/payout

### Integração Arc
Organizar em:
- `src/lib/arc/appKit.ts`
- `src/lib/arc/unifiedBalance.ts`
- `src/lib/arc/agentRegistry.ts`
- `src/lib/arc/jobMarketplace.ts`
- `src/lib/arc/adapters.ts`

## Funções esperadas
### unifiedBalance.ts
- `depositToUnifiedBalance()`
- `getUnifiedBalances()`
- `estimateJobFunding()`
- `spendFromUnifiedBalance()`

### agentRegistry.ts
- `registerAgent(metadataUri)`
- `getAgentById(agentId)`
- `getAgentReputation(agentId)`
- `recordAgentFeedback(agentId, score, tag)`

### jobMarketplace.ts
- `createJob()`
- `fundEscrow()`
- `acceptJob()`
- `submitDeliverable()`
- `approveAndPay()` — chama `complete()` on-chain
- `refundEscrow()` — mock apenas; contrato ERC-8183 da Arc não expõe refund público
- `getJobById()`

## Estados do job (ERC-8183 Arc Testnet)
Open → Funded → Submitted → Completed | Rejected | Expired
O status `Expired` é gerenciado internamente pelo contrato via campo `expiredAt`. Não há função pública de timeout — nenhum `claimAfterTimeout` existe nesta implementação de referência.

## Rotas esperadas
- `/`
- `/agents`
- `/agents/register`
- `/jobs`
- `/jobs/create`
- `/jobs/[id]`
- `/proof`
- `/dashboard`
- `/activity`
- `/settings`

## Direção de design
- dark premium
- glow sutil
- grid/futuristic background discreto
- cards fortes
- tabelas legíveis
- visual de fintech + agentic infra

## Comportamento esperado de agentes de código
### Ao criar código
- preferir componentes pequenos e tipados
- isolar integração Arc da UI
- usar dados mockados se envs não existirem
- escrever código extensível
- adicionar comentários curtos apenas onde a integração Arc exigir contexto

### Ao editar código
- preservar naming consistente
- não quebrar rotas existentes
- evitar refactors grandes sem ganho claro
- manter o modo demo funcional

### Ao escrever copy/UI text
- usar linguagem séria
- evitar hype exagerado
- priorizar clareza de produto

## Estados obrigatórios de cada ação sensível
Toda ação de job/escrow/payout deve ter:
- idle
- loading
- success
- error

## Definição de pronto para o MVP
Um build é aceitável quando permite demonstrar:
1. cadastro de agente
2. criação de job
3. funding do escrow
4. submissão de deliverable hash
5. aprovação e pagamento
6. visualização clara do histórico
7. Proof Pack com evidências do job

## Guardrails
- não inventar contratos “mágicos” sem scaffold claro
- não esconder erros reais de integração
- não acoplar UI diretamente a ABI/contract call se puder isolar num service
- não trocar a narrativa do projeto sem atualizar MEMORY.md e SOUL.md
