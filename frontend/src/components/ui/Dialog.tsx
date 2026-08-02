import { useEffect, useId, useRef } from "react"
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject } from "react"
import { createPortal } from "react-dom"
import IconButton from "./IconButton"
import { IconClose } from "./Icons"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export type DialogSize = "sm" | "md" | "lg"

const SIZES: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
}

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: DialogSize
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
}

export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  initialFocusRef,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    restoreFocusRef.current = document.activeElement as HTMLElement | null

    const panel = panelRef.current

    if (panel) {
      const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)

      if (initialFocusRef?.current) {
        initialFocusRef.current.focus()
      } else if (first) {
        first.focus()
      } else {
        panel.focus()
      }
    }

    return () => {
      restoreFocusRef.current?.focus?.()
    }
  }, [open, initialFocusRef])

  useEffect(() => {
    if (!open) {
      return
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && closeOnEscape) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [open, closeOnEscape, onClose])

  if (!open) {
    return null
  }

  function handleTab(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return
    }

    const panel = panelRef.current

    if (!panel) {
      return
    }

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    )

    if (focusables.length === 0) {
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last || !panel.contains(active)) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onKeyDown={handleTab}
        tabIndex={-1}
        className={[
          "relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-lg bg-surface shadow-overlay outline-none",
          SIZES[size],
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-foreground-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton
            label="Fechar"
            variant="ghost"
            onClick={onClose}
            icon={<IconClose />}
            className="-mr-1 -mt-1 shrink-0"
          />
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
