# ERC-8183 AgenticCommerce — deploy ArcHive

A Arc só publica a reference implementation ERC-8183 no **Testnet**
(`0x0747EEf0706327138c69792bF28Cd525089e4583`). Na mainnet (chain 5042) não
existe deploy oficial até hoje (verificado em 07/10/2026 em
docs.arc.io/arc/references/contract-addresses).

Decisão do projeto: **deployar a reference implementation do EIP-8183,
inalterada, na Arc Mainnet**, atrás de um proxy UUPS. A ABI já usada pelo app
(`src/lib/arc/contracts.ts`) é exatamente a interface do EIP — nada muda no
frontend além do endereço.

## O que tem aqui

| Arquivo | Papel |
| --- | --- |
| `src/AgenticCommerce.sol` | Reference implementation do EIP-8183, verbatim (com `claimRefund` público, não-hookable) |
| `src/IACPHook.sol` | Interface de hooks do EIP |
| `script/DeployAgenticCommerce.s.sol` | Deploy impl + proxy ERC-1967 + `initialize(USDC, treasury)` |
| `foundry.toml` | Solc 0.8.28, evm `osaka` (baseline da Arc) |

## Como deployar (mainnet)

1. Instalar o **Arc Foundry** (fork da Foundry com as divergências EVM da Arc):
   <https://docs.arc.io/arc/tutorials/install-arc-foundry.md>

2. Instalar dependências (dentro de `contracts/erc8183`):

   ```bash
   forge install OpenZeppelin/openzeppelin-contracts OpenZeppelin/openzeppelin-contracts-upgradeable foundry-rs/forge-std
   arc-forge build
   ```

3. Preparar a wallet de deploy:

   - Use uma **wallet dedicada** (não a principal).
   - Financie com **USDC na Arc mainnet** — o gás da Arc é pago em USDC nativo,
     e o mempool tem floor de `20 Gwei maxFeePerGas`
     (docs.arc.io/arc/references/evm-differences).
   - Exporte a chave privada só na sessão do terminal do deploy; nunca commitar.

4. Deploy:

   ```bash
   export DEPLOYER_PRIVATE_KEY=0x...
   # Opcional: treasury que recebe a platform fee (default = deployer)
   export PLATFORM_TREASURY=0x...
   export ARC_RPC_URL=https://rpc.mainnet.arc.io

   arc-forge script DeployAgenticCommerce \
     --rpc-url $ARC_RPC_URL \
     --private-key $DEPLOYER_PRIVATE_KEY \
     --broadcast
   ```

5. Depois do deploy:

   - Copie o endereço do **proxy**.
   - Coloque em `NEXT_PUBLIC_ARC_JOB_MARKETPLACE_ADDRESS` (Vercel, produção).
   - Confira em <https://explorer.arc.io/address/<proxy>>.
   - Regrave o endereço em `_local/MEMORY.md`.

## Segurança

- O `AgenticCommerce` é UUPS-upgradeable e o admin é o deployer. Trate a chave
  do deployer como chave de admin do marketplace.
- `claimRefund` é permissionless depois de `expiredAt` — comportamento do EIP;
  o AGENTS.md mantinha refund como "mock apenas" porque o contrato oficial de
  testnet não expõe refund público. Com deploy próprio, o refund onchain passa
  a existir (via `claimRefund` após expiração). O app já está preparado.
- Não adicionar hooks não auditados: `whitelistedHooks` só permite `address(0)`
  no deploy inicial; qualquer hook novo precisa ser deliberadamente liberado
  pelo admin.
