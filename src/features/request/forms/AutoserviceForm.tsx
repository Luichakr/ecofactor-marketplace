import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../../shared/ui/Header/Header'
import { ScreenContainer } from '../../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../../shared/ui/Button/Button'
import { Field } from '../../../shared/ui/Field/Field'
import { PhoneInput, type PhoneValue } from '../../../shared/ui/PhoneInput/PhoneInput'
import { Select } from '../../../shared/ui/Select/Select'
import { CAR_MAKES, getModels } from '../../../data/carCatalog'
import { REQUEST_PATHS, ROUTES } from '../../../shared/config/routes'
import { leads } from '../../leads/model/leadsStore'
import { SERVICE_DIRECTIONS } from './autoserviceCatalog'
import './AutoserviceForm.css'

type StepId = 'city' | 'service' | 'datetime' | 'contacts' | 'confirm'

const STEPS: { id: StepId; num: number; title: string }[] = [
  { id: 'city',     num: 1, title: 'Місто' },
  { id: 'service',  num: 2, title: 'Послуга' },
  { id: 'datetime', num: 3, title: 'Дата і час' },
  { id: 'contacts', num: 4, title: 'Дані' },
  { id: 'confirm',  num: 5, title: 'Підтвердження' },
]

/** Service locations. EV-Factor only operates from these two workshops —
 *  keep this list in sync with the partner Flutter app. */
const LOCATIONS: { id: string; city: string; address: string }[] = [
  { id: 'odesa',    city: 'Одеса',    address: 'вул. Отамана Головатого, 113, Приморський район' },
  { id: 'katowice', city: 'Катовіце', address: 'ul. Kościuszki 43, 40-048 Katowice, Польща' },
]

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const MONTH_LABELS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
]

const WEEKDAY_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const SATURDAY_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00']

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Slots offered for a given date — Sundays closed, Saturdays shortened. */
function slotsFor(d: Date): string[] {
  const wd = d.getDay() // 0=Sun, 6=Sat
  if (wd === 0) return []
  if (wd === 6) return SATURDAY_SLOTS
  return WEEKDAY_SLOTS
}

/** Build the visible grid for a month view — 6 rows × 7 cols, padded with
 *  null for days outside the current month. Week starts on Monday. */
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const firstWeekday = (first.getDay() + 6) % 7 // shift Sun=0 → 6 so Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const DRAFT_KEY = 'mp:draft:autoservice'

type Draft = {
  stepIndex: number
  locationId: string
  pickedServices: string[]
  date: string
  slot: string
  name: string
  vin: string
  make: string
  model: string
}

function loadDraft(): Partial<Draft> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Draft) : {}
  } catch { return {} }
}

