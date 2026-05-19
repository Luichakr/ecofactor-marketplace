import './Skeleton.css'

type Props = {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: boolean
}

/** Single shimmering block. Compose into card-like skeletons in pages. */
export function Skeleton({ width, height, className = '', rounded = false }: Props) {
  return (
    <span
      className={`skeleton ${rounded ? 'skeleton--rounded' : ''} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton height={200} />
      <Skeleton height={12} width="80%" className="skeleton-card__row" />
      <Skeleton height={12} width="40%" className="skeleton-card__row" />
    </div>
  )
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
