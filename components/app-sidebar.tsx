"use client";

import { LayoutDashboard, Coins, ImageIcon, ChevronUp, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Logo } from "@/components/dapp/logo";

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
];

export function AppSidebar() {
  const pathname = usePathname();
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      }
                    >
                      <Link href={item.href} className="flex items-center gap-2.5">
                        <item.icon className={`size-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        <span className="text-sm">{item.title}</span>
                        {isActive && (
                          <span className="ml-auto size-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {account ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2 hover:bg-sidebar-accent"
              >
                {/* Avatar with live dot */}
                <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                  <User2 className="size-4 text-primary" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5 items-center justify-center rounded-full bg-background">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-start text-left min-w-0">
                  <span className="text-sm font-medium truncate">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">Connected</span>
                </div>
                <ChevronUp className="size-3.5 opacity-40 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard
                    .writeText(account.address)
                    .then(() => toast.success("Address copied to clipboard"))
                    .catch(() => toast.error("Failed to copy address"));
                }}
              >
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (wallet) disconnect(wallet);
                }}
              >
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="px-2 py-3 text-center text-xs text-muted-foreground">
            No wallet connected
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
