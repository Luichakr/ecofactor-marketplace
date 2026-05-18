import './PlaceholderImage.css'

type Props = {
  /** Required pixel dimensions shown to the user. Format: "WxH" or any string. */
  size: string
  /** Optional caption above the size, e.g. "ЕЛЕКТРОМОБІЛІ". */
  caption?: string
  /** Optional aspect ratio for the placeholder box. Default 3/4 (portrait). */
  aspectRatio?: string
  className?: string
}

/**
 * Light-gray dashed placeholder shown in place of a real photo.
 * Displays the recommended pixel size so designers know what to prepare.
 */
export function PlaceholderImage({
  size,
  caption,
  aspectRatio = '3 / 4',
  className = '',
}: Props) {
  return (
    <div
      className={`placeholder-image ${className}`}
      style={{ aspectRatio }}
      aria-label={caption ? `${caption} ${size}` : size}
    >
      <div className="placeholder-image__inner">
        {caption && <span className="placeholder-image__caption">{caption}</span>}
        <span className="placeholder-image__size">{size}</span>
        <span className="placeholder-image__hint">PHOTO TBD</span>
      </div>
    </div>
  )
}
