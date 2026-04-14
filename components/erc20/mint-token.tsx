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
import { MIN_TOKEN_QUANTITY, MAX_MINT_QUANTITY } from "@/lib/constants";

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
    reset,
  } = useForm<MintForm>({
    // Fix #11: initialise defaultValues to prevent controlled/uncontrolled warnings
    defaultValues: { amount: "" },
  });
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

      const transaction = claimTo({
        contract,
        to: account.address,
        quantity: data.amount,
      });

      await sendAndConfirmTransaction({
        transaction,
        account,
      });

      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mint failed");
    }
  };

  return (
    // Fix #15: handleSubmit already calls preventDefault; no need for an extra wrapper
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="mint-amount">Amount to Mint</Label>
        {/* Fix #2 & #3: aria-describedby links the input to its error message */}
        <Input
          id="mint-amount"
          type="number"
          placeholder="10.0"
          step="0.1"
          aria-describedby="mint-amount-error"
          aria-invalid={!!errors.amount}
          {...register("amount", {
            required: "Amount is required",
            min: {
              // Fix #4: use named constant instead of magic number
              value: MIN_TOKEN_QUANTITY,
              message: `Amount must be at least ${MIN_TOKEN_QUANTITY}`,
            },
            max: {
              value: MAX_MINT_QUANTITY,
              message: `Amount cannot exceed ${MAX_MINT_QUANTITY.toLocaleString()}`,
            },
          })}
        />
        {/* id ties to aria-describedby; role="alert" announces errors to screen readers */}
        {errors.amount && (
          <p id="mint-amount-error" role="alert" className="text-xs text-destructive">
            {errors.amount.message}
          </p>
        )}
      </div>

      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="Mint successful"
        errorMessage="Mint failed"
        className="w-full"
        aria-label="Mint tokens"
      >
        Mint Tokens
      </TransactionButton>
    </form>
  );
}
