# AgentKit External Wallet Integration

This is a [Next.js](https://nextjs.org) project bootstrapped with `create-onchain-agent` and configured for **external wallet integration**.

🔑 **Your Keys, Your Crypto** - Users connect their own wallet (MetaMask, Coinbase Wallet, etc.) and the AI agent prepares transactions for them to approve. The agent never has access to private keys.

## Key Features

- 💼 **External Wallet Support**: Connect MetaMask, Coinbase Wallet, or any wallet via WalletConnect
- 🤖 **AI-Powered DeFi Assistant**: Prepare ERC20 token transfers with natural language
- 🔒 **Non-Custodial**: Agent prepares transactions, users approve with their own wallet
- 🔄 **Multi-User Support**: Each connected wallet gets its own agent instance with memory
- ⛓️ **Multi-Chain**: Supports Base, Ethereum mainnet and testnets

## Getting Started

### 1. Install Dependencies

```sh
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file from the example:

```sh
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
NETWORK_ID=base-sepolia
```

**Note**: CDP API keys are NOT needed for external wallet mode. The agent uses `ReadOnlyEvmWalletProvider` and the user's browser wallet.

### 3. Run the Development Server

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Connect Your Wallet

Click "Connect Wallet" in the top-right corner and connect with MetaMask, Coinbase Wallet, or WalletConnect.

### 5. Start Chatting

Try these commands:
- "Check my USDC balance"
- "Send 1 USDC to 0x..."
- "What's the current ETH price?"

## How It Works

### Architecture

1. **Frontend (React + Wagmi)**
   - User connects wallet via wagmi
   - Sends messages to agent API with wallet address
   - Receives prepared transactions and prompts user to sign

2. **Backend (Next.js API Routes)**
   - Creates per-user agent instances with `ReadOnlyEvmWalletProvider`
   - Agent uses `externalWalletERC20ActionProvider` to prepare transactions
   - Returns transaction data to frontend (does NOT execute)

3. **Transaction Flow**
   ```
   User Message → Agent Prepares TX → User Signs in Wallet → Confirmation
   ```

### Key Differences from CDP Wallet Mode

| Aspect | External Wallet Mode | CDP Wallet Mode |
|--------|---------------------|-----------------|
| **Wallet Control** | User controls wallet | Agent controls wallet |
| **Private Keys** | User's wallet | CDP MPC wallet |
| **Transaction Execution** | User signs in browser | Agent auto-executes |
| **Setup** | Only OpenAI API key | CDP API keys required |
| **Use Case** | Users keep custody | Autonomous agents |

## Configuring Your Agent

### 1. Select Your LLM  
Modify `/app/api/agent/create-agent.ts` to use a different model:

```typescript
const llm = new ChatOpenAI({ model: "gpt-4o" }); // or gpt-4o-mini
```

### 2. Wallet Provider (Already Configured)
The agent uses `ReadOnlyEvmWalletProvider` which:
- Provides read-only blockchain access via RPC
- Tracks user's wallet address
- Cannot sign or execute transactions

### 3. Action Providers (Customize in `/app/api/agent/prepare-agentkit.ts`)
Current providers:
- `externalWalletERC20ActionProvider()` - Prepares ERC20 token transfers
- `pythActionProvider()` - Price feed data

Add more providers from [AgentKit Action Providers](https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#action-providers)

### 4. Network Configuration
Set `NETWORK_ID` in `.env.local`:
- `base-sepolia` (testnet - default)
- `base-mainnet` (mainnet)
- `ethereum-sepolia` (testnet)
- `ethereum-mainnet` (mainnet)

## USDC Token Addresses

The agent is pre-configured with USDC addresses:

| Network | Address |
|---------|---------|
| Base Mainnet | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Base Sepolia | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Ethereum Mainnet | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| Ethereum Sepolia | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |

## Available Commands

### Check Balance
"What's my USDC balance?"

### Transfer Tokens  
"Send 1 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

### Price Feeds
"What's the current ETH price?"

## Learn More

- [AgentKit Documentation](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
- [AgentKit GitHub](https://github.com/coinbase/agentkit)
- [External Wallet ERC20 Provider](https://github.com/coinbase/agentkit/tree/main/typescript/agentkit/src/action-providers/externalWalletERC20)
- [Wagmi Documentation](https://wagmi.sh)
- [Next.js Documentation](https://nextjs.org/docs)

## Contributing

Interested in contributing to AgentKit? Follow the contribution guide:

- [Contribution Guide](https://github.com/coinbase/agentkit/blob/main/CONTRIBUTING.md)
- Join the discussion on [Discord](https://discord.gg/CDP)

## Security Notes

⚠️ **Important Security Considerations**:

1. **The agent never has access to private keys** - users sign all transactions with their own wallet
2. **Built-in guardrails** - prevents sending tokens to token contracts or invalid addresses
3. **Balance checks** - verifies sufficient balance before preparing transactions
4. **User approval required** - every transaction requires explicit user confirmation

---

**Built with ❤️ using [AgentKit](https://github.com/coinbase/agentkit) and [Wagmi](https://wagmi.sh)**
