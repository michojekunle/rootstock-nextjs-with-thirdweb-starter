"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { client } from "@/lib/thirdweb"
import { getContract, readContract } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { getCached, getTokenDataCacheKey } from "@/lib/cache"
import { formatTokenAmount, parseTokenAmount } from "@/lib/utils"
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

interface CachedTokenMeta {
  symbol: string
  decimals: number
}

export interface OptimisticDelta {
  /** Human-readable amount (e.g. "100") */
  amount: string
  /** credit = balance went up (mint), debit = balance went down (transfer) */
  type: "credit" | "debit"
}

interface TokenBalanceProps {
  contractAddress: string
  userAddress: string
  /** Increment to trigger a background re-fetch after a confirmed transaction */
  refreshKey?: number
  /** Optimistic delta to display immediately while the re-fetch is in-flight */
  optimisticDelta?: OptimisticDelta | null
  /** Called once the re-fetch triggered by refreshKey completes */
  onRefreshed?: () => void
}

export function TokenBalance({
  contractAddress,
  userAddress,
  refreshKey = 0,
  optimisticDelta,
  onRefreshed,
}: TokenBalanceProps) {
  const [balance, setBalance] = useState<string>("0")
  const [decimals, setDecimals] = useState<number>(18)
  const [symbol, setSymbol] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isFirstMount = useRef(true)

  useEffect(() => {
    let cancelled = false

    const fetchBalance = async () => {
      try {
        // On re-fetches triggered by refreshKey, show a subtle refresh indicator
        // instead of the full skeleton — balance is already visible
        if (isFirstMount.current) {
          setLoading(true)
        } else {
          setIsRefreshing(true)
        }
        setError(null)

        const chain = getActiveChain()
        const contract = getContract({ client, address: contractAddress, chain })

        const cached = getCached<CachedTokenMeta>(getTokenDataCacheKey(contractAddress, chain.id))

        const [balanceData, decimalsData] = await Promise.all([
          readContract({
            contract,
            method: "function balanceOf(address account) view returns (uint256)",
            params: [userAddress],
          }),
          cached
            ? Promise.resolve(cached.decimals)
            : readContract({
                contract,
                method: "function decimals() view returns (uint8)",
                params: [],
              }).then(Number),
        ])

        if (!cancelled) {
          setBalance(String(balanceData))
          setDecimals(Number(decimalsData))
          if (cached?.symbol) setSymbol(cached.symbol)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch balance")
      } finally {
        if (!cancelled) {
          setLoading(false)
          setIsRefreshing(false)
          isFirstMount.current = false
          onRefreshed?.()
        }
      }
    }

    fetchBalance()
    return () => { cancelled = true }
  }, [contractAddress, userAddress, refreshKey])

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  // Apply optimistic delta to the displayed balance while re-fetch is in-flight
  let rawToDisplay = balance
  if (optimisticDelta && balance !== "0") {
    try {
      const balanceBig = BigInt(balance)
      const deltaBig = parseTokenAmount(optimisticDelta.amount, decimals)
      rawToDisplay =
        optimisticDelta.type === "credit"
          ? String(balanceBig + deltaBig)
          : String(balanceBig >= deltaBig ? balanceBig - deltaBig : BigInt(0))
    } catch {
      // If parsing fails, fall back to current balance
    }
  }
  const displayBalance = formatTokenAmount(rawToDisplay, decimals)

  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
      <CardContent className="p-0">
        <div className="px-5 pt-5 pb-4">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="size-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Your Balance</p>
            {isRefreshing && (
              <RefreshCw className="ml-auto size-3.5 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Balance + symbol */}
          <div className="flex items-baseline gap-2 min-w-0">
            <p className="text-3xl font-bold tracking-tight tabular-nums truncate">
              {displayBalance}
            </p>
            {symbol && (
              <span className="text-base font-semibold text-muted-foreground shrink-0">
                {symbol}
              </span>
            )}
          </div>

          {/* Optimistic delta badge */}
          {optimisticDelta && (
            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold
              ${optimisticDelta.type === "credit"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {optimisticDelta.type === "credit"
                ? <TrendingUp className="size-3" />
                : <TrendingDown className="size-3" />
              }
              {optimisticDelta.type === "credit" ? "+" : "−"}{optimisticDelta.amount} {symbol}
              <span className="opacity-60 font-normal">· updating</span>
            </div>
          )}
        </div>

        {/* Address footer */}
        <div className="flex items-center gap-2 border-t px-5 py-3 bg-muted/30">
          <div className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
          <p className="text-xs text-muted-foreground font-mono">
            {userAddress.slice(0, 6)}…{userAddress.slice(-4)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
