import { useState, useCallback } from 'react';
import {
  DcChargerConfig,
  DcStationType,
  DcPower,
  DcConnectorType,
  DcColorOption,
  DcConnector,
  DC_MAX_CONNECTORS,
  DC_MAX_CONNECTORS_CM,
} from '../model/dc-charger.types';

const INITIAL_CONFIG: DcChargerConfig = {
  step: 1,
  stationType: null,
  power: null,
  connectors: [],
  features: { terminal: false, cableManagement: false },
  color: 'black',
  customColor: '#1a6b3c',
};

export function useDcChargerConfig() {
  const [config, setConfig] = useState<DcChargerConfig>(INITIAL_CONFIG);

  const setStep = useCallback((step: number) => {
    setConfig((prev) => ({ ...prev, step }));
  }, []);

  const setStationType = useCallback((stationType: DcStationType) => {
    setConfig((prev) => ({
      ...prev,
      stationType,
      connectors: [],
      features: { terminal: false, cableManagement: false },
    }));
  }, []);

  const setPower = useCallback((power: DcPower) => {
    setConfig((prev) => ({ ...prev, power }));
  }, []);

  const addConnector = useCallback((type: DcConnectorType) => {
    setConfig((prev) => {
      if (!prev.stationType) return prev;
      const max = prev.features.cableManagement
        ? DC_MAX_CONNECTORS_CM[prev.stationType]
        : DC_MAX_CONNECTORS[prev.stationType];
      if (prev.connectors.length >= max) return prev;
      const connector: DcConnector = {
        id: `${Date.now()}-${prev.connectors.length}`,
        type,
        position: prev.connectors.length + 1,
      };
      return { ...prev, connectors: [...prev.connectors, connector] };
    });
  }, []);

  const removeConnector = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      connectors: prev.connectors
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, position: i + 1 })),
    }));
  }, []);

  const toggleTerminal = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      features: { ...prev.features, terminal: !prev.features.terminal },
    }));
  }, []);

  const toggleCableManagement = useCallback(() => {
    setConfig((prev) => {
      const nextCm = !prev.features.cableManagement;
      const max = prev.stationType
        ? (nextCm ? DC_MAX_CONNECTORS_CM[prev.stationType] : DC_MAX_CONNECTORS[prev.stationType])
        : 0;
      return {
        ...prev,
        features: { ...prev.features, cableManagement: nextCm },
        // drop excess connectors if new max is lower
        connectors: prev.connectors.slice(0, max).map((c, i) => ({ ...c, position: i + 1 })),
      };
    });
  }, []);

  const setColor = useCallback((color: DcColorOption) => {
    setConfig((prev) => ({ ...prev, color }));
  }, []);

  const setCustomColor = useCallback((customColor: string) => {
    setConfig((prev) => ({ ...prev, customColor, color: 'custom' }));
  }, []);

  const canAddMoreConnectors = config.stationType
    ? config.connectors.length < (
        config.features.cableManagement
          ? DC_MAX_CONNECTORS_CM[config.stationType]
          : DC_MAX_CONNECTORS[config.stationType]
      )
    : false;

  return {
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
  };
}
