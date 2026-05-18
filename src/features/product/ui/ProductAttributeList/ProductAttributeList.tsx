import type { ProductAttribute } from '../../../../entities/product/model/product.types'
import './ProductAttributeList.css'

type Props = {
  attributes: ProductAttribute[]
  showDetails?: boolean
}

export function ProductAttributeList({ attributes, showDetails = false }: Props) {
  const visible = attributes
    .filter((a) => showDetails ? a.visibleInDetails : a.visibleInCard)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))

  if (visible.length === 0) return null

  return (
    <dl className="product-attr-list">
      {visible.map((attr) => (
        <div key={attr.key} className="product-attr-list__row">
          <dt className="product-attr-list__label">{attr.label}</dt>
          <dd className="product-attr-list__value">
            {formatAttrValue(attr)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function formatAttrValue(attr: ProductAttribute): string {
  const v = attr.value
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Так' : 'Ні'
  if (Array.isArray(v)) return v.join(', ')
  if (attr.unit) return `${v} ${attr.unit}`
  return String(v)
}
