import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../../shared/config/routes'
import { subscribeCartToast, type CartToastPayload } from './bus'
import './CartToast.css'

const AUTO_DISMISS_MS = 3500

/**
 * Phone-style push notification at the top of the screen: "Додано до кошику"
 * + product title + thumbnail. Tap opens the cart; auto-dismisses.
 */
export function CartToast() {
  const [data, setData] = useState<CartToastPayload | null>(null)
  const navigate = useNavigate()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return subscribeCartToast((p) => {
      setData(p)
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setData(null), AUTO_DISMISS_MS)
    })
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  if (!data) return null

  return (
    <button
      type="button"
      className="cart-toast"
      onClick={() => {
        setData(null)
        navigate(ROUTES.CART)
      }}
      role="status"
      aria-live="polite"
    >
      <span className="cart-toast__text">
        <span className="cart-toast__title">Додано до кошику</span>
        <span className="cart-toast__sub">{data.title}</span>
      </span>
      {data.image && <img className="cart-toast__img" src={data.image} alt="" />}
    </button>
  )
}
