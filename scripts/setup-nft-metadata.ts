#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * setup-nft-metadata.ts
 *
 * Uploads the Rootstock "R" logo to IPFS via Thirdweb Storage, then lazy-mints
 * a batch of NFTs on the configured ERC721 Drop contract so users can claim them.
 *
 * Run ONCE after deploying your NFT Drop contract (or whenever you want to add
 * more supply to the drop).
 *
 * ─── Usage ───────────────────────────────────────────────────────────────────
 *
 *   pnpm setup:nft
 *   pnpm setup:nft -- --count=500
 *
 * ─── Required env vars ───────────────────────────────────────────────────────
 *
 *   THIRDWEB_SECRET_KEY                   Server-side Thirdweb API key
 *                                         (different from NEXT_PUBLIC_THIRDWEB_CLIENT_ID)
 *                                         Get one at: https://thirdweb.com/dashboard/settings/api-keys
 *
 *   DEPLOYER_PRIVATE_KEY                  0x-prefixed private key of the wallet that
 *                                         has the "Minter" role on the contract
 *
 *   NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS The deployed ERC721 Drop contract address
 *
 *   NEXT_PUBLIC_DEFAULT_NETWORK           mainnet | testnet  (default: testnet)
 *
 * ─── What it does ────────────────────────────────────────────────────────────
 *
 *   1. Reads public/icon.svg (the Rootstock "R" logo)
 *   2. Uploads the image to IPFS — returns an ipfs:// URI
 *   3. Calls lazyMint() on your contract, writing that IPFS URI as the image
 *      for every NFT in the batch
 *   4. After this, users can call claim() from the UI to receive NFTs
 *      whose image is the Rootstock "R" logo stored permanently on IPFS
 */

import { createThirdwebClient, getContract, sendAndConfirmTransaction } from "thirdweb"
import { upload } from "thirdweb/storage"
import { lazyMint } from "thirdweb/extensions/erc721"
import { privateKeyToAccount } from "thirdweb/wallets"
import { defineChain } from "thirdweb"
import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Load .env.local ──────────────────────────────────────────────────────────
// tsx is a plain Node.js runner — it does NOT load .env.local automatically
// (that's something Next.js does internally). We parse it here so the script
// works the same way whether run via `pnpm setup:nft` or directly.

function loadEnvLocal(): void {
  const envPath = resolve(__dirname, "../.env.local")
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue

    const key = trimmed.slice(0, eqIdx).trim()
    if (!key || key.includes(" ")) continue

    // First definition wins — same behaviour as Next.js / dotenv
    if (key in process.env) continue

    let value = trimmed.slice(eqIdx + 1).trim()

    // Strip inline comments that aren't inside quotes (e.g. KEY=val # comment)
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const hashIdx = value.indexOf(" #")
      if (hashIdx !== -1) value = value.slice(0, hashIdx).trim()
    }

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

loadEnvLocal()

// ─── Parse --count flag ───────────────────────────────────────────────────────

function parseCount(): number {
  const flag = process.argv.find((a) => a.startsWith("--count="))
  if (!flag) return 100
  const n = parseInt(flag.split("=")[1], 10)
  if (isNaN(n) || n < 1) throw new Error("--count must be a positive integer")
  return n
}

const count = parseCount()

// ─── Validate env ─────────────────────────────────────────────────────────────

const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS
const NETWORK = process.env.NEXT_PUBLIC_DEFAULT_NETWORK ?? "testnet"

if (!THIRDWEB_SECRET_KEY) {
  throw new Error(
    "Missing THIRDWEB_SECRET_KEY.\n" +
    "Create a server-side API key at https://thirdweb.com/dashboard/settings/api-keys\n" +
    "and add it to your .env.local (do NOT use the NEXT_PUBLIC_ client ID here)."
  )
}
if (!DEPLOYER_PRIVATE_KEY) {
  throw new Error("Missing DEPLOYER_PRIVATE_KEY — provide the 0x-prefixed private key of the minter wallet.")
}
if (!CONTRACT_ADDRESS) {
  throw new Error("Missing NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS — set it in .env.local.")
}

