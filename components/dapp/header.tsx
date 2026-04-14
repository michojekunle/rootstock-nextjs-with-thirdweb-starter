"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ConnectWalletButton } from "@/components/dapp/connect-wallet-button"
import { ChainSwitcher } from "@/components/dapp/chain-switcher"
import { useActiveWallet } from "thirdweb/react"

export function Header() {
  const wallet = useActiveWallet()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-xl px-4">
      <SidebarTrigger aria-label="Toggle Navigation Sidebar" className="shrink-0" />
      <Separator orientation="vertical" className="h-5 shrink-0" />

      <div className="flex flex-1 items-center justify-between min-w-0">
        <h1 className="hidden md:block text-sm font-semibold text-foreground/70 truncate">
          Rootstock dApp Starter
        </h1>

        <div className="flex items-center gap-2 ml-auto">
          {wallet && <ChainSwitcher />}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
