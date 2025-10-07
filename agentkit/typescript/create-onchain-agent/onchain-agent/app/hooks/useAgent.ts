import { useState } from "react";
import { useAccount, useSendTransaction, usePublicClient } from "wagmi";
import { AgentRequest, AgentResponse } from "../types/api";

/**
 * Sends a user message to the AgentKit backend API and retrieves the agent's response.
 *
 * @async
 * @function messageAgent
 * @param {string} userMessage - The message sent by the user.
 * @param {string | undefined} walletAddress - The user's connected wallet address.
 * @returns {Promise<AgentResponse>} The agent's response including optional transaction data.
 *
 * @throws {Error} Logs an error if the request fails.
 */
async function messageAgent(
  userMessage: string,
  walletAddress: string | undefined,
): Promise<AgentResponse> {
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, walletAddress } as AgentRequest),
    });

    return (await response.json()) as AgentResponse;
  } catch (error) {
    console.error("Error communicating with agent:", error);
    return { error: "Failed to communicate with agent" };
  }
}

/**
 * This hook manages interactions with the AI agent and wallet transactions.
 * It integrates with wagmi to handle wallet connections and transaction signing.
 *
 * #### How It Works
 * - `sendMessage(input)` sends a message to `/api/agent` with the user's wallet address
 * - If the agent prepares a transaction, it prompts the user to sign it via wagmi
 * - `messages` stores the chat history including transaction confirmations
 * - `isThinking` tracks whether the agent is processing or a transaction is pending
 *
 * #### See Also
 * - The API logic in `/api/agent/route.ts`
 * - Transaction preparation in `externalWalletERC20ActionProvider`
 *
 * @returns {object} An object containing:
 * - `messages`: The conversation history.
 * - `sendMessage`: A function to send a new message.
 * - `isThinking`: Boolean indicating if the agent is processing or transaction is pending.
 */
export function useAgent() {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "agent" }[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  /**
   * Sends a user message, updates local state, and retrieves the agent's response.
   * If a transaction is prepared, prompts the user to sign it.
   *
   * @param {string} input - The message from the user.
   */
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    setMessages((prev: { text: string; sender: "user" | "agent" }[]) => [
      ...prev,
      { text: input, sender: "user" },
    ]);
    setIsThinking(true);

    const response = await messageAgent(input, address);

    // Handle error response
    if (response.error) {
      setMessages((prev: { text: string; sender: "user" | "agent" }[]) => [
        ...prev,
        { text: response.error!, sender: "agent" },
      ]);
      setIsThinking(false);
      return;
    }

    // Handle transaction preparation
    if (response.transaction) {
      const tx = response.transaction.calls[0];

      try {
        // Add agent's message about the transaction
        setMessages((prev: { text: string; sender: "user" | "agent" }[]) => [
          ...prev,
          {
            text: `${response.response}\n\n💡 Please approve this transaction in your wallet to complete the transfer.`,
            sender: "agent",
          },
        ]);

        // Send transaction via wagmi (this will show the wallet popup)
        const hash = await sendTransactionAsync({
          to: tx.to as `0x${string}`,
          data: tx.data as `0x${string}`,
          value: BigInt(tx.value),
        });

        // Add transaction submitted message (only shown after user signs)
        setMessages((prev: { text: string; sender: "user" | "agent" }[]) => [
          ...prev,
          {
            text: `✅ Transaction submitted!\n\n📄 Hash: ${hash}\n\n⏳ Waiting for confirmation...`,
            sender: "agent",
          },
        ]);

        // Wait for transaction confirmation
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          
          setMessages((prev: { text: string; sender: "user" | "agent" }[]) => [
            ...prev,
            {
              text: `🎉 Transaction confirmed!\n\n📄 Hash: ${hash}\n✅ Status: ${receipt.status === "success" ? "Success" : "Failed"}`,
              sender: "agent",
            },
          ]);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Transaction was rejected or failed";
        setMessages((prev: { text: string; sender: "user" | "agent" }[]) => [
          ...prev,
          { text: `❌ Transaction failed: ${errorMessage}`, sender: "agent" },
        ]);
      }
    } else {
      // Regular text response
      setMessages((prev: { text: string; sender: "user" | "agent" }[]) => [
        ...prev,
        { text: response.response!, sender: "agent" },
      ]);
    }

    setIsThinking(false);
  };

  return { messages, sendMessage, isThinking };
}
