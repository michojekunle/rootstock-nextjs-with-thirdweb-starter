import type React from "react"
import type { Metadata } from "next"
import { ThirdwebProvider } from "@/components/providers/thirdweb-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/dapp/header"
import { Toaster } from "@/components/ui/sonner"
import { AppInitializer } from "@/components/dapp/app-initializer"
import { ErrorBoundary } from "@/components/dapp/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Rootstock dApp Starter | Thirdweb SDK v5",
  description:
    "Production-ready Next.js 16 dApp starter kit for Rootstock blockchain with Thirdweb SDK v5. Features ERC20 and ERC721 integrations.",
  keywords: ["Rootstock", "Bitcoin", "dApp", "Web3", "Thirdweb", "ERC20", "NFT", "RBTC", "tRBTC"],
  // Icons are auto-discovered from app/icon.tsx and app/apple-icon.tsx —
  // no manual declaration needed here.
  openGraph: {
    title: "Rootstock dApp Starter",
    description: "Production-ready ERC20 & ERC721 dApp built on Rootstock with Thirdweb SDK v5.",
    type: "website",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "Rootstock dApp" }],
  },
  twitter: {
    card: "summary",
    title: "Rootstock dApp Starter",
    description: "Production-ready ERC20 & ERC721 dApp on Rootstock.",
    images: ["/icon.svg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`font-sans antialiased`}>
        <noscript>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#fff",
            padding: "20px",
            fontFamily: "system-ui, sans-serif",
          }}>
            <div style={{ maxWidth: "500px", textAlign: "center" }}>
              <h1 style={{ fontSize: "24px", marginBottom: "16px", color: "#333" }}>
                JavaScript is disabled
              </h1>
              <p style={{ color: "#666", marginBottom: "16px" }}>
                This dApp requires JavaScript to be enabled. Please enable JavaScript in your browser settings and reload the page.
              </p>
              <code style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
                display: "block",
                fontSize: "12px",
                color: "#333"
              }}>
                Rootstock dApp • Powered by Thirdweb
              </code>
            </div>
          </div>
        </noscript>

        <AppInitializer>
          <ThirdwebProvider>
            <ErrorBoundary componentName="Root App">
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <ErrorBoundary componentName="Header">
                    <Header />
                  </ErrorBoundary>
                  <ErrorBoundary componentName="Page Content">
                    {children}
                  </ErrorBoundary>
                </SidebarInset>
              </SidebarProvider>
            </ErrorBoundary>
            <Toaster />
          </ThirdwebProvider>
        </AppInitializer>
      </body>
    </html>
  )
}
