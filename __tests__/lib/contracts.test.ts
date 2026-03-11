/// <reference types="jest" />

/**
 * Unit tests for lib/contracts.ts
 */

import { isValidContractAddress } from "@/lib/contracts";

describe("contracts", () => {
  describe("isValidContractAddress", () => {
    it("returns true for valid EVM addresses", () => {
      expect(isValidContractAddress("0x1234567890123456789012345678901234567890")).toBe(
        true
      );
      expect(isValidContractAddress("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")).toBe(
        true
      );
      expect(isValidContractAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")).toBe(
        true
      );
    });

    it("returns false for invalid addresses", () => {
      // Too short
      expect(isValidContractAddress("0x1234567890123456789012345678901234567")).toBe(
        false
      );
      // Too long
      expect(isValidContractAddress("0x12345678901234567890123456789012345678901")).toBe(
        false
      );
      // Missing 0x prefix
      expect(isValidContractAddress("1234567890123456789012345678901234567890")).toBe(
        false
      );
      // Invalid hex characters
      expect(isValidContractAddress("0xZZZZZ678901234567890123456789012345678901")).toBe(
        false
      );
      // Empty string
      expect(isValidContractAddress("")).toBe(false);
    });

    it("is case-insensitive", () => {
      expect(isValidContractAddress("0xABCDEF1234567890123456789012345678901234")).toBe(
        true
      );
      expect(isValidContractAddress("0xabcdef1234567890123456789012345678901234")).toBe(
        true
      );
    });
  });
});
