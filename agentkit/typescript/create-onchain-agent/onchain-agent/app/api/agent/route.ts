import { AgentRequest, AgentResponse, TransactionPrepared } from "@/app/types/api";
import { NextResponse } from "next/server";
import { createAgent } from "./create-agent";

/**
 * Attempts to parse a string as JSON and return a TransactionPrepared object if valid.
 *
 * @param {string} content - The string to parse
 * @returns {TransactionPrepared | null} The parsed transaction or null if invalid
 */
function tryParseTransactionPrepared(content: string): TransactionPrepared | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "TRANSACTION_PREPARED") {
      return parsed as TransactionPrepared;
    }
  } catch {
    // Not JSON or invalid format
  }
  return null;
}

/**
 * Handles incoming POST requests to interact with the AgentKit-powered AI agent.
 * This function processes user messages and streams responses from the agent.
 * If the agent prepares a transaction, it's returned to the frontend for wallet signing.
 *
 * @function POST
 * @param {Request & { json: () => Promise<AgentRequest> }} req - The incoming request object
 * @returns {Promise<NextResponse<AgentResponse>>} JSON response with agent reply and optional transaction
 *
 * @description Sends a single message to the agent and returns the agents' final response.
 * If a transaction is prepared, it's included in the response for the user to sign with their wallet.
 *
 * @example
 * const response = await fetch("/api/agent", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ userMessage: input, walletAddress: "0x..." }),
 * });
 */
export async function POST(
  req: Request & { json: () => Promise<AgentRequest> },
): Promise<NextResponse<AgentResponse>> {
  try {
    // 1️. Extract user message and wallet address from the request body
    const { userMessage, walletAddress } = await req.json();

    // Check if wallet is connected
    if (!walletAddress) {
      return NextResponse.json({
        error: "Please connect your wallet to use the agent.",
      });
    }

    // 2. Get the agent for this user's wallet
    const agent = await createAgent(walletAddress);

    // 3. Start streaming the agent's response
    const stream = await agent.stream(
      { messages: [{ content: userMessage, role: "user" }] },
      { configurable: { thread_id: walletAddress } }, // Use wallet address as thread ID for memory
    );

    // 4️. Process the streamed response chunks
    let agentResponse = "";
    let transactionPrepared: TransactionPrepared | null = null;

    for await (const chunk of stream) {
      // Check for tool outputs (this is where prepared transactions come from)
      if ("tools" in chunk && chunk.tools?.messages) {
        for (const toolMessage of chunk.tools.messages) {
          if (toolMessage.content) {
            const parsed = tryParseTransactionPrepared(String(toolMessage.content));
            if (parsed) {
              console.log("🔧 Transaction prepared by tool:", parsed.description);
              transactionPrepared = parsed;
            }
          }
        }
      }

      // Get the final agent response for the user
      if ("agent" in chunk) {
        agentResponse += chunk.agent.messages[0].content;
      }
    }

    // 5️. Return the final response with optional transaction
    return NextResponse.json({
      response: agentResponse,
      transaction: transactionPrepared || undefined,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({
      error:
        error instanceof Error
          ? error.message
          : "I'm sorry, I encountered an issue processing your message. Please try again later.",
    });
  }
}
