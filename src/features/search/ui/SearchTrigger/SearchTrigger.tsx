import { useState, createContext, useContext, type ReactNode } from 'react'
import { SearchOverlay } from '../SearchOverlay/SearchOverlay'

type Ctx = { open: () => void }

const SearchContext = createContext<Ctx>({ open: () => {} })

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <SearchContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <SearchOverlay open={isOpen} onClose={() => setIsOpen(false)} />
    </SearchContext.Provider>
  )
}

export function useSearchTrigger() {
  return useContext(SearchContext)
}

export function SearchIconButton({ className = '' }: { className?: string }) {
  const { open } = useSearchTrigger()
  return (
    <button
      type="button"
      className={`search-trigger ${className}`}
      onClick={open}
      aria-label="Пошук"
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        minHeight: 0,
        cursor: 'pointer',
        color: 'inherit',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.2" />
        <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </button>
  )
}
