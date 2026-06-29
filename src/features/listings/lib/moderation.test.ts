import { describe, it, expect } from 'vitest'
import { classifyListing } from './moderation'

describe('classifyListing — energy-only moderation', () => {
  it('accepts an EV charging station', () => {
    const v = classifyListing({ title: 'Зарядна станція 7 кВт Type 2', description: 'Wallbox для електромобіля', imagesCount: 1 })
    expect(v.allowed).toBe(true)
    expect(v.relevant).toBe(true)
    expect(v.score).toBeGreaterThanOrEqual(0.5)
    expect(v.category).toBeTruthy()
  })

  it('accepts a solar panel + inverter', () => {
    const v = classifyListing({ title: 'Сонячна панель 450W', description: 'Інвертор гібридний MPPT' })
    expect(v.relevant).toBe(true)
    expect(v.score).toBeGreaterThanOrEqual(0.5)
  })

  it('accepts a portable power station', () => {
    const v = classifyListing({ title: 'Портативна зарядна станція EcoFlow', description: 'Powerbank 1000Вт' })
    expect(v.relevant).toBe(true)
  })

  it('rejects an off-topic item (sofa)', () => {
    const v = classifyListing({ title: 'Диван шкіряний', description: 'Майже новий, самовивіз' })
    expect(v.relevant).toBe(false)
    expect(v.score).toBeLessThan(0.5)
    expect(v.reasons.join(' ')).toMatch(/енергетик/i)
  })

  it('hard-rejects prohibited content regardless of wording', () => {
    const v = classifyListing({ title: 'Зброя пневматична', description: 'набої в комплекті' })
    expect(v.allowed).toBe(false)
    expect(v.relevant).toBe(false)
    expect(v.score).toBe(0)
  })

  it('treats two supporting energy terms as relevant', () => {
    const v = classifyListing({ title: 'Кабель 380В', description: 'трифазний, висока потужність' })
    expect(v.relevant).toBe(true)
  })
})
