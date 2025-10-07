import { FlaunchActionProvider } from "./flaunchActionProvider";
import { Network } from "../../network";
import {
  FlaunchSchema,
  BuyCoinWithETHInputSchema,
  BuyCoinWithCoinInputSchema,
  SellCoinSchema,
} from "./schemas";
import { EvmWalletProvider } from "../../wallet-providers";
import { Hex } from "viem";
import { formatEther } from "viem";
import * as swapUtils from "./swap_utils";

// Mock the actual contract calls with Jest
jest.mock("viem", () => {
  const originalModule = jest.requireActual("viem");
  return {
    ...originalModule,
    createPublicClient: jest.fn().mockReturnValue({
      simulateContract: jest.fn().mockResolvedValue({
        result: [BigInt(1000000000000000000)],
      }),
    }),
    decodeEventLog: jest.fn().mockImplementation(() => {
      return {
        eventName: "PoolCreated",
        args: {
          _memecoin: "0x1234567890123456789012345678901234567890",
        },
      };
    }),
    parseEther: jest.fn().mockReturnValue(BigInt(100000000000000000)),
    parseUnits: jest.fn().mockReturnValue(BigInt(100000000000000000)),
    encodeAbiParameters: jest.fn().mockReturnValue("0xencoded"),
    encodeFunctionData: jest.fn().mockReturnValue("0xfunctiondata"),
    zeroAddress: "0x0000000000000000000000000000000000000000",
    zeroHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  };
});

// Mock the metadata_utils module
jest.mock("./metadata_utils", () => ({
  generateTokenUri: jest.fn().mockResolvedValue("ipfs://test-uri"),
}));

// Mock the client_utils module
jest.mock("./client_utils", () => ({
  ethRequiredToFlaunch: jest.fn().mockResolvedValue(BigInt(100000000000000000)),
  getMemecoinAddressFromReceipt: jest
    .fn()
    .mockReturnValue("0x1234567890123456789012345678901234567890"),
}));

// Mock the swap_utils module
jest.mock("./swap_utils", () => ({
  getAmountWithSlippage: jest.fn().mockImplementation(amount => amount),
  memecoinToEthWithPermit2: jest.fn().mockReturnValue({
    commands: "0x02",
    inputs: ["0x5678"],
  }),
  getSwapAmountsFromReceipt: jest.fn().mockImplementation(() => ({
    coinsBought: BigInt(1000000000000000000),
    ethSold: BigInt(100000000000000000),
    coinsSold: BigInt(1000000000000000000),
    ethBought: BigInt(100000000000000000),
  })),
  buyFlaunchCoin: jest
    .fn()
    .mockImplementation(
      async (walletProvider, coinAddress, _swapType, _amount, _slippagePercent) => {
        // Simulate the actual behavior by calling wallet provider methods
        walletProvider.getNetwork();
        const coinSymbol = await walletProvider.readContract({
          address: coinAddress,
          abi: [],
          functionName: "symbol",
        });

        const hash = await walletProvider.sendTransaction({
          to: coinAddress,
          data: "0x",
        });

        await walletProvider.waitForTransactionReceipt(hash);

        return `Bought ${formatEther(BigInt(1000000000000000000))} $${coinSymbol} for ${formatEther(BigInt(100000000000000000))} ETH`;
      },
    ),
}));

