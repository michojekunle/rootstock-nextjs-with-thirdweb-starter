import { describe, it, expect } from "vitest";
import { formatTokenAmount, parseTokenAmount, sanitizeContractString, isValidAddress } from "@/lib/utils";

describe("Utility Functions", () => {
  // ── formatTokenAmount ────────────────────────────────────────────────────────
  describe("formatTokenAmount", () => {
    it("should format whole numbers correctly", () => {
      expect(formatTokenAmount("1000000000000000000", 18)).toBe("1");
    });

    it("should handle fractional amounts", () => {
      expect(formatTokenAmount("1500000000000000000", 18)).toBe("1.5");
    });

    it("should handle very small amounts", () => {
      // 1_000_000_000_000 raw units with 18 decimals = 0.000001 tokens (one millionth)
      expect(formatTokenAmount("1000000000000", 18)).toBe("0.000001");
    });

    it("should return integer string when amount is below 6dp display threshold", () => {
      // 1 raw unit with 18 decimals = 10^-18, rounds to 0 at 6dp — show as "0" not "0."
      expect(formatTokenAmount("1", 18)).toBe("0");
    });

    it("should format with commas", () => {
      expect(formatTokenAmount("1000000000000000000000", 18)).toBe("1,000");
    });

    it("should handle zero", () => {
      expect(formatTokenAmount("0", 18)).toBe("0");
    });
  });

  // ── parseTokenAmount ─────────────────────────────────────────────────────────
  describe("parseTokenAmount", () => {
    it("should parse a whole number with 18 decimals", () => {
      expect(parseTokenAmount("1", 18)).toBe(BigInt("1000000000000000000"));
    });

    it("should parse a decimal amount correctly", () => {
      expect(parseTokenAmount("1.5", 18)).toBe(BigInt("1500000000000000000"));
    });

    it("should handle zero", () => {
      expect(parseTokenAmount("0", 18)).toBe(BigInt(0));
    });

    it("should truncate excess decimal places rather than rounding", () => {
      // 0.001 with 2 decimals → 0 (truncated, not rounded)
      expect(parseTokenAmount("0.001", 2)).toBe(BigInt(0));
    });

    it("should handle 6-decimal tokens (USDC-style)", () => {
      expect(parseTokenAmount("1.5", 6)).toBe(BigInt("1500000"));
    });

    it("roundtrips with formatTokenAmount", () => {
      const raw = "123456789000000000"
      const formatted = formatTokenAmount(raw, 18)     // "0.123456"
      const reparsed = parseTokenAmount(formatted, 18)
      // Reparsed won't equal original exactly (6dp truncation) but must be close
      expect(reparsed).toBe(BigInt("123456000000000000"))
    });
  });

  // ── sanitizeContractString ───────────────────────────────────────────────────
  describe("sanitizeContractString", () => {
    it("returns the string unchanged when under the limit", () => {
      expect(sanitizeContractString("MyToken")).toBe("MyToken");
    });

    it("truncates strings that exceed maxLength", () => {
      const long = "A".repeat(200);
      expect(sanitizeContractString(long).length).toBe(100);
    });

    it("respects a custom maxLength", () => {
      expect(sanitizeContractString("ABCDEF", 4)).toBe("ABCD");
    });

    it("trims leading and trailing whitespace", () => {
      expect(sanitizeContractString("  MyToken  ")).toBe("MyToken");
    });

    it("returns empty string for non-string input", () => {
      expect(sanitizeContractString(42)).toBe("");
      expect(sanitizeContractString(null)).toBe("");
      expect(sanitizeContractString(undefined)).toBe("");
    });
  });

  // ── isValidAddress ───────────────────────────────────────────────────────────
  describe("isValidAddress", () => {
    it("should return true for valid checksummed addresses", () => {
      // Vitalik's address correctly checksummed
      expect(isValidAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")).toBe(true);
    });

    it("should return true for valid lowercase addresses", () => {
      expect(isValidAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045")).toBe(true);
    });

    it("should return false for invalid length", () => {
      expect(isValidAddress("0x123")).toBe(false);
    });

    it("should return false for invalid characters", () => {
      expect(isValidAddress("0xG8da6bf26964af9d7eed9e03e53415d37aa96045")).toBe(false);
    });

    it("should return false for incorrect checksum", () => {
      // Changed one char case
      expect(isValidAddress("0xd8DA6BF26964aF9D7eEd9e03E53415D37aA96044")).toBe(false);
    });
  });
});
