import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import Login from "./Login"

const loginMock = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  }
})

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ login: loginMock }),
}))

describe("Login", () => {
  beforeEach(() => {
    loginMock.mockReset()
  })

  it("renders email and password fields with an accessible label", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Senha")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument()
  })

  it("submits credentials", async () => {
    loginMock.mockResolvedValue({ id: "u1" })

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText("Email"), "sub@test.com")
    await user.type(screen.getByLabelText("Senha"), "secret123")
    await user.click(screen.getByRole("button", { name: "Entrar" }))

    expect(loginMock).toHaveBeenCalledWith("sub@test.com", "secret123")
  })

  it("shows a controlled error for invalid credentials", async () => {
    loginMock.mockRejectedValue(new Error("invalid"))

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText("Email"), "sub@test.com")
    await user.type(screen.getByLabelText("Senha"), "wrong")
    await user.click(screen.getByRole("button", { name: "Entrar" }))

    expect(
      await screen.findByText("Credenciais inválidas. Verifique o email e a senha."),
    ).toBeInTheDocument()
  })
})
