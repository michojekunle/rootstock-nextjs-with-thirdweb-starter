import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { TransferToken } from "@/components/erc20/transfer-token"
import { useActiveAccount } from "thirdweb/react"

vi.mock("thirdweb/react", () => ({
  useActiveAccount: vi.fn(),
}))

describe("TransferToken Form", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useActiveAccount).mockReturnValue({ address: "0x123" } as ReturnType<typeof useActiveAccount>)
  })

  it("renders recipient and amount inputs with submit button", () => {
    render(<TransferToken contractAddress="0xContract" />)

    expect(screen.getByLabelText(/Recipient Address/i)).toBeDefined()
    expect(screen.getByLabelText(/Amount/i)).toBeDefined()
    expect(screen.getByRole("button", { name: /Transfer Token/i })).toBeDefined()
  })

  it("shows validation error when recipient is empty", async () => {
    render(<TransferToken contractAddress="0xContract" />)

    fireEvent.click(screen.getByRole("button", { name: /Transfer Token/i }))

    await waitFor(() => {
      expect(screen.getByText(/Recipient address is required/i)).toBeDefined()
    })
  })

  it("shows validation error for invalid recipient address", async () => {
    render(<TransferToken contractAddress="0xContract" />)

    fireEvent.change(screen.getByLabelText(/Recipient Address/i), {
      target: { value: "not-an-address" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Transfer Token/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid Ethereum address/i)).toBeDefined()
    })
  })

  it("shows validation error when amount is below minimum", async () => {
    render(<TransferToken contractAddress="0xContract" />)

    fireEvent.change(screen.getByLabelText(/Recipient Address/i), {
      target: { value: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
    })
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "0.05" } })
    fireEvent.click(screen.getByRole("button", { name: /Transfer Token/i }))

    await waitFor(() => {
      expect(screen.getByText(/Amount must be at least 0.1/i)).toBeDefined()
    })
  })

  it("shows error when wallet is not connected", async () => {
    vi.mocked(useActiveAccount).mockReturnValue(undefined)
    render(<TransferToken contractAddress="0xContract" />)

    fireEvent.change(screen.getByLabelText(/Recipient Address/i), {
      target: { value: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
    })
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "1.0" } })
    fireEvent.click(screen.getByRole("button", { name: /Transfer Token/i }))

    await waitFor(() => {
      expect(screen.getByText(/Wallet not connected/i)).toBeDefined()
    })
  })
})
