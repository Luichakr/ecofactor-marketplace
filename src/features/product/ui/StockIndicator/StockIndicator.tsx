import { useState } from 'react'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { Button } from '../../../../shared/ui/Button/Button'
import { stockNotify, useStockNotify } from '../../../stock-notify/model/stockNotifyStore'
import './StockIndicator.css'

type Props = {
  productId: string
  stock?: number
  size?: 'sm' | 'md'
}

/**
 * Renders a coloured pill describing stock state. For OOS items it also
 * exposes a "notify me when back" sheet.
 */
export function StockIndicator({ productId, stock, size = 'sm' }: Props) {
  const watched = useStockNotify().some((s) => s.productId === productId)
  const [open, setOpen] = useState(false)
  const [contact, setContact] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!contact.trim()) return
    stockNotify.add(productId, contact.trim())
    setSent(true)
    setTimeout(() => {
      setOpen(false)
      setSent(false)
      setContact('')
    }, 1200)
  }

  if (stock === 0) {
    return (
      <>
        <button
          type="button"
          className={`stock-ind stock-ind--oos stock-ind--${size}`}
          onClick={() => setOpen(true)}
          disabled={watched}
        >
          <span className="stock-ind__dot" />
          <span>{watched ? 'ВИ ПІДПИСАНІ' : 'НЕМАЄ В НАЯВНОСТІ'}</span>
        </button>

        <BottomSheet open={open} onClose={() => setOpen(false)} title="ПОВІДОМИТИ" maxHeightPct={48}>
          <form className="stock-ind__form" onSubmit={submit}>
            <p className="stock-ind__form-hint">
              Залиште контакт — повідомимо, як тільки товар з'явиться.
            </p>
            <input
              type="text"
              className="stock-ind__input"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email або телефон"
              autoFocus
            />
            <Button variant="primary" fullWidth size="lg" type="submit">
              {sent ? 'ПІДПИСАНО' : 'ПОВІДОМИТИ КОЛИ З\'ЯВИТЬСЯ'}
            </Button>
          </form>
        </BottomSheet>
      </>
    )
  }

  if (typeof stock === 'number' && stock <= 5) {
    return (
      <span className={`stock-ind stock-ind--low stock-ind--${size}`}>
        <span className="stock-ind__dot" />
        ЗАЛИШИЛОСЬ {stock}
      </span>
    )
  }

  return (
    <span className={`stock-ind stock-ind--ok stock-ind--${size}`}>
      <span className="stock-ind__dot" />
      В НАЯВНОСТІ
    </span>
  )
}
