import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { CreateAction } from "../actionDecorator";
import { GetSwapPriceSchema, ExecuteSwapSchema } from "./schemas";
import { EvmWalletProvider, LegacyCdpWalletProvider } from "../../wallet-providers";
import {
  erc20Abi,
  formatUnits,
  parseUnits,
  maxUint256,
  encodeFunctionData,
  size,
  concat,
  Hex,
  numberToHex,
} from "viem";
import { getTokenDetails, PERMIT2_ADDRESS } from "./utils";
/**
 * Configuration for the ZeroXActionProvider.
 */
export interface ZeroXActionProviderConfig {
  /**
   * The API key to use for 0x API requests.
   */
  apiKey?: string;
}

/**
 * 0x API Action Provider for token swaps.
 * Requires a 0x API key.
 */
export class ZeroXActionProvider extends ActionProvider<EvmWalletProvider> {
  #apiKey: string;

  /**
   * Constructor for the ZeroXActionProvider.
   *
   * @param config - Configuration for the provider.
   */
  constructor(config: ZeroXActionProviderConfig) {
    super("zerox", []);
    const apiKey = config.apiKey || process.env.ZEROX_API_KEY;
    if (!apiKey) {
      throw new Error("0x API key not provided.");
    }
    this.#apiKey = apiKey;
  }

