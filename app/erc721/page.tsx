"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { ImageIcon, AlertCircle } from "lucide-react"
import { NFTDropInfo } from "@/components/erc721/nft-drop-info"
import { ClaimNFT } from "@/components/erc721/claim-nft"
import { YourNFTs } from "@/components/erc721/your-nfts"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import { getActiveChain } from "@/lib/chains"

export default function ERC721Page() {
  const account = useActiveAccount()
  const chain = useActiveWalletChain()
  const activeChain = getActiveChain()
  const isCorrectChain = chain?.id === activeChain.id

  if (!account) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">NFT Drop (ERC721)</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Please connect your wallet to interact with NFTs.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">NFT Drop (ERC721)</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Please switch to the correct network to interact with NFTs.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!CONTRACT_ADDRESSES.NFT_DROP) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">NFT Drop (ERC721)</h1>
        </div>
        <Alert variant="default">
          <AlertCircle className="size-4" />
          <AlertDescription>
            NFT Drop contract not configured. Please add your contract address to the environment variables.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">NFT Drop (ERC721)</h1>
        </div>
        <p className="text-muted-foreground">Manage and claim NFTs from the drop collection</p>
      </div>

      <NFTDropInfo contractAddress={CONTRACT_ADDRESSES.NFT_DROP} />

      <Card>
        <CardHeader>
          <CardTitle>NFT Operations</CardTitle>
          <CardDescription>Claim NFTs or view your collection</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="claim" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="claim">Claim NFT</TabsTrigger>
              <TabsTrigger value="owned">Your NFTs</TabsTrigger>
            </TabsList>

            <TabsContent value="claim" className="space-y-4">
              <ClaimNFT contractAddress={CONTRACT_ADDRESSES.NFT_DROP} userAddress={account.address} />
            </TabsContent>

            <TabsContent value="owned" className="space-y-4">
              <YourNFTs contractAddress={CONTRACT_ADDRESSES.NFT_DROP} userAddress={account.address} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
