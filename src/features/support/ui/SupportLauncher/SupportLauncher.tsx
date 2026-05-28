import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { supportChat, useSupportChat } from '../../model/supportChatStore'
import './SupportLauncher.css'

// Hide the floating button on these page roots — bottom-nav presence and
// sticky CTAs make the FAB visually noisy in flows where it adds nothing.
// /profile is included because the profile header now exposes a chat
// icon next to the avatar, so the FAB would duplicate that affordance.
const HIDE_ON = ['/checkout', '/cart', '/profile']

/** Module-level signal — any component can call `openSupport()` to surface
 *  the chat sheet. SupportLauncher subscribes via a DOM event so we don't
 *  need a React Context just for this one trigger. */
export function openSupport() {
  window.dispatchEvent(new Event('support:open'))
}

export function SupportLauncher() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const messages = useSupportChat()
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Listen for the global open event so other screens (e.g. ProfilePage
  // header) can trigger the chat without rendering the FAB themselves.
  useEffect(() => {
    function handler() { setOpen(true) }
    window.addEventListener('support:open', handler)
    return () => window.removeEventListener('support:open', handler)
  }, [])

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [open, messages.length])

  const fabHidden = HIDE_ON.some((p) => pathname.startsWith(p))

  function send(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    supportChat.send(text)
    setText('')
  }

  return (
    <>
      {!fabHidden && (
        <button
          type="button"
          className="support-launcher"
          onClick={() => setOpen(true)}
          aria-label="Підтримка"
        >
          <span className="support-launcher__dot" />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 5H20V17H13L8 21V17H4V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)} title="ПІДТРИМКА" maxHeightPct={80}>
        <div className="support-chat">
          <div ref={scrollRef} className="support-chat__messages">
            {messages.map((m) => (
              <div key={m.id} className={`support-chat__msg support-chat__msg--${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form className="support-chat__form" onSubmit={send}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Напишіть повідомлення..."
              className="support-chat__input"
            />
            <button type="submit" className="support-chat__send">→</button>
          </form>
        </div>
      </BottomSheet>
    </>
  )
}
