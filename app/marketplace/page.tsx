"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { ShoppingCart, AlertCircle } from "lucide-react"
import { MarketplaceListings } from "@/components/marketplace/marketplace-listings"
import { CreateListing } from "@/components/marketplace/create-listing"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import { getActiveChain } from "@/lib/chains"

export default function MarketplacePage() {
  const account = useActiveAccount()
  const chain = useActiveWalletChain()
  const activeChain = getActiveChain()
  const isCorrectChain = chain?.id === activeChain.id

  if (!account) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Marketplace</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Please connect your wallet to access the marketplace.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Marketplace</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Please switch to the correct network to access the marketplace.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!CONTRACT_ADDRESSES.MARKETPLACE) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Marketplace</h1>
        </div>
        <Alert variant="default">
          <AlertCircle className="size-4" />
          <AlertDescription>
            Marketplace contract not configured. Please add your contract address to the environment variables.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">Marketplace</h1>
        </div>
        <p className="text-muted-foreground">Buy, sell, and trade NFTs and tokens on Rootstock</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace Operations</CardTitle>
          <CardDescription>Browse listings or create your own</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="listings">Browse Listings</TabsTrigger>
              <TabsTrigger value="create">Create Listing</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              <MarketplaceListings contractAddress={CONTRACT_ADDRESSES.MARKETPLACE} />
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <CreateListing contractAddress={CONTRACT_ADDRESSES.MARKETPLACE} sellerAddress={account.address} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
