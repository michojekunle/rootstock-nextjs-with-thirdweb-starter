"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"
import { rootstockMainnet, rootstockTestnet } from "@/lib/chains"

interface ChainBadgeProps {
  chainId: number
  className?: string
}

/**
 * Renders a network status card showing the currently connected chain.
 * Used on the Dashboard alongside WalletStatus to give a full picture
 * of the connection state.
 */
export function ChainBadge({ chainId, className }: ChainBadgeProps) {
  const isMainnet = chainId === rootstockMainnet.id
  const isTestnet = chainId === rootstockTestnet.id
  const isKnown = isMainnet || isTestnet

  const networkName = isMainnet
    ? "Rootstock Mainnet"
    : isTestnet
    ? "Rootstock Testnet"
    : "Unknown Network"

  const networkEnv = isMainnet ? "Production" : isTestnet ? "Development" : "—"

  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Globe className="size-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">{networkName}</p>
            {isKnown ? (
              <Badge
                variant={isMainnet ? "default" : "secondary"}
                className="text-[10px] px-1.5 py-0 shrink-0"
              >
                {networkEnv}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                Unsupported
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Chain ID: {chainId}</p>
        </div>
      </CardContent>
    </Card>
  )
}
