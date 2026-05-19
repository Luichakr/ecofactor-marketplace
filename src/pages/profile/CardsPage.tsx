import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { Button } from '../../shared/ui/Button/Button'
import { BottomSheet } from '../../shared/ui/BottomSheet/BottomSheet'
import { ROUTES } from '../../shared/config/routes'
import { profile, useCards, type SavedCard } from '../../features/profile/model/profileStore'
import './SimpleProfileList.css'

const BRAND_LABEL: Record<SavedCard['brand'], string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMEX',
}

function detectBrand(num: string): SavedCard['brand'] {
  if (num.startsWith('4')) return 'visa'
  if (num.startsWith('3')) return 'amex'
  return 'mastercard'
}

export function CardsPage() {
  const navigate = useNavigate()
  const cards = useCards()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Header title="ПЛАТІЖНІ КАРТКИ" showBack onBack={() => navigate(ROUTES.PROFILE)} />
      <ScreenContainer withTopInset={false}>
        {cards.length === 0 ? (
          <EmptyState
            title="Карток поки немає"
            description="Додайте картку для швидшого оформлення замовлень."
          />
        ) : (
          <ul className="simple-list">
            {cards.map((c) => (
              <li key={c.id} className="simple-list__row">
                <div className="simple-list__main">
                  <span className="simple-list__chip">{BRAND_LABEL[c.brand]}</span>
                  <span className="simple-list__title simple-list__title--mono">•••• {c.last4}</span>
                  <span className="simple-list__sub">Дійсна до {c.expiry}{c.cardholder ? ` · ${c.cardholder}` : ''}</span>
                  {c.isDefault && <span className="simple-list__default">ЗА ЗАМОВЧАННЯМ</span>}
                </div>
                <button
                  type="button"
                  className="simple-list__delete"
                  onClick={() => {
                    if (window.confirm(`Видалити картку •••• ${c.last4}?`)) profile.deleteCard(c.id)
                  }}
                  aria-label="Видалити"
                >×</button>
              </li>
            ))}
          </ul>
        )}

        <div className="simple-list__cta">
          <Button variant="outline" fullWidth size="lg" onClick={() => setOpen(true)}>
            + ДОДАТИ КАРТКУ
          </Button>
          <p className="simple-list__note">
            Реквізити картки зберігаються у платіжному провайдері. У застосунку ми бачимо лише
            останні 4 цифри та термін дії.
          </p>
        </div>
      </ScreenContainer>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="ДОДАТИ КАРТКУ" maxHeightPct={70}>
        <CardForm
          onSubmit={(c) => {
            profile.addCard(c)
            setOpen(false)
          }}
        />
      </BottomSheet>
    </>
  )
}

function CardForm({ onSubmit }: { onSubmit: (c: Omit<SavedCard, 'id'>) => void }) {
  const [num, setNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [holder, setHolder] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const digits = num.replace(/\s/g, '')
    if (digits.length < 4 || !expiry.match(/^\d{2}\/\d{2}$/)) return
    onSubmit({
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      expiry,
      cardholder: holder.trim().toUpperCase() || undefined,
      isDefault,
    })
  }

  return (
    <form className="simple-form" onSubmit={submit}>
      <Field label="Номер картки" value={num} onChange={setNum} placeholder="4242 4242 4242 4242" />
      <div className="simple-form__row">
        <Field label="Термін" value={expiry} onChange={setExpiry} placeholder="MM/YY" />
        <Field label="CVV" value={''} onChange={() => {}} placeholder="•••" />
      </div>
      <Field label="Власник" value={holder} onChange={setHolder} placeholder="IVAN IVANENKO" />
      <label className="simple-form__toggle">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        <span>Використовувати за замовчанням</span>
      </label>
      <Button variant="primary" fullWidth size="lg" type="submit">ЗБЕРЕГТИ</Button>
    </form>
  )
}

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="simple-form__field">
      <span className="simple-form__label">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="simple-form__input"
      />
    </label>
  )
}