  /**
   * Gets a price quote for swapping one token for another.
   *
   * @param walletProvider - The wallet provider to get information from.
   * @param args - The input arguments for the action.
   * @returns A message containing the price quote.
   */
  @CreateAction({
    name: "get_swap_price_quote_from_0x",
    description: `
This tool fetches a price quote for swapping between two tokens using the 0x API.

It takes the following inputs:
- sellToken: The contract address of the token to sell
- buyToken: The contract address of the token to buy
- sellAmount: The amount of sellToken to swap in whole units (e.g. 1 ETH or 10 USDC)
- slippageBps: (Optional) Maximum allowed slippage in basis points (100 = 1%)
- swapFeeRecipient: (Optional) The wallet address to receive affiliate trading fees
- swapFeeBps: The amount in basis points (0-1000) to charge as affiliate fees (defaults to 100 = 1%), only used if swapFeeRecipient is provided

Important notes:
- The contract address for native ETH is "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
- This only fetches a price quote and does not execute a swap
- Supported on all EVM networks compatible with 0x API
- Use sellToken units exactly as provided, do not convert to wei or any other units
- Never assume token or address, they have to be provided as inputs. If only token symbol is provided, use the get_token_address tool if available to get the token address first
`,
    schema: GetSwapPriceSchema,
  })
  async getSwapPrice(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetSwapPriceSchema>,
  ): Promise<string> {
    const network = walletProvider.getNetwork();
    const chainId = network.chainId;
    if (!chainId) throw new Error("Chain ID not available from wallet provider");

    try {
      // Get token details
      const {
        fromTokenDecimals: sellTokenDecimals,
        toTokenDecimals: buyTokenDecimals,
        fromTokenName: sellTokenName,
        toTokenName: buyTokenName,
      } = await getTokenDetails(walletProvider, args.sellToken, args.buyToken);

      // Convert sell amount to base units
      const sellAmount = parseUnits(args.sellAmount, sellTokenDecimals).toString();

      // Create URL for the price API request
      const url = new URL("https://api.0x.org/swap/permit2/price");
      url.searchParams.append("chainId", chainId.toString());
      url.searchParams.append("sellToken", args.sellToken);
      url.searchParams.append("buyToken", args.buyToken);
      url.searchParams.append("sellAmount", sellAmount);
      url.searchParams.append("taker", walletProvider.getAddress());
      url.searchParams.append("slippageBps", args.slippageBps.toString());
      if (args.swapFeeRecipient) {
        url.searchParams.append("swapFeeRecipient", args.swapFeeRecipient);
        url.searchParams.append("swapFeeBps", args.swapFeeBps.toString());
        url.searchParams.append("swapFeeToken", args.sellToken);
      }

      // Make the request
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "0x-api-key": this.#apiKey,
          "0x-version": "v2",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return JSON.stringify({
          success: false,
          error: `Error fetching swap price: ${response.status} ${response.statusText} - ${errorText}`,
        });
      }

      const data = await response.json();

      // Format the response
      const formattedResponse = {
        success: true,
        sellAmount: formatUnits(BigInt(sellAmount), sellTokenDecimals),
        sellTokenName: sellTokenName,
        sellToken: args.sellToken,
        buyAmount: formatUnits(data.buyAmount, buyTokenDecimals),
        minBuyAmount: data.minBuyAmount ? formatUnits(data.minBuyAmount, buyTokenDecimals) : null,
        buyTokenName: buyTokenName,
        buyToken: args.buyToken,
        slippageBps: args.slippageBps,
        liquidityAvailable: data.liquidityAvailable,
        balanceEnough: data.issues?.balance === null,
        priceOfBuyTokenInSellToken: (
          Number(formatUnits(BigInt(sellAmount), sellTokenDecimals)) /
          Number(formatUnits(data.buyAmount, buyTokenDecimals))
        ).toString(),
        priceOfSellTokenInBuyToken: (
          Number(formatUnits(data.buyAmount, buyTokenDecimals)) /
          Number(formatUnits(BigInt(sellAmount), sellTokenDecimals))
        ).toString(),
      };

      return JSON.stringify(formattedResponse);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Error fetching swap price: ${error}`,
      });
    }
  }

  /**
   * Executes a token swap using the 0x API.
   *
   * @param walletProvider - The wallet provider to use for the swap.
   * @param args - The input arguments for the action.
   * @returns A message containing the result of the swap.
   */
  @CreateAction({
    name: "execute_swap_on_0x",
    description: `
This tool executes a token swap between two tokens using the 0x API.

It takes the following inputs:
- sellToken: The contract address of the token to sell
- buyToken: The contract address of the token to buy
- sellAmount: The amount of sellToken to swap in whole units (e.g. 1 ETH or 10 USDC)
- slippageBps: (Optional) Maximum allowed slippage in basis points (100 = 1%)
- swapFeeRecipient: (Optional) The wallet address to receive affiliate trading fees
- swapFeeBps: The amount in basis points (0-1000) to charge as affiliate fees (defaults to 100 = 1%), only used if swapFeeRecipient is provided

Important notes:
- The contract address for native ETH is "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
- This will execute an actual swap transaction that sends tokens from your wallet
- If needed, it will automatically approve the permit2 contract to spend the sell token
- The approval transaction is only needed once per token
- Ensure you have sufficient balance of the sell token before executing
- The trade size might influence the excecution price depending on available liquidity 
- First fetch a price quote and only execute swap if you are happy with the indicated price
- Supported on all EVM networks compatible with 0x API
- Use sellToken units exactly as provided, do not convert to wei or any other units
- Never assume token or address, they have to be provided as inputs. If only token symbol is provided, use the get_token_address tool if available to get the token address first
`,
    schema: ExecuteSwapSchema,
  })
  async executeSwap(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof ExecuteSwapSchema>,
  ): Promise<string> {
    // Sanity checks
    const network = walletProvider.getNetwork();
    const chainId = network.chainId;
    if (!chainId) throw new Error("Chain ID not available from wallet provider");

    try {
      // Get token details
      const {
        fromTokenDecimals: sellTokenDecimals,
        toTokenDecimals: buyTokenDecimals,
        fromTokenName: sellTokenName,
        toTokenName: buyTokenName,
      } = await getTokenDetails(walletProvider, args.sellToken, args.buyToken);

      // Convert sell amount to base units
      const sellAmount = parseUnits(args.sellAmount, sellTokenDecimals).toString();

      // Get the wallet address
      const walletAddress = walletProvider.getAddress();

      // Fetch price quote first
      const priceUrl = new URL("https://api.0x.org/swap/permit2/price");
      priceUrl.searchParams.append("chainId", chainId.toString());
      priceUrl.searchParams.append("sellToken", args.sellToken);
      priceUrl.searchParams.append("buyToken", args.buyToken);
      priceUrl.searchParams.append("sellAmount", sellAmount);
      priceUrl.searchParams.append("taker", walletAddress);
      priceUrl.searchParams.append("slippageBps", args.slippageBps.toString());
      if (args.swapFeeRecipient) {
        priceUrl.searchParams.append("swapFeeRecipient", args.swapFeeRecipient);
        priceUrl.searchParams.append("swapFeeBps", args.swapFeeBps.toString());
        priceUrl.searchParams.append("swapFeeToken", args.sellToken);
      }

      const priceResponse = await fetch(priceUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "0x-api-key": this.#apiKey,
          "0x-version": "v2",
        },
      });

      if (!priceResponse.ok) {
        const errorText = await priceResponse.text();
        return JSON.stringify({
          success: false,
          error: `Error fetching swap price: ${priceResponse.status} ${priceResponse.statusText} - ${errorText}`,
        });
      }

      const priceData = await priceResponse.json();

      // Check if liquidity is available
      if (priceData.liquidityAvailable === false) {
        return JSON.stringify({
          success: false,
          error: "No liquidity available for this swap.",
        });
      }

      // Check if balance of sell token is enough
      if (priceData.balance != null) {
        return JSON.stringify({
          success: false,
          error: `Insufficient balance of sell token ${priceData.balance.token}. Requested to swap ${priceData.balance.expected}, but balance is only ${priceData.balance.actual}.`,
        });
      }

      // Check if permit2 approval is needed for ERC20 tokens
      // Only needed once per token per address
      let approvalTxHash: Hex | null = null;
      if (priceData.issues?.allowance) {
        try {
          approvalTxHash = await walletProvider.sendTransaction({
            to: args.sellToken as Hex,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [PERMIT2_ADDRESS, maxUint256],
            }),
          });

          await walletProvider.waitForTransactionReceipt(approvalTxHash);
        } catch (error) {
          return JSON.stringify({
            success: false,
            error: `Error approving token: ${error}`,
          });
        }
      }

      // Fetch the swap quote
      const quoteUrl = new URL("https://api.0x.org/swap/permit2/quote");
      quoteUrl.searchParams.append("chainId", chainId.toString());
      quoteUrl.searchParams.append("sellToken", args.sellToken);
      quoteUrl.searchParams.append("buyToken", args.buyToken);
      quoteUrl.searchParams.append("sellAmount", sellAmount);
      quoteUrl.searchParams.append("taker", walletAddress);
      quoteUrl.searchParams.append("slippageBps", args.slippageBps.toString());
      if (args.swapFeeRecipient) {
        quoteUrl.searchParams.append("swapFeeRecipient", args.swapFeeRecipient);
        quoteUrl.searchParams.append("swapFeeBps", args.swapFeeBps.toString());
        quoteUrl.searchParams.append("swapFeeToken", args.sellToken);
      }

      const quoteResponse = await fetch(quoteUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "0x-api-key": this.#apiKey,
          "0x-version": "v2",
        },
      });

      if (!quoteResponse.ok) {
        const errorText = await quoteResponse.text();
        return JSON.stringify({
          success: false,
          error: `Error fetching swap quote: ${quoteResponse.status} ${quoteResponse.statusText} - ${errorText}`,
        });
      }

      const quoteData = await quoteResponse.json();

      // Sign Permit2.eip712 returned from quote
      let signature: Hex | undefined;
      if (quoteData.permit2?.eip712) {
        try {
          // For LegacyCdpWalletProvider, remove EIP712Domain to avoid ambiguous primary types
          const types =
            walletProvider instanceof LegacyCdpWalletProvider
              ? (() => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { EIP712Domain, ...rest } = quoteData.permit2.eip712.types;
                  return rest;
                })()
              : quoteData.permit2.eip712.types;

          const typedData = {
            domain: quoteData.permit2.eip712.domain,
            types,
            primaryType: quoteData.permit2.eip712.primaryType,
            message: quoteData.permit2.eip712.message,
          } as const;

          signature = await walletProvider.signTypedData(typedData);

          // Append sig length and sig data to transaction.data
          if (signature && quoteData.transaction?.data) {
            const signatureLengthInHex = numberToHex(size(signature), {
              signed: false,
              size: 32,
            });

            const transactionData = quoteData.transaction.data as Hex;
            const sigLengthHex = signatureLengthInHex as Hex;
            const sig = signature as Hex;

            quoteData.transaction.data = concat([transactionData, sigLengthHex, sig]);
          }
        } catch (error) {
          return JSON.stringify({
            success: false,
            error: `Error signing permit2 message: ${error}`,
          });
        }
      }

      // Execute swap
      try {
        // Prepare transaction parameters
        const txParams: {
          to: Hex;
          data: Hex;
          gas?: bigint;
          value?: bigint;
        } = {
          to: quoteData.transaction.to as Hex,
          data: quoteData.transaction.data as Hex,
          ...(quoteData?.transaction.gas ? { gas: BigInt(quoteData.transaction.gas) } : {}),
          ...(quoteData.transaction.value ? { value: BigInt(quoteData.transaction.value) } : {}),
        };

        // Send transaction
        const txHash = await walletProvider.sendTransaction(txParams);
        const receipt = await walletProvider.waitForTransactionReceipt(txHash);
        if (receipt.status !== "complete" && receipt.status !== "success") {
          return JSON.stringify({
            success: false,
            ...(approvalTxHash ? { approvalTxHash } : {}),
            transactionHash: receipt.transactionHash,
            error: `Swap transaction failed`,
          });
        }

        // Format the response
        const formattedResponse = {
          success: true,
          ...(approvalTxHash ? { approvalTxHash } : {}),
          transactionHash: receipt.transactionHash,
          sellAmount: formatUnits(BigInt(sellAmount), sellTokenDecimals),
          sellTokenName: sellTokenName,
          sellToken: args.sellToken,
          buyAmount: formatUnits(quoteData.buyAmount, buyTokenDecimals),
          minBuyAmount: quoteData.minBuyAmount
            ? formatUnits(quoteData.minBuyAmount, buyTokenDecimals)
            : null,
          buyTokenName: buyTokenName,
          buyToken: args.buyToken,
          slippageBps: args.slippageBps,
          network: network.networkId,
        };

        return JSON.stringify(formattedResponse);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: `Error sending swap transaction: ${error}`,
          ...(approvalTxHash ? { approvalTxHash } : {}),
        });
      }
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Error executing swap: ${error}`,
      });
    }
  }

  /**
   * Checks if the ZeroX action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the ZeroX action provider supports the network, false otherwise.
   */
  supportsNetwork = (network: Network) => network.protocolFamily === "evm";
}

/**
 * Creates a new ZeroXActionProvider with the provided configuration.
 *
 * @param config - Optional configuration for the provider.
 * @returns A new ZeroXActionProvider.
 */
export const zeroXActionProvider = (config: ZeroXActionProviderConfig) =>
  new ZeroXActionProvider(config);
