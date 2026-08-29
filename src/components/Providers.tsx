"use client";
// src/components/Providers.tsx
//
// Wallet + auth providers for ArcHive.
// Dynamic (dynamic.xyz) provides email/social/passkey login with a
// non-custodial embedded MPC wallet, plus external wallet connect.
// DynamicWagmiConnector syncs the Dynamic session into wagmi, so every
// existing wagmi hook (useAccount, useWalletClient, ...) keeps working.
//
// Demo mode: if NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is missing, we fall
// back to a plain wagmi provider (injected wallet only) so the app still
// builds and runs.

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia, arbitrumSepolia, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { defineChain } from "viem";

// Dynamic forbids more than one DynamicContextProvider in the tree. The app
// wraps many wallet-touching components in their own <Providers> island, so we
// make Providers re-entrant: the outermost mount sets up the full stack and
// flags the context; any nested Providers becomes a transparent passthrough.
const WalletProvidersMountedContext = createContext(false);

// ── Arc Testnet chain definition ──
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.io"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

const DYNAMIC_ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;
export const hasDynamicAuth = Boolean(DYNAMIC_ENV_ID);

// Arc Testnet as a Dynamic custom EVM network (mirrors `arcTestnet` above).
const dynamicEvmNetworks = [
  {
    blockExplorerUrls: ["https://testnet.arcscan.app"],
    chainId: arcTestnet.id,
    chainName: "Arc Testnet",
    iconUrls: ["https://archivearc.xyz/icon.png"],
    name: "Arc Testnet",
    nativeCurrency: arcTestnet.nativeCurrency,
    networkId: arcTestnet.id,
    rpcUrls: ["https://rpc.testnet.arc.io"],
    vanityName: "Arc Testnet",
  },
];

const wagmiConfig = createConfig({
  chains: [arcTestnet, baseSepolia, arbitrumSepolia, sepolia],
  // Dynamic implements multi-injected provider discovery itself.
  multiInjectedProviderDiscovery: !hasDynamicAuth,
  connectors: hasDynamicAuth ? [] : [injected()],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.io"),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const alreadyMounted = useContext(WalletProvidersMountedContext);
  // A parent <Providers> is already in the tree: don't nest a second stack.
  if (alreadyMounted) return <>{children}</>;

  // Demo / fallback mode: plain wagmi (injected wallet only).
  if (!hasDynamicAuth) {
    return (
      <WalletProvidersMountedContext.Provider value={true}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
      </WalletProvidersMountedContext.Provider>
    );
  }

  return (
    <WalletProvidersMountedContext.Provider value={true}>
      <DynamicContextProvider
        theme="dark"
        settings={{
          environmentId: DYNAMIC_ENV_ID as string,
          walletConnectors: [EthereumWalletConnectors],
          overrides: { evmNetworks: dynamicEvmNetworks },
          // Email-first onboarding; external wallets stay available as an option.
          initialAuthenticationMode: "connect-and-sign",
          appName: "ArcHive",
        }}
      >
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    </WalletProvidersMountedContext.Provider>
  );
}
