import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { CreateAction } from "../actionDecorator";
import {
  HttpRequestSchema,
  RetryWithX402Schema,
  DirectX402RequestSchema,
  ListX402ServicesSchema,
} from "./schemas";
import { EvmWalletProvider, WalletProvider, SvmWalletProvider } from "../../wallet-providers";
import axios, { AxiosError } from "axios";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import { PaymentRequirements } from "x402/types";
import { useFacilitator } from "x402/verify";
import { facilitator } from "@coinbase/x402";
import {
  getX402Network,
  handleHttpError,
  formatPaymentOption,
  convertWholeUnitsToAtomic,
  isUsdcAsset,
} from "./utils";

const SUPPORTED_NETWORKS = ["base-mainnet", "base-sepolia", "solana-mainnet", "solana-devnet"];

/**
 * X402ActionProvider provides actions for making HTTP requests, with optional x402 payment handling.
 */
export class X402ActionProvider extends ActionProvider<WalletProvider> {
  /**
   * Creates a new instance of X402ActionProvider.
   * Initializes the provider with x402 capabilities.
   */
  constructor() {
    super("x402", []);
  }

  /**
   * Discovers available x402 services with optional filtering.
   *
   * @param walletProvider - The wallet provider to use for network filtering
   * @param args - Optional filters: maxUsdcPrice
   * @returns JSON string with the list of services (filtered by network and description)
   */
  @CreateAction({
    name: "discover_x402_services",
    description:
      "Discover available x402 services. Only services available on the current network will be returned. Optionally filter by a maximum price in whole units of USDC (only USDC payment options will be considered when filter is applied).",
    schema: ListX402ServicesSchema,
  })
  async discoverX402Services(
    walletProvider: WalletProvider,
    args: z.infer<typeof ListX402ServicesSchema>,
  ): Promise<string> {
    try {
      const { list } = useFacilitator(facilitator);
      const services = await list();
      if (!services || !services.items) {
        return JSON.stringify({
          error: true,
          message: "No services found",
        });
      }

      // Get the current wallet network
      const walletNetwork = getX402Network(walletProvider.getNetwork());

      // Filter services by network, description, and optional USDC price
      const hasValidMaxUsdcPrice =
        typeof args.maxUsdcPrice === "number" &&
        Number.isFinite(args.maxUsdcPrice) &&
        args.maxUsdcPrice > 0;

      const filteredServices = services.items.filter(item => {
        // Filter by network - only include services that accept the current wallet network
        const accepts = Array.isArray(item.accepts) ? item.accepts : [];
        const hasMatchingNetwork = accepts.some(req => req.network === walletNetwork);

        // Filter out services with empty or default descriptions
        const hasDescription = accepts.some(
          req =>
            req.description &&
            req.description.trim() !== "" &&
            req.description.trim() !== "Access to protected content",
        );

        return hasMatchingNetwork && hasDescription;
      });

      // Apply USDC price filtering if maxUsdcPrice is provided (only consider USDC assets)
      let priceFilteredServices = filteredServices;
      if (hasValidMaxUsdcPrice) {
        priceFilteredServices = [];
        for (const item of filteredServices) {
          const accepts = Array.isArray(item.accepts) ? item.accepts : [];
          let shouldInclude = false;

          for (const req of accepts) {
            if (req.network === walletNetwork && req.asset && req.maxAmountRequired) {
              // Only consider USDC assets when maxUsdcPrice filter is applied
              if (isUsdcAsset(req.asset, walletProvider)) {
                try {
                  const maxUsdcPriceAtomic = await convertWholeUnitsToAtomic(
                    args.maxUsdcPrice as number,
                    req.asset,
                    walletProvider,
                  );
                  if (maxUsdcPriceAtomic) {
                    const requirement = BigInt(req.maxAmountRequired);
                    const maxUsdcPriceAtomicBigInt = BigInt(maxUsdcPriceAtomic);
                    if (requirement <= maxUsdcPriceAtomicBigInt) {
                      shouldInclude = true;
                      break;
                    }
                  }
                } catch {
                  // If conversion fails, skip this requirement
                  continue;
                }
              }
            }
          }

          if (shouldInclude) {
            priceFilteredServices.push(item);
          }
        }
      }

      // Format the filtered services
      const filtered = await Promise.all(
        priceFilteredServices.map(async item => {
          const accepts = Array.isArray(item.accepts) ? item.accepts : [];
          const matchingAccept = accepts.find(req => req.network === walletNetwork);

          // Format amount if available
          let formattedMaxAmount = matchingAccept?.maxAmountRequired;
          if (matchingAccept?.maxAmountRequired && matchingAccept?.asset) {
            formattedMaxAmount = await formatPaymentOption(
              {
                asset: matchingAccept.asset,
                maxAmountRequired: matchingAccept.maxAmountRequired,
                network: matchingAccept.network,
              },
              walletProvider,
            );
          }

          return {
            resource: item.resource,
            description: matchingAccept?.description || "",
            cost: formattedMaxAmount,
            ...(matchingAccept?.outputSchema?.input && {
              input: matchingAccept.outputSchema.input,
            }),
            ...(matchingAccept?.outputSchema?.output && {
              output: matchingAccept.outputSchema.output,
            }),
            ...(item.metadata && item.metadata.length > 0 && { metadata: item.metadata }),
          };
        }),
      );

      return JSON.stringify(
        {
          success: true,
          walletNetwork,
          total: services.items.length,
          returned: filtered.length,
          items: filtered,
        },
        null,
        2,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return JSON.stringify(
        {
          error: true,
          message: "Failed to list x402 services",
          details: message,
        },
        null,
        2,
      );
    }
  }

  /**
   * Makes a basic HTTP request to an API endpoint.
   *
   * @param walletProvider - The wallet provider to use for potential payments
   * @param args - The request parameters including URL, method, headers, and body
   * @returns A JSON string containing the response or error details
   */
  @CreateAction({
    name: "make_http_request",
    description: `
Makes a basic HTTP request to an API endpoint. If the endpoint requires payment (returns 402),
it will return payment details that can be used with retry_http_request_with_x402.

EXAMPLES:
- Production API: make_http_request("https://api.example.com/weather")
- Local development: make_http_request("http://localhost:3000/api/data")
- Testing x402: make_http_request("http://localhost:3000/protected")

If you receive a 402 Payment Required response, use retry_http_request_with_x402 to handle the payment.`,
    schema: HttpRequestSchema,
  })
  async makeHttpRequest(
    walletProvider: WalletProvider,
    args: z.infer<typeof HttpRequestSchema>,
  ): Promise<string> {
    try {
      const response = await axios.request({
        url: args.url,
        method: args.method ?? "GET",
        headers: args.headers ?? undefined,
        data: args.body,
        validateStatus: status => status === 402 || (status >= 200 && status < 300),
      });

      if (response.status !== 402) {
        return JSON.stringify(
          {
            success: true,
            url: args.url,
            method: args.method,
            status: response.status,
            data: response.data,
          },
          null,
          2,
        );
      }

      // Check if wallet network matches any available payment options
      const walletNetwork = getX402Network(walletProvider.getNetwork());
      const availableNetworks = response.data.accepts.map(option => option.network);
      const hasMatchingNetwork = availableNetworks.includes(walletNetwork);

      let paymentOptionsText = `The wallet network ${walletNetwork} does not match any available payment options (${availableNetworks.join(", ")}).`;
      // Format payment options for matching networks
      if (hasMatchingNetwork) {
        const matchingOptions = response.data.accepts.filter(
          option => option.network === walletNetwork,
        );
        const formattedOptions = await Promise.all(
          matchingOptions.map(option => formatPaymentOption(option, walletProvider)),
        );
        paymentOptionsText = `The payment options are: ${formattedOptions.join(", ")}`;
      }

      return JSON.stringify({
        status: "error_402_payment_required",
        acceptablePaymentOptions: response.data.accepts,
        nextSteps: [
          "Inform the user that the requested server replied with a 402 Payment Required response.",
          paymentOptionsText,
          hasMatchingNetwork ? "Ask the user if they want to retry the request with payment." : "",
          hasMatchingNetwork
            ? `Use retry_http_request_with_x402 to retry the request with payment.`
            : "",
        ],
      });
    } catch (error) {
      return handleHttpError(error as AxiosError, args.url);
    }
  }

  /**
   * Retries a request with x402 payment after receiving a 402 response.
   *
   * @param walletProvider - The wallet provider to use for making the payment
   * @param args - The request parameters including URL, method, headers, body, and payment option
   * @returns A JSON string containing the response with payment details or error information
   */
  @CreateAction({
    name: "retry_http_request_with_x402",
    description: `
Retries an HTTP request with x402 payment after receiving a 402 Payment Required response.
This should be used after make_http_request returns a 402 response.

EXAMPLE WORKFLOW:
1. First call make_http_request("http://localhost:3000/protected")
2. If you get a 402 response, use this action to retry with payment
3. Pass the entire original response to this action

DO NOT use this action directly without first trying make_http_request!`,
    schema: RetryWithX402Schema,
  })
  async retryWithX402(
    walletProvider: WalletProvider,
    args: z.infer<typeof RetryWithX402Schema>,
  ): Promise<string> {
    try {
      // Check network compatibility before attempting payment
      const walletNetwork = getX402Network(walletProvider.getNetwork());
      const selectedNetwork = args.selectedPaymentOption.network;

      if (walletNetwork !== selectedNetwork) {
        return JSON.stringify(
          {
            error: true,
            message: "Network mismatch",
            details: `Wallet is on ${walletNetwork} but payment requires ${selectedNetwork}`,
          },
          null,
          2,
        );
      }

      // Check if wallet provider is supported
      if (
        !(
          walletProvider instanceof SvmWalletProvider || walletProvider instanceof EvmWalletProvider
        )
      ) {
        return JSON.stringify(
          {
            error: true,
            message: "Unsupported wallet provider",
            details: "Only SvmWalletProvider and EvmWalletProvider are supported",
          },
          null,
          2,
        );
      }

      // Make the request with payment handling
      const account = await walletProvider.toSigner();

      const paymentSelector = (accepts: PaymentRequirements[]) => {
        const { scheme, network, maxAmountRequired, asset } = args.selectedPaymentOption;

        let paymentRequirements = accepts.find(
          accept =>
            accept.scheme === scheme &&
            accept.network === network &&
            accept.maxAmountRequired <= maxAmountRequired &&
            accept.asset === asset,
        );
        if (paymentRequirements) {
          return paymentRequirements;
        }

        paymentRequirements = accepts.find(
          accept =>
            accept.scheme === scheme &&
            accept.network === network &&
            accept.maxAmountRequired <= maxAmountRequired &&
            accept.asset === asset,
        );
        if (paymentRequirements) {
          return paymentRequirements;
        }

        return accepts[0];
      };

      const api = withPaymentInterceptor(
        axios.create({}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account as any,
        paymentSelector as unknown as Parameters<typeof withPaymentInterceptor>[2],
      );

      const response = await api.request({
        url: args.url,
        method: args.method ?? "GET",
        headers: args.headers ?? undefined,
        data: args.body,
      });

      // Check for payment proof
      const paymentProof = response.headers["x-payment-response"]
        ? decodeXPaymentResponse(response.headers["x-payment-response"])
        : null;

      return JSON.stringify({
        status: "success",
        data: response.data,
        message: "Request completed successfully with payment",
        details: {
          url: args.url,
          method: args.method,
          paymentUsed: {
            network: args.selectedPaymentOption.network,
            asset: args.selectedPaymentOption.asset,
            amount: args.selectedPaymentOption.maxAmountRequired,
          },
          paymentProof: paymentProof
            ? {
                transaction: paymentProof.transaction,
                network: paymentProof.network,
                payer: paymentProof.payer,
              }
            : null,
        },
      });
    } catch (error) {
      return handleHttpError(error as AxiosError, args.url);
    }
  }

  /**
   * Makes an HTTP request with automatic x402 payment handling.
   *
   * @param walletProvider - The wallet provider to use for automatic payments
   * @param args - The request parameters including URL, method, headers, and body
   * @returns A JSON string containing the response with optional payment details or error information
   */
  @CreateAction({
    name: "make_http_request_with_x402",
    description: `
⚠️ WARNING: This action automatically handles payments without asking for confirmation!
Only use this when explicitly told to skip the confirmation flow.

For most cases, you should:
1. First try make_http_request
2. Then use retry_http_request_with_x402 if payment is required

This action combines both steps into one, which means:
- No chance to review payment details before paying
- No confirmation step
- Automatic payment processing
- Assumes payment option is compatible with wallet network

EXAMPLES:
- Production: make_http_request_with_x402("https://api.example.com/data")
- Local dev: make_http_request_with_x402("http://localhost:3000/protected")

Unless specifically instructed otherwise, prefer the two-step approach with make_http_request first.`,
    schema: DirectX402RequestSchema,
  })
  async makeHttpRequestWithX402(
    walletProvider: WalletProvider,
    args: z.infer<typeof DirectX402RequestSchema>,
  ): Promise<string> {
    try {
      if (
        !(
          walletProvider instanceof SvmWalletProvider || walletProvider instanceof EvmWalletProvider
        )
      ) {
        return JSON.stringify(
          {
            error: true,
            message: "Unsupported wallet provider",
            details: "Only SvmWalletProvider and EvmWalletProvider are supported",
          },
          null,
          2,
        );
      }
      const account = await walletProvider.toSigner();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const api = withPaymentInterceptor(axios.create({}), account as any);

      const response = await api.request({
        url: args.url,
        method: args.method ?? "GET",
        headers: args.headers ?? undefined,
        data: args.body,
      });

      // Check for payment proof
      const paymentProof = response.headers["x-payment-response"]
        ? decodeXPaymentResponse(response.headers["x-payment-response"])
        : null;

      return JSON.stringify(
        {
          success: true,
          message: "Request completed successfully (payment handled automatically if required)",
          url: args.url,
          method: args.method,
          status: response.status,
          data: response.data,
          paymentProof: paymentProof
            ? {
                transaction: paymentProof.transaction,
                network: paymentProof.network,
                payer: paymentProof.payer,
              }
            : null,
        },
        null,
        2,
      );
    } catch (error) {
      return handleHttpError(error as AxiosError, args.url);
    }
  }

  /**
   * Checks if the action provider supports the given network.
   *
   * @param network - The network to check support for
   * @returns True if the network is supported, false otherwise
   */
  supportsNetwork = (network: Network) => SUPPORTED_NETWORKS.includes(network.networkId!);
}

export const x402ActionProvider = () => new X402ActionProvider();
