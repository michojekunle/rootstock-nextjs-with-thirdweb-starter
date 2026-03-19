"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { client } from "@/lib/thirdweb"
import { getContract, readContract } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { getCached, setCached, getTokenDataCacheKey } from "@/lib/cache"
import { Info } from "lucide-react"
import { formatTokenAmount } from "@/lib/utils"

interface TokenInfoProps {
  contractAddress: string
}

interface TokenData {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
}

export function TokenInfo({ contractAddress }: TokenInfoProps) {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchTokenInfo = async () => {
      try {
        const chain = getActiveChain()
        const cacheKey = getTokenDataCacheKey(contractAddress, chain.id)

        // Check cache first
        const cached = getCached<TokenData>(cacheKey)
        if (cached && !cancelled) {
          setTokenData(cached)
          setLoading(false)
          return
        }

        setLoading(true)
        const contract = getContract({
          client,
          address: contractAddress,
          chain,
        })

        const [name, symbol, decimals, totalSupply] = await Promise.all([
          readContract({
            contract,
            method: "function name() view returns (string)",
            params: [],
          }),
          readContract({
            contract,
            method: "function symbol() view returns (string)",
            params: [],
          }),
          readContract({
            contract,
            method: "function decimals() view returns (uint8)",
            params: [],
          }),
          readContract({
            contract,
            method: "function totalSupply() view returns (uint256)",
            params: [],
          }),
        ])

        const data: TokenData = {
          name: String(name),
          symbol: String(symbol),
          decimals: Number(decimals),
          totalSupply: String(totalSupply),
        }

        if (!cancelled) {
          setTokenData(data)
          // Cache the token info for 5 minutes
          setCached(cacheKey, data)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch token info")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTokenInfo()

    return () => {
      cancelled = true
    }
  }, [contractAddress])

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  if (!tokenData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="size-4" />
            <p>No token information available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Token Name</p>
          <p className="text-lg font-semibold">{tokenData.name}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Symbol</p>
          <p className="text-lg font-semibold">{tokenData.symbol}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Decimals</p>
          <p className="text-lg font-semibold">{tokenData.decimals}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Supply</p>
          <p className="text-lg font-semibold truncate">
            {formatTokenAmount(tokenData.totalSupply, tokenData.decimals)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
