"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { TransactionButton } from "@/components/dapp/transaction-button"
import { useActiveAccount } from "thirdweb/react"
import { client } from "@/lib/thirdweb"
import { getContract, readContract, prepareContractCall, sendTransaction } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { ShoppingCart } from "lucide-react"

interface MarketplaceListingsProps {
  contractAddress: string
}

interface Listing {
  listingId: string
  seller: string
  assetContract: string
  tokenId: string
  quantity: string
  pricePerToken: string
  currency: string
  startTime: string
  endTime: string
  isActive: boolean
}

export function MarketplaceListings({ contractAddress }: MarketplaceListingsProps) {
  const account = useActiveAccount()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        const chain = getActiveChain()
        const contract = getContract({
          client,
          address: contractAddress,
          chain,
        })

        const listingCount = await readContract({
          contract,
          method: "function totalListings() view returns (uint256)",
          params: [],
        })

        const count = Number(listingCount)
        const fetchedListings: Listing[] = []

        for (let i = 0; i < Math.min(count, 10); i++) {
          try {
            const listing = await readContract({
              contract,
              method:
                "function listings(uint256) view returns (tuple(uint256 listingId, address seller, address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTime, uint128 endTime, bool reserved))",
              params: [BigInt(i)],
            });

            // Type assertion for the complex tuple return
            const listingData = listing as any
            const now = Math.floor(Date.now() / 1000)
            const isActive = Number(listingData.startTime) <= now && now <= Number(listingData.endTime)

            fetchedListings.push({
              listingId: String(listingData.listingId),
              seller: String(listingData.seller),
              assetContract: String(listingData.assetContract),
              tokenId: String(listingData.tokenId),
              quantity: String(listingData.quantity),
              pricePerToken: String(listingData.pricePerToken),
              currency: String(listingData.currency),
              startTime: String(listingData.startTime),
              endTime: String(listingData.endTime),
              isActive,
            })
          } catch {
            // Skip listings that fail to load
          }
        }

        setListings(fetchedListings)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch listings")
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [contractAddress])

  const handleBuy = async (listingId: string) => {
    if (!account) return

    try {
      const chain = getActiveChain()
      const contract = getContract({
        client,
        address: contractAddress,
        chain,
      })

      const listing = listings.find((l) => l.listingId === listingId)
      if (!listing) return

      const totalPrice = BigInt(listing.pricePerToken) * BigInt(listing.quantity)

      const transaction = prepareContractCall({
        contract,
        method:
          "function buyFromListing(uint256 listingId, address buyFor, uint256 quantity, address currency, uint256 expectedTotalPrice)",
        params: [BigInt(listingId), account.address, BigInt(listing.quantity), listing.currency, totalPrice],
      })

      await sendTransaction({
        transaction,
        account,
      })

      // Refresh listings
      window.location.reload()
    } catch (err) {
      console.error("Buy failed:", err)
      throw err
    }
  }

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <ShoppingCart className="size-8" />
            <p>No active listings available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <Card key={listing.listingId}>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Listing #{listing.listingId}</p>
              <p className="font-semibold truncate">Token #{listing.tokenId}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Quantity</p>
                <p className="font-medium">{listing.quantity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-medium">{listing.pricePerToken}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
            </div>
            <TransactionButton
              onTransaction={() => handleBuy(listing.listingId)}
              successMessage="Purchase complete"
              errorMessage="Purchase failed"
              className="w-full"
              disabled={!listing.isActive}
            >
              {listing.isActive ? "Buy Now" : "Listing Inactive"}
            </TransactionButton>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
