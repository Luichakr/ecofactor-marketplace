import { useState } from 'react'
import './ProductTabs.css'

export type ProductTabId = 'reviews' | 'description' | 'specs'

const TABS: { id: ProductTabId; label: string }[] = [
  { id: 'description', label: 'Опис' },
  { id: 'specs', label: 'Характеристики' },
  { id: 'reviews', label: 'Відгуки' },
]

type Props = {
  /** Controlled active tab. Falls back to internal state when omitted. */
  active?: ProductTabId
  onChange?: (id: ProductTabId) => void
}

/**
 * Section tab bar for the product page: Відгуки · Опис · Характеристики
 * with an underline under the active tab. Tap/swipe/scroll-spy behaviour is
 * wired up in later steps — this step just places the bar.
 */
export function ProductTabs({ active, onChange }: Props) {
  const [internal, setInternal] = useState<ProductTabId>('description')
  const current = active ?? internal

  function select(id: ProductTabId) {
    setInternal(id)
    onChange?.(id)
  }

  return (
    <div className="product-tabs" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={current === t.id}
          className={`product-tabs__tab ${current === t.id ? 'product-tabs__tab--active' : ''}`}
          onClick={() => select(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
