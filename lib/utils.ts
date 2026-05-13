import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getAddress } from 'thirdweb/utils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely format a raw token amount (BigInt string) to a human-readable decimal string.
 * Uses BigInt arithmetic throughout to avoid Number precision loss for large balances
 * (Number.MAX_SAFE_INTEGER is ~9×10^15; a token with 18 decimals overflows at ~10,000 tokens).
 */
export function formatTokenAmount(raw: string, decimals: number): string {
  const rawBig = BigInt(raw)
  // Use a loop instead of ** to stay compatible with the ES6 target in tsconfig
  let divisor = BigInt(1)
  for (let i = 0; i < decimals; i++) divisor *= BigInt(10)
  const intPart = rawBig / divisor
  const fracPart = rawBig % divisor
  if (fracPart === BigInt(0)) {
    return intPart.toLocaleString()
  }
  const fracStr = fracPart.toString().padStart(decimals, "0").slice(0, 6).replace(/0+$/, "")
  // If the fractional part is entirely below the 6-dp display threshold, show as integer
  if (!fracStr) return intPart.toLocaleString()
  return `${intPart.toLocaleString()}.${fracStr}`
}

/**
 * Parse a human-readable token amount string into its on-chain BigInt representation.
 *
 * Uses BigInt multiplication throughout — never routes `10 ** decimals` through a JS
 * Number, which would lose precision for decimals > 22 (IEEE 754 doubles are exact for
 * powers of 10 only up to 10^22).  All ERC-20 tokens use ≤ 18 decimals, but this
 * function is correct for any decimal count.
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [intPart, fracPart = ""] = amount.split(".")
  const paddedFrac = fracPart.padEnd(decimals, "0").slice(0, decimals)
  let multiplier = BigInt(1)
  for (let i = 0; i < decimals; i++) multiplier *= BigInt(10)
  return BigInt(intPart) * multiplier + BigInt(paddedFrac || "0")
}

/**
 * Sanitize a value returned from a smart contract for safe UI display.
 *
 * React already escapes JSX text content (no XSS risk), but a malicious contract
 * can return an arbitrarily long string that breaks layout.  This caps the value
 * and guarantees a string type regardless of what the RPC returned.
 */
export function sanitizeContractString(value: unknown, maxLength = 100): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, maxLength)
}

/**
 * Validate an EVM address using EIP-55 checksum validation via thirdweb's getAddress.
 *
 * Why not regex?  A regex like /^0x[a-fA-F0-9]{40}$/ passes structurally-valid
 * addresses that have an incorrect checksum (e.g. a copy-paste typo that changed
 * a letter's case).  getAddress() will throw on those, catching errors before a
 * transaction is sent.
 *
 * Accepts both all-lowercase (no checksum) and correctly checksummed addresses.
 */
export function isValidAddress(addr: string): boolean {
  try {
    getAddress(addr) // throws if address is invalid or has wrong checksum
    return true
  } catch {
    return false
  }
}
