import './FilterChip.css'

type Props = {
  label: string
  active?: boolean
  onClick?: () => void
  count?: number
}

export function FilterChip({ label, active = false, onClick, count }: Props) {
  return (
    <button
      className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
      onClick={onClick}
      type="button"
    >
      {label}
      {count !== undefined && <span className="filter-chip__count">{count}</span>}
    </button>
  )
}
