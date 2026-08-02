import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import ResetPasswordPage from "./ResetPasswordPage"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams(initialParams)],
  }
})

vi.mock("../../services/auth", () => ({
  resetPassword: vi.fn(),
}))

import { resetPassword } from "../../services/auth"

let initialParams = "token=abc.123"

function renderPage() {
  return render(<ResetPasswordPage />)
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigateMock.mockReset()
    initialParams = "token=abc.123"
  })

  it("shows an invalid link state when no token is present", () => {
    initialParams = ""

    renderPage()

    expect(screen.getByText("Link inválido")).toBeInTheDocument()
  })

  it("rejects mismatched passwords", async () => {
    vi.mocked(resetPassword).mockResolvedValue({ success: true } as never)

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText("Nova senha"), "secret123")
    await user.type(screen.getByLabelText("Confirme a nova senha"), "different")
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }))

    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument()
    expect(resetPassword).not.toHaveBeenCalled()
  })

  it("resets the password and shows a success state", async () => {
    vi.mocked(resetPassword).mockResolvedValue({ success: true } as never)

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText("Nova senha"), "secret123")
    await user.type(screen.getByLabelText("Confirme a nova senha"), "secret123")
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }))

    expect(resetPassword).toHaveBeenCalledWith("abc.123", "secret123")
    expect(await screen.findByText(/Senha redefinida com sucesso/)).toBeInTheDocument()
  })

  it("shows an invalid-or-expired state for a rejected token", async () => {
    vi.mocked(resetPassword).mockRejectedValue({ response: { status: 401 } })

    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText("Nova senha"), "secret123")
    await user.type(screen.getByLabelText("Confirme a nova senha"), "secret123")
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }))

    expect(
      await screen.findByText(/link de redefinição é inválido/i),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Solicitar novo link" })).toBeInTheDocument()
  })
})
