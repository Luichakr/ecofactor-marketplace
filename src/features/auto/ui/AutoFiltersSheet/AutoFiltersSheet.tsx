import { useMemo, useState, useEffect } from 'react'
import { BottomSheet } from '../../../../shared/ui/BottomSheet/BottomSheet'
import { Button } from '../../../../shared/ui/Button/Button'
import type { AutoCard } from '../../api/lubeavtoApi'
import './AutoFiltersSheet.css'

export type AutoFilterValue = {
  makes: string[]
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  mileageMaxKm?: number
  transmission?: string
  drive?: string
}

type Props = {
  open: boolean
  onClose: () => void
  value: AutoFilterValue
  onApply: (next: AutoFilterValue) => void
  /** All cars before filters — used to derive facet lists and ranges. */
  source: AutoCard[]
  /** Count of cars that would match the current draft. */
  matchCount: number
}

const EMPTY: AutoFilterValue = { makes: [] }

export function AutoFiltersSheet({ open, onClose, value, onApply, source, matchCount }: Props) {
  const [draft, setDraft] = useState<AutoFilterValue>(value)

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  const facets = useMemo(() => {
    const makes = new Map<string, number>()
    const transmissions = new Set<string>()
    const drives = new Set<string>()
    let yMin = Infinity, yMax = -Infinity
    let pMin = Infinity, pMax = -Infinity
    for (const c of source) {
      if (c.make) makes.set(c.make, (makes.get(c.make) ?? 0) + 1)
      if (c.transmission && c.transmission !== '—') transmissions.add(c.transmission)
      if (c.drive && c.drive !== '—') drives.add(c.drive)
      if (c.year > 0) { yMin = Math.min(yMin, c.year); yMax = Math.max(yMax, c.year) }
      if (c.priceUsd > 0) { pMin = Math.min(pMin, c.priceUsd); pMax = Math.max(pMax, c.priceUsd) }
    }
    return {
      makes: [...makes.entries()].sort((a, b) => b[1] - a[1]),
      transmissions: [...transmissions].sort(),
      drives: [...drives].sort(),
      yMin: Number.isFinite(yMin) ? yMin : undefined,
      yMax: Number.isFinite(yMax) ? yMax : undefined,
      pMin: Number.isFinite(pMin) ? pMin : undefined,
      pMax: Number.isFinite(pMax) ? pMax : undefined,
    }
  }, [source])

  function toggleMake(m: string) {
    setDraft((d) => ({
      ...d,
      makes: d.makes.includes(m) ? d.makes.filter((x) => x !== m) : [...d.makes, m],
    }))
  }

  function setNum(key: keyof AutoFilterValue, raw: string) {
    const n = raw.trim() === '' ? undefined : Number(raw)
    setDraft((d) => ({ ...d, [key]: Number.isFinite(n) ? n : undefined }))
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="ФІЛЬТРИ" maxHeightPct={92}>
      <div className="auto-filters">
        {/* Make */}
        {facets.makes.length > 0 && (
          <section className="auto-filters__section">
            <h3 className="auto-filters__title">|01| ВИРОБНИК</h3>
            <div className="auto-filters__chips">
              {facets.makes.map(([m, n]) => {
                const active = draft.makes.includes(m)
                return (
                  <button
                    key={m}
                    type="button"
                    className={`auto-filters__chip ${active ? 'auto-filters__chip--active' : ''}`}
                    onClick={() => toggleMake(m)}
                  >
                    {m} <span className="auto-filters__chip-n">{n}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Year range */}
        <section className="auto-filters__section">
          <h3 className="auto-filters__title">|02| РІК</h3>
          <div className="auto-filters__range">
            <input
              type="number"
              inputMode="numeric"
              placeholder={facets.yMin ? String(facets.yMin) : 'від'}
              value={draft.yearMin ?? ''}
              onChange={(e) => setNum('yearMin', e.target.value)}
              className="auto-filters__num"
            />
            <span className="auto-filters__dash">—</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder={facets.yMax ? String(facets.yMax) : 'до'}
              value={draft.yearMax ?? ''}
              onChange={(e) => setNum('yearMax', e.target.value)}
              className="auto-filters__num"
            />
          </div>
        </section>

        {/* Price range */}
        <section className="auto-filters__section">
          <h3 className="auto-filters__title">|03| ЦІНА, $</h3>
          <div className="auto-filters__range">
            <input
              type="number"
              inputMode="numeric"
              placeholder={facets.pMin ? String(Math.floor(facets.pMin)) : 'від'}
              value={draft.priceMin ?? ''}
              onChange={(e) => setNum('priceMin', e.target.value)}
              className="auto-filters__num"
            />
            <span className="auto-filters__dash">—</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder={facets.pMax ? String(Math.ceil(facets.pMax)) : 'до'}
              value={draft.priceMax ?? ''}
              onChange={(e) => setNum('priceMax', e.target.value)}
              className="auto-filters__num"
            />
          </div>
        </section>

        {/* Mileage max */}
        <section className="auto-filters__section">
          <h3 className="auto-filters__title">|04| ПРОБІГ, КМ</h3>
          <div className="auto-filters__range">
            <input
              type="number"
              inputMode="numeric"
              placeholder="не більше"
              value={draft.mileageMaxKm ?? ''}
              onChange={(e) => setNum('mileageMaxKm', e.target.value)}
              className="auto-filters__num auto-filters__num--wide"
            />
          </div>
        </section>

        {/* Transmission */}
        {facets.transmissions.length > 0 && (
          <section className="auto-filters__section">
            <h3 className="auto-filters__title">|05| КПП</h3>
            <div className="auto-filters__chips">
              {facets.transmissions.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`auto-filters__chip ${draft.transmission === t ? 'auto-filters__chip--active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, transmission: d.transmission === t ? undefined : t }))}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Drive */}
        {facets.drives.length > 0 && (
          <section className="auto-filters__section">
            <h3 className="auto-filters__title">|06| ПРИВІД</h3>
            <div className="auto-filters__chips">
              {facets.drives.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`auto-filters__chip ${draft.drive === d ? 'auto-filters__chip--active' : ''}`}
                  onClick={() => setDraft((cur) => ({ ...cur, drive: cur.drive === d ? undefined : d }))}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="auto-filters__cta">
          <Button variant="outline" fullWidth size="lg" onClick={() => setDraft(EMPTY)}>
            СКИНУТИ
          </Button>
          <Button variant="primary" fullWidth size="lg" onClick={() => { onApply(draft); onClose() }}>
            ПОКАЗАТИ {matchCount}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export function applyAutoFilters(cars: AutoCard[], f: AutoFilterValue): AutoCard[] {
  return cars.filter((c) => {
    if (f.makes.length > 0 && !f.makes.includes(c.make)) return false
    if (f.yearMin !== undefined && c.year < f.yearMin) return false
    if (f.yearMax !== undefined && c.year > f.yearMax) return false
    if (f.priceMin !== undefined && c.priceUsd < f.priceMin) return false
    if (f.priceMax !== undefined && c.priceUsd > f.priceMax) return false
    if (f.mileageMaxKm !== undefined && c.mileageKm > f.mileageMaxKm) return false
    if (f.transmission && c.transmission !== f.transmission) return false
    if (f.drive && c.drive !== f.drive) return false
    return true
  })
}

export function countActiveAutoFilters(f: AutoFilterValue): number {
  let n = 0
  if (f.makes.length > 0) n += 1
  if (f.yearMin !== undefined || f.yearMax !== undefined) n += 1
  if (f.priceMin !== undefined || f.priceMax !== undefined) n += 1
  if (f.mileageMaxKm !== undefined) n += 1
  if (f.transmission) n += 1
  if (f.drive) n += 1
  return n
}
