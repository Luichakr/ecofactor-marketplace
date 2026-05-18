import type { ProductStatus } from '../../../entities/product/model/product.types'
import { PRODUCT_STATUS_LABELS } from '../../../entities/product/model/product.types'
import './StatusBadge.css'

type Props = {
  status: ProductStatus
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {PRODUCT_STATUS_LABELS[status]}
    </span>
  )
}
