"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionButtonProps extends React.ComponentProps<typeof Button> {
  onTransaction: () => Promise<void>
  successMessage?: string
  errorMessage?: string
}

/**
 * Button component with built-in transaction state management.
 * Shows loading, success, and error states automatically.
 *
 * Accessibility:
 * - aria-busy is set to true while the transaction is in progress so that
 *   screen readers announce the processing state (#8).
 * - aria-label updates to reflect the current button state so screen reader
 *   users know what is happening without needing to see the icon (#8).
 * - The button is disabled during loading to prevent duplicate submissions (#7).
 */
export function TransactionButton({
  onTransaction,
  successMessage = "Success",
  errorMessage = "Failed",
  children,
  className,
  disabled,
  // Forward any caller-supplied aria-label; fall back to derived label below
  "aria-label": callerAriaLabel,
  ...props
}: TransactionButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleClick = async () => {
    try {
      setStatus("loading")
      await onTransaction()
      setStatus("success")
      setTimeout(() => setStatus("idle"), 2000)
    } catch (error) {
      // Fix #12: only log in development; replace with a structured logger in production
      if (process.env.NODE_ENV === "development") {
        console.error("Transaction error:", error)
      }
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  // Fix #8: derive an accessible label for each state so screen readers
  // announce the change when the button transitions (e.g. "Processing transaction…")
  const derivedAriaLabel =
    status === "loading"
      ? "Processing transaction…"
      : status === "success"
        ? successMessage
        : status === "error"
          ? errorMessage
          : callerAriaLabel ?? undefined

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || status === "loading"}
      // Fix #8: aria-busy=true tells assistive technology the action is in-flight
      aria-busy={status === "loading"}
      aria-label={derivedAriaLabel}
      className={cn(
        "transition-all",
        status === "success" && "bg-green-600 hover:bg-green-600",
        status === "error" && "bg-destructive hover:bg-destructive",
        className,
      )}
      {...props}
    >
      {status === "loading" && <Spinner className="mr-2" />}
      {status === "success" && <CheckCircle2 className="mr-2 size-4" />}
      {status === "error" && <XCircle className="mr-2 size-4" />}

      {status === "loading" && "Processing..."}
      {status === "success" && successMessage}
      {status === "error" && errorMessage}
      {status === "idle" && children}
    </Button>
  )
}
