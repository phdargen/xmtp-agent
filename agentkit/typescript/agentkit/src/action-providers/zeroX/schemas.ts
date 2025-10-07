import { z } from "zod";

/**
 * Input schema for getting a swap price.
 */
export const GetSwapPriceSchema = z
  .object({
    sellToken: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The token contract address to sell"),
    buyToken: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The token contract address to buy"),
    sellAmount: z
      .string()
      .describe("The amount of sellToken to sell in whole units (e.g., 1.5 WETH, 10 USDC)"),
    slippageBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .optional()
      .default(100)
      .describe("The maximum acceptable slippage in basis points (0-10000, default: 100)"),
    swapFeeRecipient: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .optional()
      .describe("The wallet address to receive an affiliate fee on the trade"),
    swapFeeBps: z
      .number()
      .int()
      .min(0)
      .max(1000)
      .default(100)
      .describe(
        "The amount in basis points (0-1000) of the sellToken to charge as trading fee (defaults to 100 = 1%), only used if swapFeeRecipient is provided",
      ),
  })
  .strip()
  .describe("Get a price quote for swapping one token for another");

/**
 * Input schema for executing a swap.
 */
export const ExecuteSwapSchema = z
  .object({
    sellToken: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The token contract address to sell"),
    buyToken: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The token contract address to buy"),
    sellAmount: z
      .string()
      .describe("The amount of sellToken to sell in whole units (e.g., 1.5 WETH, 10 USDC)"),
    slippageBps: z
      .number()
      .int()
      .min(0)
      .max(10000)
      .optional()
      .default(100)
      .describe("The maximum acceptable slippage in basis points (0-10000, default: 100)"),
    swapFeeRecipient: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .optional()
      .describe("The wallet address to receive an affiliate fee on the trade"),
    swapFeeBps: z
      .number()
      .int()
      .min(0)
      .max(1000)
      .default(100)
      .describe(
        "The amount in basis points (0-1000) of the sellToken to charge as trading fee (defaults to 100 = 1%), only used if swapFeeRecipient is provided",
      ),
  })
  .strip()
  .describe("Execute a swap between two tokens");
