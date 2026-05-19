import { useState } from 'react'
import { RequestLayout } from '../ui/RequestLayout/RequestLayout'
import { FormSection } from '../ui/FormSection/FormSection'
import { Field } from '../../../shared/ui/Field/Field'
import { ChipGroup } from '../../../shared/ui/ChipGroup/ChipGroup'
import { PhoneInput, type PhoneValue, COUNTRIES } from '../../../shared/ui/PhoneInput/PhoneInput'
import { PhotoUpload, type LocalPhoto } from '../../../shared/ui/PhotoUpload/PhotoUpload'
import { leads } from '../../leads/model/leadsStore'

const POWER_OPTIONS = ['3.5 кВт', '7 кВт', '11 кВт', '22 кВт', '50+ кВт DC', 'Потрібна порада']

export function LocationForm() {
  const [photos, setPhotos] = useState<LocalPhoto[]>([])
  const [country, setCountry] = useState('UA')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [power, setPower] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState<PhoneValue | undefined>()
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const canSubmit =
    country.length > 0 &&
    city.trim().length >= 2 &&
    address.trim().length >= 4 &&
    power.length > 0 &&
    name.trim().length >= 2 &&
    phone !== undefined && phone.digits.length >= 9

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    leads.add({
      type: 'location',
      name,
      phone: phone?.e164,
      message: note,
      payload: { country, city, address, power, photoCount: photos.length },
    })
    setSubmitted(true)
  }

  const countryOptions = COUNTRIES.map((c) => ({ value: c.code, label: c.name }))

  return (
    <RequestLayout
      title="Запропонувати локацію"
      subtitle="ВЛАСНА СТАНЦІЯ"
      intro="Маєте місце під зарядну станцію — паркінг, СТО, готель, торговий центр? Розкажіть про локацію — оцінимо доцільність та звʼяжемось."
      submitted={submitted}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
      submitLabel="НАДІСЛАТИ ПРОПОЗИЦІЮ"
      successTitle="Пропозицію прийнято"
      successDescription="Наша команда розгляне локацію та звʼяжеться з вами для уточнення деталей."
    >
      <FormSection num="01" title="Фото локації" description="До 5 фото — необовʼязково, але допомагає швидше зорієнтуватись.">
        <PhotoUpload
          max={5}
          value={photos}
          onChange={setPhotos}
          label="Фотографії"
          hint="Покажіть під'їзд, паркомісце, точки підключення електрики"
        />
      </FormSection>

      <FormSection num="02" title="Адреса" description="Де саме можна встановити станцію">
        <ChipGroup
          label="Країна"
          required
          options={countryOptions}
          value={country}
          onChange={setCountry}
          layout="scroll"
        />
        <Field
          label="Місто"
          placeholder="Київ, Одеса, Львів..."
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoComplete="address-level2"
        />
        <Field
          label="Адреса"
          placeholder="Вулиця, будинок, орієнтир"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="street-address"
        />
      </FormSection>

      <FormSection num="03" title="Потужність">
        <ChipGroup
          label="Бажана потужність станції"
          required
          options={POWER_OPTIONS}
          value={power}
          onChange={setPower}
        />
        <Field
          as="textarea"
          label="Додаткова інформація"
          placeholder="Наявність електрики, добова прохідність, бажаний термін запуску..."
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
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
      </FormSection>
    </RequestLayout>
  )
}
