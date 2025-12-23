"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  error?: string
  retry?: () => void
}

/**
 * Error state component with optional retry functionality
 * Provides user-friendly error messages
 */
export function ErrorState({ title = "Something went wrong", error, retry }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error}</p>
        {retry && (
          <Button size="sm" variant="outline" onClick={retry} className="mt-2 bg-transparent">
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
