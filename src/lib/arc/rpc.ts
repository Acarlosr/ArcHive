import { fallback, http } from "viem";

/**
 * Endpoints RPC da Arc Testnet, em ordem de preferência.
 *
 * O primeiro é o oficial da Circle; os outros três são os provedores
 * publicados em docs.arc.io/arc/references/rpc-endpoints. Ter mais de um
 * importa: em 31/08/2026 o endpoint oficial falhou momentaneamente
 * ("Failed to fetch") no meio de uma criação de job, e com um único
 * transport isso vira erro vermelho na tela do usuário.
 */
export const ARC_RPC_URLS = [
  process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "https://rpc.testnet.arc.io",
  "https://rpc.quicknode.testnet.arc.io",
  "https://rpc.drpc.testnet.arc.io",
  "https://rpc.blockdaemon.testnet.arc.io",
].filter((url, index, all) => all.indexOf(url) === index);

/**
 * Transport com failover automático: se um endpoint não responder, o viem
 * tenta o próximo da lista sozinho, sem o usuário perceber.
 */
export function arcTransport() {
  return fallback(
    ARC_RPC_URLS.map((url) => http(url, { retryCount: 2, timeout: 10_000 })),
    { rank: false },
  );
}
