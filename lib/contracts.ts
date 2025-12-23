/**
 * Contract addresses for Rootstock networks
 * Update these with your deployed contract addresses
 */

export const CONTRACT_ADDRESSES = {
  // ERC20 Token Contract
  ERC20: process.env.NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS || "",

  // NFT Drop Contract (ERC721)
  NFT_DROP: process.env.NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS || "",

  // Marketplace Contract (MarketplaceV3)
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS || "",
} as const

/**
 * Check if contracts are configured
 */
export const isContractsConfigured = () => {
  return Object.values(CONTRACT_ADDRESSES).every((address) => address !== "")
}

/**
 * Contract deployment guide URLs
 */
export const DEPLOYMENT_GUIDES = {
  THIRDWEB_DASHBOARD: "https://thirdweb.com/dashboard",
  ROOTSTOCK_DOCS: "https://dev.rootstock.io/developers/smart-contracts/thirdweb/overview/",
  MARKETPLACE_GUIDE: "https://dev.rootstock.io/developers/smart-contracts/thirdweb/deploy-marketplace-contracts/",
} as const
