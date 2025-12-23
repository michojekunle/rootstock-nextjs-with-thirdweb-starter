"use client"

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Network } from "lucide-react"
import { getActiveChain } from "@/lib/chains"

/**
 * Displays the current wallet connection status and active chain
 * Shows wallet address and network information when connected
 */
export function WalletStatus() {
  const account = useActiveAccount()
  const chain = useActiveWalletChain()
  const activeChain = getActiveChain()

  if (!account) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 p-4">
          <Wallet className="size-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">No Wallet Connected</p>
            <p className="text-xs text-muted-foreground">Connect your wallet to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isCorrectChain = chain?.id === activeChain.id
  const chainName = chain?.name || "Unknown Network"

  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
            {isCorrectChain ? (
              <Badge variant="default" className="text-xs">
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Wrong Network
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Network className="size-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">{chainName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
