/**
 * Client-side caching utility for contract data with TTL (time-to-live).
 * Reduces RPC calls by caching token metadata, decimals, and other stable data.
 *
 * Security note: localStorage can be read and written by any JavaScript running
 * on the same origin. An XSS vulnerability could allow a malicious script to
 * inject fake token data. Mitigations in place:
 *   1. Schema version (CACHE_VERSION) — entries from a different version are
 *      discarded, which limits stale or incompatible data from persisting.
 *   2. Short TTL (5 min default) — limits the window in which tampered data
 *      could be served.
 *   3. The app always re-fetches live data on user-initiated transactions.
 * This cache is suitable for display data only, never for security decisions.
 */

const CACHE_PREFIX = "rootstock_dapp_cache:";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Increment this whenever the CacheEntry shape changes.
 * Any stored entry with a different version will be treated as a cache miss
 * and evicted, preventing stale or incompatible data from being returned.
 */
const CACHE_VERSION = 1;

interface CacheEntry<T> {
  v: number;
  data: T;
  expiresAt: number;
}

/**
 * Get a cached value if it exists, hasn't expired, and matches the current
 * schema version. Returns null on any mismatch so the caller re-fetches.
 *
 * Note: localStorage is same-origin accessible. See module-level security note.
 */
export function getCached<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const entry: CacheEntry<T> = JSON.parse(stored);

    // Reject entries from a different schema version
    if (entry.v !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (error) {
    // Silently fail if localStorage is unavailable or data is corrupted
    if (process.env.NODE_ENV === "development") {
      console.warn("Cache read failed for key:", key, error);
    }
    return null;
  }
}

/**
 * Store a value in cache with TTL.
 */
export function setCached<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  try {
    const entry: CacheEntry<T> = {
      v: CACHE_VERSION,
      data,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    // Silently fail if localStorage is full or unavailable
    if (process.env.NODE_ENV === "development") {
      console.warn("Cache write failed for key:", key, error);
    }
  }
}

/**
 * Clear a specific cached value.
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Cache clear failed for key:", key, error);
    }
  }
}

/**
 * Clear all cached values for this dApp.
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(CACHE_PREFIX)
    );
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Clear all cache failed:", error);
    }
  }
}

/**
 * Generate a cache key for token contract data.
 */
export function getTokenDataCacheKey(contractAddress: string, chainId: number): string {
  return `token_data:${chainId}:${contractAddress.toLowerCase()}`;
}

/**
 * Generate a cache key for NFT metadata.
 */
export function getNFTMetadataCacheKey(contractAddress: string, tokenId: string, chainId: number): string {
  return `nft_metadata:${chainId}:${contractAddress.toLowerCase()}:${tokenId}`;
}
