import React from 'react';
import {
  DcStationType,
  DC_STATION_LABELS,
  DC_STATION_POWERS,
} from '../../model/dc-charger.types';
import { ScrollArea } from '../ScrollArea';
import './StepDcFormFactor.css';

const STATION_ORDER: DcStationType[] = ['dw', 'mob', '2p', '4p', '8p', '8pnv', '12p'];

const STATION_DESCRIPTIONS: Record<DcStationType, string> = {
  'dw':   'Настінне зарядне — 40–60 кВт',
  'mob':  'Мобільне зарядне — 40–60 кВт',
  '2p':   'Компактна DC-стійка — 60–80 кВт',
  '4p':   'DC-стійка середньої потужності — 90–160 кВт',
  '8p':   'Потужна DC-стійка — 240–320 кВт',
  '8pnv': 'DC-стійка з медіаекраном — 240–320 кВт',
  '12p':  'Флагманська DC-стійка — 360–480 кВт',
};

interface StepDcFormFactorProps {
  selected: DcStationType | null;
  onSelect: (type: DcStationType) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepDcFormFactor: React.FC<StepDcFormFactorProps> = ({
  selected,
  onSelect,
  onBack,
  onNext,
}) => {
  return (
    <div className="step-dc-ff">
      <h2>Форм-фактор станції</h2>
      <p>Оберіть тип DC-зарядної станції.</p>

      <ScrollArea className="dc-ff-list">
        {STATION_ORDER.map((type) => {
          const powers = DC_STATION_POWERS[type];
          const powerStr = powers.length === 1
            ? `${powers[0]} кВт`
            : `${powers[0]}–${powers[powers.length - 1]} кВт`;
          return (
            <button
              key={type}
              type="button"
              className={`dc-ff-option ${selected === type ? 'active' : ''}`}
              onClick={() => onSelect(type)}
            >
              <span className="dc-ff-name">{DC_STATION_LABELS[type]}</span>
              <span className="dc-ff-desc">{STATION_DESCRIPTIONS[type]}</span>
              <span className="dc-ff-power">{powerStr}</span>
            </button>
          );
        })}
      </ScrollArea>

      <div className="step-dc-nav">
        <button type="button" className="btn btn-back" onClick={onBack}>Назад</button>
        <button
          type="button"
          className="btn btn-next"
          onClick={onNext}
          disabled={!selected}
        >
          Далі
        </button>
      </div>
    </div>
  );
};
