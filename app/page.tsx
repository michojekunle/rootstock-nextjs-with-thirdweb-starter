"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WalletStatus } from "@/components/dapp/wallet-status";
import { ChainBadge } from "@/components/dapp/chain-badge";
import { Coins, ImageIcon, ShoppingCart, Code2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useActiveWalletChain } from "thirdweb/react";

const features = [
  {
    title: "ERC20 Token",
    description: "Mint, transfer, and manage ERC20 tokens on Rootstock",
    icon: Coins,
    href: "/erc20",
    color: "text-primary",
  },
  {
    title: "NFT Drop (ERC721)",
    description: "Create NFT drops with lazy minting and claim functionality",
    icon: ImageIcon,
    href: "/erc721",
    color: "text-chart-2",
  },
  {
    title: "Marketplace",
    description: "Buy, sell, and trade assets with direct listings and offers",
    icon: ShoppingCart,
    href: "/marketplace",
    color: "text-chart-4",
  },
];

export default function DashboardPage() {
  const chain = useActiveWalletChain();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl font-bold">
          Welcome to Rootstock
        </h1>
        <p className="text-pretty text-muted-foreground">
          A production-ready dApp starter kit powered by Thirdweb SDK v5 and
          Next.js 15
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 items-center">
        <WalletStatus />
        {chain?.id && <ChainBadge chainId={chain?.id} />}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Features</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.href} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <feature.icon className={`size-5 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <CardDescription>{feature.description}</CardDescription>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Link href={feature.href}>
                    Explore
                    <Code2 className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            Get started with Rootstock development
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </div>
            <div className="flex-1">
              <p className="font-medium">Connect Your Wallet</p>
              <p className="text-sm text-muted-foreground">
                Click "Connect Wallet" to connect MetaMask, Coinbase Wallet, or
                WalletConnect
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              2
            </div>
            <div className="flex-1">
              <p className="font-medium">Switch to Rootstock Network</p>
              <p className="text-sm text-muted-foreground">
                Use the chain switcher to select Rootstock Mainnet or Testnet
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              3
            </div>
            <div className="flex-1">
              <p className="font-medium">Deploy Your Contracts</p>
              <p className="text-sm text-muted-foreground">
                Add your contract addresses to the .env file and start
                interacting with them
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
