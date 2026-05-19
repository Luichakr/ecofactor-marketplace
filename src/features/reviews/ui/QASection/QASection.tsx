import { useMemo, useState } from 'react'
import { getQuestionsFor, type ProductQuestion } from '../../../../data/mockReviews'
import './QASection.css'

export function QASection({ productId }: { productId: string }) {
  const data = useMemo(() => getQuestionsFor(productId), [productId])
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitted(true)
    setText('')
  }

  return (
    <section className="qa-section">
      <h2 className="qa-section__title">ПИТАННЯ ТА ВІДПОВІДІ</h2>

      {data.length === 0 ? (
        <p className="qa-section__empty">Поки немає запитань — поставте першим.</p>
      ) : (
        <ul className="qa-section__list">
          {data.map((q) => (
            <QAItem key={q.id} q={q} />
          ))}
        </ul>
      )}

      <form className="qa-section__form" onSubmit={submit}>
        <textarea
          className="qa-section__input"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Поставити запитання продавцю..."
        />
        <button type="submit" className="qa-section__submit">
          НАДІСЛАТИ
        </button>
        {submitted && (
          <p className="qa-section__sent">Дякуємо! Менеджер відповість протягом 24 годин.</p>
        )}
      </form>
    </section>
  )
}

function QAItem({ q }: { q: ProductQuestion }) {
  return (
    <li className="qa-item">
      <div className="qa-item__q">
        <span className="qa-item__q-label">{q.authorName}:</span>
        <span className="qa-item__q-text">{q.text}</span>
      </div>
      {q.answers.map((a) => (
        <div key={a.id} className={`qa-item__a ${a.fromSeller ? 'qa-item__a--seller' : ''}`}>
          <span className="qa-item__a-label">{a.fromSeller ? '◆ ' : ''}{a.authorName}:</span>
          <span className="qa-item__a-text">{a.text}</span>
        </div>
      ))}
    </li>
  )
}
