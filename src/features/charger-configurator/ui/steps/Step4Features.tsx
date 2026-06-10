import React, { useEffect, useRef } from 'react';
import {
  ColorOption,
  COLOR_LABELS,
  StationType,
  AVAILABLE_COLORS,
} from '../../model/charger.types';
import { ScrollArea } from '../ScrollArea';
import { ColorPicker } from '../ColorPicker';
import './Step4Features.css';

interface Step4FeaturesProps {
  selectedColor: ColorOption;
  customColor: string;
  stationType: StationType;
  hasTerminal: boolean;
  hasStand: boolean;
  onColorSelect: (color: ColorOption) => void;
  onCustomColorChange: (hex: string) => void;
  onToggleTerminal: () => void;
  onToggleStand: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step4Features: React.FC<Step4FeaturesProps> = ({
  selectedColor,
  customColor,
  stationType,
  hasTerminal,
  hasStand,
  onColorSelect,
  onCustomColorChange,
  onToggleTerminal,
  onToggleStand,
  onBack,
  onNext,
}) => {
  // Payment terminal is offered only on the 2-port ECO Totem (NV Duet),
  // matching the production site — not on the 3-port trio or the wall unit.
  const canHaveTerminal = stationType === 'nv-duet';
  const colors = AVAILABLE_COLORS[stationType];

  // The colour picker opens below the swatch grid, often past the scroll fold —
  // bring it into view so the user sees it react to the "Мій колір" tap.
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedColor === 'custom') {
      pickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedColor]);

  return (
    <div className="step-4-container">
      <div className="step-4-content">
        <h2>Крок 4: Додаткові функції</h2>
        <p>Опціональні можливості для зручності та монетизації. Не впливають на ліміт потужності.</p>

        <ScrollArea className="step-4-scroll">
          <div className="features-section">
            <p className="features-section-title">Опції</p>
            <div className="features-toggles">
              {canHaveTerminal && (
                <button
                  type="button"
                  className={`feature-toggle ${hasTerminal ? 'active' : ''}`}
                  onClick={onToggleTerminal}
                >
                  <span className="feature-toggle-check">{hasTerminal ? '✓' : ''}</span>
                  <span className="feature-toggle-content">
                    <span className="feature-toggle-label">Платіжний термінал</span>
                    <span className="feature-toggle-desc">Прийом оплат картками / Apple Pay / Google Pay. Доступний лише для ECO Totem (NV Duet).</span>
                  </span>
                </button>
              )}
              <button
                type="button"
                className={`feature-toggle ${hasStand ? 'active' : ''}`}
                onClick={onToggleStand}
              >
                <span className="feature-toggle-check">{hasStand ? '✓' : ''}</span>
                <span className="feature-toggle-content">
                  <span className="feature-toggle-label">Стійка в комплекті</span>
                  <span className="feature-toggle-desc">Вимкніть, якщо плануєте настінне кріплення або маєте власну стійку.</span>
                </span>
              </button>
            </div>
          </div>

          <div className="features-section">
            <p className="features-section-title">Колір станції</p>
            <p className="section-subtitle">Оберіть колір корпусу</p>
            <div className="color-selector">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`color-option ${selectedColor === color ? 'active' : ''}`}
                  onClick={() => onColorSelect(color)}
                  title={COLOR_LABELS[color]}
                >
                  {color === 'custom' ? (
                    <div
                      className="color-preview color-preview--custom"
                      style={selectedColor === 'custom' ? { background: customColor } : undefined}
                    />
                  ) : (
                    <div className="color-preview" data-color={color} />
                  )}
                  <span className="color-label">{COLOR_LABELS[color]}</span>
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

        <div className="step-navigation">
          <button className="btn btn-back" onClick={onBack}>Назад</button>
          <button className="btn btn-next" onClick={onNext}>Далі</button>
        </div>
      </div>
    </div>
  );
};
