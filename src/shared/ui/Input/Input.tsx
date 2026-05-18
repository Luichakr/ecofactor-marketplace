import type { InputHTMLAttributes } from 'react'
import './Input.css'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...rest }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-group__label" htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className={`input-group__field ${error ? 'input-group__field--error' : ''}`}
        {...rest}
      />
      {error && <p className="input-group__error">{error}</p>}
    </div>
  )
}
