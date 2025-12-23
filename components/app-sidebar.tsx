"use client"

import { LayoutDashboard, Coins, ImageIcon, ShoppingCart, Settings, ChevronUp, User2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useActiveAccount } from "thirdweb/react"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "ERC20 Tokens",
    icon: Coins,
    href: "/erc20",
  },
  {
    title: "NFT Drop (ERC721)",
    icon: ImageIcon,
    href: "/erc721",
  },
  {
    title: "Marketplace",
    icon: ShoppingCart,
    href: "/marketplace",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const account = useActiveAccount()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Rootstock dApp</span>
            <span className="text-xs text-sidebar-foreground/60">Thirdweb SDK v5</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {account ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <User2 className="size-4 text-primary" />
                </div>
                <div className="flex flex-1 flex-col items-start text-left">
                  <span className="text-sm font-medium">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </span>
                  <span className="text-xs text-muted-foreground">Connected</span>
                </div>
                <ChevronUp className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(account.address)
                }}
              >
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.reload()}>Disconnect</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="px-2 py-3 text-center text-sm text-muted-foreground">Wallet not connected</div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
