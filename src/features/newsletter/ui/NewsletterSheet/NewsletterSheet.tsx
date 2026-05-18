import { useState } from 'react'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { Field } from '../../../../shared/ui/Field/Field'
import { Button } from '../../../../shared/ui/Button/Button'
import './NewsletterSheet.css'

type Props = {
  open: boolean
  onClose: () => void
}

const TOPICS = [
  { id: 'news', label: 'Новинки та запуски' },
  { id: 'promo', label: 'Знижки та акції' },
  { id: 'guides', label: 'Гайди та практики' },
  { id: 'events', label: 'Події ECOFACTOR' },
]

export function NewsletterSheet({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [topics, setTopics] = useState<Set<string>>(new Set(['news', 'promo']))
  const [consent, setConsent] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit = emailValid && consent && topics.size > 0

  function toggle(id: string) {
    setTopics((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSubmit() {
    if (!canSubmit) return
    setSubmitted(true)
    window.setTimeout(() => {
      setSubmitted(false)
      setEmail('')
      setTopics(new Set(['news', 'promo']))
      onClose()
    }, 2200)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Розсилка" maxHeightPct={92}>
      {submitted ? (
        <div className="newsletter-sheet__success">
          <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="1" />
            <path d="M17 28L25 36L40 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="newsletter-sheet__success-text">
            Підписку оформлено. На вашу пошту прийде підтвердження.
          </p>
        </div>
      ) : (
        <div className="newsletter-sheet">
          <p className="newsletter-sheet__intro">
            Без спаму — лише важливі новини про електро­мобільність,
            знижки на сервіс та запуск нових продуктів.
          </p>

          <Field
            label="Email"
            placeholder="name@example.com"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={email && !emailValid ? 'Перевірте формат email' : undefined}
          />

          <div className="newsletter-sheet__topics">
            <span className="newsletter-sheet__topics-label">Цікавлять теми</span>
            <div className="newsletter-sheet__chips">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip ${topics.has(t.id) ? 'chip--active' : ''}`}
                  onClick={() => toggle(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <label className="newsletter-sheet__consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              Я погоджуюсь з{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()}>політикою конфіденційності</a>
              {' '}та обробкою email для розсилки.
            </span>
          </label>

          <Button variant="primary" size="lg" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
            ПІДПИСАТИСЯ
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}
