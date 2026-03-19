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
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <Wallet className="size-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
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
      <CardContent className="flex items-center gap-3 p-4">
        {/* Wallet avatar with live connection dot */}
        <div className="relative shrink-0">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="size-4 text-primary" />
          </div>
          {/* Pulsing live dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-background">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold tabular-nums truncate">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
            {isCorrectChain ? (
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                Wrong Network
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Network className="size-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground truncate">{chainName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
