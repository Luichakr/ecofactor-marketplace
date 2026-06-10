import React from 'react';
import { PowerOption } from '../../model/charger.types';
import { ScrollArea } from '../ScrollArea';
import './Step2PowerSelection.css';

interface Step2PowerSelectionProps {
  selectedPower: PowerOption | null;
  onPowerSelect: (power: PowerOption) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2PowerSelection: React.FC<Step2PowerSelectionProps> = ({
  selectedPower,
  onPowerSelect,
  onBack,
  onNext,
}) => {
  const powers: { id: PowerOption; label: string; description: string }[] = [
    {
      id: 'up-to-22',
      label: 'до 22 кВт',
      description: 'Підійде для невеликих локацій або станцій з одним портом.',
    },
    {
      id: 'up-to-44',
      label: 'до 44 кВт',
      description: 'Хороше рішення для станцій із двома портами.',
    },
    {
      id: 'from-44',
      label: 'від 44 кВт',
      description: 'Для місць із більшим трафіком: кілька портів із різною потужністю.',
    },
  ];

  return (
    <div className="step-2-container">
      <div className="step-2-content">
        <h2>Крок 2: Вільна потужність</h2>
        <p>Скільки вільної потужності має локація? Це загальний ліміт на всю станцію.</p>

        <ScrollArea className="power-selector">
          {powers.map((power) => (
            <button
              key={power.id}
              className={`power-option ${selectedPower === power.id ? 'active' : ''}`}
              onClick={() => onPowerSelect(power.id)}
            >
              <div className="power-option-label">{power.label}</div>
              <div className="power-option-description">{power.description}</div>
            </button>
          ))}
        </ScrollArea>

        <p className="info-text">* На наступному кроці ви зможете розподілити цей ліміт між портами.</p>

        <div className="step-navigation">
          <button className="btn btn-back" onClick={onBack}>
            Назад
          </button>
          <button className="btn btn-next" onClick={onNext} disabled={!selectedPower}>
            Далі
          </button>
        </div>
      </div>
    </div>
  );
};
