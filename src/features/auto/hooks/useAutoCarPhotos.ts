import { useEffect, useState } from 'react'
import { fetchAutoCarById } from '../api/lubeavtoApi'

/**
 * Lazy-fetches the full photo gallery for a Lubeavto car by id. The list
 * endpoint we use for the catalog feed only returns ONE photo per card,
 * but the detail endpoint (`/api/v0/cars/:id`) returns the full set.
 *
 * Call this on the product detail page only — skips the request entirely
 * for non-car ids or when the catalog feed already supplied >1 photo.
 *
 * Cached per-id so navigating back to the same car doesn't refetch.
 */
const cache = new Map<string, string[]>()

export function useAutoCarPhotos(id: string | undefined, enabled: boolean): string[] | null {
  const [photos, setPhotos] = useState<string[] | null>(() => (id && cache.has(id) ? cache.get(id)! : null))

  useEffect(() => {
    if (!enabled || !id) return
    if (cache.has(id)) {
      setPhotos(cache.get(id)!)
      return
    }
    let cancelled = false
    fetchAutoCarById(id)
      .then((card) => {
        if (cancelled) return
        if (card && card.images.length > 0) {
          cache.set(id, card.images)
          setPhotos(card.images)
        }
      })
      .catch(() => {
        /* swallow — UI keeps showing whatever photo we had */
      })
    return () => {
      cancelled = true
    }
  }, [id, enabled])

  return photos
}
