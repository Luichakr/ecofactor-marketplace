import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../../shared/config/routes'
import { subscribeBookmarkToast } from './bus'
import './BookmarkToast.css'

const AUTO_DISMISS_MS = 4500

export function BookmarkToast() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return subscribeBookmarkToast(() => {
      setOpen(true)
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setOpen(false), AUTO_DISMISS_MS)
    })
  }, [])

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  if (!open) return null

  return (
    <div className="bookmark-toast" role="status" aria-live="polite">
      <span className="bookmark-toast__label">Збережено</span>
      <button
        type="button"
        className="bookmark-toast__link"
        onClick={() => { setOpen(false); navigate(ROUTES.FAVORITES) }}
      >
        ПЕРЕГЛЯНУТИ ЗАКЛАДКИ
      </button>
      <button
        type="button"
        className="bookmark-toast__close"
        onClick={() => setOpen(false)}
        aria-label="Закрити"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
