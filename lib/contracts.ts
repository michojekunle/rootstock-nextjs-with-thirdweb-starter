/**
 * Contract addresses for Rootstock networks
 * Update these with your deployed contract addresses
 */

import { isAddress } from "thirdweb/utils"

export const CONTRACT_ADDRESSES = {
  // ERC20 Token Contract
  ERC20: process.env.NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS || "",

  // NFT Drop Contract (ERC721)
  NFT_DROP: process.env.NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS || "",
} as const

/**
 * Returns true when the given string is a valid EVM address.
 * Uses thirdweb's isAddress() which validates both format (0x + 40 hex chars)
 * and EIP-55 mixed-case checksum to catch single-character typos.
 */
export const isValidContractAddress = (address: string): boolean => {
  try {
    return isAddress(address)
  } catch {
    return false
  }
}

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
