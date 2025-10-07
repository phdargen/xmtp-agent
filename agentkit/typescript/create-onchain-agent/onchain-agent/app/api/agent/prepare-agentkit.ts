import {
  AgentKit,
  externalWalletERC20ActionProvider,
  pythActionProvider,
  ReadOnlyEvmWalletProvider,
  WalletProvider,
  walletActionProvider,
  cdpApiActionProvider,
} from "@coinbase/agentkit";

/**
 * AgentKit Integration Route - External Wallet Mode
 *
 * This file configures AgentKit to work with user-controlled wallets (e.g., MetaMask, Coinbase Wallet).
 * The agent prepares transactions but does NOT execute them - users sign with their own wallets.
 *
 * Key Components:
 * 1. ReadOnlyEvmWalletProvider:
 *    - Provides read-only blockchain access
 *    - Tracks user's wallet address for transaction preparation
 *    - No private keys or signing capabilities
 *
 * 2. External Wallet Action Providers:
 *    - externalWalletERC20ActionProvider: Prepares ERC20 token transactions
 *    - pythActionProvider: Provides price feed data
 *
 * Learn more: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit
 */

/**
 * Prepares the AgentKit and WalletProvider for a specific user's wallet address.
 *
 * @function prepareAgentkitAndWalletProvider
 * @param {string} userAddress - The user's connected wallet address
 * @returns {Promise<{ agentkit: AgentKit, walletProvider: WalletProvider }>} The initialized AgentKit instance
 *
 * @description Creates a read-only wallet provider configured for the user's address,
 * then initializes AgentKit with action providers that prepare (but don't execute) transactions.
 *
 * @throws {Error} If the network is not supported or initialization fails.
 */
export async function prepareAgentkitAndWalletProvider(userAddress: string): Promise<{
  agentkit: AgentKit;
  walletProvider: WalletProvider;
}> {
  try {
    // Initialize read-only wallet provider with user's address
    // This provider can read blockchain state but cannot sign transactions
    const walletProvider = ReadOnlyEvmWalletProvider.configure({
      networkId: process.env.NETWORK_ID || "base-sepolia",
      rpcUrl: process.env.RPC_URL,
      address: userAddress,
    });

    // Initialize AgentKit with external wallet action providers
    // These providers prepare transactions for the user to sign with their own wallet
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        externalWalletERC20ActionProvider(), // Prepares ERC20 token transfers
        pythActionProvider(), // Provides price feed data
        cdpApiActionProvider(),
        walletActionProvider(),
      ],
    });

    return { agentkit, walletProvider };
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
}
