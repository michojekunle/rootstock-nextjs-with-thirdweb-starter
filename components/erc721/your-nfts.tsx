"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingCard } from "@/components/dapp/loading-card"
import { ErrorState } from "@/components/dapp/error-state"
import { Spinner } from "@/components/ui/spinner"
import { client } from "@/lib/thirdweb"
import { getContract, readContract, getContractEvents, type ThirdwebContract } from "thirdweb"
import { getOwnedNFTs, transferEvent } from "thirdweb/extensions/erc721"
import { getActiveChain } from "@/lib/chains"
import { ImageIcon, RefreshCw } from "lucide-react"

interface YourNFTsProps {
  contractAddress: string
  userAddress: string
  /** Increment to trigger a background re-fetch after a confirmed claim */
  refreshKey?: number
  /** Number of optimistic placeholder cards to prepend while re-fetching */
  pendingCount?: number
  /** Called once the re-fetch triggered by refreshKey completes */
  onRefreshed?: () => void
}

interface NFT {
  tokenId: string
  uri: string
  metadata?: {
    name?: string
    image?: string
    description?: string
  }
}

/** NFTs shown per page / per "Load More" press */
const PAGE_SIZE = 24

/**
 * IPFS gateways tried in order. Thirdweb's CDN is fastest for content
 * uploaded via the Thirdweb SDK; the others are public fallbacks.
 */
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.thirdwebcdn.com/ipfs/",
  "https://ipfs.io/ipfs/",
]

function resolveUri(uri: string, gatewayIndex = 0): string {
  if (uri.startsWith("ipfs://")) {
    const cid = uri.slice("ipfs://".length)
    const gateway = IPFS_GATEWAYS[gatewayIndex] ?? IPFS_GATEWAYS[0]
    return `${gateway}${cid}`
  }
  return uri
}

function isSafeImageUrl(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  return (
    lower.startsWith("https://") ||
    lower.startsWith("http://") ||
    lower.startsWith("data:image/") ||
    lower.startsWith("ipfs://")
  )
}

const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 500

function sanitizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : undefined
}

async function fetchMetadata(uri: string): Promise<NFT["metadata"] | undefined> {
  try {
    let json: Record<string, unknown>

    let successfulGatewayIndex = 0

    if (uri.startsWith("data:application/json")) {
      const [, payload] = uri.split(",")
      const isBase64 = uri.includes(";base64,")
      const decoded = isBase64 ? atob(payload) : decodeURIComponent(payload)
      json = JSON.parse(decoded) as Record<string, unknown>
    } else {
      let lastError: unknown
      let response: Response | undefined

      const urls = uri.startsWith("ipfs://")
        ? IPFS_GATEWAYS.map((_, i) => ({ url: resolveUri(uri, i), index: i }))
        : [{ url: uri, index: 0 }]

      for (const { url, index } of urls) {
        try {
          response = await fetch(url, { signal: AbortSignal.timeout(8000) })
          if (response.ok) {
            successfulGatewayIndex = index
            break
          }
        } catch (err) {
          lastError = err
        }
      }

      if (!response?.ok) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[YourNFTs] failed to fetch metadata:", uri, lastError)
        }
        return undefined
      }

      json = (await response.json()) as Record<string, unknown>
    }

    if (process.env.NODE_ENV === "development") {
      console.debug("[YourNFTs] metadata for", uri.slice(0, 60), json)
    }

    // Check for common image field names in NFT metadata
    const rawImage = (json.image || json.image_url || json.animation_url) ? String(json.image || json.image_url || json.animation_url) : undefined
    
    // Resolve the image using the same gateway that successfully served the metadata
    let resolvedImage = rawImage
    if (rawImage?.startsWith("ipfs://")) {
      resolvedImage = resolveUri(rawImage, successfulGatewayIndex)
    } else if (rawImage && !rawImage.startsWith("http") && !rawImage.startsWith("data:")) {
      // Handle case where image might be a raw CID
      resolvedImage = resolveUri(`ipfs://${rawImage}`, successfulGatewayIndex)
    }

    const isSafe = resolvedImage && isSafeImageUrl(resolvedImage)

    return {
      name: sanitizeText(json.name || json.title, MAX_NAME_LENGTH),
      image: isSafe ? resolvedImage : undefined,
      description: sanitizeText(json.description || json.caption, MAX_DESCRIPTION_LENGTH),
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[YourNFTs] fetchMetadata error:", err)
    }
    return undefined
  }
}

/**
 * Fetch a page of NFTs in newest-first order.
 *
 * `pageOffset` is a 0-based display offset: 0 means "start from the most
 * recently acquired NFT". For ERC721Enumerable this maps to owner index
 * `totalBalance - 1 - pageOffset`. The non-enumerable fallback mirrors this
 * by assuming sequential token IDs counted down from `totalBalance - 1`.
 */
