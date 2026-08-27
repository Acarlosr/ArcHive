# ArcHive → Circle Acceleration Season — Plano Mestre
_Salvo em 27/08/2026. Fonte: sessão de estratégia com Claude._

## 1. Contexto / Oportunidade
- **Programa:** Circle Acceleration Season (Crecimiento × Circle). 6 semanas online, kickoff na Aleph Week, 12+ times LatAm.
- **Verticais alvo:** payments, remittances, FX, treasury, agentic commerce.
- **Exigência:** produto já em mercado ou closed beta.
- **Timing crítico:** **Arc Mainnet lança 16/09/2026.** O Demo Day cai na era pós-mainnet → chegar "mainnet day-one ready" é vantagem decisiva.
- **Form:** Airtable. Campos obrigatórios incluem pitch deck, branding kit (Google Drive público), X/LinkedIn do founder e da startup.

## 2. Avaliação honesta de chance
Estimativa atual: **25–35%**, elevável.

**A favor**
- Brasil/LatAm = público-alvo exato (Crecimiento é argentino).
- Deploy real no Arc Testnet com tx visíveis no ArcScan (filtro do form → "sim").
- Usa stack Circle de verdade: USDC + x402 + escrow.
- Convite para o **Arc Architects program** = prova social forte. CITAR NO FORM.

**Contra (gaps a fechar)**
1. **Testnet-only, sem usuários** → maior gap. Precisa virar "closed beta com N usuários e X transações".
2. **Solo founder, sem time** → red flag para programa de execução de 6 semanas.
3. **Sem "evidence of demand"** → campo obrigatório, munição fraca hoje.
4. Foco declarado é fintech/payments — precisa enquadrar ArcHive nesse eixo.

**Ações que fecham os gaps (antes de submeter)**
1. Conseguir 5–15 usuários reais no testnet → narrar como closed beta.
2. Arrumar co-founder ou advisor nomeado (mesmo part-time).
3. Evidence of demand: conversas com devs de agentes, waitlist, DMs, prints.
4. Pitch deck de 8–10 slides (form diz "helps a lot" = na prática obrigatório).

## 3. Qual projeto submeter — DECIDIDO
- **ArcHive** → SIM. Melhor encaixe em "agentic commerce", usa mais peças da Circle.
- **Stepless** → mencionar no deck como prova de portfólio/execução, não como startup principal.
- **ArcDex** → NÃO submeter. DEX genérica é o perfil menos desejado.

## 4. A TESE — evolução do ArcHive
> **"Tesouraria autônoma para PMEs e pessoas na LatAm"**
> Agentes de IA operam o caixa: recebem USDC de qualquer chain (Unified Balance),
> fazem hedge/conversão FX automática (USDC↔EURC via FX engine nativo do Arc),
> pagam fornecedores e APIs via x402, com trilha de compliance nativa.
> Um **CFO autônomo on-chain**.

**Narrativa única:** ArcHive cresce de "marketplace de jobs de agentes" → "agentes que operam dinheiro real de empresas". Reaproveita ERC-8004/8183/x402 já deployados. NÃO é começar do zero.

**Por que é o tiro certo**
- Usa a peça mais nova e menos explorada do stack (Unified Balance, lançada 30/abr).
- FX é o vertical que a Circle mais quer ver na LatAm.
- É agentic commerce de verdade, não chatbot com carteira.
- Câmbio/remessa é dor real BR/AR — plateia argentina VIVE esse problema (peso, dólar blue).

**Frase de pitch:**
> _"Poupança inteligente em dólar digital para a LatAm: uma IA cuida do câmbio e dos pagamentos, o usuário só vê um número crescer — e nenhuma chave existe para ser roubada."_

## 5. Stack Arc/Circle disponível (verificado em docs.arc.io, ago/2026)
- **Unified Balance** (App Kit, 30/abr) — junta USDC de várias chains num saldo único gastável em qualquer chain. Built on Circle Gateway. **Peça mais nova, pouco explorada.**
- **FX engine nativo** — swap USDC↔EURC, settlement sub-segundo. **Permite cobrar spread customizado SEM deployar contrato** → monetização embutida.
- **Agentic economy oficial na docs:** ERC-8004 (identidade/reputação de agente) + ERC-8183 (ciclo de vida do job: criação, escrow, entrega, avaliação, settlement USDC) + x402 (nanopagamentos por API).
- **Compliance nativo:** Elliptic + TRM Labs integrados na chain.
- **Arc MCP Server** para dev assistido por IA. `docs.arc.io/llms.txt` = índice para LLM.
- **Gas em USDC** — sem token volátil, fee previsível para cotação de câmbio.
- **Gateway ganhou suporte ERC-1271 em 05/08/2026** → destrava smart wallets no Unified Balance. Limitação antiga da docs está caindo AGORA. Timing perfeito.
- App Kit tem 3 sample apps prontos: FX swaps, fintech treasury, multichain wallet.

