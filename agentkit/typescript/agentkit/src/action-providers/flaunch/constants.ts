import { parseAbi } from "viem";
import { base, baseSepolia } from "viem/chains";
import { Addresses } from "./types";
import { erc20Abi as ERC20_ABI } from "viem";

// Re-export the ERC20 ABI from the erc20 action provider constants
export { ERC20_ABI };

export const TOTAL_SUPPLY = 100_000_000_000n * 10n ** 18n; // 100 Billion tokens in wei

export const FastFlaunchZapAddress: Addresses = {
  [base.id]: "0xd79e27f51ddf9df5ee76106ee192530f474b02f6",
  [baseSepolia.id]: "0x251e97446a7019E5DA4860d4CF47291321C693D0",
};

export const FlaunchZapAddress: Addresses = {
  [base.id]: "0xfa9e8528ee95eb109bffd1a2d59cb95b300a672a",
  [baseSepolia.id]: "0xb2f5d987de90e026b61805e60b6002d367461474",
};

export const RevenueManagerAddress: Addresses = {
  [base.id]: "0x712fa8ddc7347b4b6b029aa21710f365cd02d898",
  [baseSepolia.id]: "0x17E02501dE3e420347e7C5fCAe3AD787C5aea690",
};

export const AddressFeeSplitManagerAddress: Addresses = {
  [base.id]: "0x6baa4ec493a9698dc7388c0f290e29ea3d149f99",
  [baseSepolia.id]: "0xf72dcdee692c188de6b14c6213e849982e04069b",
};

export const FlaunchPositionManagerV1_1Address: Addresses = {
  [base.id]: "0xf785bb58059fab6fb19bdda2cb9078d9e546efdc",
  [baseSepolia.id]: "0x24347e0dd16357059abfc1b321df354873552fdc",
};

export const FLETHAddress: Addresses = {
  [base.id]: "0x000000000D564D5be76f7f0d28fE52605afC7Cf8",
  [baseSepolia.id]: "0x79FC52701cD4BE6f9Ba9aDC94c207DE37e3314eb",
};

export const FLETHHooksAddress: Addresses = {
  [base.id]: "0x9E433F32bb5481a9CA7DFF5b3af74A7ed041a888",
  [baseSepolia.id]: "0x4bd2ca15286c96e4e731337de8b375da6841e888",
};

export const QuoterAddress: Addresses = {
  [base.id]: "0x0d5e0f971ed27fbff6c2837bf31316121532048d",
  [baseSepolia.id]: "0x4a6513c898fe1b2d0e78d3b0e0a4a151589b1cba",
};

export const UniversalRouterAddress: Addresses = {
  [base.id]: "0x6fF5693b99212Da76ad316178A184AB56D299b43",
  [baseSepolia.id]: "0x492E6456D9528771018DeB9E87ef7750EF184104",
};

