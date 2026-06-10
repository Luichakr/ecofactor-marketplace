import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDcChargerConfig } from '../hooks/useDcChargerConfig';
import { DcConfiguratorPreview } from './DcConfiguratorPreview';
import { StepDcFormFactor } from './steps/StepDcFormFactor';
import { StepDcPower } from './steps/StepDcPower';
import { StepDcConnectors } from './steps/StepDcConnectors';
import { StepDcFeatures } from './steps/StepDcFeatures';
import { StepDcSummary } from './steps/StepDcSummary';
import { Header } from '../../../shared/ui/Header/Header';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer/ScreenContainer';
import './ChargerConfigurator.css';

const TOTAL_STEPS = 5;
const WIZARD_LABELS = ['Форм-фактор', 'Потужність', 'Конектори', 'Функції', 'Зведення'];

export const DcChargerConfigurator: React.FC = () => {
  const navigate = useNavigate();

  const {
    config,
    setStep,
    setStationType,
    setPower,
    addConnector,
    removeConnector,
    toggleTerminal,
    toggleCableManagement,
    setColor,
    setCustomColor,
    canAddMoreConnectors,
  } = useDcChargerConfig();

  const handleNext = () => {
    if (config.step < TOTAL_STEPS) setStep(config.step + 1);
  };

  const handleBack = () => {
    if (config.step > 1) setStep(config.step - 1);
    else navigate(-1);
  };

  const handleSubmit = () => {
    console.log('DC configuration submitted:', config);
  };

  return (
    <>
      <Header
        title="DC КОНФІГУРАТОР"
        showBack
        onBack={handleBack}
      />
      <ScreenContainer withTopInset={false}>
        <div className="charger-configurator">

          <nav className="cc-steps" aria-label="Кроки">
            {[1, 2, 3, 4, 5].map((step, i) => {
              const state =
                config.step > step ? 'done' : config.step === step ? 'active' : 'todo';
              return (
                <Fragment key={step}>
                  <button
                    type="button"
                    className={`cc-step cc-step--${state}`}
                    onClick={() => config.step >= step && setStep(step)}
                    disabled={config.step < step}
                    aria-label={WIZARD_LABELS[i]}
                  >
                    <span className="cc-step-circle">
                      {state === 'done' ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M3 7L6 10L11 4"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        step
                      )}
                    </span>
                  </button>
                  {step < 5 && (
                    <span
                      className={`cc-step-line ${config.step > step ? 'cc-step-line--done' : ''}`}
                    />
                  )}
                </Fragment>
              );
            })}
          </nav>

          {config.stationType && (
            <div className="cc-preview">
              <DcConfiguratorPreview config={config} />
            </div>
          )}

          <section className="cc-panel">
            {config.step === 1 && (
              <StepDcFormFactor
                selected={config.stationType}
                onSelect={setStationType}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {config.step === 2 && config.stationType && (
              <StepDcPower
                stationType={config.stationType}
                selectedPower={config.power}
                onPowerSelect={setPower}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {config.step === 3 && config.stationType && (
              <StepDcConnectors
                stationType={config.stationType}
                connectors={config.connectors}
                hasCableManagement={config.features.cableManagement}
                onAddConnector={addConnector}
                onRemoveConnector={removeConnector}
                onBack={handleBack}
                onNext={handleNext}
                canAddMore={canAddMoreConnectors}
              />
            )}

            {config.step === 4 && config.stationType && (
              <StepDcFeatures
                stationType={config.stationType}
                features={config.features}
                selectedColor={config.color}
                customColor={config.customColor}
                onToggleTerminal={toggleTerminal}
                onToggleCableManagement={toggleCableManagement}
                onColorSelect={setColor}
                onCustomColorChange={setCustomColor}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {config.step === 5 && (
              <StepDcSummary
                config={config}
                onBack={handleBack}
                onSubmit={handleSubmit}
              />
            )}
          </section>
        </div>
      </ScreenContainer>
    </>
  );
};
