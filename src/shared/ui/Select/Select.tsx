import { useEffect, useRef, useState } from 'react'
import './Select.css'

export type SelectOption = {
  value: string
  label: string
  /** Optional second line shown below the label (e.g. count) */
  hint?: string
}

type Props = {
  label: string
  placeholder?: string
  required?: boolean
  /** Either an array of strings, or full {value, label, hint} options. */
  options: SelectOption[] | string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Optional helper text shown below the field. */
  helper?: string
  error?: string
}

/**
 * Underlined Zara-style select that opens a bottom-sheet style dropdown
 * with options. Custom styling — native <select> looks too OS-dependent.
 */
export function Select({
  label,
  placeholder = 'Оберіть',
  required,
  options,
  value,
  onChange,
  disabled,
  helper,
  error,
}: Props) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const opts: SelectOption[] = (options as Array<SelectOption | string>).map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  )

  const current = opts.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  function pick(v: string) {
    onChange(v)
    setOpen(false)
  }

  return (
    <div className={`select ${error ? 'select--error' : ''} ${disabled ? 'select--disabled' : ''}`} ref={wrapperRef}>
      <label className="select__label">
        {label}
        {required && <span className="select__required" aria-hidden="true"> *</span>}
      </label>

      <button
        type="button"
        className="select__trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={`select__value ${!current ? 'select__value--placeholder' : ''}`}>
          {current?.label ?? placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`select__chev ${open ? 'select__chev--open' : ''}`}>
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {open && opts.length > 0 && (
        <ul className="select__dropdown" role="listbox">
          {opts.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                className={`select__option ${o.value === value ? 'select__option--active' : ''}`}
                onClick={() => pick(o.value)}
              >
                <span className="select__option-label">{o.label}</span>
                {o.hint && <span className="select__option-hint">{o.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className="select__error">{error}</p>
      ) : helper ? (
        <p className="select__helper">{helper}</p>
      ) : null}
    </div>
  )
}
