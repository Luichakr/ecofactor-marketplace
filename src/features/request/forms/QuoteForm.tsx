import { useState } from 'react'
import { RequestLayout } from '../ui/RequestLayout/RequestLayout'
import { FormSection } from '../ui/FormSection/FormSection'
import { Field } from '../../../shared/ui/Field/Field'
import { PhoneInput, type PhoneValue } from '../../../shared/ui/PhoneInput/PhoneInput'
import { ProductImage } from '../../product/ui/ProductImage/ProductImage'
import type { MarketplaceProduct } from '../../../entities/product/model/product.types'
import { formatPrice } from '../../../entities/product/model/product.types'
import { leads } from '../../leads/model/leadsStore'
import './QuoteForm.css'

type Props = {
  /** Product the user is requesting a quote for (price hidden by seller, etc.). */
  product?: MarketplaceProduct
}

export function QuoteForm({ product }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const emailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const canSubmit =
    name.trim().length >= 2 &&
    phone !== undefined && phone.digits.length >= 9 &&
    emailValid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    leads.add({
      type: 'quote',
      name,
      phone: phone?.e164,
      email,
      message,
      productId: product?.id,
    })
    setSubmitted(true)
  }

  return (
    <RequestLayout
      title="Запит ціни"
      subtitle="ІНДИВІДУАЛЬНА ПРОПОЗИЦІЯ"
      intro={
        product
          ? 'Цей товар не продається за стандартним прайсом. Менеджер прорахує ціну під ваш проект.'
          : 'Залиште контакти — менеджер звʼяжеться та сформує комерційну пропозицію.'
      }
      submitted={submitted}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      submitLabel="ОТРИМАТИ ПРОПОЗИЦІЮ"
      successTitle="Запит надіслано"
      successDescription="Менеджер прорахує ціну та звʼяжеться з вами протягом робочого дня."
    >
      {product && (
        <FormSection num="01" title="Товар">
          <div className="quote-form__product">
            <div className="quote-form__product-image">
              <ProductImage
                src={product.image}
                alt={product.title}
                categoryId={product.categoryId}
              />
            </div>
            <div className="quote-form__product-info">
              <p className="quote-form__product-title">{product.title}</p>
              {product.subtitle && (
                <p className="quote-form__product-subtitle">{product.subtitle}</p>
              )}
              {product.price?.value !== undefined && (
                <p className="quote-form__product-price">{formatPrice(product.price)}</p>
              )}
            </div>
          </div>
        </FormSection>
      )}

      <FormSection num={product ? '02' : '01'} title="Контактні дані">
        <Field
          label="Імʼя"
          placeholder="Як до вас звертатися"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
        />
        <PhoneInput label="Телефон" required value={phone} onChange={setPhone} />
        <Field
          label="Email"
          placeholder="name@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={email && !emailValid ? 'Перевірте формат email' : undefined}
          helper="Необовʼязково — на нього надійде комерційна пропозиція"
        />
      </FormSection>

      <FormSection num={product ? '03' : '02'} title="Деталі запиту">
        <Field
          as="textarea"
          label="Коментар"
          placeholder="Кількість, термін, особливості проекту..."
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </FormSection>
    </RequestLayout>
  )
}
