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
  sendAndConfirmTransaction,
} from "thirdweb";
import { getActiveChain } from "@/lib/chains";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { claimTo } from "thirdweb/extensions/erc20";

interface MintForm {
  amount: string;
}

interface MintTokenProps {
  contractAddress: string;
}

export function MintToken({ contractAddress }: MintTokenProps) {
  const account = useActiveAccount();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MintForm>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: MintForm) => {
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

      const amount = BigInt(data.amount) * BigInt(10 ** 18);

      const transaction = claimTo({
        contract,
        to: account.address,
        quantity: data.amount,
      });

      await sendAndConfirmTransaction({
        transaction,
        account,
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mint failed");
      throw err;
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
        <Label htmlFor="amount">Amount to Mint</Label>
        <Input
          id="amount"
          type="number"
          placeholder="10.0"
          step="0.1"
          {...register("amount", {
            required: "Amount is required",
            min: {
              value: 0.1,
              message: "Amount must be greater than 0",
            },
          })}
        />
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="Mint successful"
        errorMessage="Mint failed"
        className="w-full"
      >
        Mint Tokens
      </TransactionButton>
    </form>
  );
}
