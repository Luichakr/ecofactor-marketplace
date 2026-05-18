import './HomeTransition.css'

type Props = {
  title?: string
  hint?: string
}

export function HomeTransition({ title = 'The New', hint = 'ПРОКРУТИТИ ВНИЗ' }: Props) {
  return (
    <section className="home-transition">
      <div className="home-transition__inner">
        <h2 className="home-transition__title">{title}</h2>
        <p className="home-transition__hint">{hint}</p>
        <span className="home-transition__line" aria-hidden="true" />
      </div>
    </section>
  )
}
