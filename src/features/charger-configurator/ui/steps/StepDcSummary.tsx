import React from 'react';
import {
  DcChargerConfig,
  DC_STATION_LABELS,
  DC_CONNECTOR_LABELS,
  DC_COLOR_LABELS,
} from '../../model/dc-charger.types';
import { ScrollArea } from '../ScrollArea';
import './StepDcSummary.css';

interface StepDcSummaryProps {
  config: DcChargerConfig;
  onBack: () => void;
  onSubmit: () => void;
}

export const StepDcSummary: React.FC<StepDcSummaryProps> = ({ config, onBack, onSubmit }) => {
  const stationLabel = config.stationType ? DC_STATION_LABELS[config.stationType] : '—';

  return (
    <div className="step-dc-sum">
      <h2>{stationLabel}</h2>
      <p className="dc-sum-subtitle">
        {config.power ? `${config.power} кВт` : '—'} · DC
      </p>

      <ScrollArea className="dc-sum-scroll">
        <div className="dc-sum-list">
          <div className="dc-sum-item">
            <span className="dc-sum-label">Форм-фактор</span>
            <span className="dc-sum-value">{stationLabel}</span>
          </div>
          <div className="dc-sum-item">
            <span className="dc-sum-label">Потужність</span>
            <span className="dc-sum-value">{config.power ? `${config.power} кВт` : '—'}</span>
          </div>
          <div className="dc-sum-item">
            <span className="dc-sum-label">Конектори</span>
            <div className="dc-sum-connectors">
              {config.connectors.length === 0 && <span className="dc-sum-value">—</span>}
              {config.connectors.map((c, i) => (
                <span key={c.id} className="dc-sum-value">
                  {i + 1}. {DC_CONNECTOR_LABELS[c.type]}
                </span>
              ))}
            </div>
          </div>
          <div className="dc-sum-item">
            <span className="dc-sum-label">Функції</span>
            <div className="dc-sum-connectors">
              {!config.features.terminal && !config.features.cableManagement && (
                <span className="dc-sum-value">—</span>
              )}
              {config.features.terminal && (
                <span className="dc-sum-value">Платіжний термінал</span>
              )}
              {config.features.cableManagement && (
                <span className="dc-sum-value">Підтримка кабелю (MPK)</span>
              )}
            </div>
          </div>
          <div className="dc-sum-item">
            <span className="dc-sum-label">Колір</span>
            <span className="dc-sum-value">
              {config.color === 'custom' ? (
                <span className="dc-sum-color-custom">
                  <span
                    className="dc-sum-color-chip"
                    style={{ background: config.customColor }}
                  />
                  {DC_COLOR_LABELS.custom} ({config.customColor.toUpperCase()})
                </span>
              ) : (
                DC_COLOR_LABELS[config.color]
              )}
            </span>
          </div>
        </div>

        <div className="dc-sum-form-section">
        <h3>Отримати PDF</h3>
        <p>Заповніть форму — ми надішлемо PDF на ваш email. Наш представник зв'яжеться з вами для уточнення деталей.</p>
        <form className="dc-sum-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="dc-form-group">
            <label htmlFor="dc-name">Повне ім'я*</label>
            <input type="text" id="dc-name" name="name" required />
          </div>
          <div className="dc-form-group">
            <label htmlFor="dc-company">Компанія</label>
            <input type="text" id="dc-company" name="company" />
          </div>
          <div className="dc-form-group">
            <label htmlFor="dc-email">Email*</label>
            <input type="email" id="dc-email" name="email" required />
          </div>
          <div className="dc-form-group">
            <label htmlFor="dc-phone">Телефон*</label>
            <input type="tel" id="dc-phone" name="phone" placeholder="+380 (XX) XXX-XX-XX" required />
          </div>
          <div className="dc-form-group">
            <label htmlFor="dc-message">Повідомлення</label>
            <textarea id="dc-message" name="message" rows={3} />
          </div>
          <button type="submit" className="btn btn-submit">Відправити</button>
        </form>
        </div>
      </ScrollArea>

      <div className="dc-sum-nav">
        <button type="button" className="btn btn-back" onClick={onBack}>Назад</button>
        <button type="button" className="btn btn-submit" onClick={onSubmit}>Надіслати</button>
      </div>
    </div>
  );
};
