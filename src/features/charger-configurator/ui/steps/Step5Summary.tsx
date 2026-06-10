import React from 'react';
import {
  ChargerConfig,
  CONNECTOR_LABELS,
  COLOR_LABELS,
  FORM_FACTOR_LABELS,
  Connector,
} from '../../model/charger.types';
import { ScrollArea } from '../ScrollArea';

import './Step5Summary.css';

interface Step5SummaryProps {
  config: ChargerConfig;
  totalUsedPower: number;
  onBack: () => void;
  onSubmit: () => void;
}

export const Step5Summary: React.FC<Step5SummaryProps> = ({
  config,
  totalUsedPower,
  onBack,
  onSubmit,
}) => {
  const formFactorLabel = config.formFactor ? FORM_FACTOR_LABELS[config.formFactor] : '—';
  const powerLabel = config.power === 'up-to-22' ? 'до 22 кВт'
    : config.power === 'up-to-44' ? 'до 44 кВт'
    : 'від 44 кВт';

  return (
    <div className="step-5-container">
      <div className="step-5-content">
        <h2>Підсумок</h2>
        <p className="config-subtitle">{formFactorLabel} · {powerLabel} · {totalUsedPower} кВт</p>

        <ScrollArea className="step-5-scroll">
          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-label">Форм-фактор</span>
              <span className="summary-value">{formFactorLabel}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Потужність</span>
              <span className="summary-value">{powerLabel}</span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Конектори</span>
              <div className="summary-connectors">
                {config.connectors.map((connector: Connector, index: number) => (
                  <span key={connector.id} className="summary-connector-tag">
                    {index + 1}. {CONNECTOR_LABELS[connector.type]}
                  </span>
                ))}
                {config.connectors.length === 0 && (
                  <span className="summary-value">—</span>
                )}
              </div>
            </div>

            <div className="summary-item">
              <span className="summary-label">Колір</span>
              <span className="summary-value">
                {config.color === 'custom' ? (
                  <span className="summary-color-custom">
                    <span
                      className="summary-color-chip"
                      style={{ background: config.customColor }}
                    />
                    {COLOR_LABELS.custom} ({config.customColor.toUpperCase()})
                  </span>
                ) : (
                  COLOR_LABELS[config.color]
                )}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Функції</span>
              <div className="summary-connectors">
                {config.hasTerminal && (
                  <span className="summary-connector-tag">Платіжний термінал</span>
                )}
                {config.hasStand && (
                  <span className="summary-connector-tag">Стійка в комплекті</span>
                )}
                {!config.hasTerminal && !config.hasStand && (
                  <span className="summary-value">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
          <h3>Отримати PDF</h3>
          <p>Заповніть форму — ми надішлемо PDF на ваш email і запустимо завантаження. Наш представник зв'яжеться з вами для уточнення деталей.</p>

          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className="form-group">
              <label htmlFor="cf-name">Повне ім'я*</label>
              <input type="text" id="cf-name" name="name" required />
            </div>

            <div className="form-group">
              <label htmlFor="cf-company">Компанія</label>
              <input type="text" id="cf-company" name="company" />
            </div>

            <div className="form-group">
              <label htmlFor="cf-email">Email*</label>
              <input type="email" id="cf-email" name="email" required />
            </div>

            <div className="form-group">
              <label htmlFor="cf-phone">Телефон*</label>
              <input type="tel" id="cf-phone" name="phone" placeholder="+380 (XX) XXX-XX-XX" required />
            </div>

            <div className="form-group">
              <label htmlFor="cf-message">Повідомлення</label>
              <textarea id="cf-message" name="message" rows={3} />
            </div>

            <button type="submit" className="btn btn-submit">
              Відправити
            </button>
          </form>
        </div>
        </ScrollArea>

        <div className="step-navigation">
          <button className="btn btn-back" onClick={onBack}>
            Назад
          </button>
          <button className="btn btn-submit" onClick={onSubmit}>
            Надіслати
          </button>
        </div>
      </div>
    </div>
  );
};
