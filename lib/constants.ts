/**
 * Shared application constants.
 *
 * Centralising magic numbers here prevents them from scattering across components
 * and makes it easy to change them in one place.
 */

/**
 * Maximum ERC-20 approval amount shown in the UI.
 *
 * This is the *practical* upper limit presented to users, not the true uint256 max
 * (2^256 - 1 ≈ 1.15×10^77).  Using uint256 max on-chain is fine, but showing it
 * as a number in an input field is confusing.  999,999,999 tokens is effectively
 * "unlimited" for any real use-case while remaining human-readable.
 *
 * If you want to send the true uint256 max on-chain, set amount to this string
 * *after* multiplying by the token's decimals in the smart-contract call.
 */
export const MAX_APPROVAL_AMOUNT = "999999999";

/**
 * Minimum token quantity a user can mint or transfer.
 *
 * Prevents "dust" transactions (sub-cent amounts) that waste gas and clutter
 * the user's token history.  0.1 tokens is the lowest sensible unit for most
 * 18-decimal ERC-20 tokens used on Rootstock.
 */
export const MIN_TOKEN_QUANTITY = 0.1;

/**
 * Maximum token quantity per single mint transaction.
 *
 * A practical cap that avoids accidentally minting or claiming in the millions
 * via a typo.  Adjust if your token design requires larger single-tx amounts.
 */
export const MAX_MINT_QUANTITY = 1_000_000;

/**
 * Maximum NFT quantity claimable in a single transaction.
 */
export const MAX_NFT_CLAIM_QUANTITY = 10;

/**
 * Maximum token quantity per single transfer transaction.
 *
 * Acts as a UI-level sanity cap to prevent accidental over-transfers via typo.
 * This does not restrict what the contract itself allows.
 */
export const MAX_TRANSFER_AMOUNT = 1_000_000_000;
