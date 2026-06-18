import { useRef, useState } from 'react'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../shared/ui/Button/Button'
import { BottomSheet } from '../../shared/ui/BottomSheet/BottomSheet'
import { Field } from '../../shared/ui/Field/Field'
import { Icon } from '../../shared/ui/Icon/Icon'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { listings, useListings, type Listing } from '../../features/listings/model/listingsStore'
import { ROUTES } from '../../shared/config/routes'
import './MyListingsPage.css'

const MAX_PHOTOS = 6

function formatMoney(value: number): string {
  return `${new Intl.NumberFormat('uk-UA').format(Math.round(value))} ₴`
}

/** Downscale a picked image to ≤900px and return a JPEG data URL. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const max = 900
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error('no ctx'))
      }
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('load error'))
    }
    img.src = url
  })
}

export function MyListingsPage() {
  const items = useListings()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Header title="МОЇ ОГОЛОШЕННЯ" showBack backFallback={ROUTES.PROFILE} />
      <ScreenContainer withTopInset={false}>
        <div className="listings-page">
          {items.length === 0 ? (
            <EmptyState
              title="Оголошень поки немає"
              description="Створіть перше оголошення — додайте фото, опис і ціну, і воно зʼявиться тут."
            />
          ) : (
            <ul className="listings-page__list">
              {items.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </ul>
          )}

          <div className="listings-page__cta">
            <Button variant="primary" fullWidth size="lg" onClick={() => setOpen(true)}>
              + ДОДАТИ ОГОЛОШЕННЯ
            </Button>
          </div>
        </div>
      </ScreenContainer>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="НОВЕ ОГОЛОШЕННЯ" maxHeightPct={92}>
        <ListingForm
          onSubmit={(l) => {
            listings.add(l)
            setOpen(false)
          }}
        />
      </BottomSheet>
    </>
  )
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <li className="listing-card">
      <span className="listing-card__img">
        {listing.images[0] ? (
          <img src={listing.images[0]} alt={listing.title} />
        ) : (
          <span className="listing-card__img-empty">
            <Icon name="image" size={28} />
          </span>
        )}
      </span>
      <div className="listing-card__info">
        <h3 className="listing-card__title">{listing.title}</h3>
        {listing.description && <p className="listing-card__desc">{listing.description}</p>}
        <span className="listing-card__price">
          {listing.price != null ? formatMoney(listing.price) : 'Ціна за домовленістю'}
        </span>
      </div>
      <button
        type="button"
        className="listing-card__delete"
        aria-label="Видалити"
        onClick={() => {
          if (window.confirm(`Видалити оголошення «${listing.title}»?`)) listings.remove(listing.id)
        }}
      >
        <Icon name="delete" size={20} />
      </button>
    </li>
  )
}

function ListingForm({ onSubmit }: { onSubmit: (l: Omit<Listing, 'id' | 'createdAt'>) => void }) {
  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const priceNum = Number(price.replace(/\s/g, ''))
  const valid = title.trim().length >= 3 && images.length > 0

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setBusy(true)
    try {
      const room = MAX_PHOTOS - images.length
      const urls = await Promise.all(files.slice(0, room).map(fileToDataUrl))
      setImages((prev) => [...prev, ...urls])
    } catch {
      /* skip bad files */
    } finally {
      setBusy(false)
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      price: price.trim() ? priceNum : undefined,
      currency: 'UAH',
      images,
    })
  }

  return (
    <form className="listing-form" onSubmit={submit}>
      {/* Photos */}
      <span className="listing-form__label">Фотографії</span>
      <div className="listing-form__photos">
        {images.map((src, i) => (
          <span key={i} className="listing-form__photo">
            <img src={src} alt="" />
            <button
              type="button"
              className="listing-form__photo-remove"
              aria-label="Прибрати фото"
              onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
            >
              <Icon name="close" size={14} />
            </button>
          </span>
        ))}
        {images.length < MAX_PHOTOS && (
          <button
            type="button"
            className="listing-form__add-photo"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            <Icon name={busy ? 'hourglass_empty' : 'add_a_photo'} size={24} />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFiles}
          style={{ display: 'none' }}
        />
      </div>

      <Field label="Назва" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Напр. Зарядна станція 7 кВт" required />
      <Field
        as="textarea"
        label="Опис"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Стан, комплектація, причина продажу…"
        rows={4}
      />
      <Field
        label="Ціна, ₴"
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))}
        placeholder="напр. 12000"
        inputMode="numeric"
      />

      <Button variant="primary" fullWidth size="lg" type="submit" disabled={!valid || busy}>
        ОПУБЛІКУВАТИ
      </Button>
    </form>
  )
}
