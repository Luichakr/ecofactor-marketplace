import { useEffect, useMemo, useState } from 'react'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { Button } from '../../../../shared/ui/Button/Button'
import { Icon } from '../../../../shared/ui/Icon/Icon'
import { profile, useCards, type SavedCard } from '../../../profile/model/profileStore'
import type { ListingPromo, PromoTier } from '../../../listings/model/listingsStore'
import { PROMO_PLANS, planByTier, formatUAH, makePromo, type PromoPlan } from '../../model/promoPlans'
import './PromoteSheet.css'

type Step = 'plan' | 'pay' | 'thanks'

type Props = {
  open: boolean
  onClose: () => void
  /** Title of the listing being promoted (shown for context). */
  listingTitle?: string
  /** Called once payment "succeeds" with the built promo record. */
  onPaid: (promo: ListingPromo) => void
}

const BRAND_LABEL: Record<SavedCard['brand'], string> = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX' }
function detectBrand(num: string): SavedCard['brand'] {
  if (num.startsWith('4')) return 'visa'
  if (num.startsWith('3')) return 'amex'
  return 'mastercard'
}

export function PromoteSheet({ open, onClose, listingTitle, onPaid }: Props) {
  const cards = useCards()
  const [step, setStep] = useState<Step>('plan')
  const [tier, setTier] = useState<PromoTier>('top')
  const [paid, setPaid] = useState<ListingPromo | null>(null)

  const plan = planByTier(tier)

  // Reset to the first step whenever the sheet opens.
  useEffect(() => {
    if (open) {
      setStep('plan')
      setTier('top')
      setPaid(null)
    }
  }, [open])

  function handlePaid(p: ListingPromo) {
    setPaid(p)
    onPaid(p)
    setStep('thanks')
  }

  const title = step === 'plan' ? 'ПРОСУВАННЯ' : step === 'pay' ? 'ОПЛАТА' : 'ОПЛАЧЕНО'

  return (
    <BottomSheet open={open} onClose={onClose} title={title} maxHeightPct={92}>
      {step === 'plan' && (
        <PlanStep
          tier={tier}
          onPick={setTier}
          listingTitle={listingTitle}
          onNext={() => setStep('pay')}
        />
      )}
      {step === 'pay' && (
        <PayStep plan={plan} cards={cards} onBack={() => setStep('plan')} onPaid={handlePaid} />
      )}
      {step === 'thanks' && paid && <ThanksStep promo={paid} onDone={onClose} />}
    </BottomSheet>
  )
}

/* ─────────────────────────── Step 1: plan ─────────────────────────── */

function PlanStep({
  tier,
  onPick,
  listingTitle,
  onNext,
}: {
  tier: PromoTier
  onPick: (t: PromoTier) => void
  listingTitle?: string
  onNext: () => void
}) {
  const plan = planByTier(tier)
  return (
    <div className="promote">
      <p className="promote__lead">
        Виділіть оголошення{listingTitle ? ` «${listingTitle}»` : ''} — більше переглядів і швидший продаж.
      </p>

      <div className="promote__plans">
        {PROMO_PLANS.map((p) => (
          <button
            key={p.tier}
            type="button"
            className={`promo-plan ${tier === p.tier ? 'promo-plan--active' : ''}`}
            onClick={() => onPick(p.tier)}
          >
            {p.popular && <span className="promo-plan__popular">Популярний вибір</span>}
            <span className="promo-plan__radio" aria-hidden="true" />
            <span className="promo-plan__body">
              <span className="promo-plan__head">
                <span className="promo-plan__name">{p.name}</span>
                {p.badge && <PromoBadgePreview type={p.badge} />}
              </span>
              <span className="promo-plan__blurb">{p.blurb}</span>
              {p.multiplier && <span className="promo-plan__mult">{p.multiplier} більше переглядів</span>}
            </span>
            <span className="promo-plan__price">{formatUAH(p.price)}</span>
          </button>
        ))}
      </div>

      <div className="promote__cta">
        <div className="promote__total">
          <span>До сплати</span>
          <strong>{formatUAH(plan.price)}</strong>
        </div>
        <Button variant="primary" fullWidth size="lg" onClick={onNext}>
          Перейти до оплати
        </Button>
        <p className="promote__note">Оплата тестова — гроші не списуються.</p>
      </div>
    </div>
  )
}

/** Inline (non-absolute) badge preview used inside plan rows. */
function PromoBadgePreview({ type }: { type: 'top' | 'vip' }) {
  return <span className={`promo-plan__badge promo-plan__badge--${type}`}>{type === 'vip' ? '★ VIP' : '▲ ТОП'}</span>
}

/* ─────────────────────────── Step 2: pay ──────────────────────────── */

