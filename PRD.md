# PRD.md

## Product
ArcHive

## One-liner
Marketplace de jobs para AI agents com identidade onchain, escrow em USDC, funding multichain e gastos controlados com ferramentas pagas na Arc Testnet.

## Problema
Hoje existem poucos produtos que demonstrem de forma clara uma economia agentic real:
- quem é o agente
- qual trabalho foi contratado
- onde está o dinheiro
- quais ferramentas pagas o agente usou
- quando o pagamento é liberado

## Solução
ArcHive conecta clientes e agentes com um fluxo verificável:
1. registrar agente
2. publicar job
3. financiar escrow em USDC
4. autorizar gastos de ferramenta por política
5. registrar recibos de nanopagamento
6. submeter deliverable hash
7. aprovar e pagar
8. gerar Proof Pack do job

## Público inicial
- builders Arc
- creators técnicos
- operadores de agentes
- demos para hackathons / community showcases

## Métricas iniciais de sucesso
- agentes registrados
- jobs criados
- jobs concluídos
- USDC em escrows
- USDC liquidado
- recibos de tool spend por job
- USDC gasto por agentes em serviços pagos
- Proof Packs completos por job
- eventos indexáveis por job

## MVP
### Funcionalidades
- landing page
- registry de agentes
- criação de job
- funding do escrow
- política de gasto para tools pagas
- rotas x402 para nanopayments
- recibos de chamadas pagas ligados ao job
- endpoint de Gateway webhooks para Activity Log automático
- Proof Packs com identidade, escrow, recibos x402, entrega hash-only, aprovação e payout
- aba Docs com arquitetura e integrações implantadas
- submissão de deliverable
- aprovação/pagamento
- dashboard
- activity log

### Requisitos não funcionais
- interface rápida
- visual forte
- demo mode
- código modular
- fácil extensão para contratos reais

## Fora de escopo agora
- matching avançado de agentes
- ranking complexo
- autonomia de execução do agente dentro do app
- otimização automática de preço entre provedores
- agente custodiar fundos livremente sem política de gasto
- governança
- token próprio

## Proposta de valor
ArcHive torna a economia agentic visível e operacional em uma UX compreensível: trabalho, escrow, gastos de execução, entrega, liquidação e Proof Pack.

## Direção V2
ArcHive V2 é uma camada de prova para trabalho agentic na Arc. A V2 deve melhorar o produto existente com:
- Proof Packs por job
- indexação futura com Goldsky
- onboarding futuro com Dynamic ou account abstraction
- alinhamento futuro com Circle Agent Stack, Agent Wallets, Circle Skills e CLI
- entregas privadas por conteúdo, mas verificáveis por hash/prova

A V2 não deve virar DEX, swap, lending, yield, mineração, BRL/BRLA, token próprio ou narrativa fiscal.
