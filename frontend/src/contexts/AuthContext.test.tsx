import { render, screen } from "@testing-library/react"
import { act } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthProvider, useAuth } from "./AuthContext"

vi.mock("../services/token-storage", () => ({
  getToken: vi.fn(),
  clearToken: vi.fn(),
}))

vi.mock("../services/auth", () => ({
  fetchCurrentSession: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

import { fetchCurrentSession, login } from "../services/auth"
import { getToken } from "../services/token-storage"

const artistSession = {
  id: "u1",
  email: "artist@test.com",
  name: "Artist",
  status: "ACTIVE",
  roles: ["ARTIST"],
  tier: null,
  tierId: null,
  tierPriority: null,
  isSuperAdmin: false,
  isArtist: true,
  isSubscriber: false,
}

const subscriberSession = {
  id: "u2",
  email: "sub@test.com",
  name: null,
  status: "ACTIVE",
  roles: ["SUBSCRIBER"],
  tier: null,
  tierId: null,
  tierPriority: null,
  isSuperAdmin: false,
  isArtist: false,
  isSubscriber: true,
}

function Consumer({ onReady }: { onReady: (v: ReturnType<typeof useAuth>) => void }) {
  const auth = useAuth()
  onReady(auth)

  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="user">{auth.user?.email ?? "none"}</span>
      <span data-testid="artist">{String(auth.isArtist)}</span>
      <span data-testid="admin">{String(auth.isAdmin)}</span>
      <span data-testid="error">{auth.sessionError ?? ""}</span>
      <button onClick={() => void auth.logout()}>logout</button>
    </div>
  )
}

function renderWithProvider() {
  let captured: ReturnType<typeof useAuth> | undefined
  render(
    <AuthProvider>
      <Consumer onReady={(v) => (captured = v)} />
    </AuthProvider>,
  )

  return () => captured
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows loading until a stored token session resolves", async () => {
    vi.mocked(getToken).mockReturnValue("token")
    vi.mocked(fetchCurrentSession).mockResolvedValue(artistSession as never)

    renderWithProvider()

    expect(screen.getByTestId("loading").textContent).toBe("true")

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(screen.getByTestId("loading").textContent).toBe("false")
    expect(screen.getByTestId("user").textContent).toBe("artist@test.com")
    expect(screen.getByTestId("artist").textContent).toBe("true")
    expect(screen.getByTestId("admin").textContent).toBe("true")
  })

  it("loads a subscriber session as non-admin", async () => {
    vi.mocked(getToken).mockReturnValue("token")
    vi.mocked(fetchCurrentSession).mockResolvedValue(subscriberSession as never)

    renderWithProvider()

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(screen.getByTestId("admin").textContent).toBe("false")
    expect(screen.getByTestId("artist").textContent).toBe("false")
  })

  it("clears the session when the stored token is invalid", async () => {
    vi.mocked(getToken).mockReturnValue("stale-token")
    vi.mocked(fetchCurrentSession).mockRejectedValue({
      response: { status: 401 },
    })

    renderWithProvider()

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(screen.getByTestId("user").textContent).toBe("none")
    expect(screen.getByTestId("error").textContent).toContain("expirou")
  })

  it("shows a controlled error on temporary network failure without admin access", async () => {
    vi.mocked(getToken).mockReturnValue("token")
    vi.mocked(fetchCurrentSession).mockRejectedValue(new Error("network"))

    renderWithProvider()

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(screen.getByTestId("admin").textContent).toBe("false")
    expect(screen.getByTestId("error").textContent).toContain("sessão")
  })

  it("stores the database-backed session after login", async () => {
    vi.mocked(getToken).mockReturnValue(null)
    vi.mocked(login).mockResolvedValue(subscriberSession as never)
    vi.mocked(fetchCurrentSession).mockResolvedValue(artistSession as never)

    const getAuth = renderWithProvider()

    await act(async () => {
      const auth = getAuth()
      await auth!.login("a@b.com", "secret")
    })

    expect(screen.getByTestId("user").textContent).toBe("artist@test.com")
    expect(screen.getByTestId("artist").textContent).toBe("true")
  })
})
