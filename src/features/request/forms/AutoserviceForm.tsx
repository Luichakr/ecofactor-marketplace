import { useState } from 'react'
import { RequestLayout } from '../ui/RequestLayout/RequestLayout'
import { FormSection } from '../ui/FormSection/FormSection'
import { Field } from '../../../shared/ui/Field/Field'
import { ChipGroup } from '../../../shared/ui/ChipGroup/ChipGroup'
import { PhoneInput, type PhoneValue } from '../../../shared/ui/PhoneInput/PhoneInput'
import { Select } from '../../../shared/ui/Select/Select'
import { CAR_MAKES, getModels } from '../../../data/carCatalog'
import './AutoserviceForm.css'

const SERVICE_TYPES = [
  { id: 'diagnostics', label: 'Діагностика' },
  { id: 'battery', label: 'Перевірка батареї EV' },
  { id: 'oil', label: 'Заміна оливи' },
  { id: 'brakes', label: 'Гальмівна система' },
  { id: 'tires', label: 'Шиномонтаж' },
  { id: 'suspension', label: 'Підвіска' },
  { id: 'charging', label: 'Сервіс зарядного' },
  { id: 'other', label: 'Інше' },
]

const TIME_SLOTS = ['09:00 — 12:00', '12:00 — 15:00', '15:00 — 18:00', 'Уточнити']

function todayISO(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function plusDaysISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function AutoserviceForm() {
  const [services, setServices] = useState<string[]>([])
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [plate, setPlate] = useState('')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const emailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const yearValid = year.length === 0 || /^\d{4}$/.test(year)

  const canSubmit =
    services.length > 0 &&
    make.trim().length >= 1 &&
    model.trim().length >= 1 &&
    yearValid &&
    date.length > 0 &&
    slot.length > 0 &&
    name.trim().length >= 2 &&
    phone !== undefined && phone.digits.length >= 9 &&
    emailValid

  function toggleService(id: string) {
    setServices((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
  }

  return (
    <RequestLayout
      title="Запис на автосервіс"
      subtitle="ВИЇЗД В СЕРВІСНИЙ ЦЕНТР"
      intro="Оберіть послугу, час та залиште контакти — оператор підтвердить запис протягом години."
      submitted={submitted}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      submitLabel="ЗАПИСАТИСЯ"
      successTitle="Запис прийнято"
      successDescription="Оператор звʼяжеться для підтвердження дати та часу візиту."
    >
      <FormSection num="01" title="Послуга" description="Можна обрати кілька — точну вартість підтвердить майстер на місці.">
        <div className="autoservice__service-list">
          {SERVICE_TYPES.map((s) => {
            const active = services.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                className={`chip ${active ? 'chip--active' : ''}`}
                onClick={() => toggleService(s.id)}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </FormSection>

      <FormSection num="02" title="Авто">
        <Select
          label="Марка"
          placeholder="Оберіть бренд"
          required
          options={CAR_MAKES}
          value={make}
          onChange={(v) => {
            setMake(v)
            setModel('') // reset model when brand changes
          }}
        />

        {make && make !== 'Інше' && getModels(make).length > 0 ? (
          <Select
            label="Модель"
            placeholder="Оберіть модель"
            required
            options={getModels(make)}
            value={model}
            onChange={setModel}
          />
        ) : (
          <Field
            label="Модель"
            placeholder={make === 'Інше' ? 'Введіть марку і модель' : 'Введіть назву моделі'}
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        )}

        <div className="autoservice__row">
          <Field
            label="Рік"
            placeholder="2023"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            error={year && !yearValid ? '4 цифри' : undefined}
          />
          <Field
            label="Номер"
            placeholder="AA 1234 BB"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            helper="Необовʼязково"
          />
        </div>
      </FormSection>

      <FormSection num="03" title="Дата та час">
        <Field
          label="Бажана дата"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={todayISO()}
          max={plusDaysISO(60)}
        />
        <ChipGroup
          label="Час"
          required
          options={TIME_SLOTS}
          value={slot}
          onChange={setSlot}
        />
      </FormSection>

      <FormSection num="04" title="Контактні дані">
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
          helper="Необовʼязково — для копії запису"
        />
        <Field
          as="textarea"
          label="Коментар"
          placeholder="Симптоми, побажання, попередня історія обслуговування..."
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </FormSection>
    </RequestLayout>
  )
}
