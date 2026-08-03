function formatCount(count: number): string {
  return count > 99 ? "99+" : String(count)
}

interface UnreadBadgeProps {
  count: number
}

export default function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) {
    return null
  }

  return (
    <span
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground"
      aria-label={`${formatCount(count)} mensagens não lidas`}
    >
      {formatCount(count)}
    </span>
  )
}
