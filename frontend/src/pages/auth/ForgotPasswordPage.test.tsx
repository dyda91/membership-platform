import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import ForgotPasswordPage from "./ForgotPasswordPage"

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  }
})

vi.mock("../../services/auth", () => ({
  forgotPassword: vi.fn(),
}))

import { forgotPassword } from "../../services/auth"

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows the generic success message regardless of the account", async () => {
    vi.mocked(forgotPassword).mockResolvedValue({ message: "ok" } as never)

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText("E-mail"), "user@test.com")
    await user.click(screen.getByRole("button", { name: "Enviar instruções" }))

    expect(await screen.findByText(/Se uma conta existir/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Voltar ao Login" })).toBeInTheDocument()
  })

  it("shows a controlled throttling message on 429", async () => {
    vi.mocked(forgotPassword).mockRejectedValue({ response: { status: 429 } })

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText("E-mail"), "user@test.com")
    await user.click(screen.getByRole("button", { name: "Enviar instruções" }))

    expect(await screen.findByText(/Muitas solicitações/)).toBeInTheDocument()
  })

  it("never reveals account existence on generic failures", async () => {
    vi.mocked(forgotPassword).mockRejectedValue(new Error("network"))

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText("E-mail"), "user@test.com")
    await user.click(screen.getByRole("button", { name: "Enviar instruções" }))

    expect(await screen.findByText(/Se uma conta existir/)).toBeInTheDocument()
  })
})
