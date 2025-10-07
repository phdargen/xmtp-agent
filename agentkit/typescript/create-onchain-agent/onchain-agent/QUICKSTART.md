# 🚀 Quick Start Guide - External Wallet Mode

Get your external wallet AgentKit running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MetaMask or Coinbase Wallet browser extension
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Setup Steps

### 1️⃣ Install Dependencies

```bash
cd agentkit/typescript/create-onchain-agent/onchain-agent
npm install
```

### 2️⃣ Configure Environment

Create your environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
NEXT_PUBLIC_NETWORK_ID=base-sepolia
```

### 3️⃣ Start Development Server

```bash
npm run dev
```

### 4️⃣ Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

### 5️⃣ Connect Wallet

1. Click **"Connect Wallet"** in the top-right corner
2. Choose your wallet (MetaMask, Coinbase Wallet, or WalletConnect)
3. Approve the connection

### 6️⃣ Start Chatting!

Try these commands:

#### Check Your Balance
```
What's my USDC balance?
```

#### Get Price Information
```
What's the current ETH price?
```

#### Transfer Tokens
```
Send 1 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

## What Happens Next?

1. **Agent Understands** - AI interprets your request
2. **Transaction Prepared** - Agent creates transaction data
3. **Your Approval** - Wallet prompts you to sign
4. **Confirmation** - Transaction executes on-chain

## Architecture

```
┌──────────────┐
│   You Type   │
│  "Send USDC" │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   AI Agent   │
│  Prepares TX │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Your Wallet  │
│ Signs & Sends│
└──────────────┘
```

## Key Features

✅ **Your Keys, Your Crypto** - You control the wallet, agent just prepares transactions

✅ **Multi-Chain** - Works on Base and Ethereum (mainnet & testnet)

✅ **Safe** - Built-in checks prevent sending to wrong addresses

✅ **Smart** - Natural language commands powered by GPT-4

## Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key for the AI agent |
| `NEXT_PUBLIC_NETWORK_ID` | ❌ No | Network to use (default: base-sepolia) |
| `RPC_URL` | ❌ No | Custom RPC endpoint (uses public by default) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ❌ No | For WalletConnect support |

## Supported Networks

- **base-sepolia** (testnet) - Default, perfect for testing
- **base-mainnet** - Base L2 mainnet
- **ethereum-sepolia** - Ethereum testnet
- **ethereum-mainnet** - Ethereum mainnet

## Supported Wallets

- 🦊 **MetaMask** - Most popular Ethereum wallet
- 🔷 **Coinbase Wallet** - Coinbase's self-custody wallet
- 🌐 **WalletConnect** - Connect any WalletConnect-compatible wallet

## USDC Token Addresses

Pre-configured for each network:

| Network | USDC Address |
|---------|--------------|
| Base Mainnet | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Base Sepolia | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Ethereum Mainnet | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| Ethereum Sepolia | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |

## Testing with Testnet

### Get Test Tokens

1. **Base Sepolia ETH**: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. **Base Sepolia USDC**: Use the faucet or bridge from Sepolia

### Test Transfers

```
Send 0.1 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

The agent will:
1. Check your balance
2. Prepare the transaction
3. Ask you to approve in your wallet
4. Execute the transfer

## Troubleshooting

### "Please connect your wallet"
- Click "Connect Wallet" in top-right
- Approve the connection in your wallet

### "Wrong Network" warning
- Click "Switch to base-sepolia" 
- Or change network in your wallet manually

### Transaction fails
- Check you have enough tokens
- Ensure you have ETH for gas
- Verify the recipient address

### Agent doesn't respond
- Check OpenAI API key in `.env.local`
- Check browser console for errors
- Ensure wallet is connected

## Next Steps

### Customize the Agent

**Change the AI Model:**
```typescript
// app/api/agent/create-agent.ts
const llm = new ChatOpenAI({ model: "gpt-4o" }); // Upgrade to GPT-4
```

**Add More Capabilities:**
```typescript
// app/api/agent/prepare-agentkit.ts
actionProviders: [
  externalWalletERC20ActionProvider(),
  pythActionProvider(),
  // Add more action providers here
]
```

**Customize Instructions:**
```typescript
// app/api/agent/create-agent.ts
messageModifier: `
  You are a DeFi assistant...
  // Add your custom instructions
`
```

### Deploy to Production

1. Set production environment variables
2. Use mainnet network ID
3. Add your own RPC endpoint for reliability
4. Consider rate limiting for OpenAI API

## Security Notes

🔒 **The agent NEVER has access to your private keys**

✅ All transactions require your approval

✅ Built-in safety checks prevent common mistakes

✅ You can disconnect anytime

## Learn More

- 📚 [Full Documentation](./README.md)
- 🔧 [Implementation Details](./EXTERNAL_WALLET_IMPLEMENTATION.md)
- 💻 [AgentKit GitHub](https://github.com/coinbase/agentkit)
- 📖 [AgentKit Docs](https://docs.cdp.coinbase.com/agentkit/docs/welcome)

## Need Help?

- 💬 [Discord Community](https://discord.gg/CDP)
- 📝 [GitHub Issues](https://github.com/coinbase/agentkit/issues)
- 📧 [Documentation](https://docs.cdp.coinbase.com/agentkit/docs/welcome)

---

**Happy Building! 🎉**

Your external wallet agent is ready to help users interact with DeFi safely and easily.

