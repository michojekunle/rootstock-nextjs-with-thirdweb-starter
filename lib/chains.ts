import { defineChain } from "thirdweb";

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
});

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
});

/**
 * Get the active chain based on the NEXT_PUBLIC_DEFAULT_NETWORK environment variable.
 * Accepts "rootstock-mainnet" or "mainnet" for mainnet;
 * all other values (including "rootstock-testnet" / "testnet") fall back to testnet.
 *
 * IMPORTANT — build-time value: this function reads an env var baked in at build time,
 * so it always returns the same chain regardless of which network the user's wallet
 * is currently connected to. The `isCorrectChain` guard used on the ERC20/ERC721
 * pages is load-bearing: it prevents users from sending transactions to the wrong
 * network if their wallet is on a different chain. Do NOT remove that guard without
 * replacing it with an equivalent runtime network check.
 */
export const getActiveChain = () => {
  const network = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || "rootstock-testnet";
  return network === "rootstock-mainnet" || network === "mainnet"
    ? rootstockMainnet
    : rootstockTestnet;
};

/**
 * Get all supported chains
 */
export const supportedChains = [rootstockMainnet, rootstockTestnet];
