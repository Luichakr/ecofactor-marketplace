import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../../shared/ui/Header/Header'
import { ScreenContainer } from '../../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../../shared/ui/Button/Button'
import { Field } from '../../../shared/ui/Field/Field'
import { ChipGroup } from '../../../shared/ui/ChipGroup/ChipGroup'
import { PhoneInput, type PhoneValue } from '../../../shared/ui/PhoneInput/PhoneInput'
import { REQUEST_PATHS, ROUTES } from '../../../shared/config/routes'
import { leads } from '../../leads/model/leadsStore'
import { StationIllustration } from './StationIllustration'
import './CustomStationForm.css'

type StepId = 'track' | 'model' | 'power' | 'connectors' | 'options' | 'contacts'

/* Six-step wizard. Step 0 (`track`) splits the funnel into AC vs DC up
 * front — same entry the live ecofactortech.com configurator uses (two
 * big "Підібрати AC-станцію / DC-станцію" buttons). Once chosen, every
 * downstream step is filtered to the matching catalog. */
const STEPS: { id: StepId; num: string; title: string }[] = [
  { id: 'track',      num: '01', title: 'AC чи DC' },
  { id: 'model',      num: '02', title: 'Тип станції' },
  { id: 'power',      num: '03', title: 'Потужність' },
  { id: 'connectors', num: '04', title: 'Конектори' },
  { id: 'options',    num: '05', title: 'Опції' },
  { id: 'contacts',   num: '06', title: 'Контакти' },
]

/* Catalog mirrors ecofactortech.com/ua/ac-configurator + /dc-configurator.
 * `track` separates the AC and DC product families so we can flip the rest
 * of the catalog (powers, connectors) per the user's first choice. */
type Track = 'ac' | 'dc'

type StationModel = {
  value: string
  label: string
  subtitle: string
  track: Track
}

const MODELS: StationModel[] = [
  // AC family
  { value: 'eco-totem', label: 'ECO Totem', subtitle: 'Окрема стійка для вулиці та парковок', track: 'ac' },
  { value: 'eco-wall',  label: 'ECO Wall',  subtitle: 'Компактний корпус на стіну або підставку', track: 'ac' },
  // DC family
  { value: 'tor-wall',         label: 'TOR Wall',                subtitle: 'Настінна DC станція',                  track: 'dc' },
  { value: 'tor-mobile',       label: 'TOR Mobile',              subtitle: 'Мобільна DC',                          track: 'dc' },
  { value: 'tor-quattro-mini', label: 'TOR Quattro Mini',        subtitle: '2 модулі · 60–80 кВт',                 track: 'dc' },
  { value: 'tor-quattro-4',    label: 'TOR Quattro',             subtitle: '4 модулі · 90–160 кВт',                track: 'dc' },
  { value: 'tor-quattro-8',    label: 'TOR Quattro',             subtitle: '8 модулів · 240–320 кВт',              track: 'dc' },
  { value: 'tor-media',        label: 'TOR MEDIA',               subtitle: 'З медіа-екраном',                      track: 'dc' },
  { value: 'tor-quattro-12',   label: 'TOR Quattro',             subtitle: '12 модулів · 360–480 кВт',             track: 'dc' },
]

/* Numeric power options, kW. The wizard picks them based on the chosen
 * model's track. Values match the live configurator. */
const POWERS_BY_TRACK: Record<Track, number[]> = {
  ac: [22, 44, 88],
  dc: [40, 60, 80, 90, 120, 160, 240, 320, 360, 480],
}

/* Per-connector wattage so step 3 can show "Used X of Y kW" live. AC and
 * DC connector lists differ — `track` picks the right one. */
type Connector = { id: string; label: string; kw: number }

