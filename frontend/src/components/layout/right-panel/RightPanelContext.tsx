import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"

interface RightPanelValue {
  content: ReactNode
  setContent: (node: ReactNode) => void
  clearContent: () => void
}

const RightPanelContext = createContext<RightPanelValue>({
  content: null,
  setContent: () => {},
  clearContent: () => {},
})

/**
 * Lets routed pages publish contextual content for the right panel (for
 * example the selected conversation or the loaded artist profile) without the
 * shell knowing page internals. Pages clear the content when they unmount so
 * the route-based fallback takes over.
 */
export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode>(null)

  const clearContent = useCallback(() => setContent(null), [])

  const value = useMemo(
    () => ({ content, setContent, clearContent }),
    [content, clearContent],
  )

  return (
    <RightPanelContext.Provider value={value}>
      {children}
    </RightPanelContext.Provider>
  )
}

export function useRightPanel() {
  return useContext(RightPanelContext)
}
