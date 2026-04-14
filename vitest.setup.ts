import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock the Thirdweb SDK and other browser APIs that aren't available in JSDOM
vi.mock("thirdweb", () => ({
  getContract: vi.fn(),
  readContract: vi.fn(),
  prepareContractCall: vi.fn(),
  sendAndConfirmTransaction: vi.fn(),
  defineChain: vi.fn((c) => c),
  // lib/thirdweb.ts calls this at module init; must be present in the mock
  createThirdwebClient: vi.fn(() => ({})),
}));

vi.mock("thirdweb/react", () => ({
  useActiveAccount: vi.fn(),
  useActiveWalletChain: vi.fn(),
  useSwitchActiveWalletChain: vi.fn(),
  useActiveWallet: vi.fn(),
  // ConnectButton is a thirdweb-managed UI component; no test renders it directly.
  ConnectButton: vi.fn(() => null),
}));

// Mock window.location.reload for ErrorBoundary tests
Object.defineProperty(window, "location", {
  value: {
    reload: vi.fn(),
  },
  writable: true,
});
