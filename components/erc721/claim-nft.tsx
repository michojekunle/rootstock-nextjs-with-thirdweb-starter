"use client";

import { useEffect, useState } from "react";
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
import { MAX_NFT_CLAIM_QUANTITY } from "@/lib/constants";

const DAILY_LIMIT = 1000;


/** Native/gas token placeholder used by Thirdweb's claim conditions (EIP-7528) */
const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
/** uint256 max — signals "no per-wallet quantity limit" in the allowlist proof */
const UINT256_MAX = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);
/** Zero address used as the currency placeholder when price is 0 */
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface ClaimForm {
  quantity: string;
}

interface ClaimNFTProps {
  contractAddress: string;
  userAddress: string;
  /** Called with the claimed quantity after the tx is confirmed on-chain */
  onSuccess?: (quantity: number) => void;
}

export function ClaimNFT({ contractAddress, userAddress, onSuccess }: ClaimNFTProps) {
  const account = useActiveAccount();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClaimForm>({
    defaultValues: { quantity: "250" },
  });
  const [error, setError] = useState<string | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState(0);

  // Fetch daily claimed amount from LocalStorage
  useEffect(() => {
    if (!userAddress || !contractAddress) return;
    const storageKey = `claim_limit_${userAddress}_${contractAddress}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const { count, date } = JSON.parse(stored);
      const today = new Date().toISOString().split("T")[0];
      if (date === today) {
        setDailyClaimed(count);
      } else {
        setDailyClaimed(0);
      }
    }
  }, [userAddress, contractAddress]);

  const maxAllowedToday = Math.max(0, DAILY_LIMIT - dailyClaimed);
  const isAtDailyLimit = dailyClaimed >= DAILY_LIMIT;

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

      const quantity = BigInt(data.quantity);

      const transaction = prepareContractCall({
        contract,
        method:
          "function claim(address _receiver, uint256 _quantity, address _currency, uint256 _pricePerToken, (bytes32[] proof, uint256 quantityLimitPerWallet, uint256 pricePerToken, address currency) _allowlistProof, bytes _data) payable",
        params: [
          userAddress,
          quantity,
          NATIVE_TOKEN_ADDRESS,
          BigInt(0),
          {
            proof: [],
            quantityLimitPerWallet: UINT256_MAX,
            pricePerToken: BigInt(0),
            currency: ZERO_ADDRESS,
          },
          "0x",
        ],
      });

      await sendAndConfirmTransaction({
        transaction,
        account,
      });

      reset();
      onSuccess?.(Number(data.quantity));

      // Update daily limit in LocalStorage
      const storageKey = `claim_limit_${userAddress}_${contractAddress}`;
      const newCount = dailyClaimed + Number(data.quantity);
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(storageKey, JSON.stringify({ count: newCount, date: today }));
      setDailyClaimed(newCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
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
        <Label htmlFor="claim-quantity">Quantity to Claim</Label>
        {isAtDailyLimit ? (
          <Alert className="bg-muted/50 border-dashed">
            <AlertDescription className="text-xs">
              You have reached your daily limit of <span className="font-bold text-foreground">{DAILY_LIMIT}</span> NFT claims. 
              Please come back tomorrow!
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Input
              id="claim-quantity"
              type="number"
              min="1"
              max={Math.min(MAX_NFT_CLAIM_QUANTITY, maxAllowedToday)}
              aria-describedby="claim-quantity-error"
              aria-invalid={!!errors.quantity}
              {...register("quantity", {
                required: "Quantity is required",
                min: {
                  value: 1,
                  message: "Minimum quantity is 1",
                },
                max: {
                  value: Math.min(MAX_NFT_CLAIM_QUANTITY, maxAllowedToday),
                  message: dailyClaimed > 0
                    ? `You can only claim ${maxAllowedToday} more today`
                    : `Maximum quantity is ${MAX_NFT_CLAIM_QUANTITY}`,
                },
              })}
            />
            {errors.quantity && (
              <p id="claim-quantity-error" role="alert" className="text-xs text-destructive">
                {errors.quantity.message}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground italic">
              Daily limit: {DAILY_LIMIT}. Remaining today: {maxAllowedToday}.
            </p>
          </>
        )}
      </div>

      <TransactionButton
        onTransaction={handleSubmit(onSubmit)}
        successMessage="NFT claimed successfully"
        errorMessage="Claim failed"
        className="w-full"
        aria-label="Claim NFT"
        disabled={isAtDailyLimit}
      >
        {isAtDailyLimit ? `Daily Limit Reached (${DAILY_LIMIT}/${DAILY_LIMIT})` : "Claim NFT"}
      </TransactionButton>
    </form>
  );
}
