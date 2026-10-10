Labels: security, critical, payments

## Problema
A RLS de `pay_links` existe apenas em comentário em `src/lib/db/links.ts:143-161`, com a política
`"Anyone can update status" USING (true)` — ou seja, qualquer portador da anon key pode atualizar QUALQUER linha
(status, tx_hash, explorer_url, **recipient_wallet**, amount). A política de leitura por criador compara
`creator_wallet = current_user`, que nunca casa (current_user é `anon`). Se o SQL do comentário nunca foi
executado, a tabela está totalmente aberta — pior.

O fluxo de pagamento real usa o campo do banco: `usePayLink.pay()` chama
`spendFromUnifiedBalance({ amount: link.amount, recipientAddress: link.recipient_wallet, ... })` — USDC real
enviado para o destinatário gravado em `pay_links.recipient_wallet`.

## Evidência
- `src/lib/db/links.ts:143-161` — SQL de RLS em comentário com `USING (true)` para UPDATE
- `src/hooks/usePayLink.ts:87-101` — envio real usa `link.recipient_wallet` e `link.amount`
- `src/components/PayCard.tsx:49-58` — página pública executa o pagamento com dados do banco
- `src/lib/db/links.ts:104-119` — `markLinkPaid` atualiza qualquer link por ID, sem posse

## Impacto
Ataque em duas etapas sem autenticação: (1) obter a URL pública do link (compartilhada no chat/e-mail);
(2) alterar `recipient_wallet` para a carteira do atacante antes da vítima pagar → o USDC cai no atacante.
Também permite marcar links como pagos sem pagamento (fraude de status).

## Correção sugerida
1. Política real de RLS: UPDATE apenas pelo criador validado server-side (não via current_user); recipient
   imutável após criação.
2. Status `paid`, `tx_hash` e `explorer_url` definidos somente por rota server-side que confirma a transação
   on-chain (lendo o receipt na Arc), nunca por chamada do navegador.
3. Recriar todos os links existentes após a correção (recipient já pode estar adulterado).

## Critérios de aceite
- [ ] UPDATE anônimo em pay_links é rejeitado (testado)
- [ ] recipient_wallet não é alterável após criação
- [ ] marcação de pagamento exige confirmação on-chain server-side
- [ ] migração/limpeza dos links existentes documentada
