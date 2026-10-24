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
  // `.io` vem primeiro DE PROPOSITO (reordenado em 12/10/2026): os endpoints
  // mainnet em `.network` viraram NXDOMAIN (dominio morto) e o `.io` responde
  // rapido com CORS correto. `.network` fica no fim como fallback, caso volte.
  // A ordem alternada anterior (.network primeiro) existia porque bloqueadores
  // de anuncios derrubavam o dominio `.io` inteiro — para quem usa bloqueador,
  // o app precisa que o usuario crie uma excecao para archivearc.xyz.
  "https://rpc.mainnet.arc.io",
  "https://rpc.quicknode.mainnet.arc.io",
  "https://rpc.drpc.mainnet.arc.io",
  "https://rpc.blockdaemon.mainnet.arc.io",
  "https://rpc.mainnet.arc.network",
  "https://rpc.quicknode.mainnet.arc.network",
  "https://rpc.drpc.mainnet.arc.network",
  "https://rpc.blockdaemon.mainnet.arc.network",
];

const PADROES_TESTNET = [
  // `.io` primeiro pelo mesmo motivo da mainnet: `.arc.network` esta NXDOMAIN
  // nas duas redes desde 12/10/2026 (mantido no fim caso volte).
  "https://rpc.testnet.arc.io",
  "https://rpc.quicknode.testnet.arc.io",
  "https://rpc.drpc.testnet.arc.io",
  "https://rpc.blockdaemon.testnet.arc.io",
  "https://rpc.testnet.arc.network",
  "https://rpc.quicknode.testnet.arc.network",
  "https://rpc.drpc.testnet.arc.network",
  "https://rpc.blockdaemon.testnet.arc.network",
];

export const ARC_RPC_URLS = [
  ...(process.env.NEXT_PUBLIC_ARC_RPC_URL ? [process.env.NEXT_PUBLIC_ARC_RPC_URL] : []),
  ...(ARC_NETWORK === "mainnet" ? PADROES_MAINNET : PADROES_TESTNET),
].filter((url, index, all) => all.indexOf(url) === index);

/**
 * Transport com failover automático: se um endpoint não responder — ou for
 * bloqueado por extensão — o viem tenta o próximo da lista sozinho.
 *
 * No BROWSER usamos o proxy `/api/rpc` do próprio site: navegadores de
 * privacidade (Helium, Brave) e bloqueadores de anúncios bloqueiam fetch
 * direto para os domínios `arc.io` / `arc.network` (o `arc.io` consta em
 * listas de privacidade por ser domínio de analytics de terceiros) — o que
 * quebrou o smoke test de 12/10 no Helium ("Failed to fetch" em todos os 8
 * endpoints). Chamada same-origin para archivearc.xyz nunca é bloqueada; o
 * proxy repassa ao RPC com failover server-side. No SERVER (SSR/rotas),
 * chamamos os endpoints direto — sem CORS/adblock no caminho.
 */
const RPC_PROXY_PATH = "/api/rpc";

export function arcTransport() {
  if (typeof window !== "undefined") {
    return http(`${window.location.origin}${RPC_PROXY_PATH}`, {
      retryCount: 2,
      timeout: 15_000,
    });
  }
  return fallback(
    ARC_RPC_URLS.map((url) => http(url, { retryCount: 1, timeout: 8_000 })),
    { rank: false },
  );
}
