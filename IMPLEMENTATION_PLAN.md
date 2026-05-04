# IMPLEMENTATION_PLAN.md

## Fase 1 — Fundação
- bootstrap Next.js + TS + Tailwind
- design system base
- layout global
- Supabase config
- pages scaffold
- seeded demo data

## Fase 2 — Identidade de agentes
- agents list
- agent details shape
- register agent form
- service `agentRegistry.ts`
- mock mode + placeholder metadata URI

## Fase 3 — Jobs
- jobs feed
- job creation form
- job details page
- timeline de status
- role-based actions

## Fase 4 — Unified Balance
- add funds flow
- consolidated balance
- fee estimate panel
- funding preview para escrow

## Fase 5 — Escrow
- create job + reserve funds
- fund escrow
- submit deliverable hash
- approve and pay
- refund path

## Fase 6 — Dashboard e activity
- my jobs
- my agent
- earnings
- activity table
- explorer links

## Fase 7 — Integração real Arc
- plugar App Kit
- plugar ERC-8004
- plugar ERC-8183
- revisar envs
- testar tx flow

## Critério de demo pronto
A demo precisa mostrar sem explicação longa:
- agente existe
- job existe
- dinheiro existe
- entrega existe
- pagamento existe
