"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react"
import { ImageIcon, Wallet, Network, Sparkles, LayoutGrid, Settings2 } from "lucide-react"
import { NFTDropInfo } from "@/components/erc721/nft-drop-info"
import { ClaimNFT } from "@/components/erc721/claim-nft"
import { YourNFTs } from "@/components/erc721/your-nfts"
import { Button } from "@/components/ui/button"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import { getActiveChain } from "@/lib/chains"

/** The Rootstock chain expected by this dApp (set via NEXT_PUBLIC_DEFAULT_NETWORK env var) */
const configuredChain = getActiveChain()

// ─── Shared page header ───────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="flex items-center gap-4 animate-slide-up">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-400 shadow-md">
        <ImageIcon className="size-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">NFT Drop</h1>
        <p className="text-sm text-muted-foreground">
          Claim and manage your ERC721 NFTs on Rootstock
        </p>
      </div>
    </div>
  )
}

// ─── Guard state cards ────────────────────────────────────────────────────────
function GuardCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <Card
      className="animate-slide-up"
      style={{ animationDelay: "80ms" }}
    >
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ERC721Page() {
  const account = useActiveAccount()
  const chain = useActiveWalletChain()
  const switchChain = useSwitchActiveWalletChain()
  const isCorrectChain = chain?.id === configuredChain.id

  if (!account) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl w-full">
        <PageHeader />
        <GuardCard
          icon={Wallet}
          title="Wallet Not Connected"
          description="Connect your wallet using the button in the top-right corner to start claiming and viewing NFTs."
        />
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl w-full">
        <PageHeader />
        <GuardCard
          icon={Network}
          title="Wrong Network"
          description={`Your wallet is connected to a different network. Switch to ${configuredChain.name} to interact with this NFT drop.`}
          action={
            <Button
              size="sm"
              onClick={() => switchChain(configuredChain)}
              className="mt-1"
            >
              Switch to {configuredChain.name}
            </Button>
          }
        />
      </div>
    )
  }

  if (!CONTRACT_ADDRESSES.NFT_DROP) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl w-full">
        <PageHeader />
        <GuardCard
          icon={Settings2}
          title="Contract Not Configured"
          description="Add your NFT Drop contract address to the NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS environment variable and redeploy."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl w-full">
      {/* Header */}
      <PageHeader />

      {/* Collection stats */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: "60ms" }}
      >
        <NFTDropInfo contractAddress={CONTRACT_ADDRESSES.NFT_DROP} />
      </div>

      {/* Operations */}
      <Card
        className="animate-slide-up"
        style={{ animationDelay: "120ms" }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base">NFT Operations</CardTitle>
          <CardDescription>
            Claim new NFTs from the drop or browse your existing collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="claim" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-1">
              <TabsTrigger value="claim" className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Claim NFT
              </TabsTrigger>
              <TabsTrigger value="owned" className="flex items-center gap-1.5">
                <LayoutGrid className="size-3.5" />
                Your Collection
              </TabsTrigger>
            </TabsList>

            <TabsContent value="claim" className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Claim NFTs from this drop — subject to active claim conditions set by the contract owner.
              </p>
              <ClaimNFT
                contractAddress={CONTRACT_ADDRESSES.NFT_DROP}
                userAddress={account.address}
              />
            </TabsContent>

            <TabsContent value="owned" className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                All NFTs from this collection currently held in your connected wallet.
              </p>
              <YourNFTs
                contractAddress={CONTRACT_ADDRESSES.NFT_DROP}
                userAddress={account.address}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
