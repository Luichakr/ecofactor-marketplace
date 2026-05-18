import { useEffect, useMemo, useRef, useState } from 'react'
import './PhoneInput.css'

/**
 * Country presets. `mask` uses `#` for a digit placeholder; everything else
 * is a literal separator inserted as the user types.
 */
type Country = {
  code: string // ISO 3166-1 alpha-2
  name: string
  dial: string // "+380"
  mask: string // "(##) ###-##-##"
}

const COUNTRIES: Country[] = [
  { code: 'UA', name: 'Україна', dial: '+380', mask: '(##) ###-##-##' },
  { code: 'PL', name: 'Polska', dial: '+48', mask: '###-###-###' },
  { code: 'DE', name: 'Deutschland', dial: '+49', mask: '### #######' },
  { code: 'US', name: 'USA / Canada', dial: '+1', mask: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', mask: '#### ######' },
  { code: 'GE', name: 'საქართველო', dial: '+995', mask: '### ## ## ##' },
  { code: 'MD', name: 'Moldova', dial: '+373', mask: '### ## ## ##' },
  { code: 'RO', name: 'România', dial: '+40', mask: '### ### ###' },
  { code: 'SK', name: 'Slovensko', dial: '+421', mask: '### ### ###' },
  { code: 'CZ', name: 'Česko', dial: '+420', mask: '### ### ###' },
  { code: 'HU', name: 'Magyarország', dial: '+36', mask: '## ### ####' },
]

const DEFAULT_COUNTRY = 'UA'

function detectCountryFromBrowser(): string {
  if (typeof navigator === 'undefined') return DEFAULT_COUNTRY
  const lang = navigator.language || ''
  const region = lang.split('-')[1]?.toUpperCase()
  if (region && COUNTRIES.some((c) => c.code === region)) return region
  return DEFAULT_COUNTRY
}

function applyMask(digits: string, mask: string): string {
  let out = ''
  let i = 0
  for (const ch of mask) {
    if (i >= digits.length) break
    if (ch === '#') {
      out += digits[i]
      i++
    } else {
      out += ch
    }
  }
  return out
}

function countDigitsInMask(mask: string): number {
  return [...mask].filter((c) => c === '#').length
}

export type PhoneValue = {
  /** ISO 3166-1 alpha-2 country code, e.g. "UA" */
  country: string
  /** Dial prefix incl. plus, e.g. "+380" */
  dial: string
  /** Local digits only (without dial), e.g. "501234567" */
  digits: string
  /** Fully formatted e.164-like string for submission, e.g. "+380501234567" */
  e164: string
}

type Props = {
  value?: PhoneValue
  onChange?: (value: PhoneValue) => void
  required?: boolean
  /** Visible label above the input. Show "*" automatically if `required`. */
  label?: string
  /** Optional error message shown below the input. */
  error?: string
  /** Optional helper text shown below the input when no error. */
  helper?: string
  /** ID for form association. */
  id?: string
  name?: string
}

export function PhoneInput({
  value,
  onChange,
  required,
  label = 'Телефон',
  error,
  helper,
  id,
  name,
}: Props) {
  const [country, setCountry] = useState<string>(value?.country ?? detectCountryFromBrowser())
  const [digits, setDigits] = useState<string>(value?.digits ?? '')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const current = useMemo<Country>(
    () => COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0],
    [country],
  )

  const maxDigits = countDigitsInMask(current.mask)

  // Emit changes upward.
  useEffect(() => {
    onChange?.({
      country,
      dial: current.dial,
      digits,
      e164: digits ? `${current.dial}${digits}` : '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, digits])

  // Close country dropdown on outside click.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, maxDigits)
    setDigits(cleaned)
  }

  const formatted = applyMask(digits, current.mask)
  const placeholder = current.mask.replace(/#/g, '_')
  const inputId = id ?? `phone-${country}`
  const isComplete = digits.length === maxDigits

  return (
    <div className="phone-input" ref={wrapperRef}>
      <label htmlFor={inputId} className="phone-input__label">
        {label}
        {required && <span className="phone-input__required" aria-hidden="true"> *</span>}
      </label>

      <div className="phone-input__row">
        <button
          type="button"
          className="phone-input__country"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="phone-input__country-code">{current.code}</span>
          <span className="phone-input__country-dial">{current.dial}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </button>

        <input
          id={inputId}
          name={name}
          type="tel"
          className="phone-input__field"
          value={formatted}
          onChange={handleInput}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="tel"
          required={required}
        />
      </div>

      {open && (
        <ul className="phone-input__dropdown" role="listbox">
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                className={`phone-input__option ${c.code === country ? 'phone-input__option--active' : ''}`}
                onClick={() => {
                  setCountry(c.code)
                  setDigits('')
                  setOpen(false)
                }}
              >
                <span className="phone-input__option-code">{c.code}</span>
                <span className="phone-input__option-name">{c.name}</span>
                <span className="phone-input__option-dial">{c.dial}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className="phone-input__error">{error}</p>
      ) : helper ? (
        <p className="phone-input__helper">{helper}</p>
      ) : !isComplete && digits.length > 0 ? (
        <p className="phone-input__helper">Введіть {maxDigits} цифр</p>
      ) : null}
    </div>
  )
}

export { COUNTRIES, detectCountryFromBrowser }
