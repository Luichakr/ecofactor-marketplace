import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../../shared/ui/Header/Header'
import { ScreenContainer } from '../../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../../shared/ui/Button/Button'
import { Field } from '../../../shared/ui/Field/Field'
import { ChipGroup } from '../../../shared/ui/ChipGroup/ChipGroup'
import { PhoneInput, type PhoneValue } from '../../../shared/ui/PhoneInput/PhoneInput'
import { REQUEST_PATHS, ROUTES } from '../../../shared/config/routes'
import { leads } from '../../leads/model/leadsStore'
import './CustomStationForm.css'

type StepId = 'model' | 'power' | 'connectors' | 'options' | 'contacts'

const STEPS: { id: StepId; num: string; title: string }[] = [
  { id: 'model', num: '01', title: 'Тип станції' },
  { id: 'power', num: '02', title: 'Потужність' },
  { id: 'connectors', num: '03', title: 'Конектори' },
  { id: 'options', num: '04', title: 'Опції' },
  { id: 'contacts', num: '05', title: 'Контакти' },
]

const MODELS = [
  { value: 'home-ac', label: 'Домашня AC' },
  { value: 'commercial-ac', label: 'Комерційна AC' },
  { value: 'public-dc', label: 'Громадська DC' },
  { value: 'fast-dc', label: 'Швидка DC (50+ кВт)' },
  { value: 'ultra-dc', label: 'Ультра DC (150+ кВт)' },
]

const POWERS_BY_MODEL: Record<string, string[]> = {
  'home-ac': ['3.5 кВт', '7 кВт', '11 кВт', '22 кВт'],
  'commercial-ac': ['11 кВт', '22 кВт', '44 кВт'],
  'public-dc': ['30 кВт', '60 кВт'],
  'fast-dc': ['60 кВт', '100 кВт', '150 кВт'],
  'ultra-dc': ['150 кВт', '200 кВт', '300 кВт', '400 кВт'],
}

const ALL_POWERS = ['3.5 кВт', '7 кВт', '11 кВт', '22 кВт', '44 кВт', '60 кВт', '100 кВт', '150 кВт', '200 кВт', '300 кВт', '400 кВт']

const CONNECTORS = [
  { id: 'type2', label: 'Type 2' },
  { id: 'type1', label: 'Type 1' },
  { id: 'ccs2', label: 'CCS2' },
  { id: 'chademo', label: 'CHAdeMO' },
  { id: 'gbt', label: 'GB/T' },
  { id: 'schuko', label: 'Schuko' },
]

const OPTIONS = [
  { id: 'rfid', label: 'RFID-карти' },
  { id: 'payment', label: 'Платіжний термінал' },
  { id: 'app', label: 'Інтеграція з додатком ECOFACTOR' },
  { id: 'backup', label: 'Резервне живлення' },
  { id: 'lights', label: 'LED-підсвітка' },
  { id: 'barrier-free', label: 'Доступність для людей з інвалідністю' },
  { id: 'weather', label: 'Захист від погоди (IP54+)' },
  { id: 'cable-mgmt', label: 'Cable management system' },
]

export function CustomStationForm() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const [model, setModel] = useState('')
  const [power, setPower] = useState('')
  const [connectors, setConnectors] = useState<string[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [count, setCount] = useState('1')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [comment, setComment] = useState('')

  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  // Per-step validation
  const stepValid = ((): boolean => {
    switch (step.id) {
      case 'model':
        return model.length > 0
      case 'power':
        return power.length > 0
      case 'connectors':
        return connectors.length > 0
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

  function handleNext() {
    if (!stepValid) return
    if (isLast) {
      leads.add({
        type: 'custom-station',
        name,
        phone: phone?.e164,
        email,
        message: comment,
        payload: { model, power, connectors, options, count, city },
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

  // Filter power options to the chosen model
  const powerOptions = model ? POWERS_BY_MODEL[model] ?? ALL_POWERS : ALL_POWERS

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
          {/* Step indicator */}
          <nav className="custom-station__steps" aria-label="Кроки">
            {STEPS.map((s, i) => {
              const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'todo'
              return (
                <button
                  key={s.id}
                  className={`custom-station__step custom-station__step--${state}`}
                  onClick={() => i <= stepIndex && setStepIndex(i)}
                  disabled={i > stepIndex}
                  type="button"
                >
                  <span className="custom-station__step-circle">
                    {state === 'done' ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="custom-station__step-num">{s.num}</span>
                    )}
                  </span>
                  <span className="custom-station__step-label">{s.title}</span>
                </button>
              )
            })}
          </nav>

          {/* Current step content */}
          <section className="custom-station__panel">
            <header className="custom-station__panel-head">
              <span className="custom-station__panel-num">|{step.num}|</span>
              <span className="custom-station__panel-title">{step.title}</span>
            </header>

            {step.id === 'model' && (
              <div className="custom-station__list">
                {MODELS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    className={`custom-station__option ${model === m.value ? 'custom-station__option--active' : ''}`}
                    onClick={() => setModel(m.value)}
                  >
                    <span className="custom-station__option-radio" />
                    <span className="custom-station__option-label">{m.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step.id === 'power' && (
              <div className="custom-station__list">
                {powerOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`custom-station__option ${power === p ? 'custom-station__option--active' : ''}`}
                    onClick={() => setPower(p)}
                  >
                    <span className="custom-station__option-radio" />
                    <span className="custom-station__option-label">{p}</span>
                  </button>
                ))}
              </div>
            )}

            {step.id === 'connectors' && (
              <div className="custom-station__list">
                {CONNECTORS.map((c) => {
                  const active = connectors.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`custom-station__option ${active ? 'custom-station__option--active' : ''}`}
                      onClick={() => setConnectors((cur) => toggle(cur, c.id))}
                    >
                      <span className="custom-station__option-checkbox">
                        {active && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="custom-station__option-label">{c.label}</span>
                    </button>
                  )
                })}
                <p className="custom-station__hint">Можна обрати кілька</p>
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
