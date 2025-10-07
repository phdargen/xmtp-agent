# External Wallet ERC20 Action Provider

This action provider prepares ERC20 token transactions for external wallet approval instead of executing them directly. It's designed for scenarios where users sign transactions with their own wallets (e.g., browser wallet, mobile wallet) rather than having the agent execute transactions on their behalf.

## Use Case

Perfect for:
- XMTP agents where users control their own wallets
- Applications requiring user approval for all transactions
- Multi-signature or delegated wallet scenarios
- Privacy-focused applications where the agent doesn't hold funds

## Actions

### `get_erc20_balance`

Gets the balance of an ERC20 token for a user's wallet address.

**Parameters:**
- `tokenAddress`: The contract address of the ERC20 token
- `address`: The user's wallet address to check balance for

**Returns:** A string message with the balance information

**Example:**
```typescript
const balance = await agent.getBalance({
  tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // User's address
});
// Returns: "Balance of USD Coin (0x833...) at address 0x742... is 100.5"
```

### `prepare_erc20_transfer`

Prepares an ERC20 transfer transaction for the user to approve with their wallet. This action does **NOT** execute the transaction.

**Parameters:**
- `amount`: The amount to transfer in whole units (e.g., "10.5" for 10.5 USDC)
- `tokenAddress`: The contract address of the token to transfer
- `destinationAddress`: The address to send the funds to
- `userAddress`: The user's wallet address that will sign the transaction

**Returns:** A JSON string with structured transaction data

**Example:**
```typescript
const prepared = await agent.prepareTransfer({
  amount: "10.5",
  tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
  destinationAddress: "0xRecipient...",
  userAddress: "0xUser...",
});

// Returns JSON string:
// {
//   "type": "TRANSACTION_PREPARED",
//   "description": "Transfer 10.5 USD Coin to 0xRecipient...",
//   "calls": [
//     {
//       "to": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//       "data": "0xa9059cbb...", // Encoded transfer call
//       "value": "0"
//     }
//   ],
//   "metadata": {
//     "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//     "amount": "10.5",
//     "destinationAddress": "0xRecipient...",
//     "tokenName": "USD Coin",
//     "tokenDecimals": 6
//   }
// }
```

## Safety Features

The action provider includes several safety checks:

1. **Balance Validation**: Ensures user has sufficient balance before preparing transfer
2. **Token Contract Protection**: Prevents transfers to token contract addresses
3. **Address Validation**: Validates all addresses are proper Ethereum addresses
4. **Smart Contract Detection**: Checks if destination is a contract and validates it's not an ERC20 token

## Integration with XMTP

This action provider is designed to work with XMTP's `WalletSendCalls` content type:

```typescript
// 1. User sends message requesting transfer
// 2. Agent calls prepare_erc20_transfer
// 3. Parse the JSON response
const txData = JSON.parse(preparedResponse);

// 4. Convert to WalletSendCalls format
const walletSendCalls = {
  version: "1.0",
  from: userAddress,
  chainId: chainId,
  calls: txData.calls,
};

// 5. Send to user via XMTP
await conversation.send(walletSendCalls, ContentTypeWalletSendCalls);

// 6. User approves in their wallet
// 7. User sends TransactionReference back to agent
// 8. Agent confirms transaction
```

## Setup

### 1. Install Dependencies

```bash
npm install @coinbase/agentkit viem
```

### 2. Create ReadOnlyWalletProvider

```typescript
import { ReadOnlyEvmWalletProvider } from "@coinbase/agentkit";

const walletProvider = ReadOnlyEvmWalletProvider.configure({
  networkId: "base-sepolia",
  rpcUrl: "https://sepolia.base.org", // Optional
});
```

### 3. Initialize AgentKit

```typescript
import { AgentKit, externalWalletERC20ActionProvider } from "@coinbase/agentkit";

const agentkit = await AgentKit.from({
  walletProvider,
  actionProviders: [externalWalletERC20ActionProvider()],
});
```

### 4. Use with LangChain

```typescript
import { getLangChainTools } from "@coinbase/agentkit-langchain";

const tools = await getLangChainTools(agentkit);

const agent = createReactAgent({
  llm,
  tools,
  messageModifier: `
    You are a DeFi assistant. You prepare transactions for users to approve.
    User's wallet address: ${userAddress}
    When user wants to transfer tokens, use prepare_erc20_transfer with their address.
  `,
});
```

## Example: Complete XMTP Flow

See the `langchain-xmtp-externalWallet` example for a complete implementation.

## Differences from Standard ERC20 Provider

| Feature | Standard ERC20 Provider | External Wallet ERC20 Provider |
|---------|------------------------|-------------------------------|
| Execution | Executes transactions directly | Prepares for user approval |
| Wallet Required | Yes, agent needs wallet | No, read-only access |
| User Control | Agent controls funds | User controls funds |
| Balance Check | Uses agent's wallet | Uses user's specified address |
| Return Type | Transaction hash | JSON with transaction data |
| Use Case | Autonomous agents | User-approved transactions |

## Supported Networks

All EVM networks supported by viem, including:
- Ethereum (mainnet, sepolia)
- Base (mainnet, sepolia)
- Arbitrum (mainnet, sepolia)
- Optimism (mainnet, sepolia)
- Polygon (mainnet, mumbai)

## License

Apache-2.0

