/// <reference types="jest" />

/**
 * Unit tests for lib/cache.ts
 */

import { getCached, setCached, clearCache, getTokenDataCacheKey, getNFTMetadataCacheKey } from "@/lib/cache";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("cache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("setCached and getCached", () => {
    it("stores and retrieves data", () => {
      const testData = { name: "Test Token", symbol: "TEST" };
      setCached("test_key", testData);

      const retrieved = getCached("test_key");
      expect(retrieved).toEqual(testData);
    });

    it("returns null for non-existent keys", () => {
      const retrieved = getCached("non_existent");
      expect(retrieved).toBeNull();
    });

    it("expires cached data after TTL", () => {
      const testData = { value: "test" };
      // Set with 0ms TTL (immediately expired)
      setCached("test_key", testData, 0);

      // Wait a tiny bit and check
      setTimeout(() => {
        const retrieved = getCached("test_key");
        expect(retrieved).toBeNull();
      }, 10);
    });

    it("handles different data types", () => {
      const testData = {
        string: "value",
        number: 42,
        boolean: true,
        array: [1, 2, 3],
      };

      setCached("complex_key", testData);
      const retrieved = getCached("complex_key");
      expect(retrieved).toEqual(testData);
    });
  });

  describe("clearCache", () => {
    it("removes cached value", () => {
      setCached("test_key", { data: "test" });
      expect(getCached("test_key")).not.toBeNull();

      clearCache("test_key");
      expect(getCached("test_key")).toBeNull();
    });
  });

  describe("getTokenDataCacheKey", () => {
    it("generates cache key with chain ID and address", () => {
      const key = getTokenDataCacheKey("0x1234567890123456789012345678901234567890", 30);
      expect(key).toContain("token_data:30:");
      expect(key).toContain("0x1234567890123456789012345678901234567890");
    });

    it("lowercases address for consistency", () => {
      const key1 = getTokenDataCacheKey(
        "0xABCDEF1234567890123456789012345678901234",
        30
      );
      const key2 = getTokenDataCacheKey(
        "0xabcdef1234567890123456789012345678901234",
        30
      );
      expect(key1).toBe(key2);
    });
  });

  describe("getNFTMetadataCacheKey", () => {
    it("generates cache key with chain, contract, and token ID", () => {
      const key = getNFTMetadataCacheKey(
        "0x1234567890123456789012345678901234567890",
        "42",
        30
      );
      expect(key).toContain("nft_metadata:30:");
      expect(key).toContain("0x1234567890123456789012345678901234567890");
      expect(key).toContain("42");
    });
  });
});
