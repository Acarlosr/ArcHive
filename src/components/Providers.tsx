"use client";
// src/components/Providers.tsx

import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider } from "wagmi";
import { baseSepolia, arbitrumSepolia, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";

import "@rainbow-me/rainbowkit/styles.css";

// ── Arc Testnet chain definition ──
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: "ArcHive",
  appDescription: "AI Agent Job Marketplace on Arc Testnet",
  appUrl: "https://archivearc.xyz",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
  wallets: [
    {
      groupName: "Recommended",
      wallets: [rabbyWallet, metaMaskWallet, injectedWallet, walletConnectWallet],
    },
    {
      groupName: "More wallets",
      wallets: [
        coinbaseWallet,
        rainbowWallet,
        trustWallet,
        okxWallet,
        ledgerWallet,
        safeWallet,
      ],
    },
  ],
  chains: [arcTestnet, baseSepolia, arbitrumSepolia, sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00d4ff",
            accentColorForeground: "#060a10",
            borderRadius: "medium",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
