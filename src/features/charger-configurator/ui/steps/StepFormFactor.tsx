import React from 'react';
import { FormFactor } from '../../model/charger.types';
import { ScrollArea } from '../ScrollArea';
import './StepFormFactor.css';

interface StepFormFactorProps {
  selectedFormFactor: FormFactor | null;
  onFormFactorSelect: (ff: FormFactor) => void;
  onBack: () => void;
  onNext: () => void;
}

const OPTIONS: { id: FormFactor; label: string; description: string }[] = [
  {
    id: 'eco-totem',
    label: 'ECO Totem',
    description:
      'Самостійна колона для вулиці та паркінгів; зручно ставити в місцях загального доступу.',
  },
  {
    id: 'eco-wall',
    label: 'ECO Wall',
    description:
      'Компактний корпус для монтажу на стіну або постамент; підходить у випадках, коли простір обмежений.',
  },
];

export const StepFormFactor: React.FC<StepFormFactorProps> = ({
  selectedFormFactor,
  onFormFactorSelect,
  onBack,
  onNext,
}) => {
  return (
    <div className="step-ff-container">
      <div className="step-ff-content">
        <h2>Крок 1: Форм-фактор станції</h2>
        <p>Виберіть вигляд і спосіб встановлення корпусу.</p>

        <ScrollArea className="ff-selector">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`ff-option${selectedFormFactor === opt.id ? ' active' : ''}`}
              onClick={() => onFormFactorSelect(opt.id)}
            >
              <div className="ff-option__label">{opt.label}</div>
              <div className="ff-option__description">{opt.description}</div>
            </button>
          ))}
        </ScrollArea>

        <div className="step-navigation">
          <button type="button" className="btn btn-back" onClick={onBack}>Назад</button>
          <button type="button" className="btn btn-next" onClick={onNext} disabled={!selectedFormFactor}>Далі</button>
        </div>
      </div>
    </div>
  );
};
