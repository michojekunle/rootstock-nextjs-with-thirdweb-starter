/// <reference types="jest" />

/**
 * Unit tests for lib/env-validation.ts
 */

import { validateEnvironment, formatValidationErrors } from "@/lib/env-validation";

// Save original env vars
const originalEnv = { ...process.env };

afterEach(() => {
  // Restore env vars
  process.env = originalEnv;
});

describe("env-validation", () => {
  describe("validateEnvironment", () => {
    it("detects missing THIRDWEB_CLIENT_ID", () => {
      process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID = "";
      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("NEXT_PUBLIC_THIRDWEB_CLIENT_ID"))).toBe(
        true
      );
    });

    it("detects missing DEFAULT_NETWORK", () => {
      process.env.NEXT_PUBLIC_DEFAULT_NETWORK = "";
      const result = validateEnvironment();

      expect(result.errors.some((e) => e.includes("NEXT_PUBLIC_DEFAULT_NETWORK"))).toBe(true);
    });

    it("accepts valid default networks", () => {
      process.env.NEXT_PUBLIC_DEFAULT_NETWORK = "rootstock-mainnet";
      process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID = "test-id";
      const result = validateEnvironment();

      expect(result.errors.length).toBe(0);
    });

    it("warns about invalid contract addresses", () => {
      process.env.NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS = "invalid-address";
      process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID = "test-id";
      process.env.NEXT_PUBLIC_DEFAULT_NETWORK = "rootstock-mainnet";

      const result = validateEnvironment();

      expect(result.errors.some((e) => e.includes("NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS"))).toBe(
        true
      );
    });

    it("returns warnings for missing optional contracts", () => {
      process.env.NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS = "";
      process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID = "test-id";
      process.env.NEXT_PUBLIC_DEFAULT_NETWORK = "rootstock-mainnet";

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.warnings.some((w) => w.includes("ERC20"))).toBe(true);
    });
  });

  describe("formatValidationErrors", () => {
    it("formats errors and warnings", () => {
      const result = {
        isValid: false,
        errors: ["Error 1", "Error 2"],
        warnings: ["Warning 1"],
      };

      const formatted = formatValidationErrors(result);

      expect(formatted).toContain("Configuration Errors");
      expect(formatted).toContain("Error 1");
      expect(formatted).toContain("Error 2");
      expect(formatted).toContain("Warnings");
      expect(formatted).toContain("Warning 1");
    });

    it("handles empty errors and warnings", () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      const formatted = formatValidationErrors(result);
      expect(formatted).toBe("");
    });
  });
});
