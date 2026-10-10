import { fallback, http } from "viem";
import { ARC_NETWORK } from "@/lib/arc/network";

/**
 * Endpoints RPC da Arc, em ordem de preferência, por rede.
 *
 * Por que a lista é grande E alterna entre dois domínios:
 *
 * 1) Em 31/08/2026 o endpoint oficial falhou momentaneamente no meio de uma
 *    criação de job. Com um transport único, isso vira erro vermelho na tela.
 *
 * 2) Ainda em 31/08, o Chrome do Antonio devolveu `ERR_BLOCKED_BY_CLIENT` para
 *    TODOS os endpoints `arc.io` — uma extensão do navegador (bloqueador de
 *    anúncios / privacidade) bloqueia esse domínio. Os mesmos endpoints em
 *    `arc.network` respondem normalmente. Um usuário com a mesma extensão veria
 *    o app simplesmente não funcionar.
 *
 * Por isso a lista **alterna os domínios**: se uma regra de bloqueio derrubar
 * `arc.io` inteiro, a próxima tentativa já cai em `arc.network`, e vice-versa.
 */
const PADROES_MAINNET = [
  // `.network` vem primeiro DE PROPOSITO: e o unico que funciona para quem tem
  // bloqueador de anuncios (ver comentario acima). `.io` e o dominio oficial nos
  // docs e continua na lista logo atras.
  "https://rpc.mainnet.arc.network",
  "https://rpc.mainnet.arc.io",
  "https://rpc.quicknode.mainnet.arc.network",
  "https://rpc.quicknode.mainnet.arc.io",
  "https://rpc.drpc.mainnet.arc.network",
  "https://rpc.drpc.mainnet.arc.io",
  "https://rpc.blockdaemon.mainnet.arc.network",
  "https://rpc.blockdaemon.mainnet.arc.io",
];

const PADROES_TESTNET = [
  "https://rpc.testnet.arc.network",
  "https://rpc.testnet.arc.io",
  "https://rpc.quicknode.testnet.arc.network",
  "https://rpc.quicknode.testnet.arc.io",
  "https://rpc.drpc.testnet.arc.network",
  "https://rpc.drpc.testnet.arc.io",
  "https://rpc.blockdaemon.testnet.arc.network",
  "https://rpc.blockdaemon.testnet.arc.io",
];

export const ARC_RPC_URLS = [
  ...(process.env.NEXT_PUBLIC_ARC_RPC_URL ? [process.env.NEXT_PUBLIC_ARC_RPC_URL] : []),
  ...(ARC_NETWORK === "mainnet" ? PADROES_MAINNET : PADROES_TESTNET),
].filter((url, index, all) => all.indexOf(url) === index);

/**
 * Transport com failover automático: se um endpoint não responder — ou for
 * bloqueado por extensão — o viem tenta o próximo da lista sozinho.
 */
export function arcTransport() {
  return fallback(
    ARC_RPC_URLS.map((url) => http(url, { retryCount: 1, timeout: 8_000 })),
    { rank: false },
  );
}
