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
 * Button component with built-in transaction state management
 * Shows loading, success, and error states automatically
 */
export function TransactionButton({
  onTransaction,
  successMessage = "Success",
  errorMessage = "Failed",
  children,
  className,
  disabled,
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
      console.error("Transaction error:", error)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || status === "loading"}
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
