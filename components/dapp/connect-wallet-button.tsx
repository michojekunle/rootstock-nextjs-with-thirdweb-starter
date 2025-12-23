"use client"

import { ConnectButton } from "thirdweb/react"
import { client } from "@/lib/thirdweb"
import { rootstockMainnet, rootstockTestnet } from "@/lib/chains"
import { createWallet } from "thirdweb/wallets"

// Supported wallets for Rootstock
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("walletConnect"),
]

export function ConnectWalletButton() {
  return (
    <ConnectButton
      client={client}
      chains={[rootstockMainnet, rootstockTestnet]}
      wallets={wallets}
      connectButton={{
        label: "Connect Wallet",
        className:
          "!bg-primary !text-primary-foreground hover:!bg-primary/90 !font-medium !rounded-lg !px-4 !py-2 !transition-colors",
      }}
      connectModal={{
        title: "Connect to Rootstock",
        titleIcon: "/icon.svg",
        showThirdwebBranding: false,
        size: "compact",
      }}
      theme="dark"
    />
  )
}
