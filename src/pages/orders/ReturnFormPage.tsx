import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { Button } from '../../shared/ui/Button/Button'
import { useOrders } from '../../features/orders/model/ordersStore'
import {
  returnsStore,
  RETURN_REASON_LABELS,
  type ReturnReason,
  type ReturnRefundMethod,
} from '../../features/returns/model/returnsStore'
import { orderDetailPath } from '../../shared/config/routes'
import './ReturnFormPage.css'

const REFUND_LABELS: Record<ReturnRefundMethod, string> = {
  card: 'Гроші на картку',
  replacement: 'Новий товар',
  storeCredit: 'Магазинний кредит',
}

export function ReturnFormPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const order = useOrders().find((o) => o.id === orderId)

  const [selected, setSelected] = useState<Set<string>>(new Set(order?.items.map((i) => i.productId)))
  const [reason, setReason] = useState<ReturnReason>('wrongSize')
  const [comment, setComment] = useState('')
  const [refundMethod, setRefundMethod] = useState<ReturnRefundMethod>('card')

  if (!order) {
    return (
      <>
        <Header title="ПОВЕРНЕННЯ" showBack onBack={() => navigate(-1)} />
        <ScreenContainer withTopInset={false}>
          <EmptyState title="Замовлення не знайдено" />
        </ScreenContainer>
      </>
    )
  }

  function submit() {
    if (!order) return
    if (selected.size === 0) {
      alert('Виберіть хоча б один товар')
      return
    }
    const req = returnsStore.open({
      orderId: order.id,
      itemProductIds: Array.from(selected),
      reason,
      comment: comment.trim() || undefined,
      refundMethod,
    })
    alert(`Заявку на повернення створено (№ ${req.id.slice(-6)}). Менеджер зв'яжеться з вами протягом 24 годин.`)
    navigate(orderDetailPath(order.id))
  }

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  return (
    <>
      <Header title={`ПОВЕРНЕННЯ № ${order.number}`} showBack onBack={() => navigate(orderDetailPath(order.id))} />
      <ScreenContainer withTopInset={false}>
        <div className="return-form">
          <Section title="ОБЕРІТЬ ТОВАРИ ДЛЯ ПОВЕРНЕННЯ">
            {order.items.map((it) => (
              <label key={it.productId} className="return-form__row">
                <input
                  type="checkbox"
                  checked={selected.has(it.productId)}
                  onChange={() => toggle(it.productId)}
                />
                <span className="return-form__row-text">
                  <span className="return-form__row-title">{it.title}</span>
                  {it.variant && <span className="return-form__row-sub">{it.variant} · × {it.qty}</span>}
                </span>
              </label>
            ))}
          </Section>

          <Section title="ПРИЧИНА">
            {(Object.keys(RETURN_REASON_LABELS) as ReturnReason[]).map((r) => (
              <label key={r} className="return-form__radio">
                <input
                  type="radio"
                  name="reason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                />
                <span>{RETURN_REASON_LABELS[r]}</span>
              </label>
            ))}
          </Section>

          <Section title="КОМЕНТАР (НЕОБОВ'ЯЗКОВО)">
            <textarea
              className="return-form__textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Опишіть детальніше..."
              rows={3}
            />
          </Section>

          <Section title="СПОСІБ ПОВЕРНЕННЯ КОШТІВ">
            {(Object.keys(REFUND_LABELS) as ReturnRefundMethod[]).map((m) => (
              <label key={m} className="return-form__radio">
                <input
                  type="radio"
                  name="refund"
                  checked={refundMethod === m}
                  onChange={() => setRefundMethod(m)}
                />
                <span>{REFUND_LABELS[m]}</span>
              </label>
            ))}
          </Section>

          <Button variant="primary" fullWidth size="lg" onClick={submit}>
            ОФОРМИТИ ПОВЕРНЕННЯ
          </Button>
          <p className="return-form__note">
            Менеджер зв'яжеться з вами протягом 24 годин для уточнення деталей доставки до пункту прийому.
          </p>
        </div>
      </ScreenContainer>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="return-form__section">
      <h2 className="return-form__section-title">{title}</h2>
      <div className="return-form__section-body">{children}</div>
    </section>
  )
}
