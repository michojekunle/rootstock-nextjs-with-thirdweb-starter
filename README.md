# Rootstock dApp Starter Kit

A production-ready Next.js 15 dApp starter kit for building decentralized applications on the Rootstock blockchain using Thirdweb SDK v5.

## Features

- **Next.js 15 with App Router** - Latest Next.js with server components and optimized performance
- **Rootstock Network Support** - Pre-configured for both mainnet (chain ID 30) and testnet (chain ID 31)
- **Thirdweb SDK v5** - Complete integration with latest Thirdweb SDK for smart contract interactions
- **ERC20 Token Interface** - Mint, transfer, and manage tokens
- **ERC721 NFT Drop** - Create and claim NFTs with lazy minting
- **Marketplace** - Buy, sell, and trade assets with direct listings and offers
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

4. **Update `.env.local` with your configuration:**
   ```env
   # Required: Thirdweb Client ID from dashboard
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

   # Optional: Default network (mainnet or testnet)
   NEXT_PUBLIC_DEFAULT_NETWORK=testnet

   # Optional: Contract addresses (add after deployment)
   NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS=
   NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS=
   NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── erc20/                    # ERC20 token interface
│   ├── erc721/                   # NFT drop interface
│   ├── marketplace/              # Marketplace interface
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
│   ├── marketplace/             # Marketplace components
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
   - Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
   - Click "Deploy" and search for "ERC20"
   - Configure name, symbol, and initial supply
   - Deploy to Rootstock Testnet or Mainnet
   - Copy the contract address to `.env.local`

2. **NFT Drop (ERC721):**
   - Click "Deploy" and search for "ERC721 Drop"
   - Configure collection name and symbol
   - Set base URI for metadata
   - Deploy and add the address to `.env.local`

3. **Marketplace (MarketplaceV3):**
   - Click "Deploy" and search for "Marketplace"
   - Configure platform fee
   - Deploy and add the address to `.env.local`

### Deploy via Thirdweb CLI

```bash
npx thirdweb deploy

# Follow the prompts to deploy your contracts
# Make sure to deploy to Rootstock Testnet (chain ID 31) or Mainnet (chain ID 30)
```

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

### Add Network to MetaMask

1. Open MetaMask
2. Click the network selector at the top
3. Click "Add a custom network"
4. Fill in the details:
   - **Network Name:** Rootstock Testnet
   - **RPC URL:** https://public-node.testnet.rsk.co
   - **Chain ID:** 31
   - **Currency Symbol:** tRBTC
   - **Explorer URL:** https://rootstock-testnet.blockscout.com

5. Click "Save"

## Usage Guide

### Home Page
- View wallet connection status
- Switch between networks
- Quick start guide

### ERC20 Tokens
1. **Balance:** View your token balance
2. **Transfer:** Send tokens to another address
3. **Mint:** Create new tokens (if contract supports it)

### NFT Drop
1. **Browse:** View collection information
2. **Claim:** Claim available NFTs from the drop
3. **Collection:** View your owned NFTs

### Marketplace
1. **Browse:** View all active listings
2. **Buy:** Purchase NFTs or tokens from listings
3. **Sell:** Create listings for your assets
4. **Offer:** Make direct purchase offers

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | Yes | Your Thirdweb API key from dashboard |
| `NEXT_PUBLIC_DEFAULT_NETWORK` | No | Default network: "testnet" or "mainnet" (default: "testnet") |
| `NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS` | No | ERC20 token contract address |
| `NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS` | No | NFT Drop contract address |
| `NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS` | No | Marketplace contract address |

## Building for Production

```bash
npm run build
npm start
```

The app is optimized for production with:
- Automatic code splitting
- Image optimization
- CSS minification
- JavaScript compression

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import on Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variables in the dashboard
   - Click "Deploy"

### Deploy to Other Platforms

This Next.js app can be deployed to any platform supporting Node.js 18+:
- Netlify
- Firebase Hosting
- AWS Amplify
- DigitalOcean App Platform
- Railway
- Render

## Troubleshooting

### Wallet Connection Issues
- Ensure you have the correct network selected in your wallet
- Check that NEXT_PUBLIC_THIRDWEB_CLIENT_ID is set correctly
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
- [Thirdweb SDK v5 Docs](https://sdk.thirdweb.com/)
- [Rootstock GitHub](https://github.com/rsksmart)
- [Ethereum Development Guide](https://ethereum.org/en/developers/)

## Security Considerations

- Never expose your private keys or mnemonics
- Use environment variables for sensitive data
- Test contracts on testnet before mainnet deployment
- Implement proper error handling for transactions
- Validate all user inputs before contract interactions
- Keep dependencies updated for security patches

## License

MIT - See LICENSE file for details

## Support

For issues and questions:
1. Check the [Rootstock Documentation](https://dev.rootstock.io/)
2. Visit [Thirdweb Discord](https://discord.gg/thirdweb)
3. Check GitHub issues in this repository
4. Contact Rootstock support at https://dev.rootstock.io/contact-us/
