import './PaymentMethodGrid.css'

export type PaymentMethod = {
  id: string
  label: string
  /** Optional small description shown below the label. */
  hint?: string
  /** Optional SVG icon rendered above the label. */
  icon?: React.ReactNode
}

type Props = {
  options: PaymentMethod[]
  value: string
  onChange: (id: string) => void
}

export function PaymentMethodGrid({ options, value, onChange }: Props) {
  return (
    <div className="payment-grid">
      {options.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`payment-grid__card ${value === m.id ? 'payment-grid__card--selected' : ''}`}
          onClick={() => onChange(m.id)}
          aria-pressed={value === m.id}
        >
          {m.icon && <span className="payment-grid__icon">{m.icon}</span>}
          <span className="payment-grid__label">{m.label}</span>
          {m.hint && <span className="payment-grid__hint">{m.hint}</span>}
        </button>
      ))}
    </div>
  )
}
