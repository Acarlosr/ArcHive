Labels: security, high, credentials, git-history

## Problema
O repositório público contém, no histórico git, credenciais reais do Supabase:
1. `d2932bc:Superbase.txt` — dump da tela de criação do projeto com a **senha do banco** visível e um JWT
   Supabase (263 chars, sha256 ff3a2c6df9ea69a6).
2. `7b4748c:SECURITY_FIXES.md` — a chave real `sb_secret_h6Mhy...` (redigida depois, em `3c4addc`, mas
   recuperável do histórico).

Verificação feita nesta auditoria: as chaves atuais em `.env.local` (hashes conferidos) são DIFERENTES das
vazadas — a rotação parece feita. Porém: (a) a validade remota das chaves antigas não pôde ser testada neste
ambiente (DNS do Supabase bloqueado); (b) a **senha do banco nunca expira automaticamente** — se ela não foi
trocada no painel do Supabase, qualquer pessoa pode conectar direto ao Postgres (bypass total de RLS, role de
dono).

## Evidência
- `git show d2932bc:Superbase.txt` (senha do banco + JWT)
- `git show 7b4748c:SECURITY_FIXES.md` (sb_secret real)
- Commits de correção: `b722755`, `3c4addc`
- Repositório público: github.com/Acarlosr/ArcHive

## Impacto
Acesso administrativo direto ao banco (senha do DB) e às APIs Supabase (JWT/sb_secret antigos), se ainda válidos.

## Correção sugerida
1. No painel Supabase: trocar a senha do banco (Settings → Database), regenerar o JWT secret e remover a
   sb_secret antiga — confirmar que NADA das credenciais vazadas está ativo.
2. Scrub do histórico (git filter-repo ou BFG) ou, se o scrub não for viável, documentar que a invalidação
   (passo 1) é a mitigação definitiva.
3. Ativar Secret Scanning + Push Protection no GitHub.
4. Nunca colar dumps de painéis em arquivos do repo (mesmo temporários).

## Critérios de aceite
- [ ] Senha do banco rotacionada no painel Supabase
- [ ] JWT secret regenerado; sb_secret antiga revogada
- [ ] Histórico limpo OU invalidação confirmada e documentada
- [ ] Secret scanning + push protection ativos
