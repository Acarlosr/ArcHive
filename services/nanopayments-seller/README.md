# ArcHive Metered Tools Seller

Express seller service for the ArcHive Agent Spend Router using x402 and Circle Gateway Nanopayments.

This is an integrated ArcHive module, not a separate dapp or brand. The service protects paid API endpoints that AI agents can call per request while the main app tracks job-level policy and receipts.

## Setup

```bash
cd services/nanopayments-seller
npm install
cp .env.example .env
```

Set `SELLER_ADDRESS` to the EOA wallet address that should receive USDC.

```bash
npm run dev
```

The service defaults to `http://localhost:4021`.

## Environment

```bash
PORT=4021
SELLER_ADDRESS=0x...
ACCEPT_ARC_ONLY=true
```

When `ACCEPT_ARC_ONLY=true`, `createGatewayMiddleware` is configured with:

```ts
networks: ["eip155:5042002"]
```

Set `ACCEPT_ARC_ONLY=false` to allow all Circle Gateway-supported networks.

## Protected Routes

- `GET /premium-data` — `0.001 USDC`
- `POST /tools/summarize` — `0.001 USDC`
- `POST /tools/extract-json` — `0.0005 USDC`
- `POST /tools/score-deliverable` — `0.002 USDC`

Unpaid requests return HTTP `402 Payment Required`. Paid requests include payment metadata from `req.payment`.

## Security Notes

- Do not expose private keys in the frontend.
- Buyer-side Nanopayments require EOA wallets.
- This service only needs a seller receiving address. Buyers sign payment authorizations from their own clients.