async function fetchNFTPage(
  contract: ThirdwebContract,
  userAddress: string,
  pageOffset: number,
  count: number,
  useEnumerable: boolean,
  totalBalance: number,
): Promise<{ nfts: NFT[]; usedEnumerable: boolean }> {
  let tokenIds: bigint[]

  try {
    const promises: Promise<bigint>[] = []
    for (let k = 0; k < count; k++) {
      const ownerIndex = totalBalance - 1 - (pageOffset + k)
      promises.push(
        readContract({
          contract,
          method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
          params: [userAddress, BigInt(ownerIndex)],
        }).then((id) => BigInt(id))
      )
    }
    tokenIds = await Promise.all(promises)
    if (process.env.NODE_ENV === "development") console.debug("[YourNFTs] Found IDs via Enumerable:", tokenIds)
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn("[YourNFTs] Enumerable not supported, trying Indexer...")
    }

    // Fallback 1: Thirdweb Indexer
    try {
      const owned = await getOwnedNFTs({
        contract,
        address: userAddress,
        start: pageOffset,
        count,
      })
      if (owned && owned.length > 0) {
        if (process.env.NODE_ENV === "development") console.debug("[YourNFTs] Found IDs via Indexer")
        return {
          nfts: owned.map(o => ({
            tokenId: String(o.tokenId),
            uri: o.tokenURI,
            metadata: o.metadata
          })),
          usedEnumerable: false
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[YourNFTs] Indexer not available:", err)
      }
    }

    // Fallback 2: RPC Logs (Transfer events)
    try {
      if (process.env.NODE_ENV === "development") console.debug("[YourNFTs] Trying RPC events...")
      const events = await getContractEvents({
        contract,
        events: [transferEvent()],
        filters: { to: userAddress },
        fromBlock: 0n,
      })

      if (events && events.length > 0) {
        // Extract unique token IDs and sort newest first
        const allOwnedIds = Array.from(new Set(events.map(e => e.args.tokenId))).reverse()
        tokenIds = allOwnedIds.slice(pageOffset, pageOffset + count)
        if (process.env.NODE_ENV === "development") console.debug("[YourNFTs] Found IDs via Events:", tokenIds)
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[YourNFTs] Event discovery failed (likely RPC range limit):", err)
      }
    }

    // Fallback 3: Sequential Guess (Last resort)
    if (!tokenIds || tokenIds.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[YourNFTs] All discovery methods failed, using sequential fallback")
      }
      tokenIds = Array.from({ length: count }, (_, k) =>
        BigInt(Math.max(0, totalBalance - 1 - (pageOffset + k)))
      )
    }

    useEnumerable = false
  }

  // Batch-fetch all tokenURIs in parallel
  const uriResults = await Promise.all(
    tokenIds.map((tokenId) =>
      readContract({
        contract,
        method: "function tokenURI(uint256 tokenId) view returns (string)",
        params: [tokenId],
      })
        .then((uri) => ({ tokenId, uri: String(uri), ok: true }))
        .catch(() => ({ tokenId, uri: "", ok: false }))
    )
  )

  // Fetch metadata for all valid URIs in parallel
  const validUris = uriResults.filter((r) => r.ok && r.uri)
  const withMetadata = await Promise.all(
    validUris.map(async (r) => ({
      tokenId: String(r.tokenId),
      uri: r.uri,
      metadata: await fetchMetadata(r.uri),
    }))
  )

  return {
    nfts: withMetadata,
    usedEnumerable: useEnumerable,
  }
}

/** Shimmer placeholder shown for each optimistically-claimed NFT while re-fetching */
function NFTPlaceholderCard() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <CardContent className="p-0">
        <div className="aspect-square bg-muted/60" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-2/3 rounded-md bg-muted" />
          <div className="h-3 w-1/3 rounded-md bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}

