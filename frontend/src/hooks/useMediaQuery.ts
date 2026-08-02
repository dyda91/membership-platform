import { useEffect, useState } from "react"

/**
 * Resolves a CSS media query in the browser. When matchMedia is unavailable
 * (for example in jsdom tests) it defaults to `true`, keeping a desktop-first
 * presentation active so only one variant is rendered.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return true
    }

    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return
    }

    const mql = window.matchMedia(query)

    const handler = () => setMatches(mql.matches)

    setMatches(mql.matches)
    mql.addEventListener("change", handler)

    return () => mql.removeEventListener("change", handler)
  }, [query])

  return matches
}
