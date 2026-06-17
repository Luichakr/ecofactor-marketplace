import { useGoBack } from '../../lib/useGoBack'
import './Header.css'

type Props = {
  title: string
  subtitle?: string
  showBack?: boolean
  /** Custom back handler. When provided, the back button calls this instead
   *  of the default. Lets the host page route back to a logical parent
   *  (e.g. wheels list) rather than the previous history entry which may
   *  belong to an unrelated category. */
  onBack?: () => void
  /** Fallback route for the default back handler when there is no in-app
   *  history to pop (deep link / fresh WebView entry). Ignored when `onBack`
   *  is set. Defaults to the marketplace home. */
  backFallback?: string
  rightSlot?: React.ReactNode
  transparent?: boolean
}

export function Header({ title, subtitle, showBack = false, onBack, backFallback, rightSlot, transparent = false }: Props) {
  const goBack = useGoBack(backFallback)

  return (
    <header className={`header ${transparent ? 'header--transparent' : ''}`}>
      <div className="header__inner">
        {showBack && (
          <button
            className="header__back"
            onClick={() => (onBack ? onBack() : goBack())}
            aria-label="Назад"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="header__text">
          <h1 className="header__title">{title}</h1>
          {subtitle && <p className="header__subtitle">{subtitle}</p>}
        </div>
        {rightSlot && <div className="header__right">{rightSlot}</div>}
      </div>
    </header>
  )
}