const CONNECTORS_AC: Connector[] = [
  { id: 'type2-7',     label: 'Type 2 · 7 кВт',         kw: 7 },
  { id: 'type2-22',    label: 'Type 2 · 22 кВт',        kw: 22 },
  { id: 'type2-sock',  label: 'Type 2 розетка · 22 кВт',kw: 22 },
  { id: 'type1-7',     label: 'Type 1 · 7 кВт',         kw: 7 },
  { id: 'gbt-7',       label: 'GB/T · 7 кВт',           kw: 7 },
  { id: 'gbt-22',      label: 'GB/T · 22 кВт',          kw: 22 },
  { id: 'nacs-7',      label: 'NACS · 7 кВт',           kw: 7 },
]

const CONNECTORS_DC: Connector[] = [
  { id: 'ccs2',   label: 'CCS Type 2',  kw: 50 },
  { id: 'ccs1',   label: 'CCS Type 1',  kw: 50 },
  { id: 'gbt-dc', label: 'GB/T DC',     kw: 50 },
  { id: 'chademo',label: 'CHAdeMO',     kw: 50 },
  { id: 'nacs-dc',label: 'NACS DC',     kw: 50 },
]

/* Step-4 options. Single payment + cable mgmt as in the live configurator;
 * the rest are sensible defaults customers commonly tick. */
const OPTIONS = [
  { id: 'payment',     label: 'Платіжний термінал (картка / Apple Pay / Google Pay)' },
  { id: 'stand',       label: 'Підставка для встановлення' },
  { id: 'cable-mgmt',  label: 'Cable management system' },
  { id: 'rfid',        label: 'RFID-карти' },
  { id: 'app',         label: 'Інтеграція з додатком ECOFACTOR' },
  { id: 'lights',      label: 'LED-підсвітка' },
  { id: 'barrier-free',label: 'Доступність для людей з інвалідністю' },
  { id: 'weather',     label: 'Захист від погоди (IP54+)' },
]

/* Body color presets + RAL escape hatch (the live site offers a RAL
 * palette button — we open a free-text field instead for the demo). */
type ColorPreset = { id: string; label: string; swatch: string }
const COLORS: ColorPreset[] = [
  { id: 'black',     label: 'Класичний чорний', swatch: '#1c1c1e' },
  { id: 'matte',     label: 'Матовий сірий',     swatch: '#6b6b70' },
  { id: 'glossy',    label: 'Глянцевий білий',   swatch: '#f5f5f7' },
  { id: 'green',     label: 'Брендовий зелений', swatch: '#10B452' },
  { id: 'ral',       label: 'Своя палітра RAL',  swatch: 'conic-gradient(from 0deg, red, orange, yellow, green, blue, purple, red)' },
]

