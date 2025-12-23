import { defineChain } from "thirdweb"

/**
 * Rootstock Mainnet Configuration
 * Chain ID: 30
 * Native Currency: RBTC
 */
export const rootstockMainnet = defineChain({
  id: 30,
  name: "Rootstock Mainnet",
  nativeCurrency: {
    name: "Rootstock Bitcoin",
    symbol: "RBTC",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Rootstock Explorer",
      url: "https://explorer.rootstock.io",
      apiUrl: "https://explorer.rootstock.io/api",
    },
  ],
  rpc: "https://public-node.rsk.co",
  testnet: false,
})

/**
 * Rootstock Testnet Configuration
 * Chain ID: 31
 * Native Currency: tRBTC
 */
export const rootstockTestnet = defineChain({
  id: 31,
  name: "Rootstock Testnet",
  nativeCurrency: {
    name: "Test Rootstock Bitcoin",
    symbol: "tRBTC",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Rootstock Testnet Explorer",
      url: "https://rootstock-testnet.blockscout.com",
      apiUrl: "https://rootstock-testnet.blockscout.com/api",
    },
  ],
  rpc: "https://public-node.testnet.rsk.co",
  testnet: true,
})

/**
 * Get the active chain based on environment variable
 */
export const getActiveChain = () => {
  const network = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || "testnet"
  return network === "mainnet" ? rootstockMainnet : rootstockTestnet
}

/**
 * Get all supported chains
 */
export const supportedChains = [rootstockMainnet, rootstockTestnet]
