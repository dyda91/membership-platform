import type { ReactNode } from "react"

export type ContainerWidth = "narrow" | "standard" | "wide"

interface PageContainerProps {
  width?: ContainerWidth
  className?: string
  children: ReactNode
}

const WIDTHS: Record<ContainerWidth, string> = {
  narrow: "max-w-2xl",
  standard: "max-w-4xl",
  wide: "max-w-7xl",
}

export default function PageContainer({
  width = "standard",
  className = "",
  children,
}: PageContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full px-4 py-6 sm:px-6 lg:py-8",
        WIDTHS[width],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}
