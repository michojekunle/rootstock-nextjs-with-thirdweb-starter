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
import { isValidAddress } from "@/lib/utils";
import { MAX_APPROVAL_AMOUNT } from "@/lib/constants";

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
 * Setting amount to "0" revokes an existing approval.
 */
export function ApproveToken({ contractAddress }: ApproveTokenProps) {
  const account = useActiveAccount();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ApproveForm>({
    defaultValues: { spenderAddress: "", amount: "" },
  });
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
    // Fix #15: handleSubmit already prevents default; explicit wrapper removed
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      {/*
        Fix #9: Replace custom static div with <details>/<summary>.
        This is fully semantic, keyboard-navigable (Enter/Space toggles),
        and announced correctly by screen readers without any extra JS.
      */}
      <details className="bg-muted/50 p-3 rounded-lg border border-muted text-xs text-muted-foreground">
        <summary className="font-semibold cursor-pointer select-none">
          ℹ️ What is approval?
        </summary>
        <div className="mt-2 space-y-1">
          <p>
            Token approval allows a smart contract to spend your tokens on your behalf.
            This is required for DEX swaps, staking, lending, and other DeFi operations.
          </p>
          {/* Fix #14: explicitly document that 0 = revoke */}
          <p>
            <strong>Note:</strong> Set the amount to <code>0</code> to <em>revoke</em> an existing
            approval — this prevents a spender from using any more of your tokens.
          </p>
        </div>
      </details>

      <div className="space-y-2">
        <Label htmlFor="spender">Spender Address</Label>
        {/* Fix #3: aria-describedby links input to its error node */}
        <Input
          id="spender"
          placeholder="0x..."
          aria-describedby="spender-address-error"
          aria-invalid={!!errors.spenderAddress}
          {...register("spenderAddress", {
            required: "Spender address is required",
            // Fix #5: replace regex with EIP-55 checksum validation
            validate: (value) =>
              isValidAddress(value) || "Invalid Ethereum address — check for typos",
          })}
        />
        {errors.spenderAddress && (
          <p id="spender-address-error" role="alert" className="text-xs text-destructive">
            {errors.spenderAddress.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          The contract address that will be allowed to spend your tokens
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="approve-amount">Amount to Approve</Label>
        <div className="flex gap-2">
          <Input
            id="approve-amount"
            type="number"
            placeholder="1.0"
            step="0.1"
            aria-describedby="approve-amount-error"
            aria-invalid={!!errors.amount}
            {...register("amount", {
              required: "Amount is required",
              validate: (value) => {
                const num = parseFloat(value);
                if (isNaN(num)) return "Enter a valid number";
                if (num < 0) return "Amount cannot be negative";
                // Fix #14: allow 0 to revoke approval — previously blocked
                return true;
              },
            })}
          />
          {/* Fix #4: use MAX_APPROVAL_AMOUNT constant */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setValue("amount", MAX_APPROVAL_AMOUNT, { shouldValidate: true })}
            className="whitespace-nowrap"
            aria-label={`Set approval amount to maximum (${MAX_APPROVAL_AMOUNT})`}
          >
            Max
          </Button>
        </div>
        {errors.amount && (
          <p id="approve-amount-error" role="alert" className="text-xs text-destructive">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Fix #8: aria-label updates to reflect the active state for screen readers */}
      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="Token approval successful"
        errorMessage="Approval failed"
        className="w-full"
        aria-label="Approve token spending"
      >
        Approve Token
      </TransactionButton>
    </form>
  );
}
