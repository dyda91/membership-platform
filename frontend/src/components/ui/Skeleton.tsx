interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={["animate-pulse rounded-md bg-surface-muted", className].join(" ")}
    />
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={index === 0 ? "h-4 w-2/3" : "h-4 w-full"} />
      ))}
    </div>
  )
}
