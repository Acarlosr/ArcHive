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
ARC_NETWORK=testnet
ALLOWED_ORIGIN=http://localhost:3000
MAX_PER_CALL_USD=0.01
MAX_TOTAL_PER_JOB_USD=25
JOB_CAP_FRACTION=0.03
```

`ARC_NETWORK` and `ALLOWED_ORIGIN` are required: the service refuses to start without them. `ARC_NETWORK` (`testnet` | `mainnet`) derives the Circle Gateway facilitator URL; set `FACILITATOR_URL` to override. `ALLOWED_ORIGIN` is a comma-separated list of origins allowed by CORS (no wildcard).

## Spend caps

Paid endpoints enforce a per-job spend ledger server-side:

- Every paid call must send `jobId` (JSON body for POST, query string for GET). Requests without `jobId` are rejected with `403 job_required`.
- The total cap per job defaults to `MAX_TOTAL_PER_JOB_USD` (25 USDC). If the request includes `jobBudgetUsdc`, the cap is tightened to `min(jobBudgetUsdc * JOB_CAP_FRACTION, MAX_TOTAL_PER_JOB_USD)`.
- A call above the remaining budget is rejected with `403 spend_cap_exceeded` before payment settlement.
- `GET /usage/:jobId` exposes the current ledger (limit, spent, remaining).

The ledger is in-memory per service instance; restarts reset it and horizontal scaling keeps per-instance state.

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
