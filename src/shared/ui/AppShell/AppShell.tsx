import { useEffect, useRef, type ReactNode } from 'react'
import './AppShell.css'

type Props = {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Expose actual shell height as a CSS variable. Used by components that need
  // to fill the visible app area (e.g. marketplace carousel), since on desktop
  // preview the shell is capped below 100dvh.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      el.style.setProperty('--shell-h', `${el.clientHeight}px`)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="app-shell">
      {children}
    </div>
  )
}