// Mock the constants used in the test
jest.mock("./constants", () => {
  const actualConstants = jest.requireActual("./constants");
  const baseSepolia = 84532; // Base Sepolia chain ID
  const baseMainnet = 8453; // Base Mainnet chain ID

  return {
    ...actualConstants,
    // Only override the address mappings
    FlaunchPositionManagerAddress: {
      "0x14a34": "0x9A7059cA00dA92843906Cb4bCa1D005cE848AFdC",
      [baseSepolia]: "0x9A7059cA00dA92843906Cb4bCa1D005cE848AFdC",
      [baseMainnet]: "0x51Bba15255406Cfe7099a42183302640ba7dAFDC",
    },
    FastFlaunchZapAddress: {
      "0x14a34": "0x251e97446a7019E5DA4860d4CF47291321C693D0",
      [baseSepolia]: "0x251e97446a7019E5DA4860d4CF47291321C693D0",
      [baseMainnet]: "0x0000000000000000000000000000000000000000",
    },
    FLETHHooksAddress: {
      ...actualConstants.FLETHHooksAddress,
      "0x14a34": "0x4bd2ca15286c96e4e731337de8b375da6841e888",
    },
    FLETHAddress: {
      ...actualConstants.FLETHAddress,
      "0x14a34": "0x79FC52701cD4BE6f9Ba9aDC94c207DE37e3314eb",
    },
    QuoterAddress: {
      ...actualConstants.QuoterAddress,
      "0x14a34": "0x4a6513c898fe1b2d0e78d3b0e0a4a151589b1cba",
    },
    UniversalRouterAddress: {
      ...actualConstants.UniversalRouterAddress,
      "0x14a34": "0x492E6456D9528771018DeB9E87ef7750EF184104",
    },
    Permit2Address: {
      ...actualConstants.Permit2Address,
      "0x14a34": "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    },
  };
});

describe("FlaunchActionProvider", () => {
  const provider = new FlaunchActionProvider();
  let mockWalletProvider: jest.Mocked<EvmWalletProvider>;

  beforeEach(() => {
    mockWalletProvider = {
      getAddress: jest.fn().mockReturnValue("0x1234567890123456789012345678901234567890"),
      getBalance: jest.fn(),
      getName: jest.fn(),
      getNetwork: jest.fn().mockReturnValue({
        protocolFamily: "evm",
        networkId: "base-sepolia",
        chainId: "0x14a34",
      }),
      nativeTransfer: jest.fn(),
      sendTransaction: jest.fn().mockResolvedValue("0xtxhash"),
      waitForTransactionReceipt: jest.fn().mockResolvedValue({
        logs: [
          {
            address: "0x9A7059cA00dA92843906Cb4bCa1D005cE848AFdC", // FlaunchPositionManagerAddress for base-sepolia
            data: "0x0000000000000000000000001234567890123456789012345678901234567890",
            topics: ["0x"],
          },
        ],
      }),
      readContract: jest.fn().mockImplementation(({ functionName }) => {
        if (functionName === "symbol") return "TEST";
        if (functionName === "allowance") return [BigInt(0), BigInt(0)];
        return undefined;
      }),
      signTypedData: jest.fn().mockResolvedValue("0xsignature" as Hex),
      getPublicClient: jest.fn().mockReturnValue({
        simulateContract: jest.fn().mockResolvedValue({
          result: [BigInt(1000000000000000000)],
        }),
      }),
    } as unknown as jest.Mocked<EvmWalletProvider>;
  });

  describe("network support", () => {
    it("should support the supported networks", () => {
      expect(
        provider.supportsNetwork({
          protocolFamily: "evm",
          networkId: "base-mainnet",
        }),
      ).toBe(true);

      expect(
        provider.supportsNetwork({
          protocolFamily: "evm",
          networkId: "base-sepolia",
        }),
      ).toBe(true);
    });

    it("should not support other protocol families", () => {
      expect(
        provider.supportsNetwork({
          protocolFamily: "other-protocol-family",
          networkId: "base-mainnet",
        }),
      ).toBe(false);
    });

    it("should not support unsupported networks", () => {
      expect(
        provider.supportsNetwork({
          protocolFamily: "evm",
          networkId: "ethereum",
        }),
      ).toBe(false);
    });

    it("should handle invalid network objects", () => {
      expect(provider.supportsNetwork({} as Network)).toBe(false);
    });
  });

  describe("action validation", () => {
    it("should validate flaunch schema", () => {
      const validInput = {
        name: "Test Token",
        symbol: "TEST",
        image: "https://example.com/image.png",
        description: "A test token",
        websiteUrl: "https://example.com",
        premineAmount: 5,
      };
      const parseResult = FlaunchSchema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });

    it("should reject invalid flaunch input", () => {
      const invalidInput = {
        name: "",
        symbol: "",
        image: "not-a-url",
        description: "",
        premineAmount: 150, // Invalid: exceeds 100%
      };
      const parseResult = FlaunchSchema.safeParse(invalidInput);
      expect(parseResult.success).toBe(false);
    });

    it("should validate buyCoinWithETHInput schema", () => {
      const validInput = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountIn: "0.1",
        slippagePercent: 3,
      };
      const parseResult = BuyCoinWithETHInputSchema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });

    it("should validate buyCoinWithCoinInput schema", () => {
      const validInput = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountOut: "1000",
        slippagePercent: 3,
      };
      const parseResult = BuyCoinWithCoinInputSchema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });

    it("should validate sellCoin schema", () => {
      const validInput = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountIn: "1000",
        slippagePercent: 3,
      };
      const parseResult = SellCoinSchema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });
  });

  describe("flaunch action", () => {
    it("should execute flaunch action with wallet provider", async () => {
      const args = {
        name: "Test Token",
        symbol: "TEST",
        image: "https://example.com/image.png",
        description: "A test token",
        websiteUrl: "https://example.com",
        fairLaunchPercent: 60,
        fairLaunchDuration: 30,
        initialMarketCapUSD: 10000,
        creatorFeeAllocationPercent: 80,
        creatorSplitPercent: 50,
        splitReceivers: [
          {
            address: "0x1234567890123456789012345678901234567890",
            percent: 100,
          },
        ],
        preminePercent: 5,
      };

      const result = await provider.flaunch(mockWalletProvider, args);
      console.log("Test result:", result);
      expect(result).toContain("Flaunched");
      expect(result).toContain("TEST");
      expect(mockWalletProvider.getNetwork).toHaveBeenCalled();
      expect(mockWalletProvider.sendTransaction).toHaveBeenCalled();
      expect(mockWalletProvider.waitForTransactionReceipt).toHaveBeenCalled();
    });

    it("should reject premineAmount exceeding fairLaunchPercent", async () => {
      const args = {
        name: "Test Token",
        symbol: "TEST",
        image: "https://example.com/image.png",
        description: "A test token",
        websiteUrl: "https://example.com",
        fairLaunchPercent: 60,
        fairLaunchDuration: 30,
        initialMarketCapUSD: 10000,
        creatorFeeAllocationPercent: 80,
        creatorSplitPercent: 50,
        splitReceivers: [],
        preminePercent: 70, // Invalid: exceeds fairLaunchPercent of 60%
      };

      const result = await provider.flaunch(mockWalletProvider, args);
      expect(result).toContain("premineAmount (70%) cannot exceed fairLaunchPercent (60%)");
    });
  });

  describe("buyCoinWithETHInput action", () => {
    it("should execute buyCoinWithETHInput action with wallet provider", async () => {
      const args = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountIn: "0.1",
        slippagePercent: 3,
      };

      const result = await provider.buyCoinWithETHInput(mockWalletProvider, args);
      expect(result).toContain("Bought");
      expect(result).toContain("TEST");
      expect(result).toContain(formatEther(BigInt(1000000000000000000)));
      expect(mockWalletProvider.getNetwork).toHaveBeenCalled();
      expect(mockWalletProvider.sendTransaction).toHaveBeenCalled();
      expect(mockWalletProvider.readContract).toHaveBeenCalled();
      expect(mockWalletProvider.waitForTransactionReceipt).toHaveBeenCalled();
    });

    it("should handle errors in buyCoinWithETHInput", async () => {
      // Mock buyFlaunchCoin to return an error string
      (swapUtils.buyFlaunchCoin as jest.Mock).mockResolvedValueOnce(
        "Error buying coin: Transaction failed",
      );

      const args = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountIn: "0.1",
        slippagePercent: 3,
      };

      const result = await provider.buyCoinWithETHInput(mockWalletProvider, args);
      expect(result).toContain("Error buying coin");
    });
  });

  describe("buyCoinWithCoinInput action", () => {
    it("should execute buyCoinWithCoinInput action with wallet provider", async () => {
      const args = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountOut: "1000",
        slippagePercent: 3,
      };

      const result = await provider.buyCoinWithCoinInput(mockWalletProvider, args);
      expect(result).toContain("Bought");
      expect(result).toContain("TEST");
      expect(result).toContain(formatEther(BigInt(1000000000000000000)));
      expect(mockWalletProvider.getNetwork).toHaveBeenCalled();
      expect(mockWalletProvider.sendTransaction).toHaveBeenCalled();
      expect(mockWalletProvider.readContract).toHaveBeenCalled();
      expect(mockWalletProvider.waitForTransactionReceipt).toHaveBeenCalled();
    });

    it("should handle errors in buyCoinWithCoinInput", async () => {
      // Mock buyFlaunchCoin to return an error string
      (swapUtils.buyFlaunchCoin as jest.Mock).mockResolvedValueOnce(
        "Error buying coin: Transaction failed",
      );

      const args = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountOut: "1000",
        slippagePercent: 3,
      };

      const result = await provider.buyCoinWithCoinInput(mockWalletProvider, args);
      expect(result).toContain("Error buying coin");
    });
  });

  describe("sellCoin action", () => {
    it("should execute sellCoin action with wallet provider", async () => {
      const args = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountIn: "1000",
        slippagePercent: 3,
      };

      const result = await provider.sellCoin(mockWalletProvider, args);
      expect(result).toContain("Sold");
      expect(result).toContain("TEST");
      expect(result).toContain(formatEther(BigInt(1000000000000000000)));
      expect(mockWalletProvider.getNetwork).toHaveBeenCalled();
      expect(mockWalletProvider.sendTransaction).toHaveBeenCalled();
      expect(mockWalletProvider.readContract).toHaveBeenCalled();
      expect(mockWalletProvider.waitForTransactionReceipt).toHaveBeenCalled();
    });

    it("should handle permit2 approval when allowance is insufficient", async () => {
      const args = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountIn: "1000",
        slippagePercent: 3,
      };

      const result = await provider.sellCoin(mockWalletProvider, args);
      expect(result).toContain("Sold");
      expect(mockWalletProvider.signTypedData).toHaveBeenCalled();
    });

    it("should handle errors in sellCoin", async () => {
      mockWalletProvider.sendTransaction.mockRejectedValueOnce(new Error("Transaction failed"));

      const args = {
        coinAddress: "0x1234567890123456789012345678901234567890",
        amountIn: "1000",
        slippagePercent: 3,
      };

      const result = await provider.sellCoin(mockWalletProvider, args);
      expect(result).toContain("Error selling coin");
    });
  });
});
