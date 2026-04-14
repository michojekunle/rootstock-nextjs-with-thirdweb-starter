import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { TransactionButton } from "@/components/dapp/transaction-button"

describe("TransactionButton", () => {
  it("renders children in idle state", () => {
    render(
      <TransactionButton onTransaction={vi.fn().mockResolvedValue(undefined)}>
        Submit
      </TransactionButton>,
    )
    expect(screen.getByRole("button", { name: /Submit/i })).toBeDefined()
  })

  it("is disabled and shows Processing text while transaction is in flight", async () => {
    // Never resolves so we can inspect the loading state
    const pending = new Promise<void>(() => {})
    render(
      <TransactionButton onTransaction={() => pending} aria-label="Submit">
        Submit
      </TransactionButton>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }))

    await waitFor(() => {
      const btn = screen.getByRole("button")
      expect(btn.hasAttribute("disabled")).toBe(true)
      expect(btn.getAttribute("aria-busy")).toBe("true")
      expect(screen.getByText(/Processing/i)).toBeDefined()
    })
  })

  it("shows success message after transaction resolves", async () => {
    render(
      <TransactionButton
        onTransaction={vi.fn().mockResolvedValue(undefined)}
        successMessage="Transfer complete"
        aria-label="Submit"
      >
        Submit
      </TransactionButton>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Transfer complete/i)).toBeDefined()
    })
  })

  it("shows error message after transaction rejects", async () => {
    render(
      <TransactionButton
        onTransaction={vi.fn().mockRejectedValue(new Error("revert"))}
        errorMessage="Transaction failed"
        aria-label="Submit"
      >
        Submit
      </TransactionButton>,
    )

    fireEvent.click(screen.getByRole("button", { name: /Submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Transaction failed/i)).toBeDefined()
    })
  })

  it("sets aria-busy=false when not loading", () => {
    render(
      <TransactionButton onTransaction={vi.fn().mockResolvedValue(undefined)} aria-label="Submit">
        Submit
      </TransactionButton>,
    )

    const btn = screen.getByRole("button", { name: /Submit/i })
    expect(btn.getAttribute("aria-busy")).toBe("false")
  })
})