**Validação de mercado:** Kyriba × Circle faz treasury USDC para *enterprise*; Fireblocks publica a tese de agentic finance. **Ninguém desceu isso para PME/pessoa comum na LatAm com UX de banco simples.** O espaço embaixo está vazio.

## 6. UX — O TESTE DO SENHOR DE 70 ANOS
**Regra inegociável: ele NUNCA vê blockchain.** Zero seed phrase, zero gas, zero chain, zero endereço 0x.

- **Tela única:** "Você tem R$ 12.430 guardados. Este mês entrou R$ 3.200 e o app economizou R$ 87 pra você no câmbio." Um número, uma frase, um botão.
- **Login por biometria (passkey)** — sem senha, sem frase de recuperação. Chave no Secure Enclave. Recuperação social/custodial via Circle Wallets.
- **Toda ação do agente em linguagem de gente:** _"Converti seus dólares pra euro ontem porque a taxa estava 2% melhor — toque para desfazer em até 24h."_
- **Sem configurar política:** 3 perguntas no onboarding ("prefere segurança ou rendimento?") → o agente traduz em policy.
- **Modelo mental:** caderneta de poupança. Arc invisível por baixo.

## 7. ARQUITETURA DE SEGURANÇA
**Princípio: não existe chave para roubar e não existe endpoint que mova dinheiro sozinho.**

1. **Custódia:** Circle Developer-Controlled Wallets (MPC). Chave privada não existe inteira em lugar nenhum, nem no nosso servidor. Backend guarda só credencial de API com escopo mínimo, em secrets manager (KMS/HSM), rotacionada.
2. **O agente PROPÕE, nunca EXECUTA:** policy engine determinístico entre o LLM e o dinheiro. Agente gera *intenção* ("converter 500 USDC→EURC"); módulo sem IA, auditável, valida contra regras duras: limite diário, allowlist de destinos, horário, velocity check. **LLM comprometido por prompt injection não move um centavo além da política.** ← responder isso a todo mentor de segurança.
3. **Valores altos = 2 aprovações:** acima do limite exige biometria do dono + timelock de 24h com direito a cancelar. Reversibilidade percebida; irreversibilidade só após a janela.
4. **Superfície mínima:** sem endpoint público de escrita direta. API atrás de gateway com mTLS, rate limit, WAF. Sem admin panel exposto. Infra imutável, deploy por pipeline, zero SSH em produção.
5. **Compliance de fábrica:** Elliptic/TRM nativos do Arc triam todo destino ANTES do policy engine avaliar.
6. **Auditoria:** log append-only de todo evento (intenção do agente → decisão da policy → tx hash). Transforma "confie na IA" em "verifique a IA".

> **Nota de honestidade para o pitch:** "pentest não acessa" absoluto não existe — quem promete mente. O que existe é o acima: **nenhum ponto único cuja queda perca dinheiro.** Essa é a frase.

## 8. Próximos passos (pendentes — retomar aqui)
- [ ] Escrever respostas do formulário Airtable com o ângulo treasury autônoma
- [ ] Montar pitch deck 8–10 slides
- [ ] Protótipo do módulo de treasury (Unified Balance + FX + agente decisor + policy engine)
- [ ] Fechar os 4 gaps da seção 2
- [ ] Branding kit em pasta Google Drive pública

## 9. Fontes
- https://docs.arc.io/ | https://docs.arc.io/llms.txt | https://docs.arc.io/build/agentic-economy | https://docs.arc.io/build/stablecoin-fx | https://docs.arc.io/app-kit/unified-balance
- Arc Mainnet 16/09: https://x.com/arc/status/2084997753550368837
- Gateway ERC-1271: https://www.cryptotimes.io/2026/08/05/circle-upgrades-gateway-with-erc-1271-smart-wallet-support/
- Kyriba × Circle: https://www.circle.com/pressroom/kyriba-and-circle-bring-usdc-capabilities-to-enterprise-treasury-unlocking-a-path-toward-more-intelligent-treasury-decisioning
- Fireblocks agentic finance: https://www.fireblocks.com/report/agentic-finance-stack-ai-commerce
- Circle Wallets + x402: https://www.circle.com/blog/autonomous-payments-using-circle-wallets-usdc-and-x402

## 10. Nota — retomada amanhã (28/08)
Antonio confirmou: amanhã senta pra elaborar o plano de execução em detalhe (priorizando seção 8/9: conseguir usuários reais em closed beta antes de qualquer redação de form/deck).
> "Cérebro, que vamos fazer hoje? — Pink, nós vamos dominar o mundo!"
