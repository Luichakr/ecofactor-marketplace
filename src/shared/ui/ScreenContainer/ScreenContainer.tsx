import type { ReactNode } from 'react'
import './ScreenContainer.css'

type Props = {
  children: ReactNode
  withBottomNav?: boolean
  withTopInset?: boolean
  className?: string
}

export function ScreenContainer({
  children,
  withBottomNav = true,
  withTopInset = true,
  className = '',
}: Props) {
  const classes = [
    'screen-container',
    withTopInset ? 'screen-container--with-top-inset' : '',
    withBottomNav ? 'screen-container--with-nav' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <main className={classes}>
      {children}
    </main>
  )
}
