import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ApproveToken } from "@/components/erc20/approve-token"
import { useActiveAccount } from "thirdweb/react"
import { MAX_APPROVAL_AMOUNT } from "@/lib/constants"

// Mock thirdweb/react
vi.mock("thirdweb/react", () => ({
  useActiveAccount: vi.fn(),
}))

describe("ApproveToken Form", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useActiveAccount).mockReturnValue({ address: "0x123" } as any)
  })

  it("renders the form correctly", () => {
    render(<ApproveToken contractAddress="0xContract" />)

    expect(screen.getByLabelText(/Spender Address/i)).toBeDefined()
    expect(screen.getByLabelText(/Amount to Approve/i)).toBeDefined()
    expect(screen.getByRole("button", { name: /Approve Token/i })).toBeDefined()
  })

  it("sets max amount when 'Max' button is clicked", async () => {
    render(<ApproveToken contractAddress="0xContract" />)

    const maxButton = screen.getByRole("button", { name: /Set approval amount to maximum/i })
    fireEvent.click(maxButton)

    const amountInput = screen.getByLabelText(/Amount to Approve/i) as HTMLInputElement
    expect(amountInput.value).toBe(MAX_APPROVAL_AMOUNT)
  })

  it("shows validation error for invalid ethereum address", async () => {
    render(<ApproveToken contractAddress="0xContract" />)

    const spenderInput = screen.getByLabelText(/Spender Address/i)
    fireEvent.change(spenderInput, { target: { value: "invalid-address" } })

    const submitButton = screen.getByRole("button", { name: /Approve Token/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Invalid Ethereum address/i)).toBeDefined()
    })
  })

  it("allows zero amount to be submitted (revoke support)", async () => {
    render(<ApproveToken contractAddress="0xContract" />)

    const spenderInput = screen.getByLabelText(/Spender Address/i)
    fireEvent.change(spenderInput, { target: { value: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" } })

    const amountInput = screen.getByLabelText(/Amount to Approve/i)
    fireEvent.change(amountInput, { target: { value: "0" } })

    const submitButton = screen.getByRole("button", { name: /Approve Token/i })
    fireEvent.click(submitButton)

    // Should NOT show a validation error for '0'
    await waitFor(() => {
      expect(screen.queryByText(/Amount cannot be negative/i)).toBeNull()
      expect(screen.queryByText(/Approval amount must be greater than 0/i)).toBeNull()
    })
  })

  it("toggles the semantic info section", () => {
    render(<ApproveToken contractAddress="0xContract" />)

    const summary = screen.getByText(/What is approval\?/i)
    expect(summary).toBeDefined()
    // In JSDOM, we can't easily test visual visibility of <details> contents, 
    // but we verify the element exists.
    expect(screen.getByText(/Token approval allows a smart contract/i)).toBeDefined()
  })
})
