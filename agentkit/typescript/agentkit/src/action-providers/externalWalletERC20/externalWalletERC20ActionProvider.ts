import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { CreateAction } from "../actionDecorator";
import { GetBalanceSchema, PrepareTransferSchema } from "./schemas";
import { TransactionPrepared } from "./types";
import { getTokenDetails } from "../erc20/utils";
import { encodeFunctionData, Hex, getAddress, erc20Abi, parseUnits } from "viem";
import { EvmWalletProvider } from "../../wallet-providers";

/**
 * ExternalWalletERC20ActionProvider is an action provider for ERC20 tokens
 * that prepares transactions for external wallet approval instead of executing them.
 *
 * This provider is designed for scenarios where users sign transactions with their own wallets
 * (e.g., browser wallet, mobile wallet) rather than having the agent execute transactions.
 */
export class ExternalWalletERC20ActionProvider extends ActionProvider<EvmWalletProvider> {
  /**
   * Constructor for the ExternalWalletERC20ActionProvider.
   */
  constructor() {
    super("external_wallet_erc20", []);
  }

  /**
   * Gets the balance of an ERC20 token for a user's wallet address.
   *
   * @param walletProvider - The wallet provider (used only for RPC access).
   * @param args - The input arguments for the action.
   * @returns A message containing the balance.
   */
  @CreateAction({
    name: "get_erc20_balance",
    description: `
    This tool gets the balance of an ERC20 token for a specific wallet address.
    It takes the following inputs:
    - tokenAddress: The contract address of the token to check
    - address: The wallet address to check the balance for
    
    Important notes:
    - The address parameter must be the user's wallet address
    - Never assume token addresses, they must be provided as inputs
    `,
    schema: GetBalanceSchema,
  })
  async getBalance(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetBalanceSchema>,
  ): Promise<string> {
    const tokenDetails = await getTokenDetails(walletProvider, args.tokenAddress, args.address);

    if (!tokenDetails) {
      return `Error: Could not fetch token details for ${args.tokenAddress}. Please verify the token address is correct.`;
    }

    return `Balance of ${tokenDetails.name} (${args.tokenAddress}) at address ${args.address} is ${tokenDetails.formattedBalance}`;
  }

  /**
   * Prepares an ERC20 transfer transaction for user approval.
   * Returns a JSON string with transaction data that must be parsed and converted
   * to WalletSendCalls format by the chatbot.
   *
   * @param walletProvider - The wallet provider (used only for RPC access).
   * @param args - The input arguments for the action.
   * @returns A JSON string containing the prepared transaction data.
   */
  @CreateAction({
    name: "prepare_erc20_transfer",
    description: `
    This tool prepares an ERC20 token transfer transaction for the user to approve with their wallet.
    
    It takes the following inputs:
    - amount: The amount to transfer in whole units (e.g. 10.5 USDC)
    - tokenAddress: The contract address of the token to transfer
    - destinationAddress: The address to send the funds to
    - userAddress: The user's wallet address that will sign the transaction
    
    Important notes:
    - This does NOT execute the transaction - it only prepares it
    - The user must approve the transaction in their own wallet
    - Always verify the user has sufficient balance before preparing
    - Never assume token addresses, they must be provided as inputs
    `,
    schema: PrepareTransferSchema,
  })
  async prepareTransfer(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof PrepareTransferSchema>,
  ): Promise<string> {
    try {
      // Validate and normalize token address
      const tokenAddress = getAddress(args.tokenAddress);

      // Get token details for validation and better error messages
      const tokenDetails = await getTokenDetails(
        walletProvider,
        args.tokenAddress,
        args.userAddress,
      );

      if (!tokenDetails) {
        return `Error: Could not fetch token details for ${args.tokenAddress}. Please verify the token address is correct.`;
      }

      // Convert amount to token units using correct decimals
      const amountInUnits = parseUnits(String(args.amount), tokenDetails.decimals);

      // Check if user has sufficient balance
      if (tokenDetails.balance < amountInUnits) {
        return `Error: Insufficient ${tokenDetails.name} balance. User has ${tokenDetails.formattedBalance} ${tokenDetails.name}, but trying to send ${args.amount} ${tokenDetails.name}.`;
      }

      // Guardrails to prevent loss of funds
      if (args.tokenAddress.toLowerCase() === args.destinationAddress.toLowerCase()) {
        return "Error: Transfer destination is the token contract address. Refusing to prepare transaction to prevent loss of funds.";
      }

      // Check if destination is a contract
      const destinationCode = await walletProvider.getPublicClient().getCode({
        address: args.destinationAddress as Hex,
      });

      if (destinationCode && destinationCode !== "0x") {
        // Check if it's an ERC20 token contract
        const destTokenDetails = await getTokenDetails(
          walletProvider,
          args.destinationAddress,
          args.userAddress,
        );
        if (destTokenDetails) {
          return "Error: Transfer destination is an ERC20 token contract. Refusing to prepare transaction to prevent loss of funds.";
        }
        // If it's a contract but not an ERC20 token (e.g., a smart wallet), allow it
      }

      // Encode the transfer function call
      const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [args.destinationAddress as Hex, amountInUnits],
      });

      // Return structured response that will be parsed by the chatbot
      const response: TransactionPrepared = {
        type: "TRANSACTION_PREPARED",
        description: `Transfer ${args.amount} ${tokenDetails.name} to ${args.destinationAddress}`,
        calls: [
          {
            to: tokenAddress,
            data: transferData,
            value: "0",
          },
        ],
        metadata: {
          tokenAddress,
          amount: args.amount,
          destinationAddress: args.destinationAddress,
          tokenName: tokenDetails.name,
          tokenDecimals: tokenDetails.decimals,
        },
      };

      return JSON.stringify(response);
    } catch (error) {
      return `Error preparing transfer: ${error}`;
    }
  }

  /**
   * Checks if the external wallet ERC20 action provider supports the given network.
   *
   * @param network - The network to check.
   * @returns True if the provider supports the network, false otherwise.
   */
  supportsNetwork = (network: Network) => network.protocolFamily === "evm";
}

export const externalWalletERC20ActionProvider = () => new ExternalWalletERC20ActionProvider();

