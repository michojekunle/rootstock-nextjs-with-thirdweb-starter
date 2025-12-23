"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { client } from "@/lib/thirdweb"
import { getContract, readContract } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { Info } from "lucide-react"

interface NFTDropInfoProps {
  contractAddress: string
}

interface DropData {
  name: string
  symbol: string
  totalSupply: string
}

export function NFTDropInfo({ contractAddress }: NFTDropInfoProps) {
  const [dropData, setDropData] = useState<DropData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDropInfo = async () => {
      try {
        setLoading(true)
        const chain = getActiveChain()
        const contract = getContract({
          client,
          address: contractAddress,
          chain,
        })

        const [name, symbol] = await Promise.all([
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
        ])

        const totalSupply = await readContract({
          contract,
          method: "function totalSupply() view returns (uint256)",
          params: [],
        })

        setDropData({
          name: String(name),
          symbol: String(symbol),
          totalSupply: String(totalSupply),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch NFT drop info")
      } finally {
        setLoading(false)
      }
    }

    fetchDropInfo()
  }, [contractAddress])

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  if (!dropData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="size-4" />
            <p>No NFT drop information available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm text-muted-foreground">Collection Name</p>
          <p className="text-lg font-semibold">{dropData.name}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm text-muted-foreground">Symbol</p>
          <p className="text-lg font-semibold">{dropData.symbol}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm text-muted-foreground">Total Minted</p>
          <p className="text-lg font-semibold">{dropData.totalSupply}</p>
        </CardContent>
      </Card>
    </div>
  )
}
