import { useNavigate } from 'react-router-dom'
import { Header } from '../../shared/ui/Header/Header'
import { ScreenContainer } from '../../shared/ui/ScreenContainer/ScreenContainer'
import { Button } from '../../shared/ui/Button/Button'
import { ROUTES } from '../../shared/config/routes'
import './NotFoundPage.css'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <>
      <Header title="404" />
      <ScreenContainer withTopInset={false}>
        <div className="not-found">
          <div className="not-found__code">404</div>
          <h1 className="not-found__title">Сторінку не знайдено</h1>
          <p className="not-found__desc">
            Схоже, такої сторінки не існує. Поверніться на головну.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.MARKETPLACE)}>
            На головну
          </Button>
        </div>
      </ScreenContainer>
    </>
  )
}
