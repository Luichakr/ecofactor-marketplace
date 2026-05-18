import type { ReactNode } from 'react'
import './Card.css'

type Props = {
  children: ReactNode
  className?: string
  onClick?: () => void
  elevated?: boolean
}

export function Card({ children, className = '', onClick, elevated = false }: Props) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={`card ${elevated ? 'card--elevated' : ''} ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </Tag>
  )
}
