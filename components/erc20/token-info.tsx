"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { client } from "@/lib/thirdweb"
import { getContract, readContract } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { getCached, setCached, getTokenDataCacheKey } from "@/lib/cache"
import { formatTokenAmount, sanitizeContractString, parseTokenAmount } from "@/lib/utils"
import { Layers, Hash, RefreshCw, TrendingUp } from "lucide-react"

interface TokenInfoProps {
  contractAddress: string
  /** Increment to trigger a background re-fetch after a confirmed transaction */
  refreshKey?: number
  /** Optimistic supply delta — human-readable amount freshly minted, added immediately */
  optimisticSupplyDelta?: string | null
  /** Called once the re-fetch triggered by refreshKey completes */
  onRefreshed?: () => void
}

interface TokenData {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
}

export function TokenInfo({
  contractAddress,
  refreshKey = 0,
  optimisticSupplyDelta,
  onRefreshed,
}: TokenInfoProps) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFirstMount = useRef(true)

  useEffect(() => {
    let cancelled = false

    const fetchTokenInfo = async () => {
      try {
        setError(null)

        const chain = getActiveChain()
        const cacheKey = getTokenDataCacheKey(contractAddress, chain.id)

        // Only use cache on the very first load — re-fetches must bypass it so
        // totalSupply (which changes on every mint) stays fresh.
        const cached = isFirstMount.current ? getCached<TokenData>(cacheKey) : null
        if (cached && !cancelled) {
          setTokenData(cached)
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

        const [name, symbol, decimals, totalSupply] = await Promise.all([
          readContract({ contract, method: "function name() view returns (string)", params: [] }),
          readContract({ contract, method: "function symbol() view returns (string)", params: [] }),
          readContract({ contract, method: "function decimals() view returns (uint8)", params: [] }),
          readContract({ contract, method: "function totalSupply() view returns (uint256)", params: [] }),
        ])

        const data: TokenData = {
          // sanitizeContractString caps at 100 chars — prevents UI breakage from
          // maliciously long name/symbol values returned by an adversarial contract
          name: sanitizeContractString(name),
          symbol: sanitizeContractString(symbol, 20),
          decimals: Number(decimals),
          totalSupply: String(totalSupply),
        }

        if (!cancelled) {
          setTokenData(data)
          setCached(cacheKey, data)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch token info")
      } finally {
        if (!cancelled) {
          setLoading(false)
          setIsRefreshing(false)
          isFirstMount.current = false
          onRefreshed?.()
        }
      }
    }

    fetchTokenInfo()
    return () => { cancelled = true }
  }, [contractAddress, refreshKey])

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />
  if (!tokenData) return null

  // Apply optimistic supply delta while the re-fetch is in-flight
  let rawSupplyToDisplay = tokenData.totalSupply
  if (optimisticSupplyDelta) {
    try {
      const deltaBig = parseTokenAmount(optimisticSupplyDelta, tokenData.decimals)
      rawSupplyToDisplay = String(BigInt(tokenData.totalSupply) + deltaBig)
    } catch {
      // Parsing failed — fall back to the last confirmed supply
    }
  }

  const supplyDisplay = formatTokenAmount(rawSupplyToDisplay, tokenData.decimals)
  const symbolAbbr = tokenData.symbol.slice(0, 4).toUpperCase()

  return (
    <Card className="overflow-hidden">
      {/* Gradient accent band */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-primary to-primary/30" />
      <CardContent className="p-0">
        {/* Token identity header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 shadow-sm">
            <span className="text-xs font-bold text-primary tracking-tight">
              {symbolAbbr}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight truncate">{tokenData.name}</p>
            <p className="text-sm text-muted-foreground">{tokenData.symbol}</p>
          </div>
          {isRefreshing && (
            <RefreshCw className="size-3.5 text-muted-foreground animate-spin shrink-0" />
          )}
        </div>

        <div className="h-px bg-border mx-5" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 p-5 pt-4">
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5">
            <Hash className="size-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Decimals
              </p>
              <p className="text-sm font-semibold">{tokenData.decimals}</p>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5">
            <Layers className="size-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Total Supply
              </p>
              <p className="text-sm font-semibold font-mono truncate">
                {supplyDisplay}{" "}
                <span className="text-muted-foreground font-sans">{tokenData.symbol}</span>
              </p>
            </div>
            {optimisticSupplyDelta && (
              <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="size-3" />
                +{optimisticSupplyDelta}
                <span className="opacity-60 font-normal">· updating</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
