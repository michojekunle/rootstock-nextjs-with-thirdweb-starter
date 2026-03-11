/**
 * Contract addresses for Rootstock networks
 * Update these with your deployed contract addresses
 */

export const CONTRACT_ADDRESSES = {
  // ERC20 Token Contract
  ERC20: process.env.NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS || "",

  // NFT Drop Contract (ERC721)
  NFT_DROP: process.env.NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS || "",
} as const

/** EIP-55 / EVM address: "0x" followed by exactly 40 hex characters */
const EVM_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/

/**
 * Returns true when the given string looks like a valid EVM contract address.
 * Does not perform checksum validation — just format.
 */
export const isValidContractAddress = (address: string): boolean =>
  EVM_ADDRESS_REGEX.test(address)

/**
 * Returns true when all contract addresses are configured and well-formed
 */
export const isContractsConfigured = () => {
  return (
    isValidContractAddress(CONTRACT_ADDRESSES.ERC20) &&
    isValidContractAddress(CONTRACT_ADDRESSES.NFT_DROP)
  )
}

/**
 * Contract deployment guide URLs
 */
export const DEPLOYMENT_GUIDES = {
  THIRDWEB_DASHBOARD: "https://thirdweb.com/dashboard",
  ROOTSTOCK_DOCS: "https://dev.rootstock.io/developers/smart-contracts/thirdweb/overview/",
} as const
