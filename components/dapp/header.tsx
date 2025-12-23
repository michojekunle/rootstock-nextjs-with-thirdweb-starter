"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ConnectWalletButton } from "@/components/dapp/connect-wallet-button"
import { ChainSwitcher } from "@/components/dapp/chain-switcher"
import { useActiveWallet } from "thirdweb/react"

export function Header() {
  const wallet = useActiveWallet()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Rootstock dApp Starter</h1>
        </div>

        <div className="flex items-center gap-2">
          {wallet && <ChainSwitcher />}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