function NFTCard({ nft }: { nft: NFT }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square bg-muted flex items-center justify-center">
          {nft.metadata?.image ? (
            <img
              src={nft.metadata.image}
              alt={
                nft.metadata.name
                  ? `${nft.metadata.name} — NFT #${nft.tokenId}`
                  : `NFT #${nft.tokenId} from collection`
              }
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground" />
          )}
        </div>
        <div className="p-4 space-y-1">
          <p className="font-semibold truncate">
            {nft.metadata?.name || `NFT #${nft.tokenId}`}
          </p>
          <p className="text-xs text-muted-foreground">ID: {nft.tokenId}</p>
          {nft.metadata?.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {nft.metadata.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function YourNFTs({
  contractAddress,
  userAddress,
  refreshKey = 0,
  pendingCount = 0,
  onRefreshed,
}: YourNFTsProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Track whether the contract supports ERC721Enumerable so we don't retry it on every page
  const supportsEnumerable = useRef(true)
  const isFirstMount = useRef(true)

  // ── Initial load / background re-fetch ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        if (isFirstMount.current) {
          setLoading(true)
        } else {
          setIsRefreshing(true)
        }
        setError(null)

        const chain = getActiveChain()
        const contract = getContract({ client, address: contractAddress, chain })

        const rawBalance = await readContract({
          contract,
          method: "function balanceOf(address account) view returns (uint256)",
          params: [userAddress],
        })

        const total = Number(BigInt(rawBalance))
        if (!cancelled) setTotalBalance(total)

        if (total === 0) {
          if (!cancelled) setNfts([])
          return
        }

        const firstCount = Math.min(PAGE_SIZE, total)
        const { nfts: firstPage, usedEnumerable } = await fetchNFTPage(
          contract,
          userAddress,
          0,
          firstCount,
          supportsEnumerable.current,
          total,
        )
        supportsEnumerable.current = usedEnumerable

        if (!cancelled) setNfts(firstPage)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch NFTs")
          if (process.env.NODE_ENV === "development") {
            console.error("[YourNFTs] init error:", err)
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setIsRefreshing(false)
          isFirstMount.current = false
          onRefreshed?.()
        }
      }
    }

    if (contractAddress && userAddress) init()
    return () => { cancelled = true }
  }, [contractAddress, userAddress, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load more (one page) ────────────────────────────────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      const chain = getActiveChain()
      const contract = getContract({ client, address: contractAddress, chain })
      const startIdx = nfts.length
      const count = Math.min(PAGE_SIZE, totalBalance - startIdx)

      const { nfts: nextPage, usedEnumerable } = await fetchNFTPage(
        contract,
        userAddress,
        startIdx,
        count,
        supportsEnumerable.current,
        totalBalance,
      )
      supportsEnumerable.current = usedEnumerable
      setNfts((prev) => [...prev, ...nextPage])
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[YourNFTs] loadMore error:", err)
      }
    } finally {
      setLoadingMore(false)
    }
  }, [contractAddress, userAddress, nfts.length, totalBalance, loadingMore])

  // ── Load ALL remaining ──────────────────────────────────────────────────────
  // Fetches every remaining NFT page-by-page and accumulates them.
  // Works for any collection size — 10, 1 000, 10 000+.
  const handleLoadAll = useCallback(async () => {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      const chain = getActiveChain()
      const contract = getContract({ client, address: contractAddress, chain })

      let startIdx = nfts.length
      const accumulated: NFT[] = []

      while (startIdx < totalBalance) {
        const count = Math.min(PAGE_SIZE, totalBalance - startIdx)
        const { nfts: page, usedEnumerable } = await fetchNFTPage(
          contract,
          userAddress,
          startIdx,
          count,
          supportsEnumerable.current,
          totalBalance,
        )
        supportsEnumerable.current = usedEnumerable
        accumulated.push(...page)
        startIdx += count
        // Flush each page into state so the grid grows progressively
        setNfts((prev) => [...prev, ...page])
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[YourNFTs] loadAll error:", err)
      }
    } finally {
      setLoadingMore(false)
    }
  }, [contractAddress, userAddress, nfts.length, totalBalance, loadingMore])

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <LoadingCard />
  if (error) return <ErrorState error={error} />

  const hasMore = nfts.length < totalBalance
  const showEmpty = nfts.length === 0 && pendingCount === 0

  if (showEmpty) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <ImageIcon className="size-8" />
            <p>You don&apos;t own any NFTs from this collection yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{nfts.length}</span>
          {" "}of{" "}
          <span className="font-medium text-foreground">
            {totalBalance + pendingCount}
          </span>{" "}
          NFT{totalBalance + pendingCount !== 1 ? "s" : ""}
        </span>
        {isRefreshing && (
          <span className="flex items-center gap-1 animate-pulse">
            <RefreshCw className="size-3 animate-spin" />
            Updating…
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {/* Optimistic placeholder cards — appear at top after a claim */}
        {pendingCount > 0 &&
          Array.from({ length: pendingCount }).map((_, i) => (
            <NFTPlaceholderCard key={`pending-${i}`} />
          ))}

        {nfts.map((nft) => (
          <NFTCard key={nft.tokenId} nft={nft} />
        ))}
      </div>

      {/* Pagination footer */}
      {hasMore && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex-1 sm:flex-none sm:w-44"
            >
              {loadingMore ? (
                <>
                  <Spinner className="mr-2" />
                  Loading…
                </>
              ) : (
                `Load ${Math.min(PAGE_SIZE, totalBalance - nfts.length)} more`
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleLoadAll}
              disabled={loadingMore}
              className="flex-1 sm:flex-none sm:w-44"
            >
              {loadingMore ? (
                <>
                  <Spinner className="mr-2" />
                  Loading…
                </>
              ) : (
                `Load all (${totalBalance - nfts.length} remaining)`
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Loading many NFTs at once may take a moment
          </p>
        </div>
      )}
    </div>
  )
}
