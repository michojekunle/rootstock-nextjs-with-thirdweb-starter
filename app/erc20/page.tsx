"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { Coins, AlertCircle } from "lucide-react"
import { MintToken } from "@/components/erc20/mint-token"
import { TransferToken } from "@/components/erc20/transfer-token"
import { TokenBalance } from "@/components/erc20/token-balance"
import { TokenInfo } from "@/components/erc20/token-info"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import { getActiveChain } from "@/lib/chains"

export default function ERC20Page() {
  const account = useActiveAccount()
  const chain = useActiveWalletChain()
  const activeChain = getActiveChain()
  const isCorrectChain = chain?.id === activeChain.id

  if (!account) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <Coins className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">ERC20 Tokens</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Please connect your wallet to interact with ERC20 tokens.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isCorrectChain) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <Coins className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">ERC20 Tokens</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Please switch to the correct network to interact with ERC20 tokens.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!CONTRACT_ADDRESSES.ERC20) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <Coins className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">ERC20 Tokens</h1>
        </div>
        <Alert variant="default">
          <AlertCircle className="size-4" />
          <AlertDescription>
            ERC20 contract not configured. Please add your contract address to the environment variables.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Coins className="size-6 text-primary" />
          <h1 className="text-3xl font-bold">ERC20 Tokens</h1>
        </div>
        <p className="text-muted-foreground">Manage and interact with ERC20 tokens on Rootstock</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TokenInfo contractAddress={CONTRACT_ADDRESSES.ERC20} />
        <TokenBalance contractAddress={CONTRACT_ADDRESSES.ERC20} userAddress={account.address} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Operations</CardTitle>
          <CardDescription>Mint, transfer, or approve tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transfer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
              <TabsTrigger value="mint">Mint</TabsTrigger>
            </TabsList>

            <TabsContent value="transfer" className="space-y-4">
              <TransferToken contractAddress={CONTRACT_ADDRESSES.ERC20} />
            </TabsContent>

            <TabsContent value="mint" className="space-y-4">
              <MintToken contractAddress={CONTRACT_ADDRESSES.ERC20} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
