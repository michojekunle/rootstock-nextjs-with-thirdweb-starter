# Rootstock Nextjs Thirdweb dApp Starter Kit

A production-ready Next.js 16 dApp starter kit for building decentralized applications on the Rootstock blockchain using Thirdweb SDK v5.

## Features

- **Next.js 16 with App Router** - Latest Next.js with server components and optimized performance
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
   - Follow this [prebuilt contract](https://thirdweb.com/thirdweb.eth/DropERC721) and click 'Deploy Now'
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


## Development Workflow

### Testnet vs Mainnet Deployment

**Development (Testnet):**
```env
NEXT_PUBLIC_DEFAULT_NETWORK=rootstock-testnet
# Testnet faucet: https://faucet.rootstock.io
```

**Production (Mainnet):**
```env
NEXT_PUBLIC_DEFAULT_NETWORK=rootstock-mainnet
# Requires real RBTC for gas and operations
```

### Step-by-Step Deployment Guide

#### 1. Create Smart Contracts

Using Thirdweb Dashboard:
- Go to https://thirdweb.com/dashboard
- Click "Deploy Contract"
- Select ERC20 or ERC721 template
- Configure your contract:
  - **ERC20:** Set name, symbol, decimals, initial supply
  - **ERC721:** Set name, symbol, base metadata URI
- Select **Rootstock Testnet** as the target network
- Deploy and note the contract address

#### 2. Configure Environment Variables

```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your values
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_from_dashboard
NEXT_PUBLIC_DEFAULT_NETWORK=rootstock-testnet
NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS=0x... # from step 1
NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS=0x... # from step 1
```

#### 3. Test Locally

```bash
pnpm dev
# Visit http://localhost:3000
# Connect wallet and test token operations
```

#### 4. Deploy to Mainnet (When Ready)

Only deploy to mainnet after:
- ✅ Full testing on testnet
- ✅ Verified contract security
- ✅ Code audit or review
- ✅ Test with real transactions

```bash
# Create mainnet contracts on Thirdweb Dashboard

# Update .env for production
NEXT_PUBLIC_DEFAULT_NETWORK=rootstock-mainnet
NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS=0x...  # mainnet contract
NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS=0x... # mainnet contract
```

### Gas Optimization Tips

**Reduce Transaction Costs:**
1. **Batch Operations** - The dApp already batches NFT metadata fetches
2. **Caching** - Token data is cached for 5 minutes to reduce RPC calls
3. **Lazy Loading** - NFTs limit to 50 per wallet to avoid excessive loads
4. **ERC20 Approvals** - Pre-approve tokens once instead of per-transaction

**Monitor Gas Usage:**
- Rootstock block explorer: https://explorer.rootstock.io
- Check gas prices in RBTC
- Optimize contract code for smaller bytecode

## Usage Guide

### Home Page

- View wallet connection status
- Switch between networks
- Quick start guide

### ERC20 Tokens

1. **Token Info:** View name, symbol, decimals, total supply
2. **Balance:** Check your current token balance
3. **Transfer:** Send tokens to another address with decimals support
4. **Mint:** Create new tokens (requires mint permission)
5. **Approve:** Grant spending permission to other contracts (required for DeFi)

### NFT Drop

1. **Drop Info:** View collection metadata
2. **Claim:** Claim available NFTs from the drop
3. **Your Collection:** View your owned NFTs (limited to first 50 for performance)


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
- Check that NEXT_PUBLIC_DEFAULT_NETWORK is set correctly
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

## Production Checklist

Before deploying to mainnet, ensure:

- [ ] All contracts tested on testnet
- [ ] Contract addresses validated in `.env`
- [ ] Wallet connection tested with multiple wallets
- [ ] Error boundaries functioning (no white screens)
- [ ] Toast notifications displaying correctly
- [ ] JavaScript disabled fallback tested
- [ ] Gas estimation accurate
- [ ] Approval workflow tested for DEX operations
- [ ] Rate limiting configured if needed
- [ ] Error tracking (Sentry or similar) configured
- [ ] Analytics configured for user interactions

## Security Considerations

- **Private Keys:** Never expose your private keys or mnemonics
- **Environment Variables:** Use `.env.local` for sensitive data, never commit to git
- **Contract Testing:** Test contracts on testnet before mainnet deployment
- **Input Validation:** Validate all user inputs before contract interactions
- **Address Verification:** Always verify contract addresses match deployment
- **Approvals:** Understand ERC20 approval risks before implementing auto-approval
- **Error Handling:** Implement proper error handling for failed transactions
- **Dependencies:** Keep npm packages updated for security patches
- **XSS Prevention:** The dApp validates image URLs to prevent XSS attacks
- **Rate Limiting:** Consider rate limiting RPC calls in production

## Performance Considerations

- **Caching:** Token metadata cached for 5 minutes (configurable)
- **Batching:** NFT metadata fetches are batched with Promise.all
- **Limits:** NFT display limited to 50 items per wallet
- **Lazy Loading:** Components use React Suspense for code splitting
- **Asset Optimization:** Tailwind CSS v4 with PurgeCSS enabled
- **Bundle Size:** TypeScript + Next.js produces ~150KB gzipped

## Testing Guide

### Unit Tests

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage
```

### Manual Testing Checklist

1. **Wallet Connection**
   - [ ] Connect with MetaMask
   - [ ] Disconnect and reconnect
   - [ ] Switch between testnet and mainnet

2. **ERC20 Operations**
   - [ ] View token balance
   - [ ] Transfer tokens to self
   - [ ] Mint new tokens
   - [ ] Approve spender address

3. **ERC721 Operations**
   - [ ] View NFT collection info
   - [ ] Claim an NFT
   - [ ] View owned NFTs

4. **Error Scenarios**
   - [ ] Insufficient balance
   - [ ] Wrong network selected
   - [ ] Invalid addresses
   - [ ] Network errors

5. **Browser Compatibility**
   - [ ] Chrome/Edge
   - [ ] Firefox
   - [ ] Safari
   - [ ] Mobile (MetaMask Mobile)

## Support

For issues and questions:

1. Check the [Rootstock Documentation](https://dev.rootstock.io/)
2. Visit [Thirdweb Discord](https://discord.gg/thirdweb)
3. Check GitHub issues in this repository