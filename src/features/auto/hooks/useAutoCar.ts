import { useEffect, useState } from 'react'
import { fetchAutoCarById, type AutoCard } from '../api/lubeavtoApi'

type State = {
  data: AutoCard | null
  loading: boolean
  error: string | null
}

export function useAutoCar(id: string | undefined): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: null })
      return
    }
    let cancelled = false
    setState({ data: null, loading: true, error: null })
    fetchAutoCarById(id)
      .then((data) => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({ data: null, loading: false, error: err instanceof Error ? err.message : String(err) })
      })
    return () => { cancelled = true }
  }, [id])

  return state
}
