import React, { useState } from 'react';
import {
  ConnectorType,
  CONNECTOR_LABELS,
  CONNECTOR_ICONS,
  AVAILABLE_CONNECTORS,
  MAX_CONNECTORS,
  CONNECTOR_POWER,
  Connector,
  StationType,
} from '../../model/charger.types';
import { ScrollArea } from '../ScrollArea';
import './Step3ConnectorSelection.css';

interface Step3ConnectorSelectionProps {
  stationType: StationType;
  connectors: Connector[];
  totalUsedPower: number;
  powerLimit: number;
  onAddConnector: (type: ConnectorType) => void;
  onRemoveConnector: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  canAddMore: boolean;
  hasMinConnectors: boolean;
}

export const Step3ConnectorSelection: React.FC<Step3ConnectorSelectionProps> = ({
  stationType,
  connectors,
  totalUsedPower,
  powerLimit,
  onAddConnector,
  onRemoveConnector,
  onBack,
  onNext,
  canAddMore,
  hasMinConnectors,
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const availableConnectors = AVAILABLE_CONNECTORS[stationType];
  const maxConnectors = MAX_CONNECTORS[stationType];

  return (
    <div className="step-3-container">
      <div className="step-3-content">
        <h2>Крок 3: Конектори</h2>
        <p>Додавайте порти, доки вони поміщаються в обраний ліміт.</p>

        <ScrollArea className="step-3-scroll">
          <div className="power-display">
            <span className="power-label">Використано</span>
            <strong className="power-value">{totalUsedPower}</strong>
            <span className="power-label">із</span>
            <strong className="power-max">{powerLimit}</strong>
            <span className="power-label">кВт</span>
          </div>

          <div className="connector-list">
            {connectors.length === 0 && (
              <p className="empty-message">Додайте хоча б один порт.</p>
            )}
            {connectors.map((connector, index) => (
              <div key={connector.id} className="connector-item">
                <span className="connector-number">{index + 1}.</span>
                <span className="connector-type">{CONNECTOR_LABELS[connector.type]}</span>
                <button
                  className="connector-remove"
                  onClick={() => onRemoveConnector(connector.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {showSelector && (
            <div className="connector-selector">
              <button
                className="selector-close"
                onClick={() => setShowSelector(false)}
              >
                ✕
              </button>
              <p className="selector-title">Оберіть тип конектора</p>
              <div className="connector-options">
                {availableConnectors
                  .filter((type) => totalUsedPower + CONNECTOR_POWER[type] <= powerLimit)
                  .map((type) => (
                  <button
                    key={type}
                    className="connector-option"
                    onClick={() => {
                      onAddConnector(type as ConnectorType);
                      if (connectors.length + 1 >= maxConnectors) {
                        setShowSelector(false);
                      }
                    }}
                  >
                    <img
                      src={CONNECTOR_ICONS[type]}
                      alt=""
                      className="connector-option-icon"
                    />
                    <span className="connector-option-label">{CONNECTOR_LABELS[type]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showSelector && canAddMore && (
            <button className="btn-add-connector" onClick={() => setShowSelector(true)}>
              + Додати конектор
            </button>
          )}
        </ScrollArea>

        <div className="step-navigation">
          <button className="btn btn-back" onClick={onBack}>
            Назад
          </button>
          <button
            className="btn btn-next"
            onClick={onNext}
            disabled={!hasMinConnectors}
          >
            Далі
          </button>
        </div>
      </div>
    </div>
  );
};
