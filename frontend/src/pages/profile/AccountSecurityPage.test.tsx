import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AccountSecurityPage from "./AccountSecurityPage"

const logoutMock = vi.fn()
const navigateMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ logout: logoutMock }),
}))

vi.mock("../../services/auth", () => ({
  changePassword: vi.fn(),
  logoutAll: vi.fn(),
}))

import { changePassword, logoutAll } from "../../services/auth"

describe("AccountSecurityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    logoutMock.mockReset()
    navigateMock.mockReset()
  })

  it("rejects mismatched confirmation passwords", async () => {
    const user = userEvent.setup()
    render(<AccountSecurityPage />)

    await user.type(screen.getByLabelText("Senha atual"), "old-pass")
    await user.type(screen.getByLabelText("Nova senha"), "new-pass")
    await user.type(screen.getByLabelText("Confirme a nova senha"), "different")
    await user.click(screen.getByRole("button", { name: "Alterar senha" }))

    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument()
    expect(changePassword).not.toHaveBeenCalled()
  })

  it("shows an error when the current password is wrong", async () => {
    vi.mocked(changePassword).mockRejectedValue({ response: { status: 401 } })

    const user = userEvent.setup()
    render(<AccountSecurityPage />)

    await user.type(screen.getByLabelText("Senha atual"), "wrong")
    await user.type(screen.getByLabelText("Nova senha"), "new-secret")
    await user.type(screen.getByLabelText("Confirme a nova senha"), "new-secret")
    await user.click(screen.getByRole("button", { name: "Alterar senha" }))

    expect(await screen.findByText(/senha atual está incorreta/i)).toBeInTheDocument()
  })

  it("clears the session and redirects to login after a successful change", async () => {
    vi.mocked(changePassword).mockResolvedValue({ success: true } as never)

    const user = userEvent.setup()
    render(<AccountSecurityPage />)

    await user.type(screen.getByLabelText("Senha atual"), "old-pass")
    await user.type(screen.getByLabelText("Nova senha"), "new-secret")
    await user.type(screen.getByLabelText("Confirme a nova senha"), "new-secret")
    await user.click(screen.getByRole("button", { name: "Alterar senha" }))

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1)
      expect(navigateMock).toHaveBeenCalledWith(
        "/login",
        expect.objectContaining({ state: expect.objectContaining({ message: expect.stringContaining("senha") }) }),
      )
    })
  })

  it("confirms logout from all sessions and ends the session", async () => {
    vi.mocked(logoutAll).mockResolvedValue({ success: true } as never)

    const user = userEvent.setup()
    render(<AccountSecurityPage />)

    const trigger = screen.getAllByRole("button", {
      name: "Sair de todas as sessões",
    })[0]
    await user.click(trigger)

    const dialog = screen.getByRole("dialog", { name: "Sair de todas as sessões" })
    expect(dialog).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole("button", { name: "Sair de todas as sessões" }),
    )

    await waitFor(() => {
      expect(logoutAll).toHaveBeenCalledTimes(1)
      expect(logoutMock).toHaveBeenCalledTimes(1)
    })
  })
})
