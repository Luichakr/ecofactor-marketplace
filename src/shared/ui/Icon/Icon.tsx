import './Icon.css'

type Props = {
  /** Material Symbols (Rounded) glyph name, e.g. "shopping_cart". */
  name: string
  /** Pixel size — also drives the optical-size axis. */
  size?: number
  /** Filled vs outlined variant. */
  filled?: boolean
  /** Font weight axis (100–700). */
  weight?: number
  className?: string
  /** Decorative by default; pass a label to expose it to assistive tech. */
  label?: string
}

export function Icon({ name, size = 24, filled = false, weight = 400, className = '', label }: Props) {
  return (
    <span
      className={`m-icon ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {name}
    </span>
  )
}
