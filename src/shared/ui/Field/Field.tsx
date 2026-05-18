import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import './Field.css'

type SharedProps = {
  label: string
  required?: boolean
  error?: string
  helper?: string
  /** Optional content rendered to the right of the label (e.g. a counter). */
  labelAside?: ReactNode
}

type InputProps = SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & {
    as?: 'input'
  }

type TextareaProps = SharedProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & {
    as: 'textarea'
  }

type Props = InputProps | TextareaProps

/**
 * Minimalist labeled field used across request forms. Renders an underlined
 * input (Zara aesthetic) with an all-caps label and an optional asterisk for
 * required fields.
 */
export function Field(props: Props) {
  const p = props as unknown as Omit<InputProps, 'as'> & Omit<TextareaProps, 'as'> & { as?: 'input' | 'textarea'; id?: string }
  const { label, required, error, helper, labelAside, className = '', ...rest } = p
  const id = p.id ?? `f-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label htmlFor={id} className="field__label">
        <span>
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </span>
        {labelAside && <span className="field__aside">{labelAside}</span>}
      </label>

      {props.as === 'textarea' ? (
        <textarea id={id} className="field__textarea" {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} className="field__input" {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}

      {error ? (
        <p className="field__error">{error}</p>
      ) : helper ? (
        <p className="field__helper">{helper}</p>
      ) : null}
    </div>
  )
}
