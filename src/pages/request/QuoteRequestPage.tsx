import { useParams } from 'react-router-dom'
import { mockProducts } from '../../data/mockProducts'
import { useEfpfProducts } from '../../features/catalog/hooks/useEfpfProducts'
import { QuoteForm } from '../../features/request/forms/QuoteForm'

/**
 * Wraps QuoteForm with product lookup. Resolves a product by id from either
 * the live EFPF cache or the mock data set. If no productId is provided,
 * shows a generic "request a price" form.
 */
export function QuoteRequestPage() {
  const { productId } = useParams<{ productId?: string }>()
  const live = useEfpfProducts()

  const product = productId
    ? live.data?.find((p) => p.id === productId) ?? mockProducts.find((p) => p.id === productId)
    : undefined

  return <QuoteForm product={product} />
}
