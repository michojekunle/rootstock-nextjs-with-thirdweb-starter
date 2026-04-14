import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MintToken } from "@/components/erc20/mint-token"
import { useActiveAccount } from "thirdweb/react"

// Mock thirdweb/react
vi.mock("thirdweb/react", () => ({
  useActiveAccount: vi.fn(),
}))

describe("MintToken Form", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the form correctly", () => {
    (useActiveAccount as any).mockReturnValue({ address: "0x123" })
    render(<MintToken contractAddress="0xContract" />)

    expect(screen.getByLabelText(/Amount to Mint/i)).toBeDefined()
    expect(screen.getByRole("button", { name: /Mint Tokens/i })).toBeDefined()
  })

  it("shows validation error when amount is empty", async () => {
    (useActiveAccount as any).mockReturnValue({ address: "0x123" })
    render(<MintToken contractAddress="0xContract" />)

    const submitButton = screen.getByRole("button", { name: /Mint Tokens/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined()
      expect(screen.getByText(/Amount is required/i)).toBeDefined()
    })
  })

  it("shows validation error when amount is below minimum", async () => {
    (useActiveAccount as any).mockReturnValue({ address: "0x123" })
    render(<MintToken contractAddress="0xContract" />)

    const input = screen.getByLabelText(/Amount to Mint/i)
    fireEvent.change(input, { target: { value: "0.05" } })

    const submitButton = screen.getByRole("button", { name: /Mint Tokens/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Amount must be at least 0.1/i)).toBeDefined()
    })
  })

  it("shows error when wallet is not connected", async () => {
    (useActiveAccount as any).mockReturnValue(null)
    render(<MintToken contractAddress="0xContract" />)

    const input = screen.getByLabelText(/Amount to Mint/i)
    fireEvent.change(input, { target: { value: "1.0" } })

    const submitButton = screen.getByRole("button", { name: /Mint Tokens/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Wallet not connected/i)).toBeDefined()
    })
  })
})
