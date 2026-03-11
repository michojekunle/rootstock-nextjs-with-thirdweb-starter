/**
 * Environment variable validation for startup.
 * Ensures all required config is present and well-formed before the app runs.
 */

import { isValidContractAddress } from "./contracts";

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all required environment variables.
 * Returns an object with validation status and helpful error messages.
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Thirdweb Client ID
  const thirdwebClientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!thirdwebClientId) {
    errors.push(
      "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Get one at https://thirdweb.com/dashboard"
    );
  }

  // Check Default Network
  const defaultNetwork = process.env.NEXT_PUBLIC_DEFAULT_NETWORK;
  if (!defaultNetwork) {
    errors.push(
      'NEXT_PUBLIC_DEFAULT_NETWORK is not set. Use "rootstock-mainnet" or "rootstock-testnet"'
    );
  } else if (!["rootstock-mainnet", "rootstock-testnet"].includes(defaultNetwork)) {
    warnings.push(
      `NEXT_PUBLIC_DEFAULT_NETWORK is "${defaultNetwork}". Expected "rootstock-mainnet" or "rootstock-testnet"`
    );
  }

  // Check ERC20 Contract Address (optional but warn if missing)
  const erc20Address = process.env.NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS;
  if (!erc20Address) {
    warnings.push(
      "NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS is not configured. ERC20 features will be unavailable."
    );
  } else if (!isValidContractAddress(erc20Address)) {
    errors.push(
      `NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS "${erc20Address}" is not a valid EVM address. Format: 0x + 40 hex chars`
    );
  }

  // Check NFT Drop Contract Address (optional but warn if missing)
  const nftDropAddress = process.env.NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS;
  if (!nftDropAddress) {
    warnings.push(
      "NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS is not configured. NFT features will be unavailable."
    );
  } else if (!isValidContractAddress(nftDropAddress)) {
    errors.push(
      `NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS "${nftDropAddress}" is not a valid EVM address. Format: 0x + 40 hex chars`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format validation errors into a readable message for display in the UI.
 */
export function formatValidationErrors(result: EnvValidationResult): string {
  const messages: string[] = [];

  if (result.errors.length > 0) {
    messages.push("Configuration Errors:");
    result.errors.forEach((err) => messages.push(`• ${err}`));
  }

  if (result.warnings.length > 0) {
    messages.push("\nWarnings:");
    result.warnings.forEach((warn) => messages.push(`• ${warn}`));
  }

  return messages.join("\n");
}
