import { Coinbase } from "@coinbase/coinbase-sdk";

export const BaseTokenToAssetId = new Map([
  ["0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", Coinbase.assets.Cbbtc],
  ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", Coinbase.assets.Usdc],
  ["0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42", Coinbase.assets.Eurc],
]);

export const BaseSepoliaTokenToAssetId = new Map([
  ["0xcbB7C0006F23900c38EB856149F799620fcb8A4a", Coinbase.assets.Cbbtc],
  ["0x036CbD53842c5426634e7929541eC2318f3dCF7e", Coinbase.assets.Usdc],
  ["0x808456652fdb597867f38412077A9182bf77359F", Coinbase.assets.Eurc],
]);

// Token symbol to address mappings for frequently used tokens
export const TOKEN_ADDRESSES_BY_SYMBOLS = {
  "base-mainnet": {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    EURC: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
    CBBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    CBETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    WETH: "0x4200000000000000000000000000000000000006",
    ZORA: "0x1111111111166b7FE7bd91427724B487980aFc69",
    AERO: "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
    BNKR: "0x22af33fe49fd1fa80c7149773dde5890d3c76f3b",
    CLANKER: "0x1bc0c42215582d5a085795f4badbac3ff36d1bcb",
  },
  "base-sepolia": {
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    EURC: "0x808456652fdb597867f38412077A9182bf77359F",
    CBBTC: "0xcbB7C0006F23900c38EB856149F799620fcb8A4a",
    WETH: "0x4200000000000000000000000000000000000006",
  },
  "ethereum-mainnet": {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    EURC: "0x1abaea1f7c830bd89acc67ec4af516284b1bc33c",
    CBBTC: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    CBETH: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
  },
  "polygon-mainnet": {
    USDC: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
  },
  "arbitrum-mainnet": {
    USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  },
  "optimism-mainnet": {
    USDC: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    WETH: "0x4200000000000000000000000000000000000006",
  },
} as const;
