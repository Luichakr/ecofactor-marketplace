import { useState } from 'react'
import type { MarketplaceCategoryId } from '../../../../entities/category/model/category.types'
import './ProductImage.css'

type Props = {
  src?: string
  alt: string
  categoryId?: MarketplaceCategoryId | string
  className?: string
}

const SKELETONS: Record<string, React.ReactNode> = {
  cars: (
    <svg viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid meet">
      <path
        d="M30 130H170M30 130L45 90H155L170 130M30 130V148H50V138H150V148H170V130M55 110H75M125 110H145"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="55" cy="148" r="10" stroke="currentColor" strokeWidth="1" />
      <circle cx="145" cy="148" r="10" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  'charging-stations': (
    <svg viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid meet">
      <rect x="70" y="40" width="60" height="110" stroke="currentColor" strokeWidth="1" />
      <rect x="80" y="55" width="40" height="30" stroke="currentColor" strokeWidth="1" />
      <path
        d="M88 100L98 80L108 100H101L106 120L93 100H100Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M75 150V165M125 150V165" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  insurance: (
    <svg viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid meet">
      <path
        d="M100 30L50 50V100C50 130 75 155 100 165C125 155 150 130 150 100V50L100 30Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M80 100L95 115L120 88"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  tires: (
    <svg viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid meet">
      <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" />
      <path
        d="M100 35V60M100 140V165M35 100H60M140 100H165M55 55L72 72M128 128L145 145M145 55L128 72M55 145L72 128"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  ),
}

const DEFAULT_SKELETON = (
  <svg viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid meet">
    <path
      d="M30 160L70 100L100 130L140 70L170 160H30Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <circle cx="140" cy="55" r="10" stroke="currentColor" strokeWidth="1" />
  </svg>
)

export function ProductImage({ src, alt, categoryId, className = '' }: Props) {
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
        <div className="product-image__skeleton" aria-hidden="true">
          {(categoryId && SKELETONS[categoryId]) || DEFAULT_SKELETON}
        </div>
      )}
    </div>
  )
}
