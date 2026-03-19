"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { client } from "@/lib/thirdweb"
import { getContract, readContract } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { Tag, Hash, Layers } from "lucide-react"

interface NFTDropInfoProps {
  contractAddress: string
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
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon className="size-4 text-violet-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-sm font-semibold truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function NFTDropInfo({ contractAddress }: NFTDropInfoProps) {
  const [dropData, setDropData] = useState<DropData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

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

        if (!cancelled) {
          setDropData({
            name: String(name),
            symbol: String(symbol),
            totalSupply: String(totalSupply),
          })
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to fetch NFT drop info")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDropInfo()

    return () => {
      cancelled = true
    }
  }, [contractAddress])

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  if (!dropData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">No collection data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard icon={Tag} label="Collection" value={dropData.name} />
      <StatCard icon={Hash} label="Symbol" value={dropData.symbol} />
      <StatCard icon={Layers} label="Total Minted" value={dropData.totalSupply} />
    </div>
  )
}
