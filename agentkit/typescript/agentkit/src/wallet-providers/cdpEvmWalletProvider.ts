import { CdpClient, EvmServerAccount } from "@coinbase/cdp-sdk";
import {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  createPublicClient,
  Hex,
  http,
  PublicClient,
  ReadContractParameters,
  ReadContractReturnType,
  serializeTransaction,
  TransactionRequest,
  TransactionSerializable,
} from "viem";
import { Network, NETWORK_ID_TO_CHAIN_ID, NETWORK_ID_TO_VIEM_CHAIN } from "../network";
import { EvmWalletProvider } from "./evmWalletProvider";
import { WalletProviderWithClient, CdpWalletProviderConfig } from "./cdpShared";

/**
 * Supported network types for CDP SDK EVM transactions
 */
type CdpEvmNetwork =
  | "base"
  | "base-sepolia"
  | "ethereum"
  | "ethereum-sepolia"
  | "polygon"
  | "arbitrum"
  | "optimism";

interface ConfigureCdpEvmWalletProviderWithWalletOptions {
  /**
   * The CDP client of the wallet.
   */
  cdp: CdpClient;

  /**
   * The server account of the wallet.
   */
  serverAccount: EvmServerAccount;

  /**
   * The public client of the wallet.
   */
  publicClient: PublicClient;

  /**
   * The network of the wallet.
   */
  network: Network;
}

/**
 * A wallet provider that uses the Coinbase SDK.
 */
export class CdpEvmWalletProvider extends EvmWalletProvider implements WalletProviderWithClient {
  #publicClient: PublicClient;
  #serverAccount: EvmServerAccount;
  #cdp: CdpClient;
  #network: Network;

  /**
   * Constructs a new CdpEvmWalletProvider.
   *
   * @param config - The configuration options for the CdpEvmWalletProvider.
   */
  private constructor(config: ConfigureCdpEvmWalletProviderWithWalletOptions) {
    super();

    this.#serverAccount = config.serverAccount;
    this.#cdp = config.cdp;
    this.#publicClient = config.publicClient;
    this.#network = config.network;
  }

  /**
   * Configures a new CdpEvmWalletProvider with a wallet.
   *
   * @param config - Optional configuration parameters
   * @returns A Promise that resolves to a new CdpEvmWalletProvider instance
   * @throws Error if required environment variables are missing or wallet initialization fails
   */
  public static async configureWithWallet(
    config: CdpWalletProviderConfig = {},
  ): Promise<CdpEvmWalletProvider> {
    const apiKeyId = config.apiKeyId || process.env.CDP_API_KEY_ID;
    const apiKeySecret = config.apiKeySecret || process.env.CDP_API_KEY_SECRET;
    const walletSecret = config.walletSecret || process.env.CDP_WALLET_SECRET;
    const idempotencyKey = config.idempotencyKey || process.env.IDEMPOTENCY_KEY;

    if (!apiKeyId || !apiKeySecret || !walletSecret) {
      throw new Error(
        "Missing required environment variables. CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET are required.",
      );
    }

    const networkId: string = config.networkId || process.env.NETWORK_ID || "base-sepolia";
    const network = {
      protocolFamily: "evm" as const,
      chainId: NETWORK_ID_TO_CHAIN_ID[networkId],
      networkId: networkId,
    };

    const cdpClient = new CdpClient({
      apiKeyId,
      apiKeySecret,
      walletSecret,
    });

    const serverAccount = await (config.address
      ? cdpClient.evm.getAccount({ address: config.address as Address })
      : cdpClient.evm.createAccount({ idempotencyKey }));

    const rpcUrl = config.rpcUrl || process.env.RPC_URL;
    const publicClient = createPublicClient({
      chain: NETWORK_ID_TO_VIEM_CHAIN[networkId],
      transport: rpcUrl ? http(rpcUrl) : http(),
    });

    return new CdpEvmWalletProvider({
      publicClient,
      cdp: cdpClient,
      serverAccount,
      network,
    });
  }

  /**
   * Exports the wallet.
   *
   * @returns The wallet's data.
   */
  async exportWallet(): Promise<{ name: string | undefined; address: `0x${string}` }> {
    return {
      name: this.#serverAccount.name,
      address: this.#serverAccount.address as `0x${string}`,
    };
  }

  /**
   * Signs a raw hash.
   *
   * @param hash - The hash to sign.
   * @returns The signed hash.
   */
  async sign(hash: `0x${string}`): Promise<Hex> {
    return this.#serverAccount.sign({ hash });
  }

