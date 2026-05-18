import { useState } from 'react'
import { NewsletterSheet } from '../../../newsletter/ui/NewsletterSheet/NewsletterSheet'
import './HomeFooter.css'

export function HomeFooter() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <footer className="home-footer">
        <button type="button" className="home-footer__newsletter" onClick={() => setOpen(true)}>
          ПІДПИШІТЬСЯ НА НАШУ РОЗСИЛКУ
        </button>
        <p className="home-footer__links">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>PRIVACY POLICY</a>
          <span aria-hidden="true">/</span>
          <a href="#terms" onClick={(e) => e.preventDefault()}>TERMS OF USE</a>
        </p>
        <p className="home-footer__small">УПРАВЛІННЯ КОНФІДЕНЦІЙНІСТЮ</p>
      </footer>
      <NewsletterSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
