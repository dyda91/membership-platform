import { useEffect, useState } from "react"
import { checkBackend } from "../services/health"

export default function ApiStatus() {
  const [status, setStatus] = useState("Testando conexão...")

  useEffect(() => {
    checkBackend()
      .then((data) => {
        setStatus(
          `Backend: ${data.status} | Database: ${data.database}`
        )
      })
      .catch(() => {
        setStatus("Backend offline")
      })
  }, [])

  return <p>{status}</p>
}
