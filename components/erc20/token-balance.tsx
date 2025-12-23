"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { client } from "@/lib/thirdweb"
import { getContract, readContract } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { Wallet } from "lucide-react"

interface TokenBalanceProps {
  contractAddress: string
  userAddress: string
}

export function TokenBalance({ contractAddress, userAddress }: TokenBalanceProps) {
  const [balance, setBalance] = useState<string>("0")
  const [decimals, setDecimals] = useState<number>(18)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true)
        const chain = getActiveChain()
        const contract = getContract({
          client,
          address: contractAddress,
          chain,
        })

        const [balanceData, decimalsData] = await Promise.all([
          readContract({
            contract,
            method: "function balanceOf(address account) view returns (uint256)",
            params: [userAddress],
          }),
          readContract({
            contract,
            method: "function decimals() view returns (uint8)",
            params: [],
          }),
        ])

        setBalance(String(balanceData))
        setDecimals(Number(decimalsData))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch balance")
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [contractAddress, userAddress])

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  const displayBalance = (BigInt(balance) / BigInt(10 ** decimals)).toString()

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Wallet className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Your Balance</p>
            <p className="text-2xl font-bold">{displayBalance}</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Address: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
        </div>
      </CardContent>
    </Card>
  )
}
