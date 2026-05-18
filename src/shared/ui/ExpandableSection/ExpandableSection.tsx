import { useState, type ReactNode } from 'react'
import './ExpandableSection.css'

type Props = {
  /** Section heading shown in uppercase to match the Zara reference style. */
  title: string
  /** Body content revealed on expand. */
  children: ReactNode
  /** Whether the section starts open. Defaults to false. */
  defaultOpen?: boolean
}

/**
 * Zara-style expandable row: full-width button with the title on the left
 * and a "+/×" toggle on the right. Tapping opens an inline content block.
 *
 * Why a controlled state instead of `<details>`: `<details>` ships with
 * default browser styling (chevron marker, no animation) that bleeds
 * through our reset, and harder to keep the toggle aligned right. A
 * plain button + conditional render is easier to theme.
 */
export function ExpandableSection({ title, children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`expandable ${open ? 'expandable--open' : ''}`}>
      <button
        type="button"
        className="expandable__head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="expandable__title">{title}</span>
        <span className="expandable__toggle" aria-hidden="true">{open ? '×' : '+'}</span>
      </button>
      {open && <div className="expandable__body">{children}</div>}
    </div>
  )
}
