import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import RegisterPage from "./RegisterPage"

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
    useNavigate: () => vi.fn(),
  }
})

vi.mock("../services/auth", () => ({
  register: vi.fn(),
  login: vi.fn(),
}))

import { register, login } from "../services/auth"

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders name, email, password and confirmation fields", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText("Nome")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha")).toBeInTheDocument()
    expect(screen.getByLabelText("Confirme a senha")).toBeInTheDocument()
  })

  it("rejects when passwords do not match", async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText("Email"), "user@test.com")
    await user.type(screen.getByLabelText("Senha"), "secret123")
    await user.type(screen.getByLabelText("Confirme a senha"), "different")
    await user.click(screen.getByRole("button", { name: "Criar conta" }))

    expect(register).not.toHaveBeenCalled()
    expect(screen.getByText("As senhas não coincidem.")).toBeInTheDocument()
  })

  it("registers and logs in on success", async () => {
    const user = userEvent.setup()
    vi.mocked(register).mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      name: "New",
    } as never)
    vi.mocked(login).mockResolvedValue({ id: "u1" } as never)

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText("Nome"), "New User")
    await user.type(screen.getByLabelText("Email"), "user@test.com")
    await user.type(screen.getByLabelText("Senha"), "secret123")
    await user.type(screen.getByLabelText("Confirme a senha"), "secret123")
    await user.click(screen.getByRole("button", { name: "Criar conta" }))

    expect(register).toHaveBeenCalledWith({
      name: "New User",
      email: "user@test.com",
      password: "secret123",
    })
    expect(login).toHaveBeenCalledWith("user@test.com", "secret123")
  })
})
