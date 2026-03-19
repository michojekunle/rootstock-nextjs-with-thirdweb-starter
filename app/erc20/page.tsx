"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActiveAccount, useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react"
import { Coins, Wallet, Network, ArrowLeftRight, Flame, ShieldCheck, Settings2 } from "lucide-react"
import { MintToken } from "@/components/erc20/mint-token"
import { TransferToken } from "@/components/erc20/transfer-token"
import { ApproveToken } from "@/components/erc20/approve-token"
import { TokenBalance } from "@/components/erc20/token-balance"
import { TokenInfo } from "@/components/erc20/token-info"
import { Button } from "@/components/ui/button"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import { getActiveChain } from "@/lib/chains"

/** The Rootstock chain expected by this dApp (set via NEXT_PUBLIC_DEFAULT_NETWORK env var) */
const configuredChain = getActiveChain()

// ─── Shared page header ───────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="flex items-center gap-4 animate-slide-up">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-md">
        <Coins className="size-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ERC20 Tokens</h1>
        <p className="text-sm text-muted-foreground">
          Mint, transfer, and approve tokens on Rootstock
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
export default function ERC20Page() {
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
          description="Connect your wallet using the button in the top-right corner to start interacting with ERC20 tokens."
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
          description={`Your wallet is on a different network. Switch to ${configuredChain.name} to interact with this contract.`}
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

  if (!CONTRACT_ADDRESSES.ERC20) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl w-full">
        <PageHeader />
        <GuardCard
          icon={Settings2}
          title="Contract Not Configured"
          description="Add your ERC20 contract address to the NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS environment variable and redeploy."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl w-full">
      {/* Header */}
      <PageHeader />

      {/* Token stats */}
      <div
        className="grid gap-4 sm:grid-cols-2 animate-slide-up"
        style={{ animationDelay: "60ms" }}
      >
        <TokenInfo contractAddress={CONTRACT_ADDRESSES.ERC20} />
        <TokenBalance
          contractAddress={CONTRACT_ADDRESSES.ERC20}
          userAddress={account.address}
        />
      </div>

      {/* Operations */}
      <Card
        className="animate-slide-up"
        style={{ animationDelay: "120ms" }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Token Operations</CardTitle>
          <CardDescription>
            Interact with your token — transfer funds, mint new supply, or set spending allowances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transfer" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-1">
              <TabsTrigger value="transfer" className="flex items-center gap-1.5">
                <ArrowLeftRight className="size-3.5" />
                Transfer
              </TabsTrigger>
              <TabsTrigger value="mint" className="flex items-center gap-1.5">
                <Flame className="size-3.5" />
                Mint
              </TabsTrigger>
              <TabsTrigger value="approve" className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                Approve
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transfer" className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Send tokens from your wallet to any address on Rootstock.
              </p>
              <TransferToken contractAddress={CONTRACT_ADDRESSES.ERC20} />
            </TabsContent>

            <TabsContent value="mint" className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Create new tokens and add them to a wallet — requires owner/minter role.
              </p>
              <MintToken contractAddress={CONTRACT_ADDRESSES.ERC20} />
            </TabsContent>

            <TabsContent value="approve" className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Grant a spender address an allowance to transfer tokens on your behalf.
              </p>
              <ApproveToken contractAddress={CONTRACT_ADDRESSES.ERC20} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
