import { describe, it, expect, vi, beforeEach } from "vitest";
import { getActiveChain, rootstockMainnet, rootstockTestnet, supportedChains } from "@/lib/chains";

describe("Chain Logic", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("should return rootstockTestnet by default", () => {
    delete process.env.NEXT_PUBLIC_DEFAULT_NETWORK;
    expect(getActiveChain().id).toBe(rootstockTestnet.id);
  });

  it("should return rootstockMainnet when configured", () => {
    process.env.NEXT_PUBLIC_DEFAULT_NETWORK = "rootstock-mainnet";
    expect(getActiveChain().id).toBe(rootstockMainnet.id);
  });

  it("should return rootstockMainnet when 'mainnet' is specified", () => {
    process.env.NEXT_PUBLIC_DEFAULT_NETWORK = "mainnet";
    expect(getActiveChain().id).toBe(rootstockMainnet.id);
  });

  it("should fallback to testnet for any other value", () => {
    process.env.NEXT_PUBLIC_DEFAULT_NETWORK = "some-other-network";
    expect(getActiveChain().id).toBe(rootstockTestnet.id);
  });

  it("should have correct chain IDs", () => {
    expect(rootstockMainnet.id).toBe(30);
    expect(rootstockTestnet.id).toBe(31);
  });

  it("should include both chains in supportedChains", () => {
    expect(supportedChains).toContain(rootstockMainnet);
    expect(supportedChains).toContain(rootstockTestnet);
    expect(supportedChains.length).toBe(2);
  });
});
