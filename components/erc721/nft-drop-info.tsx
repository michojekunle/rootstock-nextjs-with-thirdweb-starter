"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { client } from "@/lib/thirdweb"
import { getContract, readContract } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { getCached, setCached, getNFTMetadataCacheKey } from "@/lib/cache"
import { sanitizeContractString } from "@/lib/utils"
import { Tag, Hash, Layers, RefreshCw } from "lucide-react"

interface NFTDropInfoProps {
  contractAddress: string
  /** Increment to trigger a background re-fetch after a confirmed claim */
  refreshKey?: number
  /** Optimistic count to add to totalMinted while the re-fetch is in-flight */
  optimisticMintedDelta?: number | null
}

interface DropData {
  name: string
  symbol: string
  totalSupply: string
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  mono?: boolean
  badge?: React.ReactNode
}

function StatCard({ icon: Icon, label, value, mono, badge }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon className="size-4 text-violet-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={`text-sm font-semibold truncate ${mono ? "font-mono" : ""}`}>{value}</p>
        </div>
        {badge}
      </CardContent>
    </Card>
  )
}

// Stable cache key for NFT drop collection-level metadata (not per-token)
function getDropCacheKey(contractAddress: string, chainId: number): string {
  return getNFTMetadataCacheKey(contractAddress, "collection", chainId)
}

export function NFTDropInfo({
  contractAddress,
  refreshKey = 0,
  optimisticMintedDelta,
}: NFTDropInfoProps) {
  const [dropData, setDropData] = useState<DropData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFirstMount = useRef(true)

  useEffect(() => {
    let cancelled = false

    const fetchDropInfo = async () => {
      try {
        setError(null)

        const chain = getActiveChain()
        const cacheKey = getDropCacheKey(contractAddress, chain.id)

        // Only read cache on the very first load — re-fetches must bypass it so
        // totalSupply (which increases on every claim) stays accurate.
        const cached = isFirstMount.current ? getCached<DropData>(cacheKey) : null
        if (cached && !cancelled) {
          setDropData(cached)
          setLoading(false)
          isFirstMount.current = false
          return
        }

        if (isFirstMount.current) {
          setLoading(true)
        } else {
          setIsRefreshing(true)
        }

        const contract = getContract({ client, address: contractAddress, chain })

        const [name, symbol, totalSupply] = await Promise.all([
          readContract({ contract, method: "function name() view returns (string)", params: [] }),
          readContract({ contract, method: "function symbol() view returns (string)", params: [] }),
          readContract({ contract, method: "function totalSupply() view returns (uint256)", params: [] }),
        ])

        const data: DropData = {
          // sanitizeContractString caps at 100 chars — prevents UI breakage from
          // maliciously long values returned by adversarial contracts
          name: sanitizeContractString(name),
          symbol: sanitizeContractString(symbol, 20),
          totalSupply: String(totalSupply),
        }

        if (!cancelled) {
          setDropData(data)
          setCached(cacheKey, data)
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to fetch NFT drop info")
      } finally {
        if (!cancelled) {
          setLoading(false)
          setIsRefreshing(false)
          isFirstMount.current = false
        }
      }
    }

    fetchDropInfo()
    return () => { cancelled = true }
  }, [contractAddress, refreshKey])

  if (loading) return <LoadingCard rows={1} />
  if (error) return <ErrorState error={error} />
  if (!dropData) return null

  // Apply optimistic delta to the displayed minted count
  const confirmedMinted = Number(dropData.totalSupply)
  const displayMinted = (confirmedMinted + (optimisticMintedDelta ?? 0)).toLocaleString()

  const mintedBadge =
    optimisticMintedDelta != null && optimisticMintedDelta > 0 ? (
      <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400 shrink-0">
        +{optimisticMintedDelta}
        <span className="ml-1 opacity-60 font-normal">· updating</span>
      </span>
    ) : undefined

  return (
    <div className="space-y-3">
      {/* Collection identity row */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-400/10 border border-violet-500/15 shadow-sm">
          <span className="text-xs font-bold text-violet-500 tracking-tight">
            {dropData.symbol.slice(0, 4).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight truncate">{dropData.name}</p>
          <p className="text-xs text-muted-foreground">{dropData.symbol}</p>
        </div>
        {isRefreshing && (
          <RefreshCw className="size-3.5 text-muted-foreground animate-spin shrink-0" />
        )}
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Tag}    label="Collection"   value={dropData.name}   />
        <StatCard icon={Hash}   label="Symbol"       value={dropData.symbol} />
        <StatCard icon={Layers} label="Total Minted" value={displayMinted} mono badge={mintedBadge} />
      </div>
    </div>
  )
}
