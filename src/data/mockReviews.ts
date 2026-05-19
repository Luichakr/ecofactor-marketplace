export type Review = {
  id: string
  productId: string
  authorName: string
  authorInitial: string
  rating: 1 | 2 | 3 | 4 | 5
  title?: string
  text: string
  photos: string[]
  createdAt: string
  helpfulCount: number
  verifiedPurchase: boolean
}

export type ProductQuestion = {
  id: string
  productId: string
  authorName: string
  text: string
  createdAt: string
  answers: {
    id: string
    authorName: string
    fromSeller: boolean
    text: string
    createdAt: string
  }[]
}

/** Bank of realistic reviews keyed by productId. We deliberately repeat the
 *  same content across many product ids — UI looks populated without us
 *  hand-writing 100s of unique entries. */
const BASE_REVIEWS: Omit<Review, 'productId' | 'id'>[] = [
  {
    authorName: 'Олексій К.',
    authorInitial: 'О',
    rating: 5,
    title: 'Чудовий товар, рекомендую',
    text:
      'Замовляв минулого тижня, прийшло швидко, упаковка ціла. Якість на висоті — саме те, що очікував. Дякую продавцю!',
    photos: [],
    createdAt: '2026-04-22',
    helpfulCount: 14,
    verifiedPurchase: true,
  },
  {
    authorName: 'Марія В.',
    authorInitial: 'М',
    rating: 4,
    title: 'В цілому добре',
    text:
      'Все ок, єдине — хотілось би трохи кращу інструкцію в комплекті. По продукту нарікань немає, поки тестую.',
    photos: [],
    createdAt: '2026-04-15',
    helpfulCount: 6,
    verifiedPurchase: true,
  },
  {
    authorName: 'Іван П.',
    authorInitial: 'І',
    rating: 5,
    title: 'Друга покупка тут',
    text:
      'Беру другий раз у ECOFACTOR Store, як завжди — на висоті. Доставка день в день, менеджер ввічливо все підтвердив.',
    photos: [],
    createdAt: '2026-04-08',
    helpfulCount: 22,
    verifiedPurchase: true,
  },
  {
    authorName: 'Наталія Л.',
    authorInitial: 'Н',
    rating: 4,
    title: 'Працює',
    text: 'Хороше співвідношення ціна-якість. Пакування могло б бути міцнішим, але доїхало без ушкоджень.',
    photos: [],
    createdAt: '2026-03-30',
    helpfulCount: 3,
    verifiedPurchase: false,
  },
  {
    authorName: 'Сергій М.',
    authorInitial: 'С',
    rating: 5,
    text: 'Швидко, якісно, фірмово. Все так як на сайті.',
    photos: [],
    createdAt: '2026-03-21',
    helpfulCount: 11,
    verifiedPurchase: true,
  },
  {
    authorName: 'Юлія Д.',
    authorInitial: 'Ю',
    rating: 3,
    title: 'Очікувала більшого',
    text:
      'За свої гроші — нормально, але вже бачила кращі варіанти за схожу ціну. Не пожалкую, та й не в захваті.',
    photos: [],
    createdAt: '2026-03-15',
    helpfulCount: 8,
    verifiedPurchase: true,
  },
]

const BASE_QUESTIONS: Omit<ProductQuestion, 'productId' | 'id'>[] = [
  {
    authorName: 'Дмитро',
    text: 'А чи є офіційна гарантія від виробника?',
    createdAt: '2026-04-10',
    answers: [
      {
        id: 'a1',
        authorName: 'ECOFACTOR Store',
        fromSeller: true,
        text: 'Так, офіційна гарантія 24 місяці. Гарантійні випадки приймаємо в сервіс-центрі.',
        createdAt: '2026-04-10',
      },
    ],
  },
  {
    authorName: 'Андрій',
    text: 'Доставите в Одесу за вихідні?',
    createdAt: '2026-04-05',
    answers: [
      {
        id: 'a2',
        authorName: 'ECOFACTOR Store',
        fromSeller: true,
        text:
          'Замовлення оформлене до 14:00 — відправляємо в той самий день. У вихідні Нова Пошта працює, тому має прийти.',
        createdAt: '2026-04-05',
      },
    ],
  },
]

export function getReviewsFor(productId: string): Review[] {
  // Deterministic seed from id so the same product always shows the same
  // count of reviews, but different products vary 2–6.
  const seed = productId.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const count = 2 + (seed % 5)
  return BASE_REVIEWS.slice(0, count).map((r, i) => ({
    ...r,
    productId,
    id: `${productId}-r${i}`,
  }))
}

export function getQuestionsFor(productId: string): ProductQuestion[] {
  const seed = productId.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const count = seed % 3 // 0, 1, or 2 questions
  return BASE_QUESTIONS.slice(0, count).map((q, i) => ({
    ...q,
    productId,
    id: `${productId}-q${i}`,
  }))
}

export function getRatingFor(productId: string): { average: number; count: number } {
  const seed = productId.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const count = 12 + (seed % 280)
  // Deterministic but realistic average in [3.8, 4.9].
  const average = 3.8 + (seed % 12) / 10
  return { average: Number(average.toFixed(1)), count }
}
