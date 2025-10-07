# ERC20 Action Provider

This directory contains the **ERC20ActionProvider** implementation, which provides actions to interact with **ERC20 tokens** on EVM-compatible networks.

## Directory Structure

```
erc20/
├── erc20ActionProvider.ts         # Main provider with ERC20 token functionality
├── erc20ActionProvider.test.ts    # Test file for ERC20 provider
├── constants.ts                   # Constants for ERC20 provider
├── schemas.ts                     # Token action schemas
├── index.ts                       # Main exports
├── utils.ts                       # Utility functions
└── README.md                      # This file
```

## Actions

- `get_balance`: Get the balance of an ERC20 token

  - Returns the **balance** of the token in the wallet
  - Formats the balance with the correct number of decimals

- `transfer`: Transfer ERC20 tokens to another address

  - Constructs and sends the transfer transaction
  - Returns the **transaction hash** upon success

- `approve`: Approve a spender to transfer ERC20 tokens

  - Allows a spender address to transfer tokens on behalf of the wallet
  - Takes amount, token address, and spender address as inputs
  - Returns the **transaction hash** upon success
  - Can be used to revoke allowances by setting amount to 0

- `get_allowance`: Check the allowance for a spender of an ERC20 token

  - Returns the current **allowance** amount for a spender
  - Takes token address and spender address as inputs
  - Formats the allowance with the correct number of decimals

- `get_erc20_token_address`: Get the contract address for a token symbol

  - Takes a token symbol (e.g. USDC, EURC, CBBTC) as input
  - Returns the **contract address** for the token on the current network
  - Provides available token symbols if the requested symbol is not found

## Adding New Actions

To add new ERC20 actions:

1. Define your action schema in `schemas.ts`. See [Defining the input schema](https://github.com/coinbase/agentkit/blob/main/CONTRIBUTING-TYPESCRIPT.md#defining-the-input-schema) for more information.
2. Implement the action in `erc20ActionProvider.ts`
3. Implement tests in `erc20ActionProvider.test.ts`

## Network Support

The ERC20 provider supports all EVM-compatible networks.

## Notes

For more information on the **ERC20 token standard**, visit [ERC20 Token Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/).
