import './AutoCardSkeleton.css'

type Props = {
  view: 1 | 2 | 3
}

export function AutoCardSkeleton({ view }: Props) {
  return (
    <li className={`auto-skel auto-skel--v${view}`}>
      <div className="auto-skel__image" />
      <div className="auto-skel__body">
        <span className="auto-skel__line auto-skel__line--title" />
        <span className="auto-skel__line auto-skel__line--meta" />
        <span className="auto-skel__line auto-skel__line--price" />
      </div>
    </li>
  )
}

export function AutoSkeletonList({ view, count = 6 }: { view: 1 | 2 | 3; count?: number }) {
  return (
    <ul className={`auto-page__list auto-page__list--v${view}`} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <AutoCardSkeleton key={i} view={view} />
      ))}
    </ul>
  )
}
