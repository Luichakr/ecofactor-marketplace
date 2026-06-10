import React from 'react';
import { DcStationType, DcPower, DC_STATION_POWERS } from '../../model/dc-charger.types';
import { ScrollArea } from '../ScrollArea';
import './StepDcFormFactor.css';

interface StepDcPowerProps {
  stationType: DcStationType;
  selectedPower: DcPower | null;
  onPowerSelect: (p: DcPower) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepDcPower: React.FC<StepDcPowerProps> = ({
  stationType,
  selectedPower,
  onPowerSelect,
  onBack,
  onNext,
}) => {
  const powers = DC_STATION_POWERS[stationType];

  return (
    <div className="step-dc-ff">
      <h2>Вільна потужність</h2>
      <p>Оберіть загальну потужність станції.</p>

      <ScrollArea className="dc-ff-list">
        {powers.map((kw) => (
          <button
            key={kw}
            type="button"
            className={`dc-ff-option ${selectedPower === kw ? 'active' : ''}`}
            onClick={() => onPowerSelect(kw)}
          >
            <span className="dc-ff-name">{kw} кВт</span>
          </button>
        ))}
      </ScrollArea>

      <div className="step-dc-nav">
        <button type="button" className="btn btn-back" onClick={onBack}>Назад</button>
        <button
          type="button"
          className="btn btn-next"
          onClick={onNext}
          disabled={!selectedPower}
        >
          Далі
        </button>
      </div>
    </div>
  );
};
