#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-nft.ts
 *
 * Diagnoses the NFT Drop contract state: shows how many tokens exist per batch,
 * fetches tokenURI for the first/last token of each batch, and prints the full
 * metadata JSON so you can see whether the image field is populated correctly.
 *
 * Usage:
 *   pnpm check:nft
 *   pnpm check:nft -- --wallet=0xYourWalletAddress
 */

import { createThirdwebClient, getContract, readContract } from "thirdweb"
import { defineChain } from "thirdweb"
import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnvLocal(): void {
  const envPath = resolve(__dirname, "../.env.local")
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    if (!key || key.includes(" ") || key in process.env) continue
    let value = trimmed.slice(eqIdx + 1).trim()
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const hashIdx = value.indexOf(" #")
      if (hashIdx !== -1) value = value.slice(0, hashIdx).trim()
    }
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1)
    process.env[key] = value
  }
}
loadEnvLocal()

// ─── Config ───────────────────────────────────────────────────────────────────
const CLIENT_ID   = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? ""
const SECRET_KEY  = process.env.THIRDWEB_SECRET_KEY
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS
const NETWORK     = process.env.NEXT_PUBLIC_DEFAULT_NETWORK ?? "testnet"

// Optional --wallet= flag to check a specific address
const walletArg = process.argv.find((a) => a.startsWith("--wallet="))
const WALLET_ADDRESS = walletArg?.split("=")[1]

if (!CONTRACT_ADDRESS) throw new Error("Missing NEXT_PUBLIC_NFT_DROP_CONTRACT_ADDRESS in .env.local")

const isMainnet = NETWORK === "mainnet" || NETWORK === "rootstock-mainnet"
const chain = defineChain({
  id: isMainnet ? 30 : 31,
  name: isMainnet ? "Rootstock Mainnet" : "Rootstock Testnet",
  rpc: isMainnet ? "https://public-node.rsk.co" : "https://public-node.testnet.rsk.co",
})

const client = createThirdwebClient(
  SECRET_KEY ? { secretKey: SECRET_KEY } : { clientId: CLIENT_ID }
)
const contract = getContract({ client, address: CONTRACT_ADDRESS, chain })

// ─── IPFS helpers ─────────────────────────────────────────────────────────────
const GATEWAYS = [
  "https://ipfs.thirdwebcdn.com/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
]

function resolveIpfs(uri: string, gatewayIdx = 0): string {
  if (uri.startsWith("ipfs://"))
    return `${GATEWAYS[gatewayIdx] ?? GATEWAYS[0]}${uri.slice(7)}`
  return uri
}

async function fetchJson(uri: string): Promise<{ ok: boolean; data?: unknown; gateway?: string; error?: string }> {
  const urls = uri.startsWith("ipfs://") ? GATEWAYS.map((_, i) => resolveIpfs(uri, i)) : [uri]
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (res.ok) {
        const data = await res.json() as unknown
        return { ok: true, data, gateway: url }
      }
    } catch {
      // try next gateway
    }
  }
  return { ok: false, error: "All gateways failed / timed out" }
}

