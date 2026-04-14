import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ErrorBoundary } from "@/components/dapp/error-boundary"
import type React from "react"

const ProblemChild = () => {
  throw new Error("Test Error")
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText("Safe Content")).toBeDefined()
  })

  it("renders fallback UI when an error occurs", () => {
    // Suppress console.error for this test as we expect an error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ProblemChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Something went wrong")).toBeDefined()
    spy.mockRestore()
  })

  it("renders default alert when no fallback is provided", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary componentName="TestComponent">
        <ProblemChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Something went wrong")).toBeDefined()
    expect(screen.getByText(/TestComponent encountered an error/)).toBeDefined()
  })

  it("calls window.location.reload when reload button is clicked", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    )

    const reloadButton = screen.getByText("Reload page")
    fireEvent.click(reloadButton)

    expect(window.location.reload).toHaveBeenCalled()
  })
})
