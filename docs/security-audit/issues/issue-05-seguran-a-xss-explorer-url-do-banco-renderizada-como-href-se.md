Labels: security, medium, xss

## Problema
`pay_links.explorer_url` é gravada pelo cliente (`markLinkPaid`) e, dado o acesso de escrita anônimo
(issue de RLS), pode conter `javascript:alert(1)`. A página `/pay/[id]` renderiza esse valor como href
sem sanitização. React não bloqueia schemes `javascript:` em links.

## Evidência
- `src/components/PayCard.tsx:97-106` — `href={explorerUrl ?? "#"}`
- `src/hooks/usePayLink.ts:54-57` — em `already-paid`, `explorerUrl` vem de `data.explorer_url` (banco)
- `src/components/TxStatus.tsx:54-63` — mesmo padrão com o valor em memória

Nota: `ExplorerLink` é seguro por construção (URL montada com prefixo fixo, `src/lib/demoData.ts:286-288`).
Não há `dangerouslySetInnerHTML`/`innerHTML`/`eval`/markdown no projeto (verificado).

## Impacto
XSS armazenado com trigger por clique na página de pagamento — página que concentra o ato de enviar USDC
(phishing, roubo de sessão Dynamic, assinaturas induzidas).

## Correção sugerida
1. Reconstruir a URL de explorer a partir de `tx_hash` (mesma função do ExplorerLink) em vez de confiar no
   campo do banco; ou
2. Validar na escrita E na renderização: allow-list de scheme `https:` e hosts `explorer.arc.io` /
   `testnet.arcscan.app`.

## Critérios de aceite
- [ ] href com scheme `javascript:` é bloqueado/testado
- [ ] `explorer_url` inválida não é persistida (validação na escrita)
- [ ] Renderização usa allow-list ou URL reconstruída
