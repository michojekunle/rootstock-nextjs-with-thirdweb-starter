/**
 * Client-side caching utility for contract data with TTL (time-to-live).
 * Reduces RPC calls by caching token metadata, decimals, and other stable data.
 */

const CACHE_PREFIX = "rootstock_dapp_cache:";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Get a cached value if it exists and hasn't expired.
 */
export function getCached<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;

    const entry: CacheEntry<T> = JSON.parse(stored);
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
