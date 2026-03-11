"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionButton } from "@/components/dapp/transaction-button";
import { useActiveAccount } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import {
  getContract,
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
} from "thirdweb";
import { getActiveChain } from "@/lib/chains";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TransferForm {
  to: string;
  amount: string;
}

interface TransferTokenProps {
  contractAddress: string;
}

export function TransferToken({ contractAddress }: TransferTokenProps) {
  const account = useActiveAccount();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransferForm>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: TransferForm) => {
    if (!account) {
      setError("Wallet not connected");
      return;
    }

    try {
      setError(null);
      const activeChain = getActiveChain();
      const contract = getContract({
        client,
        address: contractAddress,
        chain: activeChain,
      });

      const decimals = await readContract({
        contract,
        method: "function decimals() view returns (uint8)",
        params: [],
      });

      const decimalCount = Number(decimals);
      const [intPart, fracPart = ""] = data.amount.split(".");
      const paddedFrac = fracPart.padEnd(decimalCount, "0").slice(0, decimalCount);
      const amount = BigInt(intPart) * BigInt(10 ** decimalCount) + BigInt(paddedFrac || "0");

      const transaction = prepareContractCall({
        contract,
        method: "function transfer(address to, uint256 amount) returns (bool)",
        params: [data.to, amount],
      });

      await sendAndConfirmTransaction({
        transaction,
        account,
      });

      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    }
  };

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
        {errors.to && (
          <p className="text-xs text-destructive">{errors.to.message}</p>
        )}
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
            max: {
              value: 1_000_000_000,
              message: "Amount cannot exceed 1,000,000,000",
            },
          })}
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
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
  );
}
