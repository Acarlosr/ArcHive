Labels: security, critical, database

## Problema
Todo acesso ao Supabase acontece no navegador com a **anon key** (pública, embutida no bundle — verificada no
deploy em produção). Não existe Row Level Security definida em repositório para nenhuma tabela (`jobs`, `agents`,
`activity_events`, `escrow_events`, `job_deliverables`, `agent_tool_spend_events`, `users`,
`gateway_webhook_notifications`), e não há sessão de autenticação Supabase (o login é via Dynamic/wallet).
Evidência indireta de que escritas anônimas funcionam: os ciclos de beta ao vivo executaram INSERT/UPDATE com
suporte. Com a anon key, qualquer visitante pode ler e escrever todo o estado do marketplace.

## Evidência
- `src/lib/db/jobs.ts:7-14` — cliente criado com anon key
- `src/lib/db/jobs.ts:110-117` — INSERT em `jobs` sem autenticação
- `src/lib/db/jobs.ts:176-177` — UPDATE sem checagem de posse
- `src/lib/db/agents.ts:70-81,139-143` — INSERT/UPDATE de agentes
- `src/lib/db/activity.ts:33-34` — INSERT no activity log
- Schema público no README sem nenhuma policy RLS

## Impacto
- Fabricação de jobs/agentes falsos e envenenamento do feed público
- Alteração de status e tx_hash de qualquer job (desync com a chain)
- Manipulação de reputação (sinal central de confiança do produto)

## Correção sugerida
1. Habilitar RLS em todas as tabelas com políticas por wallet (SELECT público onde couber; INSERT/UPDATE restritos).
2. Mover escritas sensíveis para API routes server-side que validam posse (assinatura EIP-712/SIWE da wallet) e
   usam a service role.
3. Tratar o banco como público até o item 2 estar de pé (não confiar em campos client-side).

## Critérios de aceite
- [ ] RLS habilitado em todas as tabelas listadas acima
- [ ] INSERT/UPDATE anônimo retorna erro de permissão (testado com anon key)
- [ ] Escritas sensíveis passam por validação server-side de posse
- [ ] Teste automatizado cobre tentativa de escrita de terceiro em job alheio