  /**
   * Signs a message.
   *
   * @param message - The message to sign.
   * @returns The signed message.
   */
  async signMessage(message: string): Promise<Hex> {
    return this.#serverAccount.signMessage({ message });
  }

  /**
   * Signs a typed data object.
   *
   * @param typedData - The typed data object to sign.
   * @returns The signed typed data object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async signTypedData(typedData: any): Promise<Hex> {
    return this.#serverAccount.signTypedData(typedData);
  }

  /**
   * Signs a transaction.
   *
   * @param transaction - The transaction to sign.
   * @returns The signed transaction.
   */
  async signTransaction(transaction: TransactionRequest): Promise<Hex> {
    const serializedTx = serializeTransaction(transaction as TransactionSerializable);
    const signedTx = await this.#cdp.evm.signTransaction({
      address: this.#serverAccount.address,
      transaction: serializedTx,
    });

    return signedTx.signature;
  }

  /**
   * Sends a transaction.
   *
   * @param transaction - The transaction to send.
   * @returns The hash of the transaction.
   */
  async sendTransaction(transaction: TransactionRequest): Promise<Hex> {
    const result = await this.#cdp.evm.sendTransaction({
      address: this.#serverAccount.address,
      transaction: {
        to: transaction.to as Address,
        value: transaction.value ? BigInt(transaction.value.toString()) : 0n,
        data: (transaction.data as Hex) || "0x",
      },
      network: this.getCdpSdkNetwork(),
    });
    return result.transactionHash;
  }

  /**
   * Gets the address of the wallet.
   *
   * @returns The address of the wallet.
   */
  getAddress(): string {
    return this.#serverAccount.address;
  }

  /**
   * Gets the network of the wallet.
   *
   * @returns The network of the wallet.
   */
  getNetwork(): Network {
    return this.#network;
  }

  /**
   * Gets the name of the wallet provider.
   *
   * @returns The name of the wallet provider.
   */
  getName(): string {
    return "cdp_evm_wallet_provider";
  }

  /**
   * Gets the CDP client.
   *
   * @returns The CDP client.
   */
  getClient(): CdpClient {
    return this.#cdp;
  }

  /**
   * Gets the Viem PublicClient used for read-only operations.
   *
   * @returns The Viem PublicClient instance used for read-only operations.
   */
  getPublicClient(): PublicClient {
    return this.#publicClient;
  }

  /**
   * Gets the balance of the wallet.
   *
   * @returns The balance of the wallet in wei
   */
  async getBalance(): Promise<bigint> {
    return await this.#publicClient.getBalance({ address: this.#serverAccount.address });
  }

  /**
   * Waits for a transaction receipt.
   *
   * @param txHash - The hash of the transaction to wait for.
   * @returns The transaction receipt.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async waitForTransactionReceipt(txHash: Hex): Promise<any> {
    return await this.#publicClient.waitForTransactionReceipt({ hash: txHash });
  }

  /**
   * Reads a contract.
   *
   * @param params - The parameters to read the contract.
   * @returns The response from the contract.
   */
  async readContract<
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, "pure" | "view">,
    const args extends ContractFunctionArgs<abi, "pure" | "view", functionName>,
  >(
    params: ReadContractParameters<abi, functionName, args>,
  ): Promise<ReadContractReturnType<abi, functionName, args>> {
    return this.#publicClient.readContract<abi, functionName, args>(params);
  }

  /**
   * Transfer the native asset of the network.
   *
   * @param to - The destination address.
   * @param value - The amount to transfer in atomic units (Wei).
   * @returns The transaction hash.
   */
  async nativeTransfer(to: Address, value: string): Promise<Hex> {
    return this.sendTransaction({
      to: to,
      value: BigInt(value),
      data: "0x",
    });
  }

  /**
   * Converts the internal network ID to the format expected by the CDP SDK.
   *
   * @returns The network ID in CDP SDK format
   * @throws Error if the network is not supported
   */
  getCdpSdkNetwork(): CdpEvmNetwork {
    switch (this.#network.networkId) {
      case "base-sepolia":
        return "base-sepolia";
      case "base-mainnet":
        return "base";
      case "ethereum-mainnet":
        return "ethereum";
      case "ethereum-sepolia":
        return "ethereum-sepolia";
      case "polygon-mainnet":
        return "polygon";
      case "arbitrum-mainnet":
        return "arbitrum";
      case "optimism-mainnet":
        return "optimism";
      default:
        throw new Error(`Unsupported network for CDP SDK: ${this.#network.networkId}`);
    }
  }
}
