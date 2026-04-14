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
import { isValidAddress } from "@/lib/utils";
import { MIN_TOKEN_QUANTITY, MAX_TRANSFER_AMOUNT } from "@/lib/constants";

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
  } = useForm<TransferForm>({
    defaultValues: { to: "", amount: "" },
  });
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
    // Fix #15: handleSubmit already prevents default; explicit wrapper removed
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="transfer-to">Recipient Address</Label>
        {/* Fix #3: aria-describedby links input to its error node */}
        <Input
          id="transfer-to"
          placeholder="0x..."
          aria-describedby="transfer-to-error"
          aria-invalid={!!errors.to}
          {...register("to", {
            required: "Recipient address is required",
            // Fix #5: replace regex with EIP-55 checksum validation
            validate: (value) =>
              isValidAddress(value) || "Invalid Ethereum address — check for typos",
          })}
        />
        {errors.to && (
          <p id="transfer-to-error" role="alert" className="text-xs text-destructive">
            {errors.to.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transfer-amount">Amount</Label>
        <Input
          id="transfer-amount"
          type="number"
          placeholder="1.0"
          step="0.1"
          aria-describedby="transfer-amount-error"
          aria-invalid={!!errors.amount}
          {...register("amount", {
            required: "Amount is required",
            min: {
              // Fix #4: use named constant instead of magic number
              value: MIN_TOKEN_QUANTITY,
              message: `Amount must be at least ${MIN_TOKEN_QUANTITY}`,
            },
            max: {
              // Fix #4: use named constant instead of magic number
              value: MAX_TRANSFER_AMOUNT,
              message: `Amount cannot exceed ${MAX_TRANSFER_AMOUNT.toLocaleString()}`,
            },
          })}
        />
        {errors.amount && (
          <p id="transfer-amount-error" role="alert" className="text-xs text-destructive">
            {errors.amount.message}
          </p>
        )}
      </div>

      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="Transfer successful"
        errorMessage="Transfer failed"
        className="w-full"
        aria-label="Transfer tokens"
      >
        Transfer Token
      </TransactionButton>
    </form>
  );
}
