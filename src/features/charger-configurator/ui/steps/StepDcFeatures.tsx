import React, { useEffect, useRef } from 'react';
import {
  DcStationType,
  DcColorOption,
  DcFeatures,
  DC_COLOR_LABELS,
  DC_HAS_TERMINAL,
  DC_HAS_CABLE_MANAGEMENT,
} from '../../model/dc-charger.types';
import { ScrollArea } from '../ScrollArea';
import { ColorPicker } from '../ColorPicker';
import './StepDcFeatures.css';

interface StepDcFeaturesProps {
  stationType: DcStationType;
  features: DcFeatures;
  selectedColor: DcColorOption;
  customColor: string;
  onToggleTerminal: () => void;
  onToggleCableManagement: () => void;
  onColorSelect: (c: DcColorOption) => void;
  onCustomColorChange: (hex: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepDcFeatures: React.FC<StepDcFeaturesProps> = ({
  stationType,
  features,
  selectedColor,
  customColor,
  onToggleTerminal,
  onToggleCableManagement,
  onColorSelect,
  onCustomColorChange,
  onBack,
  onNext,
}) => {
  const hasTerminal = DC_HAS_TERMINAL.includes(stationType);
  const hasCm = DC_HAS_CABLE_MANAGEMENT.includes(stationType);
  const colors: DcColorOption[] = ['black', 'grey', 'white', 'custom'];

  // Bring the colour picker into view when "Мій колір" is tapped (it opens
  // below the swatch grid, often past the scroll fold).
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedColor === 'custom') {
      pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedColor]);

  return (
    <div className="step-dc-feat">
      <h2>Додаткові функції</h2>
      <p>Опціональні можливості та колір корпусу.</p>

      <ScrollArea className="dc-feat-scroll">
        {(hasTerminal || hasCm) && (
          <div className="dc-feat-section">
            <p className="dc-feat-section-title">Опції</p>
            <div className="dc-feat-toggles">
              {hasTerminal && (
                <button
                  type="button"
                  className={`dc-feat-toggle ${features.terminal ? 'active' : ''}`}
                  onClick={onToggleTerminal}
                >
                  <span className="dc-feat-toggle-check">{features.terminal ? '✓' : ''}</span>
                  <span className="dc-feat-toggle-content">
                    <span className="dc-feat-toggle-label">Платіжний термінал</span>
                    <span className="dc-feat-toggle-desc">Вбудований термінал для оплати</span>
                  </span>
                </button>
              )}
              {hasCm && (
                <button
                  type="button"
                  className={`dc-feat-toggle ${features.cableManagement ? 'active' : ''}`}
                  onClick={onToggleCableManagement}
                >
                  <span className="dc-feat-toggle-check">{features.cableManagement ? '✓' : ''}</span>
                  <span className="dc-feat-toggle-content">
                    <span className="dc-feat-toggle-label">Система підтримки кабелю</span>
                    <span className="dc-feat-toggle-desc">MPK-корпус з тримачем кабелю</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="dc-feat-section">
          <p className="dc-feat-section-title">Колір корпусу</p>
          <div className="dc-color-grid">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`dc-color-option ${selectedColor === color ? 'active' : ''}`}
                onClick={() => onColorSelect(color)}
                title={DC_COLOR_LABELS[color]}
              >
                {color === 'custom' ? (
                  <div
                    className="dc-color-preview dc-color-preview--custom"
                    style={selectedColor === 'custom' ? { background: customColor } : undefined}
                  />
                ) : (
                  <div className="dc-color-preview" data-color={color} />
                )}
                <span className="dc-color-label">{DC_COLOR_LABELS[color]}</span>
              </button>
            ))}
          </div>

          {selectedColor === 'custom' && (
            <div ref={pickerRef}>
              <ColorPicker value={customColor} onChange={onCustomColorChange} />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="step-dc-nav">
        <button type="button" className="btn btn-back" onClick={onBack}>Назад</button>
        <button type="button" className="btn btn-next" onClick={onNext}>Далі</button>
      </div>
    </div>
  );
};
