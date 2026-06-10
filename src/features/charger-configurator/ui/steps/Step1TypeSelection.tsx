import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../shared/config/routes';
import heroImg from '../../../../assets/configurator/nv-duet/body_black.png';
import './Step1TypeSelection.css';

interface Step1TypeSelectionProps {
  onNext: () => void;
}

export const Step1TypeSelection: React.FC<Step1TypeSelectionProps> = ({ onNext }) => {
  const navigate = useNavigate();

  return (
    <div className="step-1">
      <div className="step-1__hero" aria-hidden="true">
        <img src={heroImg} alt="" className="step-1__hero-layer" />
      </div>

      <h2 className="step-1__title">Конфігуратор зарядних станцій</h2>
      <p className="step-1__lead">
        Скористайтесь конфігуратором, щоб обрати форм-фактор, потужність,
        конектори та додаткові функції. Отримайте персоналізовану
        пропозицію за кілька хвилин.
      </p>

      <div className="step-1__cta">
        <button type="button" className="step-1__btn step-1__btn--primary" onClick={onNext}>
          Підібрати AC-станцію
        </button>
        <button
          type="button"
          className="step-1__btn step-1__btn--outline"
          onClick={() => navigate(ROUTES.CHARGER_CONFIGURATOR_DC)}
        >
          Підібрати DC-станцію
        </button>
      </div>

      <ul className="step-1__perks">
        <li>Безкоштовна консультація</li>
        <li>Індивідуальний підхід</li>
      </ul>
    </div>
  );
};
