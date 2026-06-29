import type { ModerationVerdict } from '../model/listingsStore'

/**
 * Draft, client-side AI pre-screen for user listings.
 *
 * The ECOFACTOR marketplace accepts ONLY energy-related goods (EV charging,
 * solar, batteries/inverters, cables/connectors, portable power). This
 * keyword classifier is the no-backend fallback: it reads the title +
 * description and decides whether the listing is on-topic and not prohibited.
 *
 * When `VITE_API_BASE` is configured, the Cloudflare Worker replaces this with
 * a real Claude vision+text moderation pass that also inspects the photos. The
 * verdict shape is identical, so the UI is the same either way.
 */

type Category = { label: string; terms: string[]; weight: number }

// Strong signals — a single hit is a confident energy match. Substring/stem
// matching catches Ukrainian declensions (e.g. "зарядк" → зарядка/зарядки/…).
const STRONG: Category[] = [
  {
    label: 'EV-зарядка',
    weight: 2,
    terms: [
      'зарядн', 'зарядк', 'зарядна стан', 'ev-', 'ev ', 'електромобіл', 'електрокар',
      'wallbox', 'воллбокс', 'evse', 'type 1', 'type1', 'type 2', 'type2', 'ccs',
      'chademo', 'gb/t', 'gbt', 'зарядний пристрій', 'charger', 'charging',
    ],
  },
  {
    label: 'Кабелі та конектори',
    weight: 2,
    terms: ['кабель type', 'зарядний кабель', 'конектор', 'коннектор', 'evse кабель', 'mode 3', 'mode 2'],
  },
  {
    label: 'Сонячні панелі',
    weight: 2,
    terms: ['сонячн', 'сонячна панель', 'фотоелемент', 'фотомодул', 'фотовольта', 'solar', 'pv-модул', 'pv модул'],
  },
  {
    label: 'Інвертори та ДБЖ',
    weight: 2,
    terms: ['інвертор', 'інвертер', 'inverter', 'дбж', 'ups', 'безперебійн', 'mppt'],
  },
  {
    label: 'Акумулятори та накопичувачі',
    weight: 2,
    terms: ['акумулятор', 'акб', 'lifepo', 'літієв', 'lithium', 'накопичувач енерг', 'battery storage', 'тяговий акум'],
  },
  {
    label: 'Портативні зарядні станції',
    weight: 2,
    terms: ['повербанк', 'павербанк', 'powerbank', 'power bank', 'портативна станці', 'портативна електростан', 'power station', 'зарядна станці'],
  },
  {
    label: 'Генерація енергії',
    weight: 2,
    terms: ['генератор', 'електростанці', 'вітрогенератор', 'вітряк', 'тепловий насос', 'сонячна електро'],
  },
]

// Supporting signals — alone they are weak; a few together imply energy.
const SUPPORT: Category[] = [
  {
    label: 'Загальна енергетика',
    weight: 1,
    terms: [
      'енерг', 'електро', 'квт', 'кв*год', 'kw', 'kwh', 'ват', 'watt', 'вольт', 'ампер',
      '220в', '380в', 'однофазн', 'трифазн', 'розетк', 'станці', 'потужніст', 'зелена енерг',
    ],
  },
]

// Hard-prohibited — reject regardless of energy relevance.
const BANNED: string[] = [
  'зброя', 'зброї', 'пістолет', 'автомат калашник', 'набої', 'патрон', 'боєприпас',
  'наркотик', 'канабіс', 'марихуан', 'кокаїн', 'амфетамін',
  'порно', 'інтим', 'еротик', 'секс-', 'віагра', 'viagra',
  'підроблен документ', 'фальшив', 'weapon', 'firearm', 'ammo', 'cocaine', 'porn', 'drugs',
]

function norm(s: string): string {
  return ` ${s.toLowerCase().replace(/[«»"'`]/g, ' ').replace(/\s+/g, ' ')} `
}

type Tally = { hits: string[]; weight: number; category?: string }

function tally(text: string, groups: Category[]): Tally {
  const hits: string[] = []
  let weight = 0
  let bestCat: string | undefined
  let bestCatHits = 0
  for (const g of groups) {
    let catHits = 0
    for (const term of g.terms) {
      if (text.includes(term)) {
        hits.push(term.trim())
        weight += g.weight
        catHits++
      }
    }
    if (catHits > bestCatHits) {
      bestCatHits = catHits
      bestCat = g.label
    }
  }
  return { hits, weight, category: bestCat }
}

/**
 * Classify a listing's text. Returns a verdict whose shape matches the backend.
 * `imagesCount` is informational — true image recognition only runs in the
 * backend; here we flag that photos still need a manager/AI vision check.
 */
export function classifyListing(input: {
  title: string
  description?: string
  imagesCount?: number
}): ModerationVerdict {
  const text = norm(`${input.title} ${input.description ?? ''}`)
  const at = new Date().toISOString()

  // 1) Prohibited content — hard reject.
  const banned = BANNED.filter((b) => text.includes(b))
  if (banned.length > 0) {
    return {
      relevant: false,
      allowed: false,
      score: 0,
      reasons: ['Виявлено ознаки забороненої категорії товару.'],
      decidedBy: 'ai',
      at,
    }
  }

  // 2) Energy relevance.
  const strong = tally(text, STRONG)
  const support = tally(text, SUPPORT)
  const strongCount = strong.hits.length
  const supportCount = support.hits.length

  const relevant = strongCount >= 1 || supportCount >= 2
  const matched = [...new Set([...strong.hits, ...support.hits])]

  let score: number
  if (relevant) {
    score = Math.min(1, 0.55 + 0.12 * strongCount + 0.05 * supportCount)
  } else {
    score = Math.min(0.45, 0.1 * (strongCount * 2 + supportCount))
  }

  const reasons: string[] = []
  if (relevant) {
    reasons.push(
      `Знайдено ознаки енергетичної категорії${strong.category ? ` (${strong.category})` : ''}: ${matched.slice(0, 6).join(', ')}.`,
    )
    if ((input.imagesCount ?? 0) > 0) {
      reasons.push('Фото перевіряє менеджер перед публікацією.')
    }
  } else {
    reasons.push('Не знайдено ознак енергетики (EV-зарядки, сонячних панелей, акумуляторів, інверторів тощо).')
    reasons.push('На майданчику дозволені лише товари, повʼязані з енергетикою.')
  }

  return {
    relevant,
    allowed: true,
    score: Number(score.toFixed(2)),
    category: relevant ? strong.category ?? support.category : undefined,
    reasons,
    decidedBy: 'ai',
    at,
  }
}
