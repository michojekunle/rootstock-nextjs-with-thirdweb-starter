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

/** Maximum number of NFTs to load per wallet to avoid excessive RPC calls */
const NFT_LOAD_LIMIT = 50

function resolveUri(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/")
  }
  return uri
}

/**
 * Only allow http/https image URLs to prevent XSS via javascript: or data: URIs
 * that could be embedded in malicious NFT metadata.
 */
function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

async function fetchMetadata(uri: string): Promise<NFT["metadata"] | undefined> {
  try {
    const response = await fetch(resolveUri(uri))
    if (!response.ok) return undefined
    const json = await response.json()
    const resolvedImage = json.image ? resolveUri(String(json.image)) : undefined
    return {
      name: json.name,
      image: resolvedImage && isSafeImageUrl(resolvedImage) ? resolvedImage : undefined,
      description: json.description,
    }
  } catch {
    return undefined
  }
}

export function YourNFTs({ contractAddress, userAddress }: YourNFTsProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

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

        const balanceBig = BigInt(balance)
        const limitBig = BigInt(NFT_LOAD_LIMIT)
        const loadCount = balanceBig < limitBig ? balanceBig : limitBig
        const userNFTs: NFT[] = []

        // Batch 1: Fetch all tokenIds in parallel
        const tokenIdPromises: Promise<bigint>[] = []
        for (let i = BigInt(0); i < loadCount; i++) {
          tokenIdPromises.push(
            readContract({
              contract,
              method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
              params: [userAddress, i],
            }).then((id) => BigInt(id))
          )
        }
        const tokenIds = await Promise.all(tokenIdPromises)
        if (cancelled) return

        // Batch 2: Fetch all tokenURIs in parallel
        const uriPromises = tokenIds.map((tokenId) =>
          readContract({
            contract,
            method: "function tokenURI(uint256 tokenId) view returns (string)",
            params: [tokenId],
          }).then((uri) => String(uri))
        )
        const tokenUris = await Promise.all(uriPromises)
        if (cancelled) return

        // Batch 3: Fetch all metadata in parallel
        const metadataPromises = tokenUris.map((uri) => fetchMetadata(uri))
        const allMetadata = await Promise.all(metadataPromises)
        if (cancelled) return

        // Combine results
        for (let i = 0; i < tokenIds.length; i++) {
          userNFTs.push({
            tokenId: String(tokenIds[i]),
            uri: tokenUris[i],
            metadata: allMetadata[i],
          })
        }

        if (!cancelled) setNfts(userNFTs)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch NFTs")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (contractAddress && userAddress) {
      fetchNFTs()
    }

    return () => {
      cancelled = true
    }
  }, [contractAddress, userAddress])

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  if (nfts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <ImageIcon className="size-8" />
            <p>You don&apos;t own any NFTs from this collection yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {nfts.length === NFT_LOAD_LIMIT && (
        <p className="text-xs text-muted-foreground">
          Showing the first {NFT_LOAD_LIMIT} NFTs in your wallet.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {nfts.map((nft) => (
        <Card key={nft.tokenId} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square bg-muted flex items-center justify-center">
              {nft.metadata?.image ? (
                <img
                  src={nft.metadata.image}
                  alt={nft.metadata.name || `NFT #${nft.tokenId}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="size-8 text-muted-foreground" />
              )}
            </div>
            <div className="p-4 space-y-1">
              <p className="font-semibold">{nft.metadata?.name || `NFT #${nft.tokenId}`}</p>
              <p className="text-xs text-muted-foreground">ID: {nft.tokenId}</p>
              {nft.metadata?.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{nft.metadata.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  )
}
