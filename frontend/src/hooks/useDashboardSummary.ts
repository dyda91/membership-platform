import { useCallback, useEffect, useState } from "react"

import { fetchDashboardSummary } from "../services/dashboard"
import type { DashboardSummary } from "../services/dashboard"

/**
 * Loads the aggregate dashboard summary used by the Dashboard page and the
 * contextual right panel. No module-level cache: the Dashboard page publishes
 * its loaded summary to the panel, and the remaining admin panels fetch it
 * themselves when mounted.
 */
export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchDashboardSummary()
      setSummary(data)
    } catch {
      setError("Não foi possível carregar o resumo do painel.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { summary, loading, error, refresh: load }
}
