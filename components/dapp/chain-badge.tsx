"use client"

import { Badge } from "@/components/ui/badge"
import { rootstockMainnet, rootstockTestnet } from "@/lib/chains"

interface ChainBadgeProps {
  chainId: number
  className?: string
}

/**
 * Displays a styled badge indicating the blockchain network
 * Shows different colors for mainnet vs testnet
 */
export function ChainBadge({ chainId, className }: ChainBadgeProps) {
  const isMainnet = chainId === rootstockMainnet.id
  const isTestnet = chainId === rootstockTestnet.id

  if (!isMainnet && !isTestnet) {
    return (
      <Badge variant="outline" className={className}>
        Unknown Network
      </Badge>
    )
  }

  return (
    <Badge variant={isMainnet ? "default" : "secondary"} className={className}>
      {isMainnet ? "Mainnet" : "Testnet"}
    </Badge>
  )
}