export function AutoserviceForm() {
  const navigate = useNavigate()
  // Restore from a previous session — if the user closed the wizard
  // halfway, they come back exactly where they left off. Cleared on
  // successful submit (see leads.add() flow below).
  const draft = useMemo(() => loadDraft(), [])

  const [stepIndex, setStepIndex] = useState(draft.stepIndex ?? 0)
  const [submitted, setSubmitted] = useState(false)

  const [locationId, setLocationId] = useState<string>(draft.locationId ?? '')
  // Currently-expanded direction in step 2 — only one open at a time so the
  // user isn't overwhelmed with the full 11-category vertical scroll.
  const [openDirection, setOpenDirection] = useState<string | null>(null)
  const [pickedServices, setPickedServices] = useState<string[]>(draft.pickedServices ?? [])
  const [date, setDate] = useState<string>(draft.date ?? '')
  const [slot, setSlot] = useState<string>(draft.slot ?? '')
  // The month currently rendered in the calendar header. Defaults to today's
  // month; user can step backward to current month and forward up to +3.
  const [viewMonth, setViewMonth] = useState(() => {
    const t = new Date()
    return { year: t.getFullYear(), month: t.getMonth() }
  })

  const [name, setName] = useState(draft.name ?? '')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [vin, setVin] = useState(draft.vin ?? '')
  const [make, setMake] = useState(draft.make ?? '')
  const [model, setModel] = useState(draft.model ?? '')

  // Persist on every meaningful change so the user can leave/return safely.
  // Phone is intentionally NOT persisted — sensitive PII shouldn't sit in
  // localStorage for a casual demo, even though everything else is local.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ stepIndex, locationId, pickedServices, date, slot, name, vin, make, model }),
      )
    } catch {}
  }, [stepIndex, locationId, pickedServices, date, slot, name, vin, make, model])

  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  const selectedLocation = LOCATIONS.find((l) => l.id === locationId)

  const stepValid = ((): boolean => {
    switch (step.id) {
      case 'city':     return locationId.length > 0
      case 'service':  return pickedServices.length > 0
      case 'datetime': return date.length > 0 && slot.length > 0
      case 'contacts':
        return (
          name.trim().length >= 2 &&
          phone !== undefined && phone.digits.length >= 9
        )
      case 'confirm':  return true
    }
  })()

  const monthCells = useMemo(
    () => buildMonthGrid(viewMonth.year, viewMonth.month),
    [viewMonth],
  )
  const today = useMemo(() => startOfDay(new Date()), [])
  // Forward boundary — current month + 3 (Flutter app's cap).
  const maxMonth = useMemo(() => {
    const m = new Date(today.getFullYear(), today.getMonth() + 3, 1)
    return { year: m.getFullYear(), month: m.getMonth() }
  }, [today])
  const canGoPrev =
    viewMonth.year > today.getFullYear() ||
    (viewMonth.year === today.getFullYear() && viewMonth.month > today.getMonth())
  const canGoNext =
    viewMonth.year < maxMonth.year ||
    (viewMonth.year === maxMonth.year && viewMonth.month < maxMonth.month)

  function shiftMonth(delta: number) {
    setViewMonth((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function toggleService(s: string) {
    setPickedServices((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    )
  }

  function handleNext() {
    if (!stepValid) return
    if (isLast) {
      leads.add({
        type: 'autoservice',
        name,
        phone: phone?.e164,
        payload: {
          locationId,
          city: selectedLocation?.city,
          address: selectedLocation?.address,
          services: pickedServices,
          date,
          slot,
          vin,
          make,
          model,
        },
      })
      try { window.localStorage.removeItem(DRAFT_KEY) } catch {}
      setSubmitted(true)
      return
    }
    setStepIndex((i) => i + 1)
  }

  function handleBack() {
    if (isFirst) return
    setStepIndex((i) => i - 1)
  }

  if (submitted) {
    const ref = (() => {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let s = ''
      for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
      return `${s}-${Math.floor(Math.random() * 10)}`
    })()
    return (
      <>
        <Header title="АВТОСЕРВІС" />
        <ScreenContainer withTopInset={false}>
          <div className="autoservice__success">
            <svg className="autoservice__success-icon" width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="1.5" />
              <path d="M17 28L25 36L40 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="autoservice__success-title">Запис прийнято</h2>
            <p className="autoservice__success-desc">
              Майстер підтвердить запис протягом години. Очікуйте дзвінок із нашого номера.
            </p>
            <div className="request-layout__success-ref">
              <span className="request-layout__success-ref-label">НОМЕР ЗВЕРНЕННЯ</span>
              <span className="request-layout__success-ref-value">#{ref}</span>
            </div>
            <div className="request-layout__success-actions">
              <Button variant="primary" size="lg" fullWidth onClick={() => navigate(ROUTES.MARKETPLACE)}>
                На головну
              </Button>
              <Button variant="outline" size="lg" fullWidth onClick={() => navigate(REQUEST_PATHS.HUB)}>
                Залишити ще заявку
              </Button>
            </div>
          </div>
        </ScreenContainer>
      </>
    )
  }

  const makeOptions = CAR_MAKES.map((m) => ({ value: m, label: m }))
  const modelOptions = make ? getModels(make).map((m) => ({ value: m, label: m })) : []

  return (
    <>
      <Header title="ЗАПИС НА СЕРВІС" showBack />
      <ScreenContainer withTopInset={false}>
        <div className="autoservice">
          {/* Horizontal numbered step indicator. Done steps show a check, the
              active step shows its number, future steps show their number
              but are disabled. */}
          <nav className="autoservice__steps" aria-label="Кроки">
            {STEPS.map((s, i) => {
              const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'todo'
              return (
                <Fragment key={s.id}>
                  <button
                    type="button"
                    className={`autoservice__step autoservice__step--${state}`}
                    onClick={() => i <= stepIndex && setStepIndex(i)}
                    disabled={i > stepIndex}
                  >
                    <span className="autoservice__step-circle">
                      {state === 'done' ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        s.num
                      )}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span
                      className={`autoservice__step-line ${i < stepIndex ? 'autoservice__step-line--done' : ''}`}
                    />
                  )}
                </Fragment>
              )
            })}
          </nav>

          <section className="autoservice__panel">
            <h2 className="autoservice__panel-title">{step.title}</h2>

            {/* ── Step 1: Location (city + workshop address) ─────────── */}
            {step.id === 'city' && (
              <div className="autoservice__list">
                {LOCATIONS.map((loc) => {
                  const active = locationId === loc.id
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      className={`autoservice__option ${active ? 'autoservice__option--active' : ''}`}
                      onClick={() => setLocationId(loc.id)}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="autoservice__option-label">{loc.city}</span>
                        <span className="autoservice__option-meta">{loc.address}</span>
                      </span>
                      {active && (
                        <span className="autoservice__option-tick">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Step 2: Service direction → tasks ──────────────────── */}
            {step.id === 'service' && (
              <>
                <p className="autoservice__hint">
                  Натисніть на напрямок — розкриється список послуг. Можна обрати кілька з різних напрямків.
                </p>
                <div className="autoservice__directions">
                  {SERVICE_DIRECTIONS.map((dir) => {
                    const open = openDirection === dir.id
                    const pickedHere = dir.services.filter((s) => pickedServices.includes(s)).length
                    return (
                      <div
                        key={dir.id}
                        className={`autoservice__direction ${open ? 'autoservice__direction--open' : ''}`}
                      >
                        <button
                          type="button"
                          className="autoservice__direction-head"
                          onClick={() => setOpenDirection(open ? null : dir.id)}
                        >
                          <span className="autoservice__direction-title">{dir.title}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            {pickedHere > 0 && (
                              <span className="autoservice__direction-count">{pickedHere}</span>
                            )}
                            <span className="autoservice__direction-chev">
                              <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                                <path d="M2 2L8 7L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </span>
                        </button>
                        {open && (
                          <div className="autoservice__direction-body">
                            {dir.services.map((s) => {
                              const active = pickedServices.includes(s)
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  className={`autoservice__service ${active ? 'autoservice__service--active' : ''}`}
                                  onClick={() => toggleService(s)}
                                >
                                  <span className="autoservice__service-checkbox">
                                    {active && (
                                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="autoservice__service-label">{s}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── Step 3: Calendar + time slots ──────────────────────── */}
            {step.id === 'datetime' && (
              <>
                <div className="autoservice__cal">
                  <header className="autoservice__cal-head">
                    <button
                      type="button"
                      className="autoservice__cal-nav"
                      onClick={() => shiftMonth(-1)}
                      disabled={!canGoPrev}
                      aria-label="Попередній місяць"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <span className="autoservice__cal-month">
                      {MONTH_LABELS[viewMonth.month]} {viewMonth.year}
                    </span>
                    <button
                      type="button"
                      className="autoservice__cal-nav"
                      onClick={() => shiftMonth(1)}
                      disabled={!canGoNext}
                      aria-label="Наступний місяць"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </header>

                  <div className="autoservice__cal-weekdays">
                    {WEEKDAY_LABELS.map((w, i) => (
                      <span
                        key={w}
                        className={`autoservice__cal-weekday ${i === 6 ? 'autoservice__cal-weekday--closed' : ''}`}
                      >
                        {w}
                      </span>
                    ))}
                  </div>

                  <div className="autoservice__cal-grid">
                    {monthCells.map((cell, i) => {
                      if (!cell) return <span key={`empty-${i}`} className="autoservice__cal-cell autoservice__cal-cell--empty" />
                      const isPast = cell < today
                      const isSunday = cell.getDay() === 0
                      const disabled = isPast || isSunday
                      const iso = ymd(cell)
                      const active = date === iso
                      return (
                        <button
                          key={iso}
                          type="button"
                          className={`autoservice__cal-cell ${active ? 'autoservice__cal-cell--active' : ''} ${disabled ? 'autoservice__cal-cell--disabled' : ''}`}
                          onClick={() => {
                            if (disabled) return
                            setDate(iso)
                            setSlot('')
                          }}
                          disabled={disabled}
                        >
                          {cell.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {date && (() => {
                  const picked = parseYmd(date)
                  const daySlots = slotsFor(picked)
                  return (
                    <>
                      <p className="autoservice__slots-title">
                        Час візиту {picked.getDay() === 6 ? '(скорочений день)' : ''}
                      </p>
                      <div className="autoservice__slots">
                        {daySlots.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`autoservice__slot ${slot === t ? 'autoservice__slot--active' : ''}`}
                            onClick={() => setSlot(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </>
                  )
                })()}

                <p className="autoservice__hint">
                  Неділя — вихідний. У суботу працюємо до 15:00. Час — для першого огляду; термін робіт майстер уточнить після прийому авто.
                </p>
              </>
            )}

            {/* ── Step 4: Personal + car data ────────────────────────── */}
            {step.id === 'contacts' && (
              <div className="autoservice__contacts">
                <Field
                  label="Імʼя"
                  placeholder="Як до вас звертатися"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                />
                <PhoneInput label="Телефон" required value={phone} onChange={setPhone} />
                <Field
                  label="VIN"
                  placeholder="Напр.: 5YJ3E1EA1NF000001"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  maxLength={17}
                />
                <Select
                  label="Марка авто"
                  placeholder="Оберіть марку"
                  value={make}
                  onChange={(v) => { setMake(v); setModel('') }}
                  options={makeOptions}
                />
                {make && (
                  <Select
                    label="Модель авто"
                    placeholder="Оберіть модель"
                    value={model}
                    onChange={setModel}
                    options={modelOptions}
                  />
                )}
                <p className="autoservice__hint">
                  Натискаючи «Далі», ви погоджуєтесь на обробку персональних даних.
                </p>
              </div>
            )}

            {/* ── Step 5: Confirm ────────────────────────────────────── */}
            {step.id === 'confirm' && (
              <>
                <div className="autoservice__summary">
                  <div className="autoservice__summary-row">
                    <span className="autoservice__summary-label">Сервіс</span>
                    <span className="autoservice__summary-value">
                      {selectedLocation?.city}<br />
                      <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 11 }}>
                        {selectedLocation?.address}
                      </span>
                    </span>
                  </div>
                  <div className="autoservice__summary-row">
                    <span className="autoservice__summary-label">Дата</span>
                    <span className="autoservice__summary-value">
                      {(() => {
                        const d = new Date(date)
                        return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()} · ${slot}`
                      })()}
                    </span>
                  </div>
                  {(make || model) && (
                    <div className="autoservice__summary-row">
                      <span className="autoservice__summary-label">Авто</span>
                      <span className="autoservice__summary-value">{[make, model].filter(Boolean).join(' ')}</span>
                    </div>
                  )}
                  {vin && (
                    <div className="autoservice__summary-row">
                      <span className="autoservice__summary-label">VIN</span>
                      <span className="autoservice__summary-value">{vin}</span>
                    </div>
                  )}
                  <div className="autoservice__summary-row">
                    <span className="autoservice__summary-label">Контакт</span>
                    <span className="autoservice__summary-value">{name} · {phone?.e164}</span>
                  </div>
                </div>

                <div className="autoservice__services-list">
                  <span className="autoservice__summary-label">Послуги ({pickedServices.length})</span>
                  {pickedServices.map((s) => (
                    <span key={s} className="autoservice__services-item">{s}</span>
                  ))}
                </div>
              </>
            )}
          </section>

          <footer className="autoservice__controls">
            <button
              type="button"
              className="autoservice__back"
              onClick={handleBack}
              disabled={isFirst}
              aria-label="Назад"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!stepValid}
              className="autoservice__next"
            >
              {isLast ? 'ПІДТВЕРДИТИ' : 'ДАЛІ'}
            </Button>
          </footer>
        </div>
      </ScreenContainer>
    </>
  )
}
