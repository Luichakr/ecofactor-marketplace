import { useTheme } from '../../lib/theme/ThemeContext'
import logoIcon from '../../../assets/logo/logo-icon.png'
import logoHorizontalDark from '../../../assets/logo/logo-horizontal-dark.png'
import logoHorizontalLight from '../../../assets/logo/logo-horizontal-light.png'
import './Logo.css'

type Variant = 'horizontal' | 'icon'

type Props = {
  /** "horizontal" — full wordmark with icon. "icon" — just the green square. */
  variant?: Variant
  /** CSS height in pixels (the width auto-scales by aspect ratio). Default 24px. */
  height?: number
  /**
   * Override the auto theme-based variant.
   *  - "light": always show the light (dark text) wordmark — for light backgrounds.
   *  - "dark":  always show the dark (white text) wordmark — for dark backgrounds.
   *  - undefined: follow the user-selected theme.
   */
  forceColorScheme?: 'light' | 'dark'
  className?: string
  ariaLabel?: string
}

export function Logo({
  variant = 'horizontal',
  height = 24,
  forceColorScheme,
  className = '',
  ariaLabel = 'ECOFACTOR',
}: Props) {
  const { theme } = useTheme()

  let src: string
  if (variant === 'icon') {
    src = logoIcon
  } else {
    const scheme = forceColorScheme ?? theme
    src = scheme === 'dark' ? logoHorizontalLight : logoHorizontalDark
  }

  return (
    <img
      src={src}
      alt={ariaLabel}
      className={`logo logo--${variant} ${className}`}
      style={{ height }}
      draggable={false}
    />
  )
}
