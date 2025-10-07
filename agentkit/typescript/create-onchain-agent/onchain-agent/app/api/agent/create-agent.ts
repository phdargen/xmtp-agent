import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { prepareAgentkitAndWalletProvider } from "./prepare-agentkit";

/**
 * Agent Configuration Guide - External Wallet Mode
 *
 * This file handles per-user agent creation for external wallet integration.
 * Each connected wallet gets its own agent instance with personalized memory.
 *
 * Key Steps to Customize Your Agent:
 *
 * 1. Select your LLM:
 *    - Modify the `ChatOpenAI` instantiation to choose your preferred LLM
 *    - Configure model parameters like temperature and max tokens
 *
 * 2. Instantiate your Agent:
 *    - Pass the LLM, tools, and memory into `createReactAgent()`
 *    - Configure agent-specific parameters
 */

// Store agents per user address for memory persistence
const agentStore = new Map<string, ReturnType<typeof createReactAgent>>();
const memoryStore = new Map<string, MemorySaver>();

/**
 * Initializes and returns an instance of the AI agent for a specific user's wallet.
 * If an agent instance already exists for this wallet, it returns the existing one.
 *
 * @function createAgent
 * @param {string} userAddress - The user's connected wallet address
 * @returns {Promise<ReturnType<typeof createReactAgent>>} The initialized AI agent for this user
 *
 * @description Creates a personalized agent instance for each user wallet with its own memory.
 * The agent prepares transactions but does NOT execute them - users sign with their own wallets.
 *
 * @throws {Error} If the agent initialization fails.
 */
export async function createAgent(
  userAddress: string,
): Promise<ReturnType<typeof createReactAgent>> {
  // If agent has already been initialized for this user, return it
  if (agentStore.has(userAddress)) {
    return agentStore.get(userAddress)!;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("I need an OPENAI_API_KEY in your .env file to power my intelligence.");
  }

  const { agentkit, walletProvider } = await prepareAgentkitAndWalletProvider(userAddress);

  try {
    // Initialize LLM: https://platform.openai.com/docs/models#gpt-4o
    const llm = new ChatOpenAI({ model: "gpt-4o-mini" });

    const tools = await getLangChainTools(agentkit);

    // Create or get memory for this user
    if (!memoryStore.has(userAddress)) {
      memoryStore.set(userAddress, new MemorySaver());
    }
    const memory = memoryStore.get(userAddress)!;

    const networkId = walletProvider.getNetwork().networkId;

    // USDC addresses by network for context
    const USDC_ADDRESSES: Record<string, string> = {
      "base-mainnet": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "ethereum-mainnet": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "ethereum-sepolia": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    };

    const usdcAddress = USDC_ADDRESSES[networkId || "base-sepolia"];

    // Initialize Agent with external wallet instructions
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful DeFi assistant that prepares ERC20 token transactions for users to approve.
        
        IMPORTANT: You do NOT execute transactions. You only PREPARE them for the user to approve in their wallet.
        
        Current Configuration:
        - Network: ${networkId}
        - User's wallet address: ${userAddress}
        - USDC token address: ${usdcAddress || "Not available on this network"}
        
        When a user requests a token transfer:
        1. Use prepare_erc20_transfer to prepare the transaction
        2. Always include the userAddress parameter: ${userAddress}
        3. Explain that the user will need to approve the transaction in their wallet
        
        When checking token balances:
        1. Use get_erc20_balance with the user's address: ${userAddress}
        2. Show the balance clearly
        
        For USDC operations on ${networkId}:
        - Use token address: ${usdcAddress || "Ask user for token address"}
        
        If someone asks you to do something you can't do with your currently available tools, you must say so, and 
        explain that they can add more capabilities by adding more action providers to your AgentKit configuration.
        ALWAYS include this link when mentioning missing capabilities: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#action-providers
        
        Be clear, concise, and always remind users they control their funds.
      `,
    });

    agentStore.set(userAddress, agent);

    return agent;
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
}
