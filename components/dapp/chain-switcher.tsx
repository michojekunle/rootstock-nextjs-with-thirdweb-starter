"use client"

import { useActiveWallet, useActiveWalletChain, useSwitchActiveWalletChain } from "thirdweb/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { rootstockMainnet, rootstockTestnet } from "@/lib/chains"
import { ChevronDown, CheckCircle2, Circle } from "lucide-react"

export function ChainSwitcher() {
  const activeChain = useActiveWalletChain()
  const wallet = useActiveWallet()
  const switchChain = useSwitchActiveWalletChain()

  if (!wallet) {
    return null
  }

  const chains = [rootstockMainnet, rootstockTestnet]
  const currentChainName = activeChain
    ? chains.find((c) => c.id === activeChain.id)?.name || "Unknown Chain"
    : "Not Connected"

  const handleSwitchChain = async (chainId: number) => {
    try {
      const chain = chains.find((c) => c.id === chainId)
      if (chain) {
        await switchChain(chain)
        toast.success(`Switched to ${chain.name}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to switch chain:", error)
      }
      toast.error("Failed to switch network")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent" aria-label={`Switch network, currently on ${currentChainName}`}>
          <span className="hidden md:block truncate">{currentChainName}</span>
          <span className="md:hidden block truncate">{currentChainName.split(" ")[1]}</span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {chains.map((chain) => {
          const isActive = activeChain?.id === chain.id
          return (
            <DropdownMenuItem key={chain.id} onClick={() => handleSwitchChain(chain.id)} className="gap-2">
              {isActive ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 opacity-50" />}
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{chain.name}</span>
                <span className="text-xs text-muted-foreground">Chain ID: {chain.id}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