export const Permit2Address: Addresses = {
  [base.id]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  [baseSepolia.id]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

export const FLAUNCH_ZAP_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_premineAmount", type: "uint256" },
      { internalType: "uint256", name: "_slippage", type: "uint256" },
      { internalType: "bytes", name: "_initialPriceParams", type: "bytes" },
    ],
    name: "calculateFee",
    outputs: [{ internalType: "uint256", name: "ethRequired_", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "string", name: "tokenUri", type: "string" },
          { internalType: "uint256", name: "initialTokenFairLaunch", type: "uint256" },
          { internalType: "uint256", name: "fairLaunchDuration", type: "uint256" },
          { internalType: "uint256", name: "premineAmount", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint24", name: "creatorFeeAllocation", type: "uint24" },
          { internalType: "uint256", name: "flaunchAt", type: "uint256" },
          { internalType: "bytes", name: "initialPriceParams", type: "bytes" },
          { internalType: "bytes", name: "feeCalculatorParams", type: "bytes" },
        ],
        internalType: "struct PositionManager.FlaunchParams",
        name: "_flaunchParams",
        type: "tuple",
      },
    ],
    name: "flaunch",
    outputs: [
      { internalType: "address", name: "memecoin_", type: "address" },
      { internalType: "uint256", name: "ethSpent_", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "string", name: "tokenUri", type: "string" },
          { internalType: "uint256", name: "initialTokenFairLaunch", type: "uint256" },
          { internalType: "uint256", name: "fairLaunchDuration", type: "uint256" },
          { internalType: "uint256", name: "premineAmount", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint24", name: "creatorFeeAllocation", type: "uint24" },
          { internalType: "uint256", name: "flaunchAt", type: "uint256" },
          { internalType: "bytes", name: "initialPriceParams", type: "bytes" },
          { internalType: "bytes", name: "feeCalculatorParams", type: "bytes" },
        ],
        internalType: "struct PositionManager.FlaunchParams",
        name: "_flaunchParams",
        type: "tuple",
      },
      {
        components: [
          { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
          { internalType: "string", name: "merkleIPFSHash", type: "string" },
          { internalType: "uint256", name: "maxTokens", type: "uint256" },
        ],
        internalType: "struct FlaunchZap.WhitelistParams",
        name: "_whitelistParams",
        type: "tuple",
      },
      {
        components: [
          { internalType: "uint256", name: "airdropIndex", type: "uint256" },
          { internalType: "uint256", name: "airdropAmount", type: "uint256" },
          { internalType: "uint256", name: "airdropEndTime", type: "uint256" },
          { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
          { internalType: "string", name: "merkleIPFSHash", type: "string" },
        ],
        internalType: "struct FlaunchZap.AirdropParams",
        name: "_airdropParams",
        type: "tuple",
      },
      {
        components: [
          { internalType: "address", name: "manager", type: "address" },
          { internalType: "bytes", name: "initializeData", type: "bytes" },
          { internalType: "bytes", name: "depositData", type: "bytes" },
        ],
        internalType: "struct FlaunchZap.TreasuryManagerParams",
        name: "_treasuryManagerParams",
        type: "tuple",
      },
    ],
    name: "flaunch",
    outputs: [
      { internalType: "address", name: "memecoin_", type: "address" },
      { internalType: "uint256", name: "ethSpent_", type: "uint256" },
      { internalType: "address", name: "deployedManager_", type: "address" },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

export const POSITION_MANAGERV1_1_ABI = parseAbi([
  "event PoolCreated(bytes32 indexed _poolId, address _memecoin, address _memecoinTreasury, uint256 _tokenId, bool _currencyFlipped, uint256 _flaunchFee, (string name, string symbol, string tokenUri, uint256 initialTokenFairLaunch, uint256 fairLaunchDuration, uint256 premineAmount, address creator, uint24 creatorFeeAllocation, uint256 flaunchAt, bytes initialPriceParams, bytes feeCalculatorParams) _params)",
  "event PoolSwap(bytes32 indexed poolId, int256 flAmount0, int256 flAmount1, int256 flFee0, int256 flFee1, int256 ispAmount0, int256 ispAmount1, int256 ispFee0, int256 ispFee1, int256 uniAmount0, int256 uniAmount1, int256 uniFee0, int256 uniFee1)",
]);

export const QUOTER_ABI = [
  {
    inputs: [
      {
        internalType: "contract IPoolManager",
        name: "_poolManager",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "PoolId", name: "poolId", type: "bytes32" }],
    name: "NotEnoughLiquidity",
    type: "error",
  },
  { inputs: [], name: "NotPoolManager", type: "error" },
  { inputs: [], name: "NotSelf", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "QuoteSwap",
    type: "error",
  },
  { inputs: [], name: "UnexpectedCallSuccess", type: "error" },
  {
    inputs: [{ internalType: "bytes", name: "revertData", type: "bytes" }],
    name: "UnexpectedRevertBytes",
    type: "error",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "Currency", name: "exactCurrency", type: "address" },
          {
            components: [
              {
                internalType: "Currency",
                name: "intermediateCurrency",
                type: "address",
              },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              {
                internalType: "contract IHooks",
                name: "hooks",
                type: "address",
              },
              { internalType: "bytes", name: "hookData", type: "bytes" },
            ],
            internalType: "struct PathKey[]",
            name: "path",
            type: "tuple[]",
          },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
        ],
        internalType: "struct IV4Quoter.QuoteExactParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "_quoteExactInput",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "Currency", name: "currency0", type: "address" },
              { internalType: "Currency", name: "currency1", type: "address" },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              {
                internalType: "contract IHooks",
                name: "hooks",
                type: "address",
              },
            ],
            internalType: "struct PoolKey",
            name: "poolKey",
            type: "tuple",
          },
          { internalType: "bool", name: "zeroForOne", type: "bool" },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
          { internalType: "bytes", name: "hookData", type: "bytes" },
        ],
        internalType: "struct IV4Quoter.QuoteExactSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "_quoteExactInputSingle",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "Currency", name: "exactCurrency", type: "address" },
          {
            components: [
              {
                internalType: "Currency",
                name: "intermediateCurrency",
                type: "address",
              },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              {
                internalType: "contract IHooks",
                name: "hooks",
                type: "address",
              },
              { internalType: "bytes", name: "hookData", type: "bytes" },
            ],
            internalType: "struct PathKey[]",
            name: "path",
            type: "tuple[]",
          },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
        ],
        internalType: "struct IV4Quoter.QuoteExactParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "_quoteExactOutput",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "Currency", name: "currency0", type: "address" },
              { internalType: "Currency", name: "currency1", type: "address" },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              {
                internalType: "contract IHooks",
                name: "hooks",
                type: "address",
              },
            ],
            internalType: "struct PoolKey",
            name: "poolKey",
            type: "tuple",
          },
          { internalType: "bool", name: "zeroForOne", type: "bool" },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
          { internalType: "bytes", name: "hookData", type: "bytes" },
        ],
        internalType: "struct IV4Quoter.QuoteExactSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "_quoteExactOutputSingle",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "poolManager",
    outputs: [{ internalType: "contract IPoolManager", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "Currency", name: "exactCurrency", type: "address" },
          {
            components: [
              {
                internalType: "Currency",
                name: "intermediateCurrency",
                type: "address",
              },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              {
                internalType: "contract IHooks",
                name: "hooks",
                type: "address",
              },
              { internalType: "bytes", name: "hookData", type: "bytes" },
            ],
            internalType: "struct PathKey[]",
            name: "path",
            type: "tuple[]",
          },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
        ],
        internalType: "struct IV4Quoter.QuoteExactParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInput",
    outputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "Currency", name: "currency0", type: "address" },
              { internalType: "Currency", name: "currency1", type: "address" },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              {
                internalType: "contract IHooks",
                name: "hooks",
                type: "address",
              },
            ],
            internalType: "struct PoolKey",
            name: "poolKey",
            type: "tuple",
          },
          { internalType: "bool", name: "zeroForOne", type: "bool" },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
          { internalType: "bytes", name: "hookData", type: "bytes" },
        ],
        internalType: "struct IV4Quoter.QuoteExactSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      { internalType: "uint256", name: "amountOut", type: "uint256" },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "Currency", name: "exactCurrency", type: "address" },
          {
            components: [
              {
                internalType: "Currency",
                name: "intermediateCurrency",
                type: "address",
              },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              {
                internalType: "contract IHooks",
                name: "hooks",
                type: "address",
              },
              { internalType: "bytes", name: "hookData", type: "bytes" },
            ],
            internalType: "struct PathKey[]",
            name: "path",
            type: "tuple[]",
          },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
        ],
        internalType: "struct IV4Quoter.QuoteExactParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactOutput",
    outputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "Currency", name: "currency0", type: "address" },
              { internalType: "Currency", name: "currency1", type: "address" },
              { internalType: "uint24", name: "fee", type: "uint24" },
              { internalType: "int24", name: "tickSpacing", type: "int24" },
              {
                internalType: "contract IHooks",
                name: "hooks",
                type: "address",
              },
            ],
            internalType: "struct PoolKey",
            name: "poolKey",
            type: "tuple",
          },
          { internalType: "bool", name: "zeroForOne", type: "bool" },
          { internalType: "uint128", name: "exactAmount", type: "uint128" },
          { internalType: "bytes", name: "hookData", type: "bytes" },
        ],
        internalType: "struct IV4Quoter.QuoteExactSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactOutputSingle",
    outputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "uint256", name: "gasEstimate", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
    name: "unlockCallback",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const IV4RouterAbiExactInput = [
  {
    type: "tuple",
    components: [
      { type: "address", name: "currencyIn" },
      {
        type: "tuple[]",
        name: "path",
        components: [
          { type: "address", name: "intermediateCurrency" },
          { type: "uint24", name: "fee" },
          { type: "int24", name: "tickSpacing" },
          { type: "address", name: "hooks" },
          { type: "bytes", name: "hookData" },
        ],
      },
      { type: "uint128", name: "amountIn" },
      { type: "uint128", name: "amountOutMinimum" },
    ],
  },
] as const;

