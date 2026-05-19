import { useNavigate } from 'react-router-dom'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { ProductCard } from '../../../product/ui/ProductCard/ProductCard'
import { PlaceholderImage } from '../../../../shared/ui/PlaceholderImage/PlaceholderImage'
import { productPath } from '../../../../shared/config/routes'
import { formatPrice } from '../../../../entities/product/model/product.types'
import { SeasonShowcase } from '../SeasonShowcase/SeasonShowcase'
import './EditorialLayout.css'

type Props = {
  /** Full filtered+sorted product list — same the catalog grid would receive. */
  products: MarketplaceProduct[]
  /** Top-level category title (e.g. "Колеса") for section copy. */
  categoryTitle?: string
  /** Subcategories of the current category. Each renders as its own
   *  full-bleed showcase, replacing the old hard-coded ЗИМА / ЛІТО pair.
   *  When omitted (or empty) the subcategory showcases are skipped. */
  subcategories?: { id: string; title: string }[]
  /** When `landscape`, hero crops and embedded product cards switch to a
   *  4:3 wide ratio instead of the default 3:4 portrait. Used by
   *  /catalog/cars view 1. */
  imageAspect?: 'portrait' | 'landscape'
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
export function EditorialLayout({
  products,
  categoryTitle,
  subcategories = [],
  imageAspect = 'portrait',
}: Props) {
  /** Products that carry attribute `subcategory === id`. Mirrors how
   *  buildFacets / filterProducts scope a vertical to its sub-tab. */
  function pickBySubcategory(id: string): MarketplaceProduct[] {
    return products.filter((p) =>
      p.attributes.some((a) => a.key === 'subcategory' && a.value === id),
    )
  }
  /** Subcategories that actually have items in the current pool — empty
   *  ones are hidden so we never render a placeholder showcase. */
  const populatedSubs = subcategories
    .map((s) => ({ ...s, items: pickBySubcategory(s.id) }))
    .filter((s) => s.items.length > 0)
  const navigate = useNavigate()

  // Slot positions in the editorial composition. With <8 products we fall
  // back to plain wrapping; with the canonical 12-tire fixture every slot
  // is filled and the layout matches the Zara reference exactly.
  const hero1 = products[0]
  const grid4 = products.slice(1, 5)
  const hero2 = products[5]
  const grid2 = products.slice(6, 8)
  // Third hero + 2x2 grid block that sits between ЛІТО and ТОП ПРОДАЖ.
  // Reuses indices 8..11 so the last four brand SKUs (Dunlop, Toyo,
  // Falken, Kumho) get a second appearance in a calmer grid context.
  const hero3 = products[2] ?? products[0]
  const grid4b = products.slice(8, 12)

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
    <div className={`editorial ${imageAspect === 'landscape' ? 'editorial--landscape' : ''}`}>
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

      {/* First half of subcategory showcases — each renders the products
       *  tagged with the matching `subcategory` attribute. Empty subs are
       *  filtered out upstream. The split into "before brands" / "after
       *  brands" keeps the visual rhythm of the original ЗИМА → brands →
       *  ЛІТО arc, but the labels now come from the category itself. */}
      {populatedSubs
        .slice(0, Math.ceil(populatedSubs.length / 2))
        .map((sub) => (
          <SeasonShowcase
            key={`sub-pre-${sub.id}`}
            title={sub.title.toUpperCase()}
            subtitle="ТОП · 2026"
            items={sub.items.slice(0, 10)}
          />
        ))}

      {/* Three brand "look-book" rows between the subcategory showcases. */}
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

      {/* Second half of subcategory showcases. */}
      {populatedSubs
        .slice(Math.ceil(populatedSubs.length / 2))
        .map((sub) => (
          <SeasonShowcase
            key={`sub-post-${sub.id}`}
            title={sub.title.toUpperCase()}
            subtitle="ТОП · 2026"
            items={sub.items.slice(0, 10)}
          />
        ))}

      {/* Mid composition block between ЛІТО and ТОП ПРОДАЖ —
       *  full-width hero + 2x2 grid, mirroring the page opener. */}
      {hero3 && (
        <FullWidthCard product={hero3} onClick={() => navigate(productPath(hero3.id))} />
      )}
      {grid4b.length > 0 && (
        <div className="editorial__grid editorial__grid--cols-2">
          {grid4b.map((p) => (
            <ProductCard key={`mid-${p.id}`} product={p} />
          ))}
        </div>
      )}

      {/* "Top sales" — same SeasonShowcase scaffold, header + slide
       *  proportions identical to the subcategory showcases above. */}
      <SeasonShowcase
        title="ТОП ПРОДАЖ"
        subtitle={categoryTitle ? `${categoryTitle.toUpperCase()} · 2026` : 'ТРАВЕНЬ 2026'}
        items={products.slice(0, 8)}
      />
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
  // Zara reference uses no "+" affordance on the full-width hero —
  // only the title + price stack underneath the edge-to-edge photo.
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
      <div className="editorial__hero-info">
        <span className="editorial__hero-title">{product.title}</span>
        {product.price && (
          <span className="editorial__hero-price">{formatPrice(product.price)}</span>
        )}
      </div>
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
