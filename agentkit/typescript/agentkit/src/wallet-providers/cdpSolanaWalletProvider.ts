import { CdpClient } from "@coinbase/cdp-sdk";
import type { KeyPairSigner } from "@solana/kit";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  MessageV0,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  SignatureStatus,
  SignatureStatusConfig,
  SystemProgram,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { Network } from "../network";
import {
  SOLANA_DEVNET_NETWORK,
  SOLANA_DEVNET_NETWORK_ID,
  SOLANA_MAINNET_NETWORK,
  SOLANA_MAINNET_NETWORK_ID,
  SOLANA_TESTNET_NETWORK,
  SOLANA_TESTNET_NETWORK_ID,
} from "../network/svm";
import { WalletProviderWithClient, CdpWalletProviderConfig } from "./cdpShared";
import { SvmWalletProvider, createSignerFromBytes } from "./svmWalletProvider";

interface ConfigureCdpSolanaWalletProviderWithWalletOptions {
  /**
   * The CDP client of the wallet.
   */
  cdp: CdpClient;

  /**
   * The server account of the wallet.
   */
  serverAccount: Awaited<ReturnType<typeof CdpClient.prototype.solana.createAccount>>;

  /**
   * The public client of the wallet.
   */
  connection: Connection;

  /**
   * The network of the wallet.
   */
  network: Network;
}

/**
 * A wallet provider that uses the Coinbase SDK.
 */
export class CdpSolanaWalletProvider extends SvmWalletProvider implements WalletProviderWithClient {
  #connection: Connection;
  #cdp: CdpClient;
  #network: Network;
  #serverAccount: Awaited<ReturnType<typeof CdpClient.prototype.solana.createAccount>>;

  /**
   * Constructs a new CdpSolanaWalletProvider.
   *
   * @param config - The configuration options for the CdpSolanaWalletProvider.
   */
  private constructor(config: ConfigureCdpSolanaWalletProviderWithWalletOptions) {
    super();

    this.#serverAccount = config.serverAccount;
    this.#cdp = config.cdp;
    this.#connection = config.connection;
    this.#network = config.network;
  }

  /**
   * Configures a new CdpSolanaWalletProvider with a wallet.
   *
   * @param config - Optional configuration parameters
   * @returns A Promise that resolves to a new CdpSolanaWalletProvider instance
   * @throws Error if required environment variables are missing or wallet initialization fails
   */
  public static async configureWithWallet(
    config: CdpWalletProviderConfig = {},
  ): Promise<CdpSolanaWalletProvider> {
    const apiKeyId = config.apiKeyId || process.env.CDP_API_KEY_ID;
    const apiKeySecret = config.apiKeySecret || process.env.CDP_API_KEY_SECRET;
    const walletSecret = config.walletSecret || process.env.CDP_WALLET_SECRET;
    const idempotencyKey = config.idempotencyKey || process.env.IDEMPOTENCY_KEY;

    if (!apiKeyId || !apiKeySecret || !walletSecret) {
      throw new Error(
        "Missing required environment variables. CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET are required.",
      );
    }

    const networkId: string = config.networkId || process.env.NETWORK_ID || "solana-devnet";

    let network: Network;
    let rpcUrl: string;
    switch (networkId) {
      case SOLANA_MAINNET_NETWORK_ID:
        network = SOLANA_MAINNET_NETWORK;
        rpcUrl = clusterApiUrl("mainnet-beta");
        break;
      case SOLANA_DEVNET_NETWORK_ID:
        network = SOLANA_DEVNET_NETWORK;
        rpcUrl = clusterApiUrl("devnet");
        break;
      case SOLANA_TESTNET_NETWORK_ID:
        network = SOLANA_TESTNET_NETWORK;
        rpcUrl = clusterApiUrl("testnet");
        break;
      default:
        throw new Error(`${networkId} is not a valid SVM networkId`);
    }

    const cdpClient = new CdpClient({
      apiKeyId,
      apiKeySecret,
      walletSecret,
    });

    const connection = new Connection(rpcUrl);

    const serverAccount = await (config.address
      ? cdpClient.solana.getAccount({ address: config.address })
      : cdpClient.solana.createAccount({ idempotencyKey }));

    return new CdpSolanaWalletProvider({
      connection,
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
   * Get the connection instance
   *
   * @returns The Solana connection instance
   */
  getConnection(): Connection {
    return this.#connection;
  }

  /**
   * Get the public key of the wallet
   *
   * @returns The wallet's public key
   */
  getPublicKey(): PublicKey {
    return new PublicKey(this.#serverAccount.address);
  }

  /**
   * Get the address of the wallet
   *
   * @returns The base58 encoded address of the wallet
   */
  getAddress(): string {
    return this.#serverAccount.address;
  }

  /**
   * Get the network
   *
   * @returns The network
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
    return "cdp_solana_wallet_provider";
  }

  /**
   * Sign a transaction
   *
   * @param transaction - The transaction to sign
   * @returns The signed transaction
   */
  async signTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction> {
    const serializedTransaction = transaction.serialize();
    const encodedSerializedTransaction = Buffer.from(serializedTransaction).toString("base64");

    const signedTransactionResponse = await this.#cdp.solana.signTransaction({
      transaction: encodedSerializedTransaction,
      address: this.#serverAccount.address,
    });

    const signedTransactionBytes = Buffer.from(
      signedTransactionResponse.signedTransaction,
      "base64",
    );
    const signedTransaction = VersionedTransaction.deserialize(signedTransactionBytes);

    return signedTransaction;
  }

  /**
   * Send a transaction
   *
   * @param transaction - The transaction to send
   * @returns The signature
   */
  async sendTransaction(transaction: VersionedTransaction): Promise<string> {
    const signature = await this.#connection.sendTransaction(transaction);
    await this.waitForSignatureResult(signature);
    return signature;
  }

  /**
   * Sign and send a transaction
   *
   * @param transaction - The transaction to sign and send
   * @returns The signature
   */
  async signAndSendTransaction(transaction: VersionedTransaction): Promise<string> {
    const signedTransaction = await this.signTransaction(transaction);
    return this.sendTransaction(signedTransaction);
  }

  /**
   * Get the status of a transaction
   *
   * @param signature - The signature
   * @param options - The options for the status
   * @returns The status
   */
  async getSignatureStatus(
    signature: string,
    options?: SignatureStatusConfig,
  ): Promise<RpcResponseAndContext<SignatureStatus | null>> {
    return this.#connection.getSignatureStatus(signature, options);
  }

  /**
   * Wait for signature receipt
   *
   * @param signature - The signature
   * @returns The confirmation response
   */
  async waitForSignatureResult(signature: string): Promise<RpcResponseAndContext<SignatureResult>> {
    const { blockhash, lastValidBlockHeight } = await this.#connection.getLatestBlockhash();
    return this.#connection.confirmTransaction({
      signature: signature,
      lastValidBlockHeight,
      blockhash,
    });
  }

