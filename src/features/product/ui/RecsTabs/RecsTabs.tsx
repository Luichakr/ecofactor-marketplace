import { useMemo, useState } from 'react'
import type { MarketplaceProduct } from '../../../../entities/product/model/product.types'
import { BundleSection } from '../../../bundles/ui/BundleSection/BundleSection'
import { ProductCard } from '../ProductCard/ProductCard'
import './RecsTabs.css'

type Props = {
  /** Currently-viewed product (excluded from suggestions). */
  current: MarketplaceProduct
  /** Same-category pool — drives the "Рекомендуємо" and "Подібні" tabs. */
  sameCat: MarketplaceProduct[]
  /** Full pool used by BundleSection. */
  bundlePool: MarketplaceProduct[]
}

type TabId = 'recs' | 'bundle' | 'similar'

/**
 * Three-tab block on the product page, replacing the previous scattered
 * Bundle + recommendations sections. Pattern lifted from Yandex Market:
 *   Рекомендуємо · Часто купують разом · Подібні
 * Selecting a tab swaps the body in place without reflowing the rest of
 * the page.
 */
export function RecsTabs({ current, sameCat, bundlePool }: Props) {
  const [tab, setTab] = useState<TabId>('recs')

  // "Подібні" — same brand or same subcategory as the current product.
  const similar = useMemo(() => {
    const currentBrand = current.attributes.find((a) => a.key === 'brand')?.value
    const currentSub = current.attributes.find((a) => a.key === 'subcategory')?.value
    return sameCat.filter((p) => {
      const b = p.attributes.find((a) => a.key === 'brand')?.value
      const s = p.attributes.find((a) => a.key === 'subcategory')?.value
      return (currentBrand && b === currentBrand) || (currentSub && s === currentSub)
    })
  }, [sameCat, current])

  const hasBundle = current.bundle && current.bundle.length > 0

  const allTabs: { id: TabId; label: string; count: number }[] = [
    { id: 'recs',    label: 'Рекомендуємо',         count: sameCat.length },
    { id: 'bundle',  label: 'Часто купують разом',  count: hasBundle ? (current.bundle?.length ?? 0) : 0 },
    { id: 'similar', label: 'Подібні',              count: similar.length },
  ]
  const tabs = allTabs.filter((t) => t.count > 0)

  if (tabs.length === 0) return null

  return (
    <section className="recs-tabs" aria-label="Рекомендації">
      <header className="recs-tabs__header" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`recs-tabs__tab ${tab === t.id ? 'recs-tabs__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </header>

      <div className="recs-tabs__body">
        {tab === 'recs' && (
          <div className="recs-tabs__grid catalog-grid catalog-grid--cols-3">
            {sameCat.map((p) => (
              <ProductCard key={p.id} product={p} pool={sameCat} />
            ))}
          </div>
        )}

        {tab === 'bundle' && (
          <BundleSection current={current} pool={bundlePool} />
        )}

        {tab === 'similar' && (
          <div className="recs-tabs__grid catalog-grid catalog-grid--cols-3">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} pool={similar} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
