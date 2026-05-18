import { useEffect, useState } from 'react'
import './PhotoUpload.css'

export type LocalPhoto = {
  id: string
  file: File
  dataUrl: string
}

type Props = {
  /** Max number of slots. Default 5. */
  max?: number
  value?: LocalPhoto[]
  onChange?: (photos: LocalPhoto[]) => void
  required?: boolean
  label?: string
  hint?: string
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result ?? ''))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export function PhotoUpload({
  max = 5,
  value,
  onChange,
  required = false,
  label = 'Фото',
  hint,
}: Props) {
  const [photos, setPhotos] = useState<LocalPhoto[]>(value ?? [])

  useEffect(() => {
    onChange?.(photos)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos])

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
    if (incoming.length === 0) return
    const remaining = max - photos.length
    const accepted = incoming.slice(0, remaining)
    const next: LocalPhoto[] = []
    for (const file of accepted) {
      const dataUrl = await fileToDataUrl(file)
      next.push({ id: randomId(), file, dataUrl })
    }
    setPhotos((cur) => [...cur, ...next])
    // reset input so the same file can be re-picked
    e.target.value = ''
  }

  function remove(id: string) {
    setPhotos((cur) => cur.filter((p) => p.id !== id))
  }

  const slots = Array.from({ length: max }, (_, i) => photos[i])

  return (
    <div className="photo-upload">
      <div className="photo-upload__label-row">
        <span className="photo-upload__label">
          {label}
          {required && <span className="photo-upload__required" aria-hidden="true"> *</span>}
        </span>
        <span className="photo-upload__count">
          {photos.length} / {max}
        </span>
      </div>

      <div className="photo-upload__grid">
        {slots.map((p, i) =>
          p ? (
            <div key={p.id} className="photo-upload__slot photo-upload__slot--filled">
              <img src={p.dataUrl} alt="" />
              <button
                type="button"
                className="photo-upload__remove"
                onClick={() => remove(p.id)}
                aria-label="Видалити фото"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ) : (
            <label key={`empty-${i}`} className="photo-upload__slot photo-upload__slot--empty">
              <input
                type="file"
                accept="image/*"
                multiple
                className="photo-upload__file-input"
                onChange={handleFiles}
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </label>
          ),
        )}
      </div>

      {hint && <p className="photo-upload__hint">{hint}</p>}
    </div>
  )
}