export const IV4RouterAbiExactOutput = [
  {
    type: "tuple",
    components: [
      { type: "address", name: "currencyOut" },
      {
        type: "tuple[]",
        name: "path",
        components: [
          { type: "address", name: "intermediateCurrency" },
          { type: "uint24", name: "fee" },
          { type: "int24", name: "tickSpacing" },
          { type: "address", name: "hooks" },
          { type: "bytes", name: "hookData" },
        ],
      },
      { type: "uint128", name: "amountOut" },
      { type: "uint128", name: "amountInMaximum" },
    ],
  },
] as const;

export const V4Actions = {
  SWAP_EXACT_IN: "07",
  SWAP_EXACT_OUT: "09",
  SETTLE_ALL: "0c",
  TAKE_ALL: "0f",
};

export const URCommands = {
  V4_SWAP: "10",
  SWEEP: "04",
  PERMIT2_PERMIT: "0a",
};

export const UNIVERSAL_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "permit2", type: "address" },
          { internalType: "address", name: "weth9", type: "address" },
          { internalType: "address", name: "v2Factory", type: "address" },
          { internalType: "address", name: "v3Factory", type: "address" },
          {
            internalType: "bytes32",
            name: "pairInitCodeHash",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "poolInitCodeHash",
            type: "bytes32",
          },
          { internalType: "address", name: "v4PoolManager", type: "address" },
          {
            internalType: "address",
            name: "v3NFTPositionManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "v4PositionManager",
            type: "address",
          },
        ],
        internalType: "struct RouterParameters",
        name: "params",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "BalanceTooLow", type: "error" },
  { inputs: [], name: "ContractLocked", type: "error" },
  {
    inputs: [{ internalType: "Currency", name: "currency", type: "address" }],
    name: "DeltaNotNegative",
    type: "error",
  },
  {
    inputs: [{ internalType: "Currency", name: "currency", type: "address" }],
    name: "DeltaNotPositive",
    type: "error",
  },
  { inputs: [], name: "ETHNotAccepted", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "commandIndex", type: "uint256" },
      { internalType: "bytes", name: "message", type: "bytes" },
    ],
    name: "ExecutionFailed",
    type: "error",
  },
  { inputs: [], name: "FromAddressIsNotOwner", type: "error" },
  { inputs: [], name: "InputLengthMismatch", type: "error" },
  { inputs: [], name: "InsufficientBalance", type: "error" },
  { inputs: [], name: "InsufficientETH", type: "error" },
  { inputs: [], name: "InsufficientToken", type: "error" },
  {
    inputs: [{ internalType: "bytes4", name: "action", type: "bytes4" }],
    name: "InvalidAction",
    type: "error",
  },
  { inputs: [], name: "InvalidBips", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "commandType", type: "uint256" }],
    name: "InvalidCommandType",
    type: "error",
  },
  { inputs: [], name: "InvalidEthSender", type: "error" },
  { inputs: [], name: "InvalidPath", type: "error" },
  { inputs: [], name: "InvalidReserves", type: "error" },
  { inputs: [], name: "LengthMismatch", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "NotAuthorizedForToken",
    type: "error",
  },
  { inputs: [], name: "NotPoolManager", type: "error" },
  { inputs: [], name: "OnlyMintAllowed", type: "error" },
  { inputs: [], name: "SliceOutOfBounds", type: "error" },
  { inputs: [], name: "TransactionDeadlinePassed", type: "error" },
  { inputs: [], name: "UnsafeCast", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "action", type: "uint256" }],
    name: "UnsupportedAction",
    type: "error",
  },
  { inputs: [], name: "V2InvalidPath", type: "error" },
  { inputs: [], name: "V2TooLittleReceived", type: "error" },
  { inputs: [], name: "V2TooMuchRequested", type: "error" },
  { inputs: [], name: "V3InvalidAmountOut", type: "error" },
  { inputs: [], name: "V3InvalidCaller", type: "error" },
  { inputs: [], name: "V3InvalidSwap", type: "error" },
  { inputs: [], name: "V3TooLittleReceived", type: "error" },
  { inputs: [], name: "V3TooMuchRequested", type: "error" },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minAmountOutReceived",
        type: "uint256",
      },
      { internalType: "uint256", name: "amountReceived", type: "uint256" },
    ],
    name: "V4TooLittleReceived",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxAmountInRequested",
        type: "uint256",
      },
      { internalType: "uint256", name: "amountRequested", type: "uint256" },
    ],
    name: "V4TooMuchRequested",
    type: "error",
  },
  {
    inputs: [],
    name: "V3_POSITION_MANAGER",
    outputs: [
      {
        internalType: "contract INonfungiblePositionManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "V4_POSITION_MANAGER",
    outputs: [{ internalType: "contract IPositionManager", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "commands", type: "bytes" },
      { internalType: "bytes[]", name: "inputs", type: "bytes[]" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "commands", type: "bytes" },
      { internalType: "bytes[]", name: "inputs", type: "bytes[]" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "msgSender",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolManager",
    outputs: [{ internalType: "contract IPoolManager", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "int256", name: "amount0Delta", type: "int256" },
      { internalType: "int256", name: "amount1Delta", type: "int256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "uniswapV3SwapCallback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes", name: "data", type: "bytes" }],
    name: "unlockCallback",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
] as const;

export const PERMIT2_ABI = [
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "allowance",
    outputs: [
      { internalType: "uint160", name: "amount", type: "uint160" },
      { internalType: "uint48", name: "expiration", type: "uint48" },
      { internalType: "uint48", name: "nonce", type: "uint48" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const PERMIT_DETAILS = [
  { name: "token", type: "address" },
  { name: "amount", type: "uint160" },
  { name: "expiration", type: "uint48" },
  { name: "nonce", type: "uint48" },
];

export const PERMIT_TYPES = {
  PermitSingle: [
    { name: "details", type: "PermitDetails" },
    { name: "spender", type: "address" },
    { name: "sigDeadline", type: "uint256" },
  ],
  PermitDetails: PERMIT_DETAILS,
};
