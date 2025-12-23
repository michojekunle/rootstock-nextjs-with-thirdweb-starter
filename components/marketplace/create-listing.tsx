"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TransactionButton } from "@/components/dapp/transaction-button"
import { useActiveAccount } from "thirdweb/react"
import { client } from "@/lib/thirdweb"
import { getContract, prepareContractCall, sendTransaction } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateListingForm {
  assetContract: string
  tokenId: string
  quantity: string
  pricePerToken: string
  currency: string
}

interface CreateListingProps {
  contractAddress: string
  sellerAddress: string
}

export function CreateListing({ contractAddress, sellerAddress }: CreateListingProps) {
  const account = useActiveAccount()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateListingForm>({
    defaultValues: {
      quantity: "1",
      currency: "0x0000000000000000000000000000000000000000",
    },
  })
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: CreateListingForm) => {
    if (!account) {
      setError("Wallet not connected")
      return
    }

    try {
      setError(null)
      const activeChain = getActiveChain()
      const contract = getContract({
        client,
        address: contractAddress,
        chain: activeChain,
      })

      const now = Math.floor(Date.now() / 1000)
      const endTime = now + 86400 * 7 // 7 days from now

      const transaction = prepareContractCall({
        contract,
        method:
          "function createListing(tuple(address assetContract, uint256 tokenId, uint256 quantity, address currency, uint256 pricePerToken, uint128 startTime, uint128 endTime, bool reserved) listing)",
        params: [
          [
            data.assetContract,
            BigInt(data.tokenId),
            BigInt(data.quantity),
            data.currency,
            BigInt(data.pricePerToken),
            BigInt(now),
            BigInt(endTime),
            false,
          ],
        ],
      })

      await sendTransaction({
        transaction,
        account,
      })

      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing")
      throw err
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="assetContract">Asset Contract Address</Label>
        <Input
          id="assetContract"
          placeholder="0x..."
          {...register("assetContract", {
            required: "Asset contract address is required",
            pattern: {
              value: /^0x[a-fA-F0-9]{40}$/,
              message: "Invalid Ethereum address",
            },
          })}
        />
        {errors.assetContract && <p className="text-xs text-destructive">{errors.assetContract.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tokenId">Token ID</Label>
          <Input
            id="tokenId"
            type="number"
            placeholder="0"
            {...register("tokenId", {
              required: "Token ID is required",
              min: {
                value: 0,
                message: "Token ID must be positive",
              },
            })}
          />
          {errors.tokenId && <p className="text-xs text-destructive">{errors.tokenId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            {...register("quantity", {
              required: "Quantity is required",
              min: {
                value: 1,
                message: "Quantity must be at least 1",
              },
            })}
          />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricePerToken">Price Per Token (in smallest unit)</Label>
        <Input
          id="pricePerToken"
          type="number"
          placeholder="1000000000000000000"
          {...register("pricePerToken", {
            required: "Price is required",
            min: {
              value: 0,
              message: "Price must be non-negative",
            },
          })}
        />
        {errors.pricePerToken && <p className="text-xs text-destructive">{errors.pricePerToken.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency Address (leave blank for RBTC)</Label>
        <Input id="currency" placeholder="0x0000000000000000000000000000000000000000" {...register("currency")} />
        <p className="text-xs text-muted-foreground">Use 0x0000... for native token (RBTC)</p>
      </div>

      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="Listing created successfully"
        errorMessage="Failed to create listing"
        className="w-full"
      >
        Create Listing
      </TransactionButton>
    </form>
  )
}