export function CustomStationForm() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  // Track is chosen FIRST (step 0). The model picker, power tiers, and
  // connector catalog are all gated on this value, so flipping AC↔DC
  // resets every downstream selection.
  const [trackChoice, setTrackChoice] = useState<Track | ''>('')
  const [model, setModel] = useState('')
  // Power is stored as a numeric kW value (0 = "not chosen") so we can
  // compare against per-connector wattage in step 3.
  const [power, setPower] = useState<number>(0)
  // Each picked connector is a row {connectorId, qty} so a user can add
  // e.g. "2× Type 2 22 kW" without picking the same id twice.
  const [picks, setPicks] = useState<Array<{ id: string; qty: number }>>([])
  const [options, setOptions] = useState<string[]>([])
  const [color, setColor] = useState<string>('black')
  const [ralCode, setRalCode] = useState('')
  const [count, setCount] = useState('1')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [comment, setComment] = useState('')

  /* `trackChoice` is the source of truth for AC vs DC once step 0 is done.
   * Until then we fall back to the selected model's own track so the
   * resume-from-mid-wizard case still works. */
  const selectedModel = MODELS.find((m) => m.value === model)
  const track: Track = (trackChoice || selectedModel?.track || 'ac')
  const connectorCatalog = track === 'dc' ? CONNECTORS_DC : CONNECTORS_AC
  const modelsForTrack = MODELS.filter((m) => m.track === track)

  /* Live power budget — sum of (kw × qty) across picks. */
  const usedKw = picks.reduce((sum, p) => {
    const c = connectorCatalog.find((x) => x.id === p.id)
    return sum + (c ? c.kw * p.qty : 0)
  }, 0)
  const remainingKw = Math.max(0, power - usedKw)

  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  // Per-step validation
  const stepValid = ((): boolean => {
    switch (step.id) {
      case 'track':
        return trackChoice.length > 0
      case 'model':
        return model.length > 0
      case 'power':
        return power > 0
      case 'connectors':
        // At least one connector picked AND total wattage fits the budget.
        return picks.length > 0 && usedKw <= power
      case 'options':
        return true // optional
      case 'contacts': {
        const emailOk = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        return (
          name.trim().length >= 2 &&
          phone !== undefined && phone.digits.length >= 9 &&
          city.trim().length >= 2 &&
          emailOk
        )
      }
    }
  })()

  function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
  }

  /** Increase qty for a connector, but only if there's enough remaining
   *  kW budget. Insert a new row at qty=1 the first time it's added. */
  function addConnector(id: string) {
    const c = connectorCatalog.find((x) => x.id === id)
    if (!c) return
    if (usedKw + c.kw > power) return
    setPicks((cur) => {
      const existing = cur.find((p) => p.id === id)
      if (existing) {
        return cur.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p))
      }
      return [...cur, { id, qty: 1 }]
    })
  }

  /** Decrement qty; remove the row at qty=0. */
  function removeConnector(id: string) {
    setPicks((cur) => {
      const existing = cur.find((p) => p.id === id)
      if (!existing) return cur
      if (existing.qty <= 1) return cur.filter((p) => p.id !== id)
      return cur.map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
    })
  }

  function handleNext() {
    if (!stepValid) return
    if (isLast) {
      leads.add({
        type: 'custom-station',
        name,
        phone: phone?.e164,
        email,
        message: comment,
        payload: {
          model,
          modelLabel: selectedModel?.label,
          track,
          power,
          connectors: picks,
          usedKw,
          options,
          color: color === 'ral' ? `RAL ${ralCode || '—'}` : color,
          count,
          city,
        },
      })
      setSubmitted(true)
      return
    }
    setStepIndex((i) => i + 1)
  }

  function handleBack() {
    if (isFirst) return
    setStepIndex((i) => i - 1)
  }

  /** Choosing AC or DC at step 0 — flushes every downstream pick so we
   *  never carry a connector valid only on the other track. */
  function pickTrack(t: Track) {
    setTrackChoice(t)
    setModel('')
    setPower(0)
    setPicks([])
  }

  /** Reset later steps when the user changes a foundational pick — a
   *  power value valid for AC may overflow for the chosen DC model. */
  function pickModel(value: string) {
    setModel(value)
    setPower(0)
    setPicks([])
  }
  function pickPower(kw: number) {
    setPower(kw)
    // Drop any connector rows that no longer fit the new budget.
    setPicks((cur) => {
      const out: typeof cur = []
      let used = 0
      for (const p of cur) {
        const c = connectorCatalog.find((x) => x.id === p.id)
        if (!c) continue
        if (used + c.kw * p.qty <= kw) {
          out.push(p)
          used += c.kw * p.qty
        }
      }
      return out
    })
  }

  const powerOptions = POWERS_BY_TRACK[track]

  if (submitted) {
    const ref = (() => {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let s = ''
      for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
      return `${s}-${Math.floor(Math.random() * 10)}`
    })()
    return (
      <>
        <Header title="КАСТОМНА СТАНЦІЯ" showBack />
        <ScreenContainer withTopInset={false}>
          <div className="custom-station__success">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="1" />
              <path d="M17 28L25 36L40 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="custom-station__success-title">Конфігурацію надіслано</h2>
            <p className="custom-station__success-desc">
              Інженер прорахує вашу станцію та звʼяжеться протягом робочого дня.
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

  return (
    <>
      <Header title="КАСТОМНА СТАНЦІЯ" showBack />
      <ScreenContainer withTopInset={false}>
        <div className="custom-station">
          {/* Horizontal step indicator — same dot+connector pattern as the
              autoservice wizard so both feel like one product. Six steps
              fit comfortably across mobile width. */}
          <nav className="custom-station__steps custom-station__steps--row" aria-label="Кроки">
            {STEPS.map((s, i) => {
              const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'todo'
              return (
                <Fragment key={s.id}>
                  <button
                    type="button"
                    className={`custom-station__step custom-station__step--${state}`}
                    onClick={() => i <= stepIndex && setStepIndex(i)}
                    disabled={i > stepIndex}
                    aria-label={s.title}
                  >
                    <span className="custom-station__step-circle">
                      {state === 'done' ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span
                      className={`custom-station__step-line ${i < stepIndex ? 'custom-station__step-line--done' : ''}`}
                    />
                  )}
                </Fragment>
              )
            })}
          </nav>

          {/* Layered station illustration — updates as the user changes
              model / color / connectors. Hidden on the very first track
              step (AC vs DC) since nothing concrete is chosen yet. */}
          {step.id !== 'track' && model && (
            <StationIllustration
              model={model}
              color={color as 'black' | 'grey' | 'white' | 'green' | 'ral'}
              picks={picks}
              className="custom-station__hero"
            />
          )}

          {/* Current step content */}
          <section className="custom-station__panel">
            <header className="custom-station__panel-head">
              <span className="custom-station__panel-num">|{step.num}|</span>
              <span className="custom-station__panel-title">{step.title}</span>
            </header>

            {step.id === 'track' && (
              <div className="custom-station__list">
                <button
                  type="button"
                  className={`custom-station__option ${trackChoice === 'ac' ? 'custom-station__option--active' : ''}`}
                  onClick={() => pickTrack('ac')}
                >
                  <span className="custom-station__option-radio" />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="custom-station__option-label">Підібрати AC-станцію</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      ECO Totem / ECO Wall · до 88 кВт
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className={`custom-station__option ${trackChoice === 'dc' ? 'custom-station__option--active' : ''}`}
                  onClick={() => pickTrack('dc')}
                >
                  <span className="custom-station__option-radio" />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="custom-station__option-label">Підібрати DC-станцію</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      TOR Wall / Mobile / Quattro · 40–480 кВт
                    </span>
                  </span>
                </button>
                <p className="custom-station__hint">
                  Безкоштовна консультація · Індивідуальний підхід
                </p>
              </div>
            )}

            {step.id === 'model' && (
              <div className="custom-station__list">
                {modelsForTrack.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    className={`custom-station__option ${model === m.value ? 'custom-station__option--active' : ''}`}
                    onClick={() => pickModel(m.value)}
                  >
                    <span className="custom-station__option-radio" />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="custom-station__option-label">{m.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {m.subtitle}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step.id === 'power' && (
              <div className="custom-station__list">
                {powerOptions.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    className={`custom-station__option ${power === kw ? 'custom-station__option--active' : ''}`}
                    onClick={() => pickPower(kw)}
                  >
                    <span className="custom-station__option-radio" />
                    <span className="custom-station__option-label">{kw} кВт</span>
                  </button>
                ))}
              </div>
            )}

            {step.id === 'connectors' && (
              <div className="custom-station__list">
                {/* Live power budget gauge — matches the "Used X of Y kW"
                 *  counter on the live ecofactortech configurator. */}
                <div className="custom-station__budget">
                  <span>Використано <b>{usedKw}</b> з <b>{power}</b> кВт</span>
                  {remainingKw > 0 && (
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      залишилось {remainingKw} кВт
                    </span>
                  )}
                </div>

                {connectorCatalog.map((c) => {
                  const row = picks.find((p) => p.id === c.id)
                  const qty = row?.qty ?? 0
                  const canAdd = usedKw + c.kw <= power
                  return (
                    <div
                      key={c.id}
                      className={`custom-station__option ${qty > 0 ? 'custom-station__option--active' : ''}`}
                      style={{ cursor: 'default' }}
                    >
                      <span className="custom-station__option-label" style={{ flex: 1 }}>
                        {c.label}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                        <button
                          type="button"
                          aria-label="Прибрати"
                          onClick={() => removeConnector(c.id)}
                          disabled={qty === 0}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: '1px solid var(--color-text)',
                            background: 'none', color: 'var(--color-text)',
                            cursor: qty === 0 ? 'not-allowed' : 'pointer',
                            opacity: qty === 0 ? 0.3 : 1, minHeight: 0,
                          }}
                        >−</button>
                        <span style={{ minWidth: 16, textAlign: 'center', fontWeight: 500 }}>{qty}</span>
                        <button
                          type="button"
                          aria-label="Додати"
                          onClick={() => addConnector(c.id)}
                          disabled={!canAdd}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: '1px solid var(--color-text)',
                            background: canAdd ? 'var(--color-text)' : 'none',
                            color: canAdd ? 'var(--color-bg)' : 'var(--color-text)',
                            cursor: canAdd ? 'pointer' : 'not-allowed',
                            opacity: canAdd ? 1 : 0.3, minHeight: 0,
                          }}
                        >+</button>
                      </span>
                    </div>
                  )
                })}
                <p className="custom-station__hint">
                  Додавайте порти, поки бюджет потужності не вичерпано.
                </p>
              </div>
            )}

            {step.id === 'options' && (
              <div className="custom-station__list">
                {OPTIONS.map((o) => {
                  const active = options.includes(o.id)
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className={`custom-station__option ${active ? 'custom-station__option--active' : ''}`}
                      onClick={() => setOptions((cur) => toggle(cur, o.id))}
                    >
                      <span className="custom-station__option-checkbox">
                        {active && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="custom-station__option-label">{o.label}</span>
                    </button>
                  )
                })}

                {/* Body color — preset swatches + RAL escape hatch. */}
                <div style={{ paddingTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                    Колір корпусу
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.id)}
                        title={c.label}
                        aria-label={c.label}
                        style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: c.swatch,
                          border: color === c.id ? '2px solid var(--color-success)' : '1px solid var(--color-border)',
                          cursor: 'pointer', padding: 0, minHeight: 0,
                          boxShadow: color === c.id ? '0 0 0 3px rgba(16, 180, 82, 0.18)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                  {color === 'ral' && (
                    <Field
                      label="Код RAL"
                      placeholder="напр. RAL 9005"
                      value={ralCode}
                      onChange={(e) => setRalCode(e.target.value)}
                    />
                  )}
                </div>

                <p className="custom-station__hint">Необовʼязково. Все, що вам потрібно.</p>
              </div>
            )}

            {step.id === 'contacts' && (
              <div className="custom-station__contacts">
                <ChipGroup
                  label="Кількість станцій"
                  required
                  options={['1', '2-5', '5-20', '20+']}
                  value={count}
                  onChange={setCount}
                />
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
                  label="Email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  helper="Необовʼязково — для надсилання комерційної пропозиції"
                />
                <Field
                  label="Місто"
                  placeholder="Київ, Одеса..."
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                />
                <Field
                  as="textarea"
                  label="Коментар"
                  placeholder="Особливості обʼєкту, термін, обʼєм..."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            )}
          </section>

          {/* Sticky bottom controls */}
          <footer className="custom-station__controls">
            <button
              type="button"
              className="custom-station__back"
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
              className="custom-station__next"
            >
              {isLast ? 'НАДІСЛАТИ' : 'ДАЛІ'}
            </Button>
          </footer>
        </div>
      </ScreenContainer>
    </>
  )
}
