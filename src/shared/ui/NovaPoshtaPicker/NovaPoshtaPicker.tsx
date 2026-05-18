import { useEffect, useState } from 'react'
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
import type { NovaPoshtaSelection } from '../NovaPoshtaDelivery/NovaPoshtaDelivery'
import './NovaPoshtaPicker.css'

type Props = {
  open: boolean
  initial?: NovaPoshtaSelection
  onCancel: () => void
  onConfirm: (selection: { city: NpSettlement; warehouse: NpWarehouse; branchType: 'any' | 'branch' | 'postomat' }) => void
}

const SEARCH_DEBOUNCE_MS = 300

/**
 * Full-screen Nova Poshta delivery point picker — opens on top of the
 * checkout step when the user taps "Choose branch" inside the НП card.
 * Mirrors the Zara "Выбрать пункт выдачи" screen.
 */
export function NovaPoshtaPicker({ open, initial, onCancel, onConfirm }: Props) {
  const [cityQuery, setCityQuery] = useState<string>(initial?.city?.MainDescription ?? '')
  const [cityOptions, setCityOptions] = useState<NpSettlement[]>([])
  const [city, setCity] = useState<NpSettlement | null>(initial?.city ?? null)
  const [cityLoading, setCityLoading] = useState(false)

  const [whSearch, setWhSearch] = useState('')
  const [warehouses, setWarehouses] = useState<NpWarehouse[]>([])
  const [whLoading, setWhLoading] = useState(false)
  const [warehouse, setWarehouse] = useState<NpWarehouse | null>(initial?.warehouse ?? null)
  const [branchType, setBranchType] = useState<'any' | 'branch' | 'postomat'>(initial?.branchType ?? 'any')

  const usingMock = !hasApiKey()

  // Reset when opened — sync with `initial`
  useEffect(() => {
    if (!open) return
    setCity(initial?.city ?? null)
    setCityQuery(initial?.city?.MainDescription ?? '')
    setWarehouse(initial?.warehouse ?? null)
    setBranchType(initial?.branchType ?? 'any')
    setWhSearch('')
    setCityOptions([])
  }, [open, initial])

  // Search cities (debounced)
  useEffect(() => {
    if (!open) return
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
        if (!cancelled) setCityOptions(rows)
      } catch {
        if (!cancelled) setCityOptions(mockSearchSettlements(q))
      } finally {
        if (!cancelled) setCityLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [cityQuery, city, usingMock, open])

  // Load warehouses when city changes (or search changes)
  useEffect(() => {
    if (!open) return
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
        if (!cancelled) setWarehouses(rows)
      } catch {
        if (!cancelled) setWarehouses(mockGetWarehouses(city.Ref, whSearch))
      } finally {
        if (!cancelled) setWhLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [city, whSearch, usingMock, open])

  if (!open) return null

  const filtered = (() => {
    if (branchType === 'any') return warehouses
    if (branchType === 'postomat') return warehouses.filter((w) => w.TypeOfWarehouse === NP_TYPE_POSTOMAT)
    return warehouses.filter((w) => w.TypeOfWarehouse !== NP_TYPE_POSTOMAT)
  })()

  function pickCity(s: NpSettlement) {
    setCity(s)
    setCityQuery(s.MainDescription)
    setCityOptions([])
    setWarehouse(null)
    setWhSearch('')
  }

  return (
    <div className="np-picker" role="dialog" aria-modal="true">
      <header className="np-picker__header">
        <button type="button" className="np-picker__close" onClick={onCancel} aria-label="Закрити">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        <h2 className="np-picker__title">Обрати пункт видачі</h2>
      </header>

      <div className="np-picker__body">
        {usingMock && (
          <p className="np-picker__notice">ДЕМО: мок-дані. Налаштуйте VITE_NOVA_POSHTA_API_KEY для живих даних.</p>
        )}

        {/* City */}
        <label className="np-picker__field-label" htmlFor="np-picker-city">МІСТО</label>
        <input
          id="np-picker-city"
          type="text"
          className="np-picker__input"
          placeholder="Почніть вводити назву міста"
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value)
            if (city && e.target.value !== city.MainDescription) setCity(null)
          }}
          autoComplete="address-level2"
        />
        {cityLoading && <p className="np-picker__hint">Пошук...</p>}
        {cityOptions.length > 0 && !city && (
          <ul className="np-picker__city-list">
            {cityOptions.map((s) => (
              <li key={s.Ref}>
                <button type="button" className="np-picker__city-option" onClick={() => pickCity(s)}>
                  <span className="np-picker__city-main">{s.SettlementTypeCode} {s.MainDescription}</span>
                  <span className="np-picker__city-area">{s.Area}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Branch type filter */}
        {city && (
          <>
            <div className="np-picker__type">
              <button
                type="button"
                className={`np-picker__type-tab ${branchType === 'any' ? 'np-picker__type-tab--active' : ''}`}
                onClick={() => setBranchType('any')}
              >ВСІ</button>
              <button
                type="button"
                className={`np-picker__type-tab ${branchType === 'branch' ? 'np-picker__type-tab--active' : ''}`}
                onClick={() => setBranchType('branch')}
              >ВІДДІЛЕННЯ</button>
              <button
                type="button"
                className={`np-picker__type-tab ${branchType === 'postomat' ? 'np-picker__type-tab--active' : ''}`}
                onClick={() => setBranchType('postomat')}
              >ПОШТОМАТ</button>
            </div>

            {/* Warehouse search */}
            <input
              type="text"
              className="np-picker__input"
              placeholder="Адреса або номер відділення"
              value={whSearch}
              onChange={(e) => setWhSearch(e.target.value)}
            />

            {/* Warehouse list */}
            {whLoading && <p className="np-picker__hint">Завантаження...</p>}
            {!whLoading && filtered.length === 0 && (
              <p className="np-picker__hint">Нічого не знайдено</p>
            )}
            {!whLoading && filtered.length > 0 && (
              <ul className="np-picker__wh-list">
                {filtered.slice(0, 100).map((w) => {
                  const isPostomat = w.TypeOfWarehouse === NP_TYPE_POSTOMAT
                  const isActive = warehouse?.Ref === w.Ref
                  return (
                    <li key={w.Ref}>
                      <button
                        type="button"
                        className={`np-picker__wh ${isActive ? 'np-picker__wh--active' : ''}`}
                        onClick={() => setWarehouse(w)}
                      >
                        <span className="np-picker__wh-radio" />
                        <span className="np-picker__wh-body">
                          <span className="np-picker__wh-title">
                            {isPostomat ? 'Поштомат' : 'Відділення'} №{w.Number}
                          </span>
                          <span className="np-picker__wh-addr">
                            {w.ShortAddressDescription ?? w.Description}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            {filtered.length > 100 && (
              <p className="np-picker__hint">Уточніть пошук — показано 100 з {filtered.length}</p>
            )}
          </>
        )}
      </div>

      <footer className="np-picker__footer">
        <button
          type="button"
          className="np-picker__confirm"
          disabled={!city || !warehouse}
          onClick={() => {
            if (city && warehouse) onConfirm({ city, warehouse, branchType })
          }}
        >
          ОБРАТИ
        </button>
      </footer>
    </div>
  )
}
