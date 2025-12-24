# Rootstock Nextjs Thirdweb dApp Starter Kit

A production-ready Next.js 15 dApp starter kit for building decentralized applications on the Rootstock blockchain using Thirdweb SDK v5.

## Features

- **Next.js 15 with App Router** - Latest Next.js with server components and optimized performance
- **Rootstock Network Support** - Pre-configured for both mainnet (chain ID 30) and testnet (chain ID 31)
- **Thirdweb SDK v5** - Complete integration with latest Thirdweb SDK for smart contract interactions
- **ERC20 Token Interface** - Mint, transfer, and manage tokens
- **ERC721 NFT Drop** - Create and claim NFTs with lazy minting
- **Wallet Connectivity** - Support for MetaMask, Coinbase Wallet, Rainbow, Rabby, and WalletConnect
- **Modern UI** - Built with shadcn/ui components and Tailwind CSS v4
- **TypeScript** - Full type safety throughout the codebase

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- A Thirdweb account and client ID
- Wallets with testnet funds (for testing on Rootstock Testnet)

### Installation

1. **Clone and install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

2. **Get your Thirdweb Client ID:**

   - Visit [Thirdweb Dashboard](https://thirdweb.com/dashboard/settings/api-keys)
   - Create a new API key
   - Copy your client ID

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

4. **Update** `.env.local` with your configuration:

   ```env
   # Required: Thirdweb Client ID from dashboard
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
   
   # Optional: Default network (mainnet or testnet)
   NEXT_PUBLIC_DEFAULT_NETWORK=testnet
   
   # Optional: Contract addresses (add after deployment)
   NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS=
   NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS=
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

6. **Open your browser:** Navigate to <http://localhost:3000>

## Project Structure

```
├── app/
│   ├── erc20/                    # ERC20 token interface
│   ├── erc721/                   # NFT drop interface
│   ├── layout.tsx               # Root layout with Thirdweb provider
│   ├── page.tsx                 # Dashboard
│   └── globals.css              # Global styles
├── components/
│   ├── dapp/                    # dApp-specific components
│   │   ├── wallet-status.tsx    # Wallet connection status
│   │   ├── chain-badge.tsx      # Network indicator
│   │   ├── chain-switcher.tsx   # Network switcher
│   │   ├── transaction-button.tsx # Transaction UI helper
│   │   └── ...
│   ├── erc20/                   # ERC20 token components
│   ├── erc721/                  # NFT components
│   ├── ui/                      # shadcn/ui components
│   └── providers/               # React providers
├── lib/
│   ├── chains.ts                # Chain configurations
│   ├── contracts.ts             # Contract addresses
│   ├── thirdweb.ts              # Thirdweb client setup
│   └── utils.ts                 # Utility functions
└── public/                      # Static assets
```

## Deploying Your Own Contracts

### Deploy via Thirdweb Dashboard

1. **ERC20 Token:**
   - Follow this [guide](https://portal.thirdweb.com/tokens/deploy-erc20)
   - Or this [https://thirdweb.com/thirdweb.eth/TokenERC20](https://thirdweb.com/thirdweb.eth/TokenERC20) and click 'Deploy Now'
   - Configure collection name and symbol
   - Deploy to Rootstock Testnet or Mainnet
   - Copy the deployed contract address to `.env.local`

2. **NFT Drop (ERC721):**
   - Follow this [prebuilt contract](https://thirdweb.com/thirdweb.eth/DropERC721) and click 'Deply Now'
   - Configure collection name and symbol
   - Set base URI for metadata
   - Deploy and add the deployed address to `.env.local`


## Network Configuration

### Rootstock Mainnet

- **Chain ID:** 30
- **Network Name:** Rootstock Mainnet
- **Currency:** RBTC
- **RPC:** https://public-node.rsk.co
- **Explorer:** https://explorer.rootstock.io

### Rootstock Testnet

- **Chain ID:** 31
- **Network Name:** Rootstock Testnet
- **Currency:** tRBTC
- **RPC:** https://public-node.testnet.rsk.co
- **Explorer:** https://rootstock-testnet.blockscout.com


## Usage Guide

### Home Page

- View wallet connection status
- Switch between networks
- Quick start guide

### ERC20 Tokens

1. **Balance:** View your token balance
2. **Transfer:** Send tokens to another address
3. **Mint:** Create new tokens (mint new tokens)

### NFT Drop

1. **Browse:** View collection information
2. **Claim:** Claim available NFTs from the drop
3. **Collection:** View your owned NFTs


## Environment Variables Reference

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | Yes | Your Thirdweb API key from dashboard |
| `NEXT_PUBLIC_DEFAULT_NETWORK` | No | Default network: "testnet" or "mainnet" (default: "testnet") |
| `NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS` | No | ERC20 token contract address |
| `NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS` | No | NFT Drop contract address |

## Troubleshooting

### Wallet Connection Issues

- Ensure you have the correct network selected in your wallet
- Check that NEXT_PUBLIC_THIRDWEB_CLIENT_ID is set correctly
- Check that NEXT_PUBLIC_THIRDWEB_DEFAULT_NETWORK is set correctly
- Try refreshing the page and reconnecting

### Contract Interaction Errors

- Verify contract addresses are correct in `.env.local`
- Ensure you have enough gas funds (RBTC for Rootstock)
- Check that your wallet is on the correct network
- Review the contract ABI if custom functions are used

### Transaction Failures

- Check gas prices - Rootstock uses Bitcoin merge mining
- Ensure sufficient balance for gas fees
- Verify transaction parameters (addresses, amounts)
- Check contract permissions and approvals

## Resources

- [Rootstock Developer Docs](https://dev.rootstock.io/)
- [Thirdweb Documentation](https://docs.thirdweb.com/)
- [Rootstock GitHub](https://github.com/rsksmart)

## Security Considerations

- Never expose your private keys or mnemonics
- Use environment variables for sensitive data
- Test contracts on testnet before mainnet deployment
- Implement proper error handling for transactions
- Validate all user inputs before contract interactions
- Keep dependencies updated for security patches

## Support

For issues and questions:

1. Check the [Rootstock Documentation](https://dev.rootstock.io/)
2. Visit [Thirdweb Discord](https://discord.gg/thirdweb)
3. Check GitHub issues in this repository