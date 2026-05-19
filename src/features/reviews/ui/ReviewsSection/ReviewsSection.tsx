import { useMemo, useState } from 'react'
import { StarRating } from '../../../../shared/ui/StarRating/StarRating'
import { getReviewsFor, getRatingFor, type Review } from '../../../../data/mockReviews'
import './ReviewsSection.css'

type Filter = 'all' | 'withPhoto' | '5' | '4' | '3' | '2' | '1'

const SHOWN_INITIALLY = 3

export function ReviewsSection({ productId }: { productId: string }) {
  const all = useMemo(() => getReviewsFor(productId), [productId])
  const rating = useMemo(() => getRatingFor(productId), [productId])
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState(false)

  const dist = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0] // 1..5
    for (const r of all) buckets[r.rating - 1]++
    return buckets
  }, [all])

  const filtered = useMemo(() => {
    if (filter === 'all') return all
    if (filter === 'withPhoto') return all.filter((r) => r.photos.length > 0)
    return all.filter((r) => String(r.rating) === filter)
  }, [all, filter])

  const visible = expanded ? filtered : filtered.slice(0, SHOWN_INITIALLY)

  return (
    <section className="reviews-section">
      <h2 className="reviews-section__title">ВІДГУКИ</h2>

      <div className="reviews-section__summary">
        <div className="reviews-section__avg">
          <span className="reviews-section__avg-value">{rating.average.toFixed(1)}</span>
          <StarRating rating={rating.average} size={16} />
          <span className="reviews-section__count">{rating.count} відгуків</span>
        </div>

        <div className="reviews-section__dist">
          {[5, 4, 3, 2, 1].map((star) => {
            const c = dist[star - 1]
            const pct = all.length ? (c / all.length) * 100 : 0
            return (
              <div key={star} className="reviews-section__dist-row">
                <span className="reviews-section__dist-star">{star}★</span>
                <span className="reviews-section__dist-bar">
                  <span className="reviews-section__dist-fill" style={{ width: `${pct}%` }} />
                </span>
                <span className="reviews-section__dist-count">{c}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="reviews-section__chips">
        {(['all', 'withPhoto', '5', '4', '3', '2', '1'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            className={`reviews-section__chip ${filter === f ? 'reviews-section__chip--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {{ all: 'УСІ', withPhoto: 'З ФОТО' }[f as 'all' | 'withPhoto'] ?? `${f}★`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="reviews-section__empty">Поки немає відгуків з таким фільтром.</p>
      ) : (
        <ul className="reviews-section__list">
          {visible.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}
        </ul>
      )}

      {filtered.length > SHOWN_INITIALLY && (
        <button
          type="button"
          className="reviews-section__more"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'ЗГОРНУТИ' : `ПОКАЗАТИ ЩЕ (${filtered.length - SHOWN_INITIALLY})`}
        </button>
      )}
    </section>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(review.helpfulCount)
  const [marked, setMarked] = useState(false)
  return (
    <li className="review-item">
      <div className="review-item__head">
        <div className="review-item__avatar">{review.authorInitial}</div>
        <div className="review-item__author">
          <span className="review-item__name">
            {review.authorName}
            {review.verifiedPurchase && (
              <svg className="review-item__verified" width="11" height="11" viewBox="0 0 24 24" fill="none" aria-label="Підтверджена покупка">
                <path d="M5 13L10 18L20 7" stroke="#1f9d55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="review-item__date">{review.createdAt}</span>
        </div>
        <StarRating rating={review.rating} size={12} />
      </div>
      {review.title && <p className="review-item__title">{review.title}</p>}
      <p className="review-item__text">{review.text}</p>
      <button
        type="button"
        className={`review-item__helpful ${marked ? 'review-item__helpful--marked' : ''}`}
        onClick={() => {
          if (marked) return
          setHelpful((n) => n + 1)
          setMarked(true)
        }}
      >
        Корисно ({helpful})
      </button>
    </li>
  )
}
