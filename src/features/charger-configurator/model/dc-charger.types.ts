// DC station types
export type DcStationType = 'dw' | 'mob' | '2p' | '4p' | '8p' | '8pnv' | '12p';

// DC power options (kW)
export type DcPower = 40 | 60 | 80 | 90 | 120 | 160 | 240 | 320 | 360 | 480;

// DC connector types
export type DcConnectorType = 'ccs2' | 'gbt-dc' | 'chademo' | 'ccs1' | 'nacs-dc';

// DC color options ('custom' = user-picked RAL/hex via the colour picker)
export type DcColorOption = 'black' | 'grey' | 'white' | 'custom';

// DC optional features
export interface DcFeatures {
  terminal: boolean;
  cableManagement: boolean;
}

// DC connector with position
export interface DcConnector {
  id: string;
  type: DcConnectorType;
  position: number;
}

// DC configuration state
export interface DcChargerConfig {
  step: number;
  stationType: DcStationType | null;
  power: DcPower | null;
  connectors: DcConnector[];
  features: DcFeatures;
  color: DcColorOption;
  customColor: string; // hex used when color === 'custom'
}

// Station labels
export const DC_STATION_LABELS: Record<DcStationType, string> = {
  'dw': 'TOR Wall',
  'mob': 'TOR Mobile',
  '2p': 'TOR Quattro Mini',
  '4p': 'TOR Quattro',
  '8p': 'TOR Quattro',
  '8pnv': 'TOR MEDIA',
  '12p': 'TOR Quattro',
};

// Station power range
export const DC_STATION_POWERS: Record<DcStationType, DcPower[]> = {
  'dw':   [40, 60],
  'mob':  [40, 60],
  '2p':   [60, 80],
  '4p':   [90, 120, 160],
  '8p':   [240, 320],
  '8pnv': [240, 320],
  '12p':  [360, 480],
};

// Max connectors per station (without CM)
export const DC_MAX_CONNECTORS: Record<DcStationType, number> = {
  'dw':   2,
  'mob':  2,
  '2p':   1,
  '4p':   3,
  '8p':   3,
  '8pnv': 2,
  '12p':  3,
};

// Max connectors with cable management
export const DC_MAX_CONNECTORS_CM: Record<DcStationType, number> = {
  'dw':   2,
  'mob':  2,
  '2p':   2,
  '4p':   3,
  '8p':   3,
  '8pnv': 2,
  '12p':  3,
};

// Available connectors per station (types that have layer images)
export const DC_AVAILABLE_CONNECTORS: Record<DcStationType, DcConnectorType[]> = {
  'dw':   ['ccs2', 'gbt-dc', 'chademo'],
  'mob':  ['ccs2', 'gbt-dc', 'chademo'],
  '2p':   ['ccs2', 'gbt-dc', 'chademo'],
  '4p':   ['ccs2', 'gbt-dc', 'chademo'],
  '8p':   ['ccs2', 'gbt-dc', 'chademo'],
  '8pnv': ['ccs2', 'gbt-dc', 'chademo'],
  '12p':  ['ccs2', 'gbt-dc', 'chademo'],
};

// Stations that support terminal
export const DC_HAS_TERMINAL: DcStationType[] = ['2p', '4p', '8p', '8pnv', '12p'];

// Stations that support cable management
export const DC_HAS_CABLE_MANAGEMENT: DcStationType[] = ['2p', '4p', '8p', '12p'];

// Connector labels
export const DC_CONNECTOR_LABELS: Record<DcConnectorType, string> = {
  'ccs2':    'CCS Type 2',
  'gbt-dc':  'GB/T DC',
  'chademo': 'CHAdeMO',
  'ccs1':    'CCS Type 1',
  'nacs-dc': 'NACS DC',
};

// Connector icons (CDN SVG)
export const DC_CONNECTOR_ICONS: Record<DcConnectorType, string> = {
  'ccs2':    'https://ecofactortech.com/wp-content/uploads/2026/04/ccs-type-2.svg',
  'gbt-dc':  'https://ecofactortech.com/wp-content/uploads/2026/04/gb-t-dc.svg',
  'chademo': 'https://ecofactortech.com/wp-content/uploads/2026/04/chademo.svg',
  'ccs1':    'https://ecofactortech.com/wp-content/uploads/2026/04/ccs-type-1.svg',
  'nacs-dc': 'https://ecofactortech.com/wp-content/uploads/2026/04/nacs.svg',
};

// Color labels
export const DC_COLOR_LABELS: Record<DcColorOption, string> = {
  'black': 'Класичний чорний',
  'grey':  'Матовий сірий',
  'white': 'Глянцевий білий',
  'custom': 'Мій колір',
};
