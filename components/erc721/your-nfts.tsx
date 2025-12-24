"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { client } from "@/lib/thirdweb"
import { getContract, readContract } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { ImageIcon } from "lucide-react"

interface YourNFTsProps {
  contractAddress: string
  userAddress: string
}

interface NFT {
  tokenId: string
  uri: string
  metadata?: {
    name?: string
    image?: string
    description?: string
  }
}

export function YourNFTs({ contractAddress, userAddress }: YourNFTsProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true)
        const chain = getActiveChain()
        const contract = getContract({
          client,
          address: contractAddress,
          chain,
        })

        const balance = await readContract({
          contract,
          method: "function balanceOf(address account) view returns (uint256)",
          params: [userAddress],
        })

        const balanceNum = Number(balance)
        alert(balanceNum);
        const userNFTs: NFT[] = []

        for (let i = 0; i < Math.min(balanceNum, 10); i++) {
          console.log("tryingggggggggggggggggg")
          try {
            const uri = await readContract({
              contract,
              method: "function tokenURI(uint256 tokenId) view returns (string)",
              params: [BigInt(i)],
            })

            userNFTs.push({
              tokenId: String(BigInt(i)),
              uri: String(uri),
            })
          } catch(err) {
            console.error(err);
            // Skip NFTs that fail to load
          }
        }

        setNfts(userNFTs)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch NFTs")
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [contractAddress, userAddress])

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  if (nfts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <ImageIcon className="size-8" />
            <p>You don't own any NFTs from this collection yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {nfts.map((nft) => (
        <Card key={nft.tokenId} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square bg-muted flex items-center justify-center">
              {nft.metadata?.image ? (
                <img
                  src={nft.metadata.image || "/placeholder.svg"}
                  alt={nft.metadata.name || `NFT #${nft.tokenId}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="size-8 text-muted-foreground" />
              )}
            </div>
            <div className="p-4 space-y-2">
              <p className="font-semibold">{nft.metadata?.name || `NFT #${nft.tokenId}`}</p>
              <p className="text-xs text-muted-foreground">ID: {nft.tokenId}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
