import type { ReactNode } from 'react'
import './FormSection.css'

type Props = {
  num: string // "01", "02", ...
  title: string
  description?: string
  children: ReactNode
}

export function FormSection({ num, title, description, children }: Props) {
  return (
    <section className="form-section">
      <header className="form-section__head">
        <span className="form-section__num">|{num}|</span>
        <span className="form-section__title">{title}</span>
      </header>
      {description && <p className="form-section__desc">{description}</p>}
      <div className="form-section__body">{children}</div>
    </section>
  )
}