// ─── Chain ────────────────────────────────────────────────────────────────────

const isMainnet = NETWORK === "mainnet" || NETWORK === "rootstock-mainnet"
const chain = defineChain({
  id: isMainnet ? 30 : 31,
  name: isMainnet ? "Rootstock Mainnet" : "Rootstock Testnet",
  rpc: isMainnet ? "https://public-node.rsk.co" : "https://public-node.testnet.rsk.co",
})

// ─── Thirdweb client & wallet ─────────────────────────────────────────────────

const client = createThirdwebClient({ secretKey: THIRDWEB_SECRET_KEY })

const account = privateKeyToAccount({
  client,
  privateKey: DEPLOYER_PRIVATE_KEY as `0x${string}`,
})

const contract = getContract({
  client,
  address: CONTRACT_ADDRESS,
  chain,
})

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n╔═══════════════════════════════════════════════╗")
  console.log("║       Rootstock NFT Metadata Setup            ║")
  console.log("╚═══════════════════════════════════════════════╝\n")
  console.log(`  Network  : ${chain.name}`)
  console.log(`  Contract : ${CONTRACT_ADDRESS}`)
  console.log(`  Wallet   : ${account.address}`)
  console.log(`  Count    : ${count} NFT(s)\n`)

  // 1. Read the Rootstock "R" logo from public/icon.svg
  const svgPath = resolve(__dirname, "../public/icon.svg")
  const svgBuffer = readFileSync(svgPath)
  const svgFile = new File([svgBuffer], "icon.svg", { type: "image/svg+xml" })

  // 2. Upload the image to IPFS (once — the same URI is reused for all NFTs)
  // upload() returns a single string when given one file, or string[] for many.
  // We normalise both cases so destructuring never silently gives us "i".
  console.log("📤 Uploading Rootstock logo to IPFS…")
  const uploadResult = await upload({ client, files: [svgFile] })
  const imageUri = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult
  if (!imageUri || !imageUri.startsWith("ipfs://")) {
    throw new Error(`Unexpected upload result: ${JSON.stringify(uploadResult)}`)
  }
  console.log(`   ✓ Image stored at: ${imageUri}\n`)

  // 3. Build NFT metadata array
  //    Each NFT gets a unique name ("Rootstock dApp #1", "#2", …) and the same logo.
  const nfts = Array.from({ length: count }, (_, i) => ({
    name: `Rootstock dApp #${i + 1}`,
    description:
      "A Rootstock dApp NFT — minted via the Rootstock Next.js + Thirdweb starter kit. " +
      "The Rootstock Bitcoin L2 ecosystem, on-chain.",
    image: imageUri,
    attributes: [
      { trait_type: "Collection", value: "Rootstock dApp Starter" },
      { trait_type: "Edition", value: String(i + 1) },
    ],
  }))

  // 4. Lazy-mint the batch on-chain
  //    lazyMint() stores metadata on IPFS and writes the base URI to the contract.
  //    Users call claim() (via the UI) to actually receive these NFTs in their wallet.
  console.log(`📝 Lazy-minting ${count} NFT(s) on ${chain.name}…`)
  const tx = lazyMint({ contract, nfts })
  const receipt = await sendAndConfirmTransaction({ transaction: tx, account })

  console.log(`   ✓ Transaction: ${receipt.transactionHash}\n`)
  console.log("✅  Done!\n")
  console.log("   Users can now claim NFTs from this collection via the UI.")
  console.log(`   Each NFT's image is the Rootstock 'R' logo pinned on IPFS:\n   ${imageUri}\n`)
}

main().catch((err: unknown) => {
  console.error("\n❌  Setup failed:", err instanceof Error ? err.message : String(err))
  process.exit(1)
})
