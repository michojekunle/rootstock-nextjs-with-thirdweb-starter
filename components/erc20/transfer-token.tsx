"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TransactionButton } from "@/components/dapp/transaction-button"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { client } from "@/lib/thirdweb"
import { getContract, prepareContractCall, sendTransaction } from "thirdweb"
import { getActiveChain } from "@/lib/chains"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TransferForm {
  to: string
  amount: string
}

interface TransferTokenProps {
  contractAddress: string
}

export function TransferToken({ contractAddress }: TransferTokenProps) {
  const account = useActiveAccount()
  const chain = useActiveWalletChain()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferForm>()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: TransferForm) => {
    if (!account || !chain) {
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

      const amount = BigInt(data.amount) * BigInt(10 ** 18)

      const transaction = prepareContractCall({
        contract,
        method: "function transfer(address to, uint256 amount) returns (bool)",
        params: [data.to, amount],
      })

      await sendTransaction({
        transaction,
        account,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed")
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
        <Label htmlFor="to">Recipient Address</Label>
        <Input
          id="to"
          placeholder="0x..."
          {...register("to", {
            required: "Recipient address is required",
            pattern: {
              value: /^0x[a-fA-F0-9]{40}$/,
              message: "Invalid Ethereum address",
            },
          })}
        />
        {errors.to && <p className="text-xs text-destructive">{errors.to.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="1.0"
          step="0.1"
          {...register("amount", {
            required: "Amount is required",
            min: {
              value: 0.1,
              message: "Amount must be greater than 0",
            },
          })}
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="Transfer successful"
        errorMessage="Transfer failed"
        className="w-full"
      >
        Transfer Token
      </TransactionButton>
    </form>
  )
}
