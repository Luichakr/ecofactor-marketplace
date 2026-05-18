import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { StickyCTA } from '../../shared/ui/StickyCTA/StickyCTA'
import { Button } from '../../shared/ui/Button/Button'
import { EmptyState } from '../../shared/ui/EmptyState/EmptyState'
import { ExpandableSection } from '../../shared/ui/ExpandableSection/ExpandableSection'
import { ProductGallery } from '../../features/product/ui/ProductGallery/ProductGallery'
import { ProductGalleryFullscreen } from '../../features/product/ui/ProductGalleryFullscreen/ProductGalleryFullscreen'
import { NovaPoshtaDelivery, type NovaPoshtaSelection } from '../../shared/ui/NovaPoshtaDelivery/NovaPoshtaDelivery'
import { PlaceholderImage } from '../../shared/ui/PlaceholderImage/PlaceholderImage'
import { FavoriteButton } from '../../features/favorites/ui/FavoriteButton/FavoriteButton'
import { useAutoCar } from '../../features/auto/hooks/useAutoCar'
import { REQUEST_PATHS, ROUTES } from '../../shared/config/routes'
import './AutoProductPage.css'

/**
 * Lubeavto returns at most one main photo; the rest of the gallery isn't
 * exposed via the public partner API. We render placeholder tiles after
 * the description so the layout matches the Zara reference and gives a
 * stable visual rhythm even before real photos are available.
 */
const PLACEHOLDER_PHOTOS: Array<{ size: string; ratio: string }> = [
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
  { size: '1248 × 1664', ratio: '3 / 4' },
]

