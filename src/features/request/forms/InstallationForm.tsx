import { useState } from 'react'
import { RequestLayout } from '../ui/RequestLayout/RequestLayout'
import { FormSection } from '../ui/FormSection/FormSection'
import { Field } from '../../../shared/ui/Field/Field'
import { ChipGroup } from '../../../shared/ui/ChipGroup/ChipGroup'
import { PhoneInput, type PhoneValue } from '../../../shared/ui/PhoneInput/PhoneInput'

const POWER_OPTIONS = ['3.5 кВт', '7 кВт', '11 кВт', '22 кВт', 'Більше 22 кВт', 'Потрібна порада']

export function InstallationForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [power, setPower] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const canSubmit =
    name.trim().length >= 2 &&
    phone !== undefined && phone.digits.length >= 9 &&
    emailValid &&
    city.trim().length >= 2 &&
    power.length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
  }

  return (
    <RequestLayout
      title="Запит на встановлення"
      subtitle="ВИЇЗД ТЕХНІКА"
      intro="Опишіть базові параметри — наш фахівець прорахує комплект та узгодить дату встановлення."
      submitted={submitted}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      submitLabel="НАДІСЛАТИ ЗАПИТ"
      successTitle="Запит прийнято"
      successDescription="Фахівець звʼяжеться з вами для уточнення дати та обʼєму робіт."
    >
      <FormSection num="01" title="Контактні дані">
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
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={email && !emailValid ? 'Перевірте формат email' : undefined}
        />
      </FormSection>

      <FormSection num="02" title="Обʼєкт встановлення" description="Локація та необхідна потужність">
        <Field
          label="Місто"
          placeholder="Київ, Одеса, Львів..."
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoComplete="address-level2"
        />

        <ChipGroup
          label="Потужність"
          required
          options={POWER_OPTIONS}
          value={power}
          onChange={setPower}
        />

        <Field
          as="textarea"
          label="Коментар"
          placeholder="Опис обʼєкту: будинок / квартира / комерція, наявність підключення тощо"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </FormSection>
    </RequestLayout>
  )
}