  /**
   * Get the balance of the wallet
   *
   * @returns The balance of the wallet
   */
  getBalance(): Promise<bigint> {
    return this.#connection.getBalance(this.getPublicKey()).then(balance => BigInt(balance));
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
   * Sign a message.
   *
   * @param message - The message to sign as a Uint8Array
   * @returns The signature as a Uint8Array
   */
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    // Convert Uint8Array to string for CDP SDK
    const messageString = Buffer.from(message).toString("utf8");

    const { signature } = await this.#cdp.solana.signMessage({
      address: this.#serverAccount.address,
      message: messageString,
    });

    // Convert signature string back to Uint8Array
    // CDP returns signature as a hex string, convert to bytes
    return new Uint8Array(Buffer.from(signature, "hex"));
  }

  /**
   * Transfer SOL from the wallet to another address
   *
   * @param to - The base58 encoded address to transfer the SOL to
   * @param value - The amount to transfer in atomic units (Lamports)
   * @returns The signature
   */
  async nativeTransfer(to: string, value: string): Promise<string> {
    const initialBalance = await this.getBalance();
    const lamports = BigInt(value);

    // Check if we have enough balance (including estimated fees)
    if (initialBalance < lamports + BigInt(5000)) {
      throw new Error(
        `Insufficient balance. Have ${Number(initialBalance)} lamports, need ${
          Number(lamports) + 5000
        } lamports (including fees)`,
      );
    }

    const toPubkey = new PublicKey(to);
    const instructions = [
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 10000,
      }),
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 2000,
      }),
      SystemProgram.transfer({
        fromPubkey: this.getPublicKey(),
        toPubkey: toPubkey,
        lamports: lamports,
      }),
    ];

    const tx = new VersionedTransaction(
      MessageV0.compile({
        payerKey: this.getPublicKey(),
        instructions: instructions,
        recentBlockhash: (await this.#connection.getLatestBlockhash()).blockhash,
      }),
    );

    const signature = await this.signAndSendTransaction(tx);
    await this.waitForSignatureResult(signature);

    return signature;
  }

  /**
   * Get the keypair signer for this wallet.
   *
   * @returns The KeyPairSigner
   */
  async getKeyPairSigner(): Promise<KeyPairSigner> {
    // Export the private key from CDP
    const exportedPrivateKey = await this.#cdp.solana.exportAccount({
      address: this.#serverAccount.address,
    });

    // Decode the base58 encoded private key to get the full 64-byte key
    const fullKeyBytes = bs58.decode(exportedPrivateKey);

    // Create and return the KeyPairSigner using the full key bytes
    return createSignerFromBytes(fullKeyBytes);
  }
}
