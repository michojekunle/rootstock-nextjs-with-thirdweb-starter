import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingCardProps {
  title?: string
  description?: string
  rows?: number
}

/**
 * Loading skeleton for card-based content
 * Provides visual feedback while data is being fetched
 */
export function LoadingCard({ title, description, rows = 3 }: LoadingCardProps) {
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <Skeleton className="h-6 w-32" />}
          {description && <Skeleton className="h-4 w-48 mt-2" />}
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
