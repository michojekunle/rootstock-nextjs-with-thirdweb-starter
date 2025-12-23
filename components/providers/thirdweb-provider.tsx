"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { ThirdwebProvider as TWProvider } from "thirdweb/react"
import type { ReactNode } from "react"

interface ThirdwebProviderProps {
  children: ReactNode
}

/**
 * Thirdweb Provider wrapper for the entire application
 * Provides access to Thirdweb SDK and wallet connection throughout the app
 */
export function ThirdwebProvider({ children }: ThirdwebProviderProps) {
  return (
    <TWProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </TWProvider>
  )
}
