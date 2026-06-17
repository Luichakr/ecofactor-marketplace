import React, { Fragment } from 'react';
import { useGoBack } from '../../../shared/lib/useGoBack';
import { useChargerConfig } from '../hooks/useChargerConfig';
import { ConfiguratorPreview } from './ConfiguratorPreview';
import { Step1TypeSelection } from './steps/Step1TypeSelection';
import { StepFormFactor } from './steps/StepFormFactor';
import { Step2PowerSelection } from './steps/Step2PowerSelection';
import { Step3ConnectorSelection } from './steps/Step3ConnectorSelection';
import { Step4Features } from './steps/Step4Features';
import { Step5Summary } from './steps/Step5Summary';
import { Header } from '../../../shared/ui/Header/Header';
import { ScreenContainer } from '../../../shared/ui/ScreenContainer/ScreenContainer';
import './ChargerConfigurator.css';

// Step 1 = AC/DC landing (no indicator, no preview)
// Steps 2-6 = wizard (indicator shows steps 1-5)
const TOTAL_STEPS = 6;
const WIZARD_LABELS = ['Форм-фактор', 'Потужність', 'Конектори', 'Функції', 'Зведення'];

export const ChargerConfigurator: React.FC = () => {
  const goBack = useGoBack();

  const {
    config,
    setStep,
    setFormFactor,
    setPower,
    addConnector,
    removeConnector,
    setColor,
    setCustomColor,
    toggleTerminal,
    toggleStand,
    totalUsedPower,
    powerLimit,
    canAddMoreConnectors,
    hasMinConnectors,
  } = useChargerConfig();

  const handleNext = () => {
    if (config.step < TOTAL_STEPS) setStep(config.step + 1);
  };

  const handleBack = () => {
    if (config.step > 1) setStep(config.step - 1);
  };

  const handleSubmit = () => {
    console.log('Configuration submitted:', config);
  };

  // On step 1 (landing) hide indicator and preview
  const isLanding = config.step === 1;
  // Wizard step number shown in indicator = config.step - 1
  const wizardStep = config.step - 1;

  return (
    <>
      <Header
        title="КОНФІГУРАТОР СТАНЦІЇ"
        showBack
        onBack={() => config.step > 1 ? setStep(config.step - 1) : goBack()}
      />
      <ScreenContainer withTopInset={false}>
        <div className="charger-configurator">

          {!isLanding && (
            <nav className="cc-steps" aria-label="Кроки">
              {[1, 2, 3, 4, 5].map((step, i) => {
                const state =
                  wizardStep > step ? 'done' : wizardStep === step ? 'active' : 'todo';
                return (
                  <Fragment key={step}>
                    <button
                      type="button"
                      className={`cc-step cc-step--${state}`}
                      onClick={() => wizardStep >= step && setStep(step + 1)}
                      disabled={wizardStep < step}
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
                        className={`cc-step-line ${wizardStep > step ? 'cc-step-line--done' : ''}`}
                      />
                    )}
                  </Fragment>
                );
              })}
            </nav>
          )}

          {!isLanding && (
            <div className="cc-preview">
              <ConfiguratorPreview config={config} />
            </div>
          )}

          <section className="cc-panel">
            {config.step === 1 && (
              <Step1TypeSelection onNext={handleNext} />
            )}

            {config.step === 2 && (
              <StepFormFactor
                selectedFormFactor={config.formFactor}
                onFormFactorSelect={setFormFactor}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {config.step === 3 && (
              <Step2PowerSelection
                selectedPower={config.power}
                onPowerSelect={setPower}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {config.step === 4 && (
              <Step3ConnectorSelection
                stationType={config.stationType}
                connectors={config.connectors}
                totalUsedPower={totalUsedPower}
                powerLimit={powerLimit}
                onAddConnector={addConnector}
                onRemoveConnector={removeConnector}
                onBack={handleBack}
                onNext={handleNext}
                canAddMore={canAddMoreConnectors}
                hasMinConnectors={hasMinConnectors}
              />
            )}

            {config.step === 5 && (
              <Step4Features
                selectedColor={config.color}
                customColor={config.customColor}
                stationType={config.stationType}
                hasTerminal={config.hasTerminal}
                hasStand={config.hasStand}
                onColorSelect={setColor}
                onCustomColorChange={setCustomColor}
                onToggleTerminal={toggleTerminal}
                onToggleStand={toggleStand}
                onBack={handleBack}
                onNext={handleNext}
              />
            )}

            {config.step === 6 && (
              <Step5Summary
                config={config}
                totalUsedPower={totalUsedPower}
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
