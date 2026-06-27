# Automação do ArcHive — dApp sem chatbot

> Documento de arquitetura. Como transformar o ArcHive num dApp automatizado onde o usuário só preenche dados e o "robô" (contrato + backend) executa o resto. Alinhado ao `PRD.md`, `AGENTS.md` e `IMPLEMENTATION_PLAN.md`.
>
> **Modelo de pagamento adotado:** escrow no smart contract.

---

## 1. A pergunta, traduzida

A ideia original era:

- a pessoa **diz só o nome da empresa e o preço** → o robô **cria o agente/job**;
- outra pessoa **localiza o job e diz "vou pagar"** → o robô **se responsabiliza pelo dinheiro**.

Isso **não é um chatbot**. É um dApp com automação direta: o usuário interage com a tela, e o contrato inteligente é o "robô" que registra, trava e libera o valor sozinho. Ninguém conversa com o sistema — o sistema reage a ações assinadas pela carteira.

O ArcHive já foi desenhado para isso. O que falta é fechar o laço de automação e deixar explícito quem faz o quê.

---

## 2. Quem é o "robô"

Não existe uma IA decidindo. O "robô" é a soma de três camadas:

| Camada | Papel | No ArcHive |
|---|---|---|
| **Smart contract (escrow)** | O cérebro. Cria job, trava USDC, libera no payout. Imutável e automático. | `jobMarketplace` + escrow on-chain |
| **Frontend (a tela)** | Onde a pessoa digita nome/preço e clica. Monta a transação e lê a lista de jobs. | Next.js App Router (`/jobs/create`, `/jobs/[id]`) |
| **Backend / indexer** | Escuta os eventos do contrato e dá a sensação de "robô agindo": notifica, atualiza dashboard, registra Activity Log. | Supabase + Gateway webhooks + (futuro) Goldsky |

A regra de ouro do `AGENTS.md` continua valendo: isso **não vira** DEX, swap, payment-link ou dashboard genérico. É uma camada de prova para trabalho agentic.

---

## 3. O fluxo automatizado, passo a passo

### Passo 1 — Criar o job (o "robô cria o agente")

O usuário preenche o mínimo na interface: **nome da empresa/agente** e **preço (em USDC)**. Ao clicar em "Criar", a carteira (App Kit / RainbowKit) assina uma transação que chama `createJob()`.

O que acontece sozinho:

- o contrato registra o job on-chain com um `jobId`;
- emite um evento `JobCreated(jobId, empresa, preco, criador)`;
- o indexer captura o evento e o job aparece no feed `/jobs` — sem ninguém cadastrar nada manualmente.

A própria blockchain é o "robô" que registra. Não há intermediário humano entre o clique e o registro.

### Passo 2 — Localizar e pagar (o "vou pagar")

Outra pessoa abre `/jobs`, vê a lista (o frontend lê direto do contrato/indexer), escolhe um job e clica **"Vou pagar"**. A carteira chama `fundEscrow(jobId)` e envia o valor em USDC.

Aqui está o ponto central: o dinheiro **não vai pro criador ainda**. Fica **travado dentro do contrato de escrow**. O job muda de estado para `Funded`.

### Passo 3 — O robô se responsabiliza (escrow)

O escrow é exatamente "o robô se responsabilizando pelo dinheiro". O contrato é o garantidor neutro — ninguém precisa confiar em ninguém:

- **entrega:** o agente/criador chama `submitDeliverable(jobId, hash)` — só o hash da entrega vai on-chain (entrega privada, verificável por prova, conforme o PRD);
- **liberação:** quem pagou chama `approveAndPay(jobId)` → o contrato libera o USDC travado para o criador, automaticamente;
- **devolução:** se algo der errado, `refundEscrow(jobId)` devolve o valor ao pagador.

Nenhuma dessas transições depende de um operador humano mexendo num banco de dados. O contrato decide com base nas regras.

---

## 4. O ponto técnico que muda tudo: contrato não age sozinho no tempo

Um detalhe que costuma confundir: **um smart contract não executa por conta própria com o passar do tempo.** Ele só roda quando *alguém chama uma função*.

Então:

