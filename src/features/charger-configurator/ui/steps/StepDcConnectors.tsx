import React, { useState } from 'react';
import {
  DcStationType,
  DcConnectorType,
  DcConnector,
  DC_AVAILABLE_CONNECTORS,
  DC_MAX_CONNECTORS,
  DC_MAX_CONNECTORS_CM,
  DC_CONNECTOR_LABELS,
  DC_CONNECTOR_ICONS,
} from '../../model/dc-charger.types';
import { ScrollArea } from '../ScrollArea';
import './StepDcConnectors.css';

interface StepDcConnectorsProps {
  stationType: DcStationType;
  connectors: DcConnector[];
  hasCableManagement: boolean;
  onAddConnector: (type: DcConnectorType) => void;
  onRemoveConnector: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  canAddMore: boolean;
}

export const StepDcConnectors: React.FC<StepDcConnectorsProps> = ({
  stationType,
  connectors,
  hasCableManagement,
  onAddConnector,
  onRemoveConnector,
  onBack,
  onNext,
  canAddMore,
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const available = DC_AVAILABLE_CONNECTORS[stationType];
  const max = hasCableManagement
    ? DC_MAX_CONNECTORS_CM[stationType]
    : DC_MAX_CONNECTORS[stationType];

  return (
    <div className="step-dc-conn">
      <h2>Конектори</h2>
      <p>Оберіть типи роз'ємів — до {max} позицій.</p>

      <ScrollArea className="dc-conn-scroll">
        <div className="dc-conn-list">
          {connectors.length === 0 && (
            <p className="dc-conn-empty">Додайте хоча б один конектор.</p>
          )}
          {connectors.map((c, i) => (
            <div key={c.id} className="dc-conn-item">
              <img src={DC_CONNECTOR_ICONS[c.type]} alt="" className="dc-conn-item-icon" />
              <span className="dc-conn-num">{i + 1}.</span>
              <span className="dc-conn-label">{DC_CONNECTOR_LABELS[c.type]}</span>
              <button
                type="button"
                className="dc-conn-remove"
                onClick={() => onRemoveConnector(c.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {showSelector && (
          <div className="dc-conn-selector">
            <button
              type="button"
              className="dc-conn-selector-close"
              onClick={() => setShowSelector(false)}
            >
              ✕
            </button>
            <p className="dc-conn-selector-title">Тип конектора</p>
            <div className="dc-conn-options">
              {available.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="dc-conn-option"
                  onClick={() => {
                    onAddConnector(type);
                    if (connectors.length + 1 >= max) setShowSelector(false);
                  }}
                >
                  <img src={DC_CONNECTOR_ICONS[type]} alt="" className="dc-conn-option-icon" />
                  <span className="dc-conn-option-label">{DC_CONNECTOR_LABELS[type]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showSelector && canAddMore && (
          <button
            type="button"
            className="dc-conn-add"
            onClick={() => setShowSelector(true)}
          >
            + Додати конектор
          </button>
        )}
      </ScrollArea>

      <div className="step-dc-nav">
        <button type="button" className="btn btn-back" onClick={onBack}>Назад</button>
        <button
          type="button"
          className="btn btn-next"
          onClick={onNext}
          disabled={connectors.length === 0}
        >
          Далі
        </button>
      </div>
    </div>
  );
};
