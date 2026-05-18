import { useState } from 'react'
import type { MarketplaceCategoryId } from '../../../../entities/category/model/category.types'
import { PlaceholderImage } from '../../../../shared/ui/PlaceholderImage/PlaceholderImage'
import './ProductImage.css'

type Props = {
  src?: string
  alt: string
  /** Kept for API back-compat; no longer used to pick a per-category SVG
   *  fallback. We now always fall back to a dashed PlaceholderImage that
   *  shows the recommended pixel size — designers find it more useful
   *  than a stylised icon. */
  categoryId?: MarketplaceCategoryId | string
  className?: string
  /** Size string for the PlaceholderImage when src is missing or fails to load. */
  placeholderSize?: string
  /** Optional uppercase caption shown above the size. */
  placeholderCaption?: string
}

export function ProductImage({
  src,
  alt,
  className = '',
  placeholderSize = '1248 × 1664',
  placeholderCaption,
}: Props) {
  const [errored, setErrored] = useState(false)
  const showImage = src && !errored

  return (
    <div className={`product-image ${className}`}>
      {showImage ? (
        <img
          className="product-image__img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <PlaceholderImage
          size={placeholderSize}
          caption={placeholderCaption}
          aspectRatio="3 / 4"
          className="product-image__placeholder"
        />
      )}
    </div>
  )
}
