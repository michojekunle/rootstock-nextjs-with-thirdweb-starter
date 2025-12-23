"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"
import { CONTRACT_ADDRESSES, DEPLOYMENT_GUIDES } from "@/lib/contracts"
import { Button } from "@/components/ui/button"

/**
 * Displays contract configuration status and provides deployment guidance
 * Shows warnings if contracts are not properly configured
 */
export function ContractStatus() {
  const hasERC20 = !!CONTRACT_ADDRESSES.ERC20
  const hasNFT = !!CONTRACT_ADDRESSES.NFT_DROP
  const hasMarketplace = !!CONTRACT_ADDRESSES.MARKETPLACE
  const allConfigured = hasERC20 && hasNFT && hasMarketplace

  if (allConfigured) {
    return (
      <Alert>
        <CheckCircle2 className="size-4 text-green-600" />
        <AlertTitle>Contracts Configured</AlertTitle>
        <AlertDescription>All contract addresses are properly configured and ready to use.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Contracts Not Configured</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Some contract addresses are missing. Deploy your contracts via thirdweb and add the addresses to your
          environment variables.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Button size="sm" variant="outline" asChild className="gap-1.5 bg-transparent">
            <a href={DEPLOYMENT_GUIDES.THIRDWEB_DASHBOARD} target="_blank" rel="noopener noreferrer">
              Deploy Contracts
              <ExternalLink className="size-3" />
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild className="gap-1.5 bg-transparent">
            <a href={DEPLOYMENT_GUIDES.ROOTSTOCK_DOCS} target="_blank" rel="noopener noreferrer">
              View Guide
              <ExternalLink className="size-3" />
            </a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
