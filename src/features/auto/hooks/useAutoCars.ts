import { useEffect, useState } from 'react'
import { fetchAutoElectricInStock, type AutoCard } from '../api/lubeavtoApi'

type State = {
  data: AutoCard[]
  loading: boolean
  error: string | null
}

export function useAutoElectricInStock(): State {
  const [state, setState] = useState<State>({ data: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState({ data: [], loading: true, error: null })
    fetchAutoElectricInStock()
      .then((data) => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setState({ data: [], loading: false, error: err instanceof Error ? err.message : String(err) })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
