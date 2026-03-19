"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApproveForm {
  spenderAddress: string;
  amount: string;
}

interface ApproveTokenProps {
  contractAddress: string;
}

/**
 * ERC20 token approval component.
 * Allows users to approve a spender address to use their tokens.
 * Required for DEX swaps, lending protocols, and other DeFi operations.
 */
export function ApproveToken({ contractAddress }: ApproveTokenProps) {
  const account = useActiveAccount();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ApproveForm>();
  const [error, setError] = useState<string | null>(null);
  const [approvalAmount, setApprovalAmount] = useState<string>("");

  const onSubmit = async (data: ApproveForm) => {
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

      // Fetch decimals to handle amount conversion
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
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [data.spenderAddress, amount],
      });

      await sendAndConfirmTransaction({
        transaction,
        account,
      });

      setApprovalAmount(data.amount);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {approvalAmount && (
        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            ✅ Successfully approved {approvalAmount} tokens. The spender can now use these tokens.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-muted/50 p-3 rounded-lg border border-muted text-xs text-muted-foreground space-y-2">
        <p className="font-semibold">ℹ️ What is approval?</p>
        <p>
          Token approval allows a smart contract to spend your tokens on your behalf.
          This is required for DEX swaps, staking, lending, and other DeFi operations.
        </p>
        <p className="text-xs">
          <strong>Note:</strong> You can always revoke approval by setting the amount to 0.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="spender">Spender Address</Label>
        <Input
          id="spender"
          placeholder="0x..."
          {...register("spenderAddress", {
            required: "Spender address is required",
            pattern: {
              value: /^0x[a-fA-F0-9]{40}$/,
              message: "Invalid Ethereum address",
            },
          })}
        />
        {errors.spenderAddress && (
          <p className="text-xs text-destructive">{errors.spenderAddress.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          The contract address that will be allowed to spend your tokens
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount to Approve</Label>
        <div className="flex gap-2">
          <Input
            id="amount"
            type="number"
            placeholder="1.0"
            step="0.1"
            {...register("amount", {
              required: "Amount is required",
              validate: (value) => {
                const num = parseFloat(value);
                if (num < 0) return "Amount cannot be negative";
                if (num === 0) return "Approval amount must be greater than 0 (to revoke, set spender address separately)";
                return true;
              },
            })}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setValue("amount", "999999999", { shouldValidate: true })}
            className="whitespace-nowrap"
          >
            Max
          </Button>
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="Token approval successful"
        errorMessage="Approval failed"
        className="w-full"
      >
        Approve Token
      </TransactionButton>
    </form>
  );
}
