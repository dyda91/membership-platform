interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
}

export default function Spinner({
  size = "md",
  className = "",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={[
        "inline-block animate-spin rounded-full border-solid border-current border-t-transparent",
        SIZES[size],
        className,
      ].join(" ")}
    />
  )
}