export function AutoProductPage() {
  const { carId } = useParams<{ carId: string }>()
  const navigate = useNavigate()
  const { data: car, loading, error } = useAutoCar(carId)
  const [delivery, setDelivery] = useState<NovaPoshtaSelection | undefined>()
  const [fullscreen, setFullscreen] = useState<number | null>(null)

  if (loading) {
    return (
      <>
        <Header title="EV-АВТО" showBack />
        <ScreenContainer withTopInset={false}>
          <div className="auto-product__skel">
            <div className="auto-product__skel-img" />
            <div className="auto-product__skel-line auto-product__skel-line--title" />
            <div className="auto-product__skel-line auto-product__skel-line--meta" />
            <div className="auto-product__skel-line auto-product__skel-line--price" />
          </div>
        </ScreenContainer>
      </>
    )
  }

  if (error || !car) {
    return (
      <>
        <Header title="EV-АВТО" showBack />
        <ScreenContainer withTopInset={false}>
          <EmptyState
            title="Авто не знайдено"
            description={error ?? 'Можливо, лот вже зняли з продажу.'}
            action={{ label: 'До каталогу', onClick: () => navigate(ROUTES.AUTO) }}
          />
        </ScreenContainer>
      </>
    )
  }

  return (
    <>
      <Header title={car.title} showBack />
      <ScreenContainer withTopInset={false}>
        <ProductGallery
          images={car.images.length > 0 ? car.images : [car.image].filter(Boolean) as string[]}
          alt={car.title}
          aspectRatio="4 / 3"
          onSlideClick={(i) => setFullscreen(i)}
          className="auto-product__gallery"
        />

        <div className="auto-product__content">
          {/* Title + badge + favorite */}
          <div className="auto-product__title-row">
            <div>
              <h1 className="auto-product__title">{car.title}</h1>
              <p className="auto-product__loc">{car.location}</p>
            </div>
            <div className="auto-product__title-actions">
              <span className={`auto-product__badge auto-product__badge--${car.isElectric ? 'ev' : 'hybrid'}`}>
                {car.isElectric ? 'ELECTRIC' : 'HYBRID'}
              </span>
              <FavoriteButton productId={`auto:${car.id}`} />
            </div>
          </div>

          {/* Description first — Zara puts it directly under title */}
          {car.description && (
            <p className="auto-product__desc">{car.description}</p>
          )}
        </div>

        {/* Additional photos strip — placeholders until Lubeavto exposes more */}
        <section className="auto-product__photos" aria-label="Фотографії">
          {PLACEHOLDER_PHOTOS.map((p, i) => (
            <PlaceholderImage
              key={i}
              size={p.size}
              aspectRatio={p.ratio}
              caption={`${car.title.toUpperCase()} · ${i + 1}`}
            />
          ))}
        </section>

        {/* Spec table */}
        <div className="auto-product__section">
          <h2 className="auto-product__section-title">ХАРАКТЕРИСТИКИ</h2>
          <dl className="auto-product__spec">
            <SpecRow label="Рік" value={car.year > 0 ? String(car.year) : '—'} />
            <SpecRow label="Пробіг" value={car.mileageLabel} />
            <SpecRow label="Паливо" value={car.fuel} />
            {car.engineVolumeL > 0 && (
              <SpecRow
                label={car.isElectric ? 'Батарея' : 'Двигун'}
                value={car.isElectric
                  ? `${Math.round(car.engineVolumeL)} kWh`
                  : `${car.engineVolumeL.toFixed(1)} L`}
              />
            )}
            <SpecRow label="КПП" value={car.transmission} />
            <SpecRow label="Привід" value={car.drive} />
            {car.bodyType && <SpecRow label="Кузов" value={car.bodyType} />}
            {car.color && <SpecRow label="Колір" value={car.color} />}
            {car.country && <SpecRow label="Країна" value={car.country} />}
            {car.hasKeys !== null && (
              <SpecRow label="Ключі" value={car.hasKeys ? 'Так' : 'Ні'} />
            )}
            {car.isDamaged !== null && (
              <SpecRow label="Стан" value={car.isDamaged ? 'Потребує перевірки' : 'Без пошкоджень'} />
            )}
            {car.publishDate && (
              <SpecRow
                label="Опубліковано"
                value={(() => {
                  const d = new Date(car.publishDate)
                  return Number.isFinite(d.getTime()) ? d.toLocaleDateString('uk-UA') : car.publishDate
                })()}
              />
            )}
            {car.vin && <SpecRow label="VIN" value={car.vin} mono />}
          </dl>
        </div>

        {/* Zara-style expandable sections */}
        <div className="auto-product__accordion">
          <ExpandableSection title="ДОСТАВКА В УКРАЇНУ">
            <p>
              Доставка авто з ЄС у будь‑яке місто України. Терміни — від 7 днів
              після підтвердження замовлення. Менеджер уточнить деталі логістики
              та митного оформлення.
            </p>
          </ExpandableSection>

          <ExpandableSection title="ПЕРЕВІРКА ТА ГАРАНТІЇ">
            <p>
              Перед відправкою авто проходить діагностику дилера. VIN звіт
              надається на запит. Гарантія на акумулятор/двигун — згідно з
              умовами виробника.
            </p>
          </ExpandableSection>

          <ExpandableSection title="ОПЛАТА">
            <p>
              Передоплата 10% бронює лот. Решта — після огляду авто або в день
              видачі. Безготівковий розрахунок, можлива розстрочка через банк‑партнера.
            </p>
          </ExpandableSection>

          <ExpandableSection title="ДОСТАВКА У ВАШЕ МІСТО">
            <NovaPoshtaDelivery value={delivery} onChange={setDelivery} label="" />
          </ExpandableSection>
        </div>

        <StickyCTA>
          <div className="auto-product__cta">
            <div className="auto-product__cta-row">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => navigate(`${REQUEST_PATHS.QUOTE}/${car.id}`)}
              >
                ЗАПИТАТИ
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={() => navigate(REQUEST_PATHS.CALLBACK)}
              >
                ДЗВІНОК
              </Button>
            </div>
            <div className="auto-product__cta-price">{car.priceLabel}</div>
          </div>
        </StickyCTA>
      </ScreenContainer>

      <ProductGalleryFullscreen
        open={fullscreen !== null}
        images={car.images}
        initialIndex={fullscreen ?? 0}
        alt={car.title}
        onClose={() => setFullscreen(null)}
      />
    </>
  )
}

function SpecRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="auto-product__spec-label">{label}</dt>
      <dd className={`auto-product__spec-value ${mono ? 'auto-product__spec-value--mono' : ''}`}>{value}</dd>
    </>
  )
}
