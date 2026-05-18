import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import './RequestHubPage.css'

type RequestType = {
  id: string
  num: string
  title: string
  description: string
  to: string
}

const REQUEST_TYPES: RequestType[] = [
  {
    id: 'callback',
    num: '01',
    title: 'Замовити дзвінок',
    description: 'Передзвонимо за 15 хвилин — тільки імʼя та телефон',
    to: '/request/callback',
  },
  {
    id: 'quote',
    num: '02',
    title: 'Запит ціни',
    description: 'Для товарів без публічної ціни — індивідуальна пропозиція',
    to: '/request/quote',
  },
  {
    id: 'custom-station',
    num: '06',
    title: 'Кастомна станція',
    description: '5 кроків — конфігуруйте станцію під свій обʼєкт',
    to: '/request/custom-station',
  },
  {
    id: 'autoservice',
    num: '07',
    title: 'Автосервіс',
    description: 'Запис на діагностику, обслуговування, шиномонтаж',
    to: '/request/autoservice',
  },
  {
    id: 'installation',
    num: '03',
    title: 'Запит на встановлення',
    description: 'Виїзд техніка, монтаж зарядної станції',
    to: '/request/installation',
  },
  {
    id: 'location',
    num: '04',
    title: 'Запропонувати локацію',
    description: 'Маєте місце під станцію — паркінг, СТО, готель, ТЦ',
    to: '/request/location',
  },
  {
    id: 'warranty',
    num: '05',
    title: 'Гарантія та повернення',
    description: 'Брак, ремонт, повернення коштів',
    to: '/request/warranty',
  },
]

export function RequestHubPage() {
  const navigate = useNavigate()

  return (
    <>
      <Header title="ЗАЯВКИ" showBack />
      <ScreenContainer withTopInset={false}>
        <div className="request-hub">
          <p className="request-hub__intro">
            Оберіть тип звернення — кожна форма відкриває потрібний набір полів,
            нічого зайвого.
          </p>

          <ul className="request-hub__list">
            {REQUEST_TYPES.map((t) => (
              <li key={t.id}>
                <button className="request-hub__item" onClick={() => navigate(t.to)}>
                  <span className="request-hub__item-num">|{t.num}|</span>
                  <span className="request-hub__item-body">
                    <span className="request-hub__item-title">{t.title}</span>
                    <span className="request-hub__item-desc">{t.description}</span>
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </ScreenContainer>
    </>
  )
}