- "liberar quando o job for confirmado" → funciona no instante em que alguém clica em aprovar. Isso já é automático do ponto de vista de confiança.
- "liberar automaticamente depois de X dias sem resposta" → precisa de um **gatilho externo**. Há duas formas:
  1. **Reivindicação pelo usuário:** após o prazo, o próprio criador chama `claimAfterTimeout(jobId)` e o contrato verifica se o prazo passou antes de liberar. Simples e sem custo de infra.
  2. **Automação agendada:** um serviço como **Chainlink Automation** ou **Gelato** chama a função no horário certo. É isso que dá a sensação de "robô totalmente autônomo".

Para o MVP na Arc Testnet, a opção (1) é suficiente e mais barata. A opção (2) entra quando você quiser zero intervenção.

---

## 5. Máquina de estados do job

```
        createJob()                fundEscrow()             submitDeliverable(hash)
 [vazio] ───────────► Created ───────────────► Funded ───────────────────► Delivered
                                                  │                              │
                                                  │ refundEscrow()               │ approveAndPay()
                                                  ▼                              ▼
                                              Refunded                        Paid  ──► Proof Pack
                                                                                 ▲
                                          claimAfterTimeout()  ──────────────────┘
                                          (após prazo, sem resposta)
```

Cada transição emite um evento on-chain. O Activity Log e o Proof Pack são montados a partir desses eventos — é assim que o job vira "prova completa": agente existe, job existe, dinheiro existe, entrega existe, pagamento existe.

---

## 6. Onde isso encaixa no código já existente

A automação não exige reescrever o ArcHive. Ela usa as funções já previstas no `AGENTS.md`:

| Ação na tela | Função do service | Camada |
|---|---|---|
| "Criar" (nome + preço) | `createJob()` em `jobMarketplace.ts` | escreve on-chain |
| "Vou pagar" | `fundEscrow(jobId)` | trava USDC |
| Submeter entrega | `submitDeliverable(jobId, hash)` | hash-only |
| Aprovar e pagar | `approveAndPay(jobId)` | libera escrow |
| Devolver | `refundEscrow(jobId)` | refund |
| Liberar por prazo | `claimAfterTimeout(jobId)` *(novo)* | gatilho de tempo |
| Ver lista de jobs | `getJobById()` + indexer | lê estado |

A UI nunca chama a ABI direto — fica isolada nos services em `src/lib/arc/`, como o guardrail exige. O modo demo continua funcionando quando as envs faltarem.

A única adição em relação ao plano atual é a função de **timeout/claim** (Passo 4, opção 1), que fecha o laço de automação sem depender de operador humano.

---

## 7. O que dá pra fazer "sem humano" e o que ainda exige um clique

Para evitar promessa exagerada (também um guardrail do projeto):

**Automático de verdade (sem intermediário humano):**

- registro do job assim que o criador assina;
- trava do dinheiro assim que o pagador assina;
- liberação para o criador no instante da aprovação;
- montagem do Activity Log e Proof Pack a partir dos eventos.

**Ainda exige uma ação (de quem assina) ou automação extra:**

- *alguém* precisa assinar cada transação com a carteira — é o que garante segurança e custódia;
- liberação por tempo só roda sozinha com Chainlink/Gelato; sem isso, o usuário reivindica após o prazo.

Ou seja: o "robô se responsabiliza" pelo **dinheiro e pelas regras**, mas cada passo é disparado por uma assinatura de carteira ou por um agendador. Não há um robô central custodiando fundos livremente — o que, aliás, é justamente o que o PRD coloca fora de escopo.

---

## 8. Próximos passos sugeridos

1. **Confirmar o contrato de escrow** na Arc Testnet com as funções acima (incluindo `claimAfterTimeout`).
2. **Ligar os services** `jobMarketplace.ts` às funções reais (sair do mock mode por trás de env flag).
3. **Indexar os eventos** para alimentar `/jobs`, `/activity` e `/proof` sem polling manual.
4. **Decidir o gatilho de tempo:** reivindicação manual (MVP) ou Chainlink/Gelato (autonomia total).
5. **Validar tudo na testnet** antes de qualquer mainnet — sem custo, exatamente o objetivo do Arc Testnet.

---

*Escopo preservado: identidade de agente, escrow USDC, entrega hash-only, aprovação e payout, Proof Pack. Nada de DEX, swap, lending, yield ou token próprio.*
