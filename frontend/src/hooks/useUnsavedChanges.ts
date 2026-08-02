import { useEffect } from "react"

/**
 * Warns before the tab is closed or refreshed while a form has unsaved
 * changes. In-app navigation is handled separately by the pages using an
 * UnsavedChangesDialog on explicit leave actions.
 */
export function useUnsavedChanges(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) {
      return
    }

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handler)

    return () => {
      window.removeEventListener("beforeunload", handler)
    }
  }, [isDirty])
}
