// Form factors
export type FormFactor = 'eco-totem' | 'eco-wall';

// Power options
export type PowerOption = 'up-to-22' | 'up-to-44' | 'from-44';

// Connector types
// Y=Type1(7kW) D=Type2cable(7kW) F=GBT(7kW) P=Type2cable(22kW) E=socket(22kW) B=GBT(22kW) A=NACS(7kW,AWonly)
export type ConnectorType =
  | 'type1-7'       // Y
  | 'type2-7'       // D
  | 'gbt-7'         // F
  | 'type2-22'      // P
  | 'type2-socket-22' // E
  | 'gbt-22'        // B
  | 'nacs-7';       // A (AW only)

// Color options ('custom' = user-picked RAL/hex via the colour picker)
export type ColorOption = 'black' | 'grey' | 'green' | 'white' | 'custom';

// Station type
export type StationType = 'aw' | 'nv-duet' | 'nv-trio';

// Connector with position
export interface Connector {
  id: string;
  type: ConnectorType;
  position: number;
}

// Configuration state
export interface ChargerConfig {
  step: number;
  formFactor: FormFactor | null;
  stationType: StationType;
  power: PowerOption | null;
  connectors: Connector[];
  color: ColorOption;
  customColor: string; // hex used when color === 'custom'
  hasTerminal: boolean;
  hasStand: boolean;
}

// Power limits (from-44 allows up to 3×22=66kW)
export const POWER_LIMITS: Record<PowerOption, number> = {
  'up-to-22': 22,
  'up-to-44': 44,
  'from-44': 66,
};

// Connector power consumption
export const CONNECTOR_POWER: Record<ConnectorType, number> = {
  'type1-7': 7,
  'type2-7': 7,
  'gbt-7': 7,
  'type2-22': 22,
  'type2-socket-22': 22,
  'gbt-22': 22,
  'nacs-7': 7,
};

// Connector labels
export const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  'type1-7': 'Type 1 (7 kW)',
  'type2-7': 'Type 2 (7 kW)',
  'gbt-7': 'GB/T (7 kW)',
  'type2-22': 'Type 2 (22 kW)',
  'type2-socket-22': 'Type 2 розетка (22 kW)',
  'gbt-22': 'GB/T (22 kW)',
  'nacs-7': 'NACS AC (7 kW)',
};

// Connector button icons (CDN)
export const CONNECTOR_ICONS: Record<ConnectorType, string> = {
  'type1-7': 'https://ecofactortech.com/wp-content/uploads/2026/04/type-3.png',
  'type2-7': 'https://ecofactortech.com/wp-content/uploads/2026/04/type-2.png',
  'gbt-7': 'https://ecofactortech.com/wp-content/uploads/2026/04/type.png',
  'type2-22': 'https://ecofactortech.com/wp-content/uploads/2026/04/type-2.png',
  'type2-socket-22': 'https://ecofactortech.com/wp-content/uploads/2026/04/type-2.png',
  'gbt-22': 'https://ecofactortech.com/wp-content/uploads/2026/04/type.png',
  'nacs-7': 'https://ecofactortech.com/wp-content/uploads/2026/04/nacs.png',
};

// Available connectors per station type
// NV: Y D F P E B (no NACS). AW: Y D F P E B A.
export const AVAILABLE_CONNECTORS: Record<StationType, ConnectorType[]> = {
  'aw':      ['type1-7', 'type2-7', 'gbt-7', 'type2-22', 'type2-socket-22', 'gbt-22', 'nacs-7'],
  'nv-duet': ['type1-7', 'type2-7', 'gbt-7', 'type2-22', 'type2-socket-22', 'gbt-22'],
  'nv-trio': ['type1-7', 'type2-7', 'gbt-7', 'type2-22', 'type2-socket-22', 'gbt-22'],
};

// Max connectors per station type
export const MAX_CONNECTORS: Record<StationType, number> = {
  'aw': 3,
  'nv-duet': 2,
  'nv-trio': 3,
};

// Min connectors per station type
export const MIN_CONNECTORS: Record<StationType, number> = {
  'aw': 1,
  'nv-duet': 2,
  'nv-trio': 2,
};

// Form factor names
export const FORM_FACTOR_LABELS: Record<FormFactor, string> = {
  'eco-totem': 'ECO Totem',
  'eco-wall': 'ECO Wall',
};

// Colors available per station type
export const AVAILABLE_COLORS: Record<StationType, ColorOption[]> = {
  'aw':      ['black', 'grey', 'green', 'custom'],
  'nv-duet': ['black', 'grey', 'white', 'custom'],
  'nv-trio': ['black', 'grey', 'white', 'custom'],
};

// Color labels
export const COLOR_LABELS: Record<ColorOption, string> = {
  'black': 'Класичний чорний',
  'grey': 'Матовий сірий',
  'green': 'Зелений',
  'white': 'Глянцевий білий',
  'custom': 'Мій колір',
};

// Terminal image (NV Duet only)
export const TERMINAL_IMAGE_URL =
  'https://ecofactortech.com/wp-content/uploads/ecofactor-configurator/layers/NV_duet_terminal.png';
