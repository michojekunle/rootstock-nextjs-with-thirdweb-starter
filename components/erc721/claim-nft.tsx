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
  sendAndConfirmTransaction,
} from "thirdweb";
import { getActiveChain } from "@/lib/chains";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { claimTo } from "thirdweb/extensions/erc20";

interface ClaimForm {
  quantity: string;
}

interface ClaimNFTProps {
  contractAddress: string;
  userAddress: string;
}

export function ClaimNFT({ contractAddress, userAddress }: ClaimNFTProps) {
  const account = useActiveAccount();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClaimForm>({
    defaultValues: { quantity: "1" },
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: ClaimForm) => {
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

      const quantity = BigInt(1);

      const transaction = prepareContractCall({
        contract,
        method:
          "function claim(address _receiver, uint256 _quantity, address _currency, uint256 _pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) _allowlistProof, bytes _data) payable",
        params: [
          userAddress,
          quantity,
          "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          BigInt(0),
          {
            proof: [],
            quantityLimitPerWallet: BigInt(
              "115792089237316195423570985008687907853269984665640564039457584007913129639935"
            ),
            pricePerToken: BigInt(0),
            currency: "0x0000000000000000000000000000000000000000",
          },
          "0x",
        ],
      });

      await sendAndConfirmTransaction({
        transaction,
        account,
      });

      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
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
        <Label htmlFor="quantity">Quantity to Claim</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max="10"
          {...register("quantity", {
            required: "Quantity is required",
            min: {
              value: 1,
              message: "Minimum quantity is 1",
            },
            max: {
              value: 10,
              message: "Maximum quantity is 10",
            },
          })}
        />
        {errors.quantity && (
          <p className="text-xs text-destructive">{errors.quantity.message}</p>
        )}
      </div>

      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="NFT claimed successfully"
        errorMessage="Claim failed"
        className="w-full"
      >
        Claim NFT
      </TransactionButton>
    </form>
  );
}
