"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";

/**
 * Network ID mapping to chain IDs
 */
const NETWORK_ID_TO_CHAIN_ID: Record<string, number> = {
  "base-mainnet": 8453,
  "base-sepolia": 84532,
  "ethereum-mainnet": 1,
  "ethereum-sepolia": 11155111,
};

/**
 * WalletConnect component that handles wallet connection and display
 *
 * @returns {React.ReactNode} The wallet connection UI component
 */
export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const expectedNetworkId = process.env.NEXT_PUBLIC_NETWORK_ID || "base-sepolia";
  const expectedChainId = NETWORK_ID_TO_CHAIN_ID[expectedNetworkId];
  const isWrongNetwork = isConnected && chainId !== expectedChainId;

  return (
    <div className="flex items-center gap-3">
      {!isConnected ? (
        <div className="flex gap-2">
          {connectors.map(connector => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="px-4 py-2 bg-[#0052FF] hover:bg-[#003ECF] text-white rounded-lg font-semibold transition-all shadow-md"
            >
              Connect Wallet
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {isWrongNetwork && (
            <div className="flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400 text-sm">Wrong Network</span>
              <button
                onClick={() => switchChain({ chainId: expectedChainId })}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-all"
              >
                Switch to {expectedNetworkId}
              </button>
            </div>
          )}
          <div className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
