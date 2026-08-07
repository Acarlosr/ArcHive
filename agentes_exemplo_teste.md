# Agentes de exemplo para teste — ArcHive

Baseado no padrão observado no site (registro 8004-xxxx, wallet 0x..., preço em USDC).

| Nome | ID Registro | Especialidade | Wallet (mock) | Taxa/job (USDC) | Reputação |
|---|---|---|---|---|---|
| SignalClerk | 8004-4219 | Monitoramento de eventos onchain / digests | 0xA71c...0004 | 420.00 | 100% jobs concluídos |
| LedgerPilot | 8004-2097 | Reconciliação financeira e payouts | 0xA71c...0002 | 850.00 | 92% jobs concluídos |
| VectorOps | 8004-1482 | Pesquisa de mercado / mapeamento competitivo | 0xA71c...0001 | 2400.00 | 88% jobs concluídos |
| SpecForge | 8004-3771 | Redação técnica / specs de integração | 0xA71c...0003 | 1250.00 | 75% jobs concluídos |
| DataWeaver | 8004-5560 | ETL e limpeza de dados | 0xB92f...0005 | 300.00 | 97% jobs concluídos |
| ProofAuditor | 8004-6183 | Auditoria de Proof Packs e compliance | 0xB92f...0006 | 600.00 | 100% jobs concluídos |
| CodeRelay | 8004-7042 | Geração e revisão de código | 0xC48d...0007 | 950.00 | 90% jobs concluídos |
| TrendScout | 8004-8319 | Análise de tendências sociais/cripto | 0xC48d...0008 | 180.00 | 82% jobs concluídos |

## Jobs de teste associados (para simular fluxo completo)

1. **SignalClerk** — "Monitorar registros de agentes na Arc Testnet" — 420 USDC — status: proof complete (100%)
2. **LedgerPilot** — "Reconciliar payouts do coorte de abril" — 850 USDC — status: aguardando aprovação do cliente (67%)
3. **VectorOps** — "Mapear concorrentes de gateway de stablecoin" — 2400 USDC — status: aguardando prova de entrega (50%)
4. **SpecForge** — "Redigir spec de integração ERC-8183" — 1250 USDC — status: aguardando funding do escrow (17%)
5. **DataWeaver** — "Limpar base de transações de maio" — 300 USDC — status: novo, sem escrow ainda (0%)
6. **ProofAuditor** — "Auditar 10 Proof Packs do mês" — 600 USDC — status: em execução, recibos x402 pendentes (33%)

## Uso sugerido

Esses registros servem para popular telas de teste (Agents, Jobs, Proof) sem depender de dados reais na testnet — cobrindo os estados possíveis: completo, pendente de aprovação, pendente de entrega, pendente de escrow e recém-criado.
