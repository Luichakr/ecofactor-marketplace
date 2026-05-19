import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { Button } from '../../shared/ui/Button/Button'
import { BottomSheet } from '../../shared/ui/BottomSheet/BottomSheet'
import { ROUTES } from '../../shared/config/routes'
import {
  profile,
  useAddresses,
  type SavedAddress,
  type AddressType,
} from '../../features/profile/model/profileStore'
import './SimpleProfileList.css'

const TYPE_LABEL: Record<AddressType, string> = { home: 'ДІМ', work: 'РОБОТА', other: 'ІНШЕ' }

export function AddressesPage() {
  const navigate = useNavigate()
  const addresses = useAddresses()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<SavedAddress | null>(null)

  function openNew() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(a: SavedAddress) {
    setEditing(a)
    setSheetOpen(true)
  }

  return (
    <>
      <Header title="АДРЕСИ ДОСТАВКИ" showBack onBack={() => navigate(ROUTES.PROFILE)} />
      <ScreenContainer withTopInset={false}>
        {addresses.length === 0 ? (
          <EmptyState
            title="Адрес поки немає"
            description="Додайте адресу, щоб оформляти замовлення швидше."
          />
        ) : (
          <ul className="simple-list">
            {addresses.map((a) => (
              <li key={a.id} className="simple-list__row">
                <button className="simple-list__main" onClick={() => openEdit(a)} type="button">
                  <span className="simple-list__chip">{TYPE_LABEL[a.type]}</span>
                  <span className="simple-list__title">{a.label}</span>
                  <span className="simple-list__sub">
                    {a.city}{a.branch ? ` · ${a.branch}` : ''}{a.street ? ` · ${a.street}` : ''}
                  </span>
                  <span className="simple-list__sub">{a.recipient} · {a.phone}</span>
                  {a.isDefault && <span className="simple-list__default">ЗА ЗАМОВЧАННЯМ</span>}
                </button>
                <button
                  type="button"
                  className="simple-list__delete"
                  onClick={() => {
                    if (window.confirm(`Видалити адресу "${a.label}"?`)) profile.deleteAddress(a.id)
                  }}
                  aria-label="Видалити"
                >×</button>
              </li>
            ))}
          </ul>
        )}

        <div className="simple-list__cta">
          <Button variant="outline" fullWidth size="lg" onClick={openNew}>
            + ДОДАТИ АДРЕСУ
          </Button>
        </div>
      </ScreenContainer>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'РЕДАГУВАТИ АДРЕСУ' : 'НОВА АДРЕСА'} maxHeightPct={88}>
        <AddressForm
          initial={editing}
          onSubmit={(a) => {
            if (editing) profile.updateAddress(editing.id, a)
            else profile.addAddress(a)
            setSheetOpen(false)
          }}
        />
      </BottomSheet>
    </>
  )
}

function AddressForm({
  initial,
  onSubmit,
}: {
  initial: SavedAddress | null
  onSubmit: (a: Omit<SavedAddress, 'id'>) => void
}) {
  const [type, setType] = useState<AddressType>(initial?.type ?? 'home')
  const [label, setLabel] = useState(initial?.label ?? 'Дім')
  const [city, setCity] = useState(initial?.city ?? '')
  const [branch, setBranch] = useState(initial?.branch ?? '')
  const [street, setStreet] = useState(initial?.street ?? '')
  const [recipient, setRecipient] = useState(initial?.recipient ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!city.trim() || !recipient.trim() || !phone.trim()) return
    onSubmit({ type, label, city, branch, street, recipient, phone, isDefault })
  }

  return (
    <form className="simple-form" onSubmit={submit}>
      <div className="simple-form__row simple-form__row--chips">
        {(['home', 'work', 'other'] as AddressType[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`simple-form__chip ${type === t ? 'simple-form__chip--active' : ''}`}
            onClick={() => setType(t)}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <Field label="Назва" value={label} onChange={setLabel} placeholder="Дім" />
      <Field label="Місто" value={city} onChange={setCity} placeholder="Київ" required />
      <Field label="Відділення НП" value={branch} onChange={setBranch} placeholder="№ 47" />
      <Field label="Або вулиця / будинок" value={street} onChange={setStreet} placeholder="вул. Хрещатик, 22, кв. 5" />
      <Field label="Отримувач" value={recipient} onChange={setRecipient} placeholder="Іван Іваненко" required />
      <Field label="Телефон" value={phone} onChange={setPhone} placeholder="+380 67 …" required />

      <label className="simple-form__toggle">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        <span>Використовувати за замовчанням</span>
      </label>

      <Button variant="primary" fullWidth size="lg" type="submit">ЗБЕРЕГТИ</Button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="simple-form__field">
      <span className="simple-form__label">{label}{required && ' *'}</span>
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
