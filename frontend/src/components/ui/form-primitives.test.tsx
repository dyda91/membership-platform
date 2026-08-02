import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import Field from "./Field"
import Input from "./Input"
import Checkbox from "./Checkbox"
import Select from "./Select"

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field id="email" label="Email">
        <Input id="email" />
      </Field>,
    )

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("renders an error message with an accessible alert role", () => {
    render(
      <Field id="email" label="Email" error="Email obrigatório">
        <Input id="email" invalid />
      </Field>,
    )

    expect(screen.getByRole("alert")).toHaveTextContent("Email obrigatório")
  })

  it("renders help text when no error is present", () => {
    render(
      <Field id="name" label="Nome" help="Nome público exibido">
        <Input id="name" />
      </Field>,
    )

    expect(screen.getByText("Nome público exibido")).toBeInTheDocument()
  })
})

describe("Input", () => {
  it("marks the control as invalid", () => {
    render(<Input invalid aria-label="Email" />)

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    )
  })
})

describe("Checkbox", () => {
  it("renders a labelled checkbox", async () => {
    const user = userEvent.setup()
    render(<Checkbox id="permanent" label="Acesso permanente" />)

    const control = screen.getByLabelText("Acesso permanente")
    expect(control).toHaveAttribute("type", "checkbox")

    await user.click(control)
    expect(control).toBeChecked()
  })
})

describe("Select", () => {
  it("keeps native select semantics", () => {
    render(
      <Select aria-label="Tier">
        <option value="">Gratuito</option>
        <option value="gold">Gold</option>
      </Select>,
    )

    const select = screen.getByLabelText("Tier")
    expect(select.tagName).toBe("SELECT")
    expect(select).toHaveDisplayValue("Gratuito")
  })
})
