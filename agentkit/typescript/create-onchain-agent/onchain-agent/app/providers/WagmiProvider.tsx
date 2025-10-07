"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider as WagmiProviderBase } from "wagmi";
import { base, baseSepolia, mainnet, sepolia } from "wagmi/chains";
import { http, createConfig } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";

/**
 * Wagmi configuration for wallet connection
 */
const config = createConfig({
  chains: [base, baseSepolia, mainnet, sepolia],
  connectors: [injected(), coinbaseWallet({ appName: "AgentKit External Wallet" })],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

/**
 * WagmiProvider component that wraps the app with wagmi and react-query providers
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactNode} The provider component
 */
export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderBase>
  );
}
