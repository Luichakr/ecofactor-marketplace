import { useState } from 'react'
import { RequestLayout } from '../ui/RequestLayout/RequestLayout'
import { FormSection } from '../ui/FormSection/FormSection'
import { Field } from '../../../shared/ui/Field/Field'
import { ChipGroup } from '../../../shared/ui/ChipGroup/ChipGroup'
import { PhoneInput, type PhoneValue } from '../../../shared/ui/PhoneInput/PhoneInput'
import { PhotoUpload, type LocalPhoto } from '../../../shared/ui/PhotoUpload/PhotoUpload'
import { leads } from '../../leads/model/leadsStore'

const ISSUE_TYPES = [
  { value: 'defect', label: 'Заводський брак' },
  { value: 'malfunction', label: 'Не працює' },
  { value: 'damage', label: 'Пошкодження' },
  { value: 'return', label: 'Повернення' },
  { value: 'other', label: 'Інше' },
]

export function WarrantyForm() {
  const [orderNumber, setOrderNumber] = useState('')
  const [productName, setProductName] = useState('')
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<LocalPhoto[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const emailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const canSubmit =
    productName.trim().length >= 2 &&
    issueType.length > 0 &&
    description.trim().length >= 10 &&
    name.trim().length >= 2 &&
    phone !== undefined && phone.digits.length >= 9 &&
    emailValid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    leads.add({
      type: 'warranty',
      name,
      phone: phone?.e164,
      email,
      message: description,
      payload: { orderNumber, productName, issueType, photoCount: photos.length },
    })
    setSubmitted(true)
  }

  return (
    <RequestLayout
      title="Гарантія та повернення"
      subtitle="ЗВЕРНЕННЯ"
      intro="Опишіть проблему — менеджер зорієнтує по гарантії, ремонту або поверненню коштів. Чим більше деталей, тим швидше вирішимо."
      submitted={submitted}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      submitLabel="НАДІСЛАТИ ЗВЕРНЕННЯ"
      successTitle="Звернення прийнято"
      successDescription="Менеджер сервісу звʼяжеться з вами протягом доби."
    >
      <FormSection num="01" title="Замовлення та товар">
        <Field
          label="№ замовлення"
          placeholder="Якщо відомий"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          helper="Не обовʼязково, але прискорить розгляд"
        />
        <Field
          label="Назва товару / SKU"
          placeholder="Наприклад: Мобільна зарядка 7 кВт Type 2"
          required
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </FormSection>

      <FormSection num="02" title="Опис проблеми">
        <ChipGroup
          label="Тип звернення"
          required
          options={ISSUE_TYPES}
          value={issueType}
          onChange={setIssueType}
        />
        <Field
          as="textarea"
          label="Деталі"
          placeholder="Що сталося, коли, за яких умов..."
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          helper="Мінімум 10 символів"
        />
        <PhotoUpload
          max={5}
          value={photos}
          onChange={setPhotos}
          label="Фото проблеми"
          hint="Допоможе уникнути зайвих уточнень"
        />
      </FormSection>

      <FormSection num="03" title="Контактні дані">
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
          helper="Необовʼязково — для копії звернення"
        />
      </FormSection>
    </RequestLayout>
  )
}