async function probeImageUrl(uri: string): Promise<string> {
  const urls = uri.startsWith("ipfs://") ? GATEWAYS.map((_, i) => resolveIpfs(uri, i)) : [uri]
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) })
      if (res.ok) return `✓ ${url}  (${res.headers.get("content-type") ?? "no content-type"})`
    } catch {
      // try next
    }
  }
  return "✗ unreachable on all gateways"
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("\n╔═══════════════════════════════════════════╗")
  console.log("║         NFT Drop Diagnostic               ║")
  console.log("╚═══════════════════════════════════════════╝\n")
  console.log(`  Chain    : ${chain.name} (id ${chain.id})`)
  console.log(`  Contract : ${CONTRACT_ADDRESS}\n`)

  // ── Contract counters ────────────────────────────────────────────────────────
  const [totalSupply, nextTokenId] = await Promise.all([
    readContract({ contract, method: "function totalSupply() view returns (uint256)", params: [] }),
    readContract({ contract, method: "function nextTokenIdToMint() view returns (uint256)", params: [] })
      .catch(() => null),
  ])

  const claimed   = Number(totalSupply)
  const available = nextTokenId != null ? Number(nextTokenId) : null

  console.log(`  Claimed (totalSupply)    : ${claimed}`)
  if (available != null) {
    console.log(`  Lazy-minted (available) : ${available}`)
    console.log(`  Unclaimed               : ${available - claimed}`)
  }
  console.log()

  // ── Wallet balance ───────────────────────────────────────────────────────────
  if (WALLET_ADDRESS) {
    const balance = await readContract({
      contract,
      method: "function balanceOf(address owner) view returns (uint256)",
      params: [WALLET_ADDRESS],
    })
    console.log(`  Wallet ${WALLET_ADDRESS}`)
    console.log(`  NFTs owned : ${Number(balance)}\n`)

    // Show tokenURI for each owned NFT (up to 10)
    const owned = Number(balance)
    const toCheck = Math.min(owned, 10)
    if (toCheck > 0) {
      console.log(`  ── Token URIs for this wallet (first ${toCheck}) ──────────────────`)
      for (let i = 0; i < toCheck; i++) {
        const tokenId = await readContract({
          contract,
          method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
          params: [WALLET_ADDRESS, BigInt(i)],
        }).catch(() => null)
        if (tokenId == null) { console.log(`  [${i}] tokenOfOwnerByIndex not supported`); break }
        const uri = await readContract({
          contract,
          method: "function tokenURI(uint256 tokenId) view returns (string)",
          params: [tokenId],
        }).catch(() => null)
        console.log(`\n  Token #${tokenId}  →  ${uri ?? "(no URI returned)"}`)
        if (!uri) continue

        const meta = await fetchJson(uri)
        if (!meta.ok) {
          console.log(`    Metadata : ✗ fetch failed — ${meta.error}`)
          continue
        }
        const json = meta.data as Record<string, unknown>
        console.log(`    Metadata : ✓ fetched via ${meta.gateway}`)
        console.log(`    name     : ${json.name ?? "(missing)"}`)
        console.log(`    image    : ${json.image ?? "(MISSING — this is why no image shows)"}`)
        if (json.image) {
          const imageStatus = await probeImageUrl(String(json.image))
          console.log(`    image ok : ${imageStatus}`)
        }
        console.log(`    description: ${String(json.description ?? "").slice(0, 80)}`)
      }
      console.log()
    }
  }

  // ── Check the first and last lazy-minted tokens ───────────────────────────────
  if (available != null && available > 0) {
    const sample = [...new Set([0, Math.max(0, available - 1)])]
    console.log(`  ── Sampling token URI at indices [${sample.join(", ")}] ─────────`)
    for (const id of sample) {
      const uri = await readContract({
        contract,
        method: "function tokenURI(uint256 tokenId) view returns (string)",
        params: [BigInt(id)],
      }).catch(() => null)
      console.log(`\n  Token #${id}  →  ${uri ?? "(no URI returned)"}`)
      if (!uri) continue

      const meta = await fetchJson(uri)
      if (!meta.ok) {
        console.log(`    Metadata : ✗ — ${meta.error}`)
        continue
      }
      const json = meta.data as Record<string, unknown>
      console.log(`    Metadata : ✓ via ${meta.gateway}`)
      console.log(`    name     : ${json.name ?? "(missing)"}`)
      console.log(`    image    : ${json.image ?? "(MISSING)"}`)
      if (json.image) {
        const imageStatus = await probeImageUrl(String(json.image))
        console.log(`    image ok : ${imageStatus}`)
      }
    }
    console.log()
  }

  console.log("  Done.\n")
}

main().catch((err: unknown) => {
  console.error("\n❌  Diagnostic failed:", err instanceof Error ? err.message : String(err))
  process.exit(1)
})
