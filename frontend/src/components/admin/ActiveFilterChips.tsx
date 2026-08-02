import Button from "../ui/Button"
import { IconClose } from "../ui/Icons"

export interface FilterChip {
  key: string
  label: string
  onRemove: () => void
}

interface ActiveFilterChipsProps {
  chips: FilterChip[]
  onClearAll: () => void
}

export default function ActiveFilterChips({
  chips,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted py-0.5 pl-3 pr-1 text-xs font-medium text-foreground"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remover filtro ${chip.label}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-border hover:text-foreground"
          >
            <IconClose />
          </button>
        </span>
      ))}

      <Button variant="ghost" size="sm" onClick={onClearAll}>
        Limpar filtros
      </Button>
    </div>
  )
}
