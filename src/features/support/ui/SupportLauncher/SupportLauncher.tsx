import { useEffect, useRef, useState } from 'react'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { supportChat, useSupportChat } from '../../model/supportChatStore'
import './SupportLauncher.css'

/** Module-level signal — any component can call `openSupport()` to surface
 *  the chat sheet. SupportLauncher subscribes via a DOM event so we don't
 *  need a React Context just for this one trigger. */
export function openSupport() {
  window.dispatchEvent(new Event('support:open'))
}

export function SupportLauncher() {
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

  function send(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    supportChat.send(text)
    setText('')
  }

  return (
    <>
      {/* Floating chat FAB hidden by design — the chat sheet is still
          reachable via openSupport() (e.g. the profile chat button). */}
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
