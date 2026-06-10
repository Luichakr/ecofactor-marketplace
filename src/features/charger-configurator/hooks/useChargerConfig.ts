import { useState, useCallback } from 'react';
import {
  ChargerConfig,
  FormFactor,
  PowerOption,
  ConnectorType,
  ColorOption,
  StationType,
  POWER_LIMITS,
  CONNECTOR_POWER,
  MAX_CONNECTORS,
  MIN_CONNECTORS,
  AVAILABLE_COLORS,
  Connector,
} from '../model/charger.types';

const INITIAL_CONFIG: ChargerConfig = {
  step: 1,
  formFactor: null,
  stationType: 'aw',
  power: null,
  connectors: [],
  color: 'black',
  customColor: '#1a6b3c',
  hasTerminal: false,
  hasStand: true,
};

// ECO Totem: nv-duet when ≤2 connectors, nv-trio when 3
function resolveNvType(connectorCount: number): StationType {
  return connectorCount >= 3 ? 'nv-trio' : 'nv-duet';
}

export function useChargerConfig() {
  const [config, setConfig] = useState<ChargerConfig>(INITIAL_CONFIG);

  const setStep = useCallback((step: number) => {
    setConfig((prev) => ({ ...prev, step }));
  }, []);

  const setFormFactor = useCallback((formFactor: FormFactor) => {
    setConfig((prev) => {
      const stationType: StationType = formFactor === 'eco-totem' ? 'nv-duet' : 'aw';
      const availableColors = AVAILABLE_COLORS[stationType];
      const color = availableColors.includes(prev.color) ? prev.color : availableColors[0];
      return {
        ...prev,
        formFactor,
        stationType,
        connectors: [],
        hasTerminal: false,
        color,
      };
    });
  }, []);

  const setPower = useCallback((power: PowerOption) => {
    setConfig((prev) => ({ ...prev, power }));
  }, []);

  const setStationType = useCallback((stationType: StationType) => {
    setConfig((prev) => ({ ...prev, stationType, connectors: [] }));
  }, []);

  const addConnector = useCallback((connectorType: ConnectorType) => {
    setConfig((prev) => {
      if (!prev.power) return prev;

      const isNv = prev.formFactor === 'eco-totem';
      const nextCount = prev.connectors.length + 1;
      const nextStationType: StationType = isNv ? resolveNvType(nextCount) : prev.stationType;
      const maxConnectors = MAX_CONNECTORS[nextStationType];
      if (prev.connectors.length >= maxConnectors) return prev;

      const totalUsedPower = prev.connectors.reduce((s, c) => s + CONNECTOR_POWER[c.type], 0);
      const powerLimit = POWER_LIMITS[prev.power];
      if (totalUsedPower + CONNECTOR_POWER[connectorType] > powerLimit) return prev;

      const newConnector: Connector = {
        id: `${Date.now()}-${prev.connectors.length}`,
        type: connectorType,
        position: nextCount,
      };

      return {
        ...prev,
        stationType: nextStationType,
        connectors: [...prev.connectors, newConnector],
        // Terminal exists only on the 2-port duet — drop it when growing to trio.
        hasTerminal: nextStationType === 'nv-duet' ? prev.hasTerminal : false,
      };
    });
  }, []);

  const removeConnector = useCallback((connectorId: string) => {
    setConfig((prev) => {
      const next = prev.connectors
        .filter((c) => c.id !== connectorId)
        .map((c, i) => ({ ...c, position: i + 1 }));
      const isNv = prev.formFactor === 'eco-totem';
      const nextStationType: StationType = isNv ? resolveNvType(next.length) : prev.stationType;
      return { ...prev, connectors: next, stationType: nextStationType };
    });
  }, []);

  const setColor = useCallback((color: ColorOption) => {
    setConfig((prev) => ({ ...prev, color }));
  }, []);

  const setCustomColor = useCallback((customColor: string) => {
    setConfig((prev) => ({ ...prev, customColor, color: 'custom' }));
  }, []);

  const toggleTerminal = useCallback(() => {
    setConfig((prev) => ({ ...prev, hasTerminal: !prev.hasTerminal }));
  }, []);

  const toggleStand = useCallback(() => {
    setConfig((prev) => ({ ...prev, hasStand: !prev.hasStand }));
  }, []);

  const reset = useCallback(() => {
    setConfig(INITIAL_CONFIG);
  }, []);

  const totalUsedPower = config.connectors.reduce((s, c) => s + CONNECTOR_POWER[c.type], 0);
  const powerLimit = config.power ? POWER_LIMITS[config.power] : 0;
  const remainingPower = powerLimit - totalUsedPower;
  // ECO Totem can grow to trio (3), so the cap must follow the form-factor's
  // ceiling — not the current stationType, which is still 'nv-duet' (max 2)
  // until the 3rd port is actually added.
  const effectiveMaxConnectors =
    config.formFactor === 'eco-totem'
      ? MAX_CONNECTORS['nv-trio']
      : MAX_CONNECTORS[config.stationType];
  const canAddMoreConnectors =
    config.connectors.length < effectiveMaxConnectors && remainingPower > 0;
  const hasMinConnectors =
    config.connectors.length >= MIN_CONNECTORS[config.stationType];

  return {
    config,
    setStep,
    setFormFactor,
    setPower,
    setStationType,
    addConnector,
    removeConnector,
    setColor,
    setCustomColor,
    toggleTerminal,
    toggleStand,
    reset,
    totalUsedPower,
    powerLimit,
    remainingPower,
    canAddMoreConnectors,
    hasMinConnectors,
  };
}
