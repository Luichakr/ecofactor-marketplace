import { useState } from 'react'
import { RequestLayout } from '../ui/RequestLayout/RequestLayout'
import { FormSection } from '../ui/FormSection/FormSection'
import { Field } from '../../../shared/ui/Field/Field'
import { PhoneInput, type PhoneValue } from '../../../shared/ui/PhoneInput/PhoneInput'
import { leads } from '../../leads/model/leadsStore'

export function CallbackForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [submitted, setSubmitted] = useState(false)

  const canSubmit =
    name.trim().length >= 2 && phone !== undefined && phone.digits.length >= 9

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    leads.add({ type: 'callback', name, phone: phone?.e164 })
    setSubmitted(true)
  }

  return (
    <RequestLayout
      title="Замовити дзвінок"
      subtitle="ШВИДКИЙ КОНТАКТ"
      intro="Залиште номер — менеджер передзвонить протягом 15 хвилин у робочий час."
      submitted={submitted}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      submitLabel="ЗАМОВИТИ ДЗВІНОК"
      successTitle="Дзвінок замовлено"
      successDescription="Очікуйте на дзвінок з нашого номера протягом 15 хвилин."
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
        <PhoneInput
          label="Телефон"
          required
          value={phone}
          onChange={setPhone}
        />
      </FormSection>
    </RequestLayout>
  )
}
