import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { ProductCard } from '../../../product/ui/ProductCard/ProductCard'
import { PlaceholderImage } from '../../../../shared/ui/PlaceholderImage/PlaceholderImage'
import { productPath } from '../../../../shared/config/routes'
import { formatPrice } from '../../../../entities/product/model/product.types'
import './EditorialLayout.css'

type Props = {
  /** Full filtered+sorted product list — same the catalog grid would receive. */
  products: MarketplaceProduct[]
  /** Top-level category title (e.g. "Колеса") for section copy. */
  categoryTitle?: string
}

/**
 * Editorial / look-book style layout used as CatalogPage view 1.
 *
 *   ┌──────────────┐  full-width hero
 *   │              │
 *   ├──────┬───────┤  4 cards in a 2-col grid
 *   │      │       │
 *   ├──────┴───────┤  full-width hero
 *   ├──────┬───────┤  2 cards in a 2-col grid
 *   │  ЗИМА│ ЛІТО  │  season-label dividers
 *   │              │
 *   ├──────────────┤  brand hero + horizontal scroller (5 variants)
 *   │  Michelin    │
 *   │  [strip→]    │
 *   ├──────────────┤
 *   │  Pirelli     │
 *   │  [strip→]    │
 *   ...
 *
 * The same products are re-surfaced in the brand strips — this is by
 * design: editorial layouts repeat hero items in multiple visual
 * "rooms" to give the page rhythm even with a small inventory.
 */
export function EditorialLayout({ products, categoryTitle }: Props) {
  const navigate = useNavigate()

  // Slot positions in the editorial composition. With <8 products we fall
  // back to plain wrapping; with the canonical 12-tire fixture every slot
  // is filled and the layout matches the Zara reference exactly.
  const hero1 = products[0]
  const grid4 = products.slice(1, 5)
  const hero2 = products[5]
  const grid2 = products.slice(6, 8)

  /** Group the remaining products by brand attribute to power the
   *  per-brand "look-book" rows. Falls back to splitting evenly if no
   *  brand attribute is present (e.g. on EFPF charger SKUs). */
  const byBrand = (() => {
    const map = new Map<string, MarketplaceProduct[]>()
    for (const p of products.slice(8)) {
      const brandAttr = p.attributes.find((a) => a.key === 'brand')
      const brand = typeof brandAttr?.value === 'string' ? brandAttr.value : 'Інше'
      const list = map.get(brand) ?? []
      list.push(p)
      map.set(brand, list)
    }
    return [...map.entries()].slice(0, 3)
  })()

  /** Pool to draw 5 cards per brand strip from — duplicates the input
   *  list when there aren't enough unique products to fill the strip. */
  function pickStripItems(seedBrand: string): MarketplaceProduct[] {
    const pool = products.filter((p) => {
      const b = p.attributes.find((a) => a.key === 'brand')
      return typeof b?.value === 'string' && b.value === seedBrand
    })
    const tail = products.filter((p) => !pool.includes(p))
    const combined = [...pool, ...tail, ...products]
    return combined.slice(0, 5)
  }

  return (
    <div className="editorial">
      {/* Row 1 — full-width hero */}
      {hero1 && (
        <FullWidthCard product={hero1} onClick={() => navigate(productPath(hero1.id))} />
      )}

      {/* Row 2 — 4 cards in 2-col */}
      {grid4.length > 0 && (
        <div className="editorial__grid editorial__grid--cols-2">
          {grid4.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Row 3 — full-width hero */}
      {hero2 && (
        <FullWidthCard product={hero2} onClick={() => navigate(productPath(hero2.id))} />
      )}

      {/* Row 4 — 2 cards in 2-col */}
      {grid2.length > 0 && (
        <div className="editorial__grid editorial__grid--cols-2">
          {grid2.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Season dividers — purely visual section breaks for now */}
      <SeasonBanner label="ЗИМА" />
      <SeasonBanner label="ЛІТО" />

      {/* Brand "look-book" rows */}
      {byBrand.map(([brand]) => {
        const seedItems = pickStripItems(brand)
        const heroItem = seedItems[0]
        if (!heroItem) return null
        return (
          <section key={brand} className="editorial__brand">
            <FullWidthCard
              product={heroItem}
              onClick={() => navigate(productPath(heroItem.id))}
              eyebrow={brand.toUpperCase()}
            />
            <BrandStrip items={seedItems} />
          </section>
        )
      })}

      {/* "Top sales" trailing carousel */}
      <section className="editorial__brand">
        <h2 className="editorial__top-sales-title">
          ТОП ПРОДАЖ {categoryTitle ? `· ${categoryTitle.toUpperCase()}` : ''}
        </h2>
        <BrandStrip items={products.slice(0, 8)} />
      </section>
    </div>
  )
}

function FullWidthCard({
  product,
  onClick,
  eyebrow,
}: {
  product: MarketplaceProduct
  onClick: () => void
  eyebrow?: string
}) {
  return (
    <button type="button" className="editorial__hit" onClick={onClick} aria-label={product.title}>
      <div className="editorial__hero">
        {product.image ? (
          <img src={product.image} alt={product.title} loading="lazy" />
        ) : (
          <PlaceholderImage size="1248 × 1664" aspectRatio="3 / 4" caption={product.title} />
        )}
        {eyebrow && <span className="editorial__hero-eyebrow">{eyebrow}</span>}
      </div>
      <div className="editorial__hero-row">
        <span className="editorial__hero-title">{product.title}</span>
        <span className="editorial__hero-plus" aria-hidden="true">+</span>
      </div>
      {product.price && (
        <span className="editorial__hero-price">{formatPrice(product.price)}</span>
      )}
    </button>
  )
}

function BrandStrip({ items }: { items: MarketplaceProduct[] }) {
  return (
    <div className="editorial__strip" role="list">
      {items.map((p) => (
        <div key={p.id} className="editorial__strip-slide" role="listitem">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

function SeasonBanner({ label }: { label: string }) {
  return (
    <div className="editorial__season">
      <span className="editorial__season-label">{label}</span>
    </div>
  )
}
