import { useMemo, useState } from 'react'
import { cart } from '../../../cart/model/cartStore'
import { formatPrice, type MarketplaceProduct } from '../../../../entities/product/model/product.types'
import './BundleSection.css'

type Props = {
  current: MarketplaceProduct
  pool: MarketplaceProduct[]
}

/**
 * "Часто купують разом" — generated bundle: current product + the 2
 * cheapest products from the same category that aren't the current one.
 * Real bundles can later come from `current.bundle: string[]` overriding
 * this synthesis.
 */
export function BundleSection({ current, pool }: Props) {
  const items = useMemo(() => {
    const explicit = current.bundle
      ? (current.bundle
          .map((id) => pool.find((p) => p.id === id))
          .filter(Boolean) as MarketplaceProduct[])
      : []
    const synthesised = pool
      .filter((p) => p.id !== current.id && p.categoryId === current.categoryId && p.price?.value)
      .sort((a, b) => (a.price?.value ?? 0) - (b.price?.value ?? 0))
      .slice(0, 2)
    const list = explicit.length > 0 ? explicit : synthesised
    return [current, ...list]
  }, [current, pool])

  const [picked, setPicked] = useState<Set<string>>(new Set(items.map((p) => p.id)))

  if (items.length < 2) return null

  const total = items
    .filter((p) => picked.has(p.id))
    .reduce((s, p) => s + (p.price?.value ?? 0), 0)
  const original = items.reduce((s, p) => s + (p.price?.value ?? 0), 0)
  const discount = Math.round(((original - total) / original) * 100)

  function toggle(id: string) {
    if (id === current.id) return
    const next = new Set(picked)
    if (next.has(id)) next.delete(id); else next.add(id)
    setPicked(next)
  }

  function addAll() {
    for (const p of items) {
      if (!picked.has(p.id)) continue
      cart.add({
        productId: p.id,
        title: p.title,
        subtitle: p.subtitle,
        image: p.image,
        price: p.price?.value,
        currency: p.price?.currency,
        qty: 1,
      })
    }
  }

  return (
    <section className="bundle-section">
      <h2 className="bundle-section__title">ЧАСТО КУПУЮТЬ РАЗОМ</h2>
      <ul className="bundle-section__list">
        {items.map((p, i) => (
          <li key={p.id} className="bundle-section__item">
            <label className="bundle-section__check">
              <input
                type="checkbox"
                checked={picked.has(p.id)}
                onChange={() => toggle(p.id)}
                disabled={p.id === current.id}
              />
            </label>
            <div className="bundle-section__thumb" />
            <div className="bundle-section__meta">
              <p className="bundle-section__name">{p.title}</p>
              {p.price && <p className="bundle-section__price">{formatPrice(p.price)}</p>}
            </div>
            {i < items.length - 1 && <span className="bundle-section__plus" aria-hidden="true">+</span>}
          </li>
        ))}
      </ul>
      <div className="bundle-section__total">
        <span className="bundle-section__total-label">Разом:</span>
        <span className="bundle-section__total-value">
          {new Intl.NumberFormat('uk-UA').format(total)} ₴
        </span>
        {discount > 0 && original > 0 && total > 0 && (
          <span className="bundle-section__discount">економія {discount > 0 ? '' : ''}</span>
        )}
      </div>
      <button
        type="button"
        className="bundle-section__cta"
        onClick={addAll}
        disabled={picked.size === 0}
      >
        ДОДАТИ В КОРЗИНУ
      </button>
    </section>
  )
}
