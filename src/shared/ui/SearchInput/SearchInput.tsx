import type { InputHTMLAttributes } from 'react'
import './SearchInput.css'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  onClear?: () => void
}

export function SearchInput({ onClear, className = '', value, ...rest }: Props) {
  return (
    <div className={`search-input ${className}`}>
      <span className="search-input__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        className="search-input__field"
        type="search"
        value={value}
        {...rest}
      />
      {value && onClear && (
        <button
          className="search-input__clear"
          onClick={onClear}
          type="button"
          aria-label="Очистити"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