function PayStep({
  plan,
  cards,
  onBack,
  onPaid,
}: {
  plan: PromoPlan
  cards: SavedCard[]
  onBack: () => void
  onPaid: (p: ListingPromo) => void
}) {
  const [selected, setSelected] = useState<string>(() => cards.find((c) => c.isDefault)?.id ?? cards[0]?.id ?? 'new')
  const [processing, setProcessing] = useState(false)

  // New-card form
  const [num, setNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [holder, setHolder] = useState('')
  const [save, setSave] = useState(true)

  const usingNew = selected === 'new' || cards.length === 0
  const digits = num.replace(/\D/g, '')
  const mm = Number(expiry.slice(0, 2))
  const expiryOk = /^\d{2}\/\d{2}$/.test(expiry) && mm >= 1 && mm <= 12
  // Mock: any digits accepted (no Luhn) — just realistic format checks.
  const newCardValid = digits.length >= 13 && digits.length <= 19 && expiryOk && cvv.length >= 3
  const canPay = !processing && (usingNew ? newCardValid : true)

  function onNum(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 19)
    setNum(d.replace(/(\d{4})(?=\d)/g, '$1 '))
  }
  function onExpiry(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 4)
    setExpiry(d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d)
  }

  function pay() {
    if (!canPay) return
    setProcessing(true)
    // Persist the new card (last4 + expiry only) if requested — like a real app.
    if (usingNew && save) {
      profile.addCard({
        brand: detectBrand(digits),
        last4: digits.slice(-4),
        expiry,
        cardholder: holder.trim().toUpperCase() || undefined,
        isDefault: cards.length === 0,
      })
    }
    // Simulate a payment round-trip. No real charge — nothing leaves the device.
    window.setTimeout(() => onPaid(makePromo(plan)), 1400)
  }

  return (
    <div className="promote">
      <div className="promote__summary">
        <span className="promote__summary-name">{plan.name}</span>
        <span className="promote__summary-price">{formatUAH(plan.price)}</span>
      </div>

      <span className="promote__label">Спосіб оплати</span>

      {cards.length > 0 && (
        <div className="pay-cards">
          {cards.map((c) => (
            <label key={c.id} className={`pay-card ${selected === c.id ? 'pay-card--active' : ''}`}>
              <input type="radio" name="paycard" checked={selected === c.id} onChange={() => setSelected(c.id)} />
              <span className="pay-card__brand">{BRAND_LABEL[c.brand]}</span>
              <span className="pay-card__num">•••• {c.last4}</span>
              <span className="pay-card__exp">{c.expiry}</span>
            </label>
          ))}
          <label className={`pay-card pay-card--new ${selected === 'new' ? 'pay-card--active' : ''}`}>
            <input type="radio" name="paycard" checked={selected === 'new'} onChange={() => setSelected('new')} />
            <Icon name="add" size={18} />
            <span className="pay-card__num">Інша картка</span>
          </label>
        </div>
      )}

      {usingNew && (
        <div className="pay-form">
          <label className="pay-form__field">
            <span>Номер картки</span>
            <input value={num} onChange={(e) => onNum(e.target.value)} placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" />
          </label>
          <div className="pay-form__row">
            <label className="pay-form__field">
              <span>Термін</span>
              <input value={expiry} onChange={(e) => onExpiry(e.target.value)} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
            </label>
            <label className="pay-form__field">
              <span>CVV</span>
              <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" inputMode="numeric" autoComplete="cc-csc" />
            </label>
          </div>
          <label className="pay-form__field">
            <span>Власник картки</span>
            <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="IVAN IVANENKO" autoComplete="cc-name" />
          </label>
          <label className="pay-form__save">
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />
            <span>Зберегти картку для майбутніх платежів</span>
          </label>
        </div>
      )}

      <div className="promote__cta">
        <Button variant="primary" fullWidth size="lg" disabled={!canPay} onClick={pay}>
          {processing ? 'Оплата…' : `Оплатити ${formatUAH(plan.price)}`}
        </Button>
        <button type="button" className="promote__back" onClick={onBack} disabled={processing}>
          ← Змінити тариф
        </button>
        <p className="promote__note">🔒 Тестова оплата. Дані картки не зберігаються повністю, гроші не списуються.</p>
      </div>
    </div>
  )
}

/* ─────────────────────────── Step 3: thanks ───────────────────────── */

function ThanksStep({ promo, onDone }: { promo: ListingPromo; onDone: () => void }) {
  const plan = planByTier(promo.tier)
  const outcome = useMemo(() => {
    if (promo.tier === 'bump') return 'Ваше оголошення підніметься у стрічці після перевірки.'
    return `Ваше оголошення отримає статус ${promo.tier === 'vip' ? 'VIP' : 'ТОП'} (${plan.name.replace(/^.*?на /, 'на ')}) після перевірки.`
  }, [promo.tier, plan.name])

  return (
    <div className="promote promote--thanks">
      <span className="promote__check" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="var(--color-accent)" strokeWidth="2" />
          <path d="M20 33L28 41L45 23" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h3 className="promote__thanks-title">Дякуємо! Оплату прийнято</h3>
      <p className="promote__thanks-outcome">{outcome}</p>

      <div className="promote__receipt">
        <div><span>Замовлення</span><strong>#{promo.orderId}</strong></div>
        <div><span>Тариф</span><strong>{plan.name}</strong></div>
        <div><span>Сума</span><strong>{formatUAH(promo.pricePaid)}</strong></div>
      </div>

      <p className="promote__note">
        Оголошення відправлено на модерацію — просування активується після схвалення.
      </p>

      <Button variant="primary" fullWidth size="lg" onClick={onDone}>
        Готово
      </Button>
    </div>
  )
}
