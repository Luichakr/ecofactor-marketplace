import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getWarehouses,
  hasApiKey,
  searchSettlements,
} from '../../api/novaposhta/client'
import {
  mockGetWarehouses,
  mockSearchSettlements,
} from '../../api/novaposhta/mockData'
import { NP_TYPE_POSTOMAT, type NpSettlement, type NpWarehouse } from '../../api/novaposhta/types'
import './NovaPoshtaDelivery.css'

export type NovaPoshtaSelection = {
  city: NpSettlement | null
  warehouse: NpWarehouse | null
  /** Optional filter — "branch" or "postomat" */
  branchType?: 'branch' | 'postomat' | 'any'
}

type Props = {
  value?: NovaPoshtaSelection
  onChange?: (value: NovaPoshtaSelection) => void
  required?: boolean
  label?: string
}

const SEARCH_DEBOUNCE_MS = 300

export function NovaPoshtaDelivery({
  value,
  onChange,
  required = false,
  label = 'Доставка Новою Поштою',
}: Props) {
  const [cityQuery, setCityQuery] = useState<string>(value?.city?.MainDescription ?? '')
  const [cityOptions, setCityOptions] = useState<NpSettlement[]>([])
  const [city, setCity] = useState<NpSettlement | null>(value?.city ?? null)
  const [cityOpen, setCityOpen] = useState(false)
  const [cityLoading, setCityLoading] = useState(false)

  const [whSearch, setWhSearch] = useState<string>('')
  const [warehouses, setWarehouses] = useState<NpWarehouse[]>([])
  const [whLoading, setWhLoading] = useState(false)
  const [warehouse, setWarehouse] = useState<NpWarehouse | null>(value?.warehouse ?? null)
  const [branchType, setBranchType] = useState<'any' | 'branch' | 'postomat'>(value?.branchType ?? 'any')

  const wrapperRef = useRef<HTMLDivElement>(null)
  const usingMock = !hasApiKey()

  // Emit changes upward.
  useEffect(() => {
    onChange?.({ city, warehouse, branchType })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, warehouse, branchType])

  // Search settlements when query changes.
  useEffect(() => {
    const q = cityQuery.trim()
    if (city && city.MainDescription === q) {
      setCityOptions([])
      return
    }
    if (q.length < 2) {
      setCityOptions([])
      return
    }
    let cancelled = false
    setCityLoading(true)
    const handle = setTimeout(async () => {
      try {
        const rows = usingMock ? mockSearchSettlements(q) : await searchSettlements(q, 10)
        if (cancelled) return
        setCityOptions(rows)
      } catch {
        if (cancelled) return
        // Fall back to mock if real call fails (no key, CORS, etc.)
        setCityOptions(mockSearchSettlements(q))
      } finally {
        if (!cancelled) setCityLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [cityQuery, city, usingMock])

  // Load warehouses when city or warehouse query changes.
  useEffect(() => {
    if (!city) {
      setWarehouses([])
      return
    }
    let cancelled = false
    setWhLoading(true)
    ;(async () => {
      try {
        const rows = usingMock
          ? mockGetWarehouses(city.Ref, whSearch)
          : await getWarehouses(city.Ref, { findByString: whSearch })
        if (cancelled) return
        setWarehouses(rows)
      } catch {
        if (cancelled) return
        setWarehouses(mockGetWarehouses(city.Ref, whSearch))
      } finally {
        if (!cancelled) setWhLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [city, whSearch, usingMock])

  // Close city dropdown on outside click.
  useEffect(() => {
    if (!cityOpen) return
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setCityOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [cityOpen])

  // Filter warehouses by branch type.
  const filteredWarehouses = useMemo(() => {
    if (branchType === 'any') return warehouses
    if (branchType === 'postomat') return warehouses.filter((w) => w.TypeOfWarehouse === NP_TYPE_POSTOMAT)
    return warehouses.filter((w) => w.TypeOfWarehouse !== NP_TYPE_POSTOMAT)
  }, [warehouses, branchType])

  function pickCity(s: NpSettlement) {
    setCity(s)
    setCityQuery(s.MainDescription)
    setCityOpen(false)
    setCityOptions([])
    // Reset warehouse selection when city changes
    setWarehouse(null)
    setWhSearch('')
  }

  function clearCity() {
    setCity(null)
    setCityQuery('')
    setCityOptions([])
    setWarehouse(null)
    setWhSearch('')
    setWarehouses([])
  }

  return (
    <div className="np-delivery" ref={wrapperRef}>
      <div className="np-delivery__head">
        <span className="np-delivery__label">
          {label}
          {required && <span className="np-delivery__required" aria-hidden="true"> *</span>}
        </span>
        <span className="np-delivery__brand">НОВА ПОШТА</span>
      </div>

      {usingMock && (
        <p className="np-delivery__notice">
          ДЕМО: відображено мок-дані. Налаштуйте VITE_NOVA_POSHTA_API_KEY у .env.local для живих даних.
        </p>
      )}

      {/* City search */}
      <div className="np-delivery__city">
        <label className="np-delivery__field-label" htmlFor="np-city">МІСТО</label>
        <div className="np-delivery__city-row">
          <input
            id="np-city"
            type="text"
            className="np-delivery__city-input"
            placeholder="Почніть вводити назву міста"
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value)
              setCityOpen(true)
              if (city && e.target.value !== city.MainDescription) setCity(null)
            }}
            onFocus={() => setCityOpen(true)}
            autoComplete="address-level2"
          />
          {city && (
            <button
              type="button"
              className="np-delivery__clear"
              onClick={clearCity}
              aria-label="Очистити"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {cityOpen && cityOptions.length > 0 && !city && (
          <ul className="np-delivery__dropdown" role="listbox">
            {cityOptions.map((s) => (
              <li key={s.Ref}>
                <button type="button" className="np-delivery__option" onClick={() => pickCity(s)}>
                  <span className="np-delivery__option-main">{s.SettlementTypeCode} {s.MainDescription}</span>
                  <span className="np-delivery__option-area">{s.Area}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {cityLoading && <p className="np-delivery__hint">Пошук...</p>}
      </div>

      {/* Branch type toggle */}
      {city && (
        <div className="np-delivery__type">
          <button
            type="button"
            className={`np-delivery__type-tab ${branchType === 'any' ? 'np-delivery__type-tab--active' : ''}`}
            onClick={() => setBranchType('any')}
          >ВСІ</button>
          <button
            type="button"
            className={`np-delivery__type-tab ${branchType === 'branch' ? 'np-delivery__type-tab--active' : ''}`}
            onClick={() => setBranchType('branch')}
          >ВІДДІЛЕННЯ</button>
          <button
            type="button"
            className={`np-delivery__type-tab ${branchType === 'postomat' ? 'np-delivery__type-tab--active' : ''}`}
            onClick={() => setBranchType('postomat')}
          >ПОШТОМАТ</button>
        </div>
      )}

      {/* Warehouse search + list */}
      {city && (
        <div className="np-delivery__warehouses">
          <label className="np-delivery__field-label" htmlFor="np-wh">
            ВІДДІЛЕННЯ / ПОШТОМАТ {required && <span className="np-delivery__required" aria-hidden="true">*</span>}
          </label>
          <input
            id="np-wh"
            type="text"
            className="np-delivery__wh-input"
            placeholder="Адреса, номер відділення..."
            value={whSearch}
            onChange={(e) => setWhSearch(e.target.value)}
          />

          {whLoading && <p className="np-delivery__hint">Завантаження...</p>}

          {!whLoading && filteredWarehouses.length === 0 && (
            <p className="np-delivery__hint">Нічого не знайдено</p>
          )}

          {!whLoading && filteredWarehouses.length > 0 && (
            <ul className="np-delivery__wh-list">
              {filteredWarehouses.slice(0, 50).map((w) => {
                const isPostomat = w.TypeOfWarehouse === NP_TYPE_POSTOMAT
                const isActive = warehouse?.Ref === w.Ref
                return (
                  <li key={w.Ref}>
                    <button
                      type="button"
                      className={`np-delivery__wh-item ${isActive ? 'np-delivery__wh-item--active' : ''}`}
                      onClick={() => setWarehouse(w)}
                    >
                      <span className="np-delivery__wh-radio" />
                      <span className="np-delivery__wh-body">
                        <span className="np-delivery__wh-title">
                          {isPostomat ? 'Поштомат' : 'Відділення'} №{w.Number}
                        </span>
                        <span className="np-delivery__wh-addr">
                          {w.ShortAddressDescription ?? w.Description}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {filteredWarehouses.length > 50 && (
            <p className="np-delivery__hint">Уточніть пошук — показано перші 50 з {filteredWarehouses.length}</p>
          )}
        </div>
      )}

      {/* Selected summary */}
      {city && warehouse && (
        <div className="np-delivery__summary">
          <span className="np-delivery__summary-label">ОБРАНО</span>
          <span className="np-delivery__summary-value">
            {city.MainDescription} — {warehouse.TypeOfWarehouse === NP_TYPE_POSTOMAT ? 'Поштомат' : 'Відділення'} №{warehouse.Number}
          </span>
          <span className="np-delivery__summary-addr">{warehouse.ShortAddressDescription ?? warehouse.Description}</span>
        </div>
      )}
    </div>
  )
}
