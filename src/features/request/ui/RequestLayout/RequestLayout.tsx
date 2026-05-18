import { useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../../../shared/ui/Header/Header'
import { ScreenContainer } from '../../../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../../../shared/ui/Button/Button'
import { REQUEST_PATHS, ROUTES } from '../../../../shared/config/routes'
import './RequestLayout.css'

/** 7-char alphanumeric reference (e.g. "A8F2K-9") for the success page. */
function makeReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `${s}-${Math.floor(Math.random() * 10)}`
}

type Props = {
  title: string
  subtitle?: string
  intro?: string
  /** When true, shows the success splash instead of children. */
  submitted?: boolean
  successTitle?: string
  successDescription?: string
  /** Children = form fields (in numbered sections). */
  children?: ReactNode
  /** CTA label. Default "Надіслати". */
  submitLabel?: string
  /** Whether the submit button is disabled (e.g. required fields empty). */
  canSubmit?: boolean
  onSubmit?: (e: React.FormEvent) => void
}

export function RequestLayout({
  title,
  subtitle,
  intro,
  submitted = false,
  successTitle = 'Заявку відправлено',
  successDescription = 'Менеджер звʼяжеться з вами найближчим часом.',
  children,
  submitLabel = 'НАДІСЛАТИ',
  canSubmit = true,
  onSubmit,
}: Props) {
  const navigate = useNavigate()

  // Generate a stable reference per "success" mount.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reference = useMemo(makeReference, [submitted])

  if (submitted) {
    return (
      <>
        <Header title={title.toUpperCase()} showBack />
        <ScreenContainer withTopInset={false}>
          <div className="request-layout__success">
            <svg className="request-layout__success-icon" width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="1" />
              <path d="M17 28L25 36L40 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="request-layout__success-title">{successTitle}</h2>
            <p className="request-layout__success-desc">{successDescription}</p>

            <div className="request-layout__success-ref">
              <span className="request-layout__success-ref-label">НОМЕР ЗВЕРНЕННЯ</span>
              <span className="request-layout__success-ref-value">#{reference}</span>
            </div>

            <div className="request-layout__success-actions">
              <Button variant="primary" size="lg" fullWidth onClick={() => navigate(ROUTES.MARKETPLACE)}>
                На головну
              </Button>
              <Button variant="outline" size="lg" fullWidth onClick={() => navigate(REQUEST_PATHS.HUB)}>
                Залишити ще заявку
              </Button>
            </div>
          </div>
        </ScreenContainer>
      </>
    )
  }

  return (
    <>
      <Header title={title.toUpperCase()} showBack />
      <ScreenContainer withTopInset={false}>
        <form className="request-layout__form" onSubmit={onSubmit} noValidate>
          <div className="request-layout__intro">
            {subtitle && <p className="request-layout__subtitle">{subtitle}</p>}
            {intro && <p className="request-layout__intro-text">{intro}</p>}
          </div>

          <div className="request-layout__sections">{children}</div>

          <div className="request-layout__cta">
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={!canSubmit}>
              {submitLabel}
            </Button>
            <p className="request-layout__required-note">
              Поля позначені <strong>*</strong> обовʼязкові
            </p>
          </div>
        </form>
      </ScreenContainer>
    </>
  )
}
