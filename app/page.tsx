"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletStatus } from "@/components/dapp/wallet-status";
import { ChainBadge } from "@/components/dapp/chain-badge";
import { Coins, ImageIcon, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useActiveWalletChain } from "thirdweb/react";

const features = [
  {
    title: "ERC20 Token",
    description: "Mint, transfer, and manage ERC20 tokens on Rootstock with built-in decimal precision.",
    icon: Coins,
    href: "/erc20",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    title: "NFT Drop (ERC721)",
    description: "Create NFT drops with lazy minting, claim conditions, and on-chain metadata.",
    icon: ImageIcon,
    href: "/erc721",
    gradient: "from-violet-500 to-purple-400",
  },
];

const steps = [
  {
    step: "01",
    title: "Connect Your Wallet",
    description: "MetaMask, Coinbase Wallet, or WalletConnect — all supported out of the box.",
  },
  {
    step: "02",
    title: "Switch to Rootstock Network",
    description: "Use the chain switcher in the header to select Rootstock Mainnet or Testnet.",
  },
  {
    step: "03",
    title: "Deploy Your Contracts",
    description: "Add your contract addresses to the .env file and start interacting immediately.",
  },
];

export default function DashboardPage() {
  const chain = useActiveWalletChain();

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 max-w-3xl w-full">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-chart-2/10 p-8 animate-slide-up bg-dot-grid">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-5">
          {/* Live pulse badge */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Production-ready dApp Starter
          </span>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Welcome to{" "}
              <span className="gradient-text">Rootstock</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Build on Bitcoin&apos;s most secure sidechain. Thirdweb SDK&nbsp;v5 +&nbsp;Next.js&nbsp;16,
              production-ready from day one.
            </p>
          </div>
        </div>
      </div>

      {/* ── Wallet + Chain status ──────────────────────────────── */}
      <div
        className="grid gap-3 sm:grid-cols-2 animate-slide-up"
        style={{ animationDelay: "80ms" }}
      >
        <WalletStatus />
        {chain?.id && <ChainBadge chainId={chain.id} />}
      </div>

      {/* ── Module cards ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Modules
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, i) => (
            <Link key={feature.href} href={feature.href} className="group block">
              <Card
                className="relative h-full cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg animate-slide-up"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                {/* Hover gradient wash */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-md transition-transform duration-300 group-hover:scale-105`}>
                      <feature.icon className="size-5 text-white" />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary/60" />
                  </div>
                  <CardTitle className="mt-3 text-base">{feature.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Quick Start timeline ───────────────────────────────── */}
      <Card
        className="animate-slide-up"
        style={{ animationDelay: "280ms" }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="size-3.5 text-primary" />
            </div>
            <CardTitle className="text-base">Quick Start</CardTitle>
          </div>
          <CardDescription>Up and running in three steps</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex gap-4">
                {/* Vertical connector */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[19px] top-11 h-full w-px bg-border" />
                )}
                {/* Step disc */}
                <div className="relative z-10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/8">
                  <span className="text-[10px] font-bold tabular-nums text-primary">
                    {s.step}
                  </span>
                </div>
                {/* Content */}
                <div className={`flex-1 ${i < steps.length - 1 ? "pb-7" : ""}`}>
                  <p className="pt-2 text-sm font-semibold">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
