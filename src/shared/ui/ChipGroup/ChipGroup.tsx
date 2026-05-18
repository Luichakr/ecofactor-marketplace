import './ChipGroup.css'

type Option = { value: string; label: string }

type Props = {
  label: string
  required?: boolean
  options: Option[] | string[]
  value: string
  onChange: (value: string) => void
  /** "wrap" (default) — chips wrap. "scroll" — single-row horizontal scroll. */
  layout?: 'wrap' | 'scroll'
}

export function ChipGroup({ label, required, options, value, onChange, layout = 'wrap' }: Props) {
  const opts: Option[] = (options as Array<Option | string>).map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  )

  return (
    <div className="chip-group">
      <label className="chip-group__label">
        {label}
        {required && <span className="chip-group__required" aria-hidden="true"> *</span>}
      </label>
      <div className={`chip-group__items chip-group__items--${layout}`}>
        {opts.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`chip ${value === o.value ? 'chip--active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
