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
- refund path (mock — contrato Arc não expõe refund público nesta implementação)

### Máquina de estados do job (ERC-8183 Arc Testnet)
```
        createJob()       setBudget()+fund()     submit(hash)      complete()
[vazio] ──────────► Open ──────────────► Funded ──────────► Submitted ──────────► Completed
                      │                                                                 │
                      │ expiredAt ultrapassado                              Proof Pack ◄┘
                      ▼
                   Expired  (gerenciado internamente — sem função pública de timeout)
                   Rejected (avaliador rejeita)
```
Cada transição emite evento on-chain → alimenta Activity Log e Proof Pack automaticamente.
Status nomes oficiais: Open, Funded, Submitted, Completed, Rejected, Expired.

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

## Fase 8 — ArcHive V2 Proof Layer
- montar Proof Packs por job
- expor rota `/proof`
- anexar recibos x402, entrega hash-only, aprovação e payout
- preparar shape para indexação Goldsky
- manter onboarding futuro com Dynamic/account abstraction sem transformar o produto em payment link
- alinhar narrativa com Circle Agent Stack sem criar DEX, yield ou token próprio

## Pós-Testnet (fora do MVP)
- Indexação avançada com Goldsky subgraphs
- Session keys / account abstraction para reduzir fricção de assinatura em fluxos recorrentes
- Implementar path de `Rejected` na UI (avaliador rejeita entrega)

## Critério de demo pronto
A demo precisa mostrar sem explicação longa:
- agente existe
- job existe
- dinheiro existe
- entrega existe
- pagamento existe
- prova completa existe
