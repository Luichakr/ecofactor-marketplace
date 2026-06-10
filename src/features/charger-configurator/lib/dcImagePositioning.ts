import { DcStationType, DcConnectorType, DcColorOption } from '../model/dc-charger.types';

const CDN4 = 'https://ecofactortech.com/wp-content/uploads/2026/04';
const CDN5 = 'https://ecofactortech.com/wp-content/uploads/2026/05';
const CDNL = 'https://ecofactortech.com/wp-content/uploads/ecofactor-configurator/layers-dc';

// Body images — regular
const BODY_IMAGES: Record<DcStationType, Partial<Record<DcColorOption, string>>> = {
  'dw':   { black: `${CDN4}/dw_body_black-copy-scaled.png`,    grey: `${CDN4}/dw_body_grey-copy-scaled.png`,    white: `${CDN4}/dw_body_white-copy-scaled.png` },
  'mob':  { black: `${CDN4}/2pmob_body_black-copy-scaled.png`, grey: `${CDN4}/2pmob_body_grey-copy-scaled.png`, white: `${CDN4}/2pmob_body_white-copy-scaled.png` },
  '2p':   { black: `${CDN4}/2p_body_black-copy-scaled.png`,    grey: `${CDN4}/2p_body_grey-copy-scaled.png`,    white: `${CDN4}/2p_body_white-copy-scaled.png` },
  '4p':   { black: `${CDN4}/4p_body_black-copy-scaled.png`,    grey: `${CDN4}/4p_body_grey-copy-scaled.png`,    white: `${CDN4}/4p_body_white-copy-scaled.png` },
  '8p':   { black: `${CDN4}/8p_body_black-copy-scaled.png`,    grey: `${CDN4}/8p_body_grey-copy-scaled.png`,    white: `${CDN4}/8p_body_white-copy-scaled.png` },
  '8pnv': { black: `${CDN4}/8pnv_body_black-copy-scaled.png`,  grey: `${CDN4}/8pnv_body_grey-copy-scaled.png`,  white: `${CDN4}/8pnv_body_white-copy-scaled.png` },
  '12p':  { black: `${CDN4}/12p_body_black-copy-scaled.png`,   grey: `${CDN4}/12p_body_grey-copy-scaled.png`,   white: `${CDN4}/12p_body_white-copy-scaled.png` },
};

// Body images — with cable management (MPK)
const BODY_IMAGES_CM: Partial<Record<DcStationType, Partial<Record<DcColorOption, string>>>> = {
  '2p':  { black: `${CDNL}/2P_body_mpk_black.png`,  grey: `${CDNL}/2P_body_mpk_grey.png`,  white: `${CDNL}/2P_body_mpk_white.png` },
  '4p':  { black: `${CDNL}/4P_body_mpk_black.png`,  grey: `${CDNL}/4P_body_mpk_grey.png`,  white: `${CDNL}/4P_body_mpk_white.png` },
  '8p':  { black: `${CDNL}/8P_body_mpk_black.png`,  grey: `${CDNL}/8P_body_mpk_grey.png`,  white: `${CDNL}/8P_body_mpk_white.png` },
  '12p': { black: `${CDNL}/12P_body_mpk_black.png`, grey: `${CDNL}/12P_body_mpk_grey.png`, white: `${CDNL}/12P_body_mpk_white.png` },
};

// Connector layers — CCS2 (C)
const CONNECTORS_CCS2: Record<string, string> = {
  'dw_1':    `${CDN4}/dw_connector_c_slot1-copy-scaled.png`,
  'dw_2':    `${CDN4}/dw_connector_c_slot2-copy-scaled.png`,
  'mob_1':   `${CDN4}/2pmob_connector_c_slot1-copy-scaled.png`,
  'mob_2':   `${CDN4}/2pmob_connector_c_slot2-copy-scaled.png`,
  '2p_1':    `${CDN4}/2p_connector_c_slot1-copy-scaled.png`,
  '4p_1':    `${CDN4}/4p_connector_c_slot1-copy-scaled.png`,
  '4p_2':    `${CDN4}/4p_connector_c_slot2-copy-scaled.png`,
  '4p_3':    `${CDN4}/4p_connector_c_slot3-copy-scaled.png`,
  '8p_1':    `${CDN4}/8p_connector_c_slot1-copy-scaled.png`,
  '8p_2':    `${CDN4}/8p_connector_c_slot2-copy-scaled.png`,
  '8p_3':    `${CDN4}/8p_connector_c_slot3-copy-scaled.png`,
  '8pnv_1':  `${CDN4}/8pnv_connector_c_slot1-copy-scaled.png`,
  '8pnv_2':  `${CDN4}/8pnv_connector_c_slot2-copy-scaled.png`,
  '12p_1':   `${CDN4}/12p_connector_c_slot1-copy-scaled.png`,
  '12p_2':   `${CDN4}/12p_connector_c_slot2-copy.png`,
  '12p_3':   `${CDN4}/12p_connector_c_slot3-copy-scaled.png`,
  // CM variants
  '2p_cm_1':  `${CDN4}/2p_mpk_connector_c_slot1-copy-scaled.png`,
  '2p_cm_2':  `${CDN4}/2p_mpk_connector_c_slot2-copy-scaled.png`,
  '4p_cm_1':  `${CDN4}/4p_mpk_connector_c_slot1-copy-scaled.png`,
  '4p_cm_2':  `${CDN4}/4p_mpk_connector_c_slot2-copy-scaled.png`,
  '8p_cm_1':  `${CDN4}/8p_connector_mpk_c_slot1-copy-scaled.png`,
  '8p_cm_2':  `${CDN4}/8p_connector_mpk_c_slot2-copy.png`,
  '12p_cm_1': `${CDN4}/12p_connector_mpk_c_slot1-copy-scaled.png`,
  '12p_cm_2': `${CDN4}/12p_connector_mpk_c_slot2-copy-scaled.png`,
};

// Connector layers — GB/T DC (G) — slot1 from /2026/05/, slot2 from /2026/04/
const CONNECTORS_GBT: Record<string, string> = {
  'dw_1':    `${CDN5}/dw_connector_g_slot1-1-scaled.png`,
  'dw_2':    `${CDN4}/dw_connector_g_slot2-copy-scaled.png`,
  'mob_1':   `${CDN5}/2pmob_connector_g_slot1-scaled.png`,
  'mob_2':   `${CDN4}/2pmob_connector_g_slot2-copy.png`,
  '2p_1':    `${CDN5}/2p_connector_g_slot1-scaled.png`,
  '2p_2':    `${CDN4}/2p_connector_g_slot2-copy.png`,
  '4p_1':    `${CDN5}/4p_connector_g_slot1-scaled.png`,
  '4p_2':    `${CDN4}/4p_connector_g_slot2-copy-scaled.png`,
  '8p_1':    `${CDN5}/8p_connector_g_slot1-scaled.png`,
  '8p_2':    `${CDN4}/8p_connector_g_slot2-copy-scaled.png`,
  '8pnv_1':  `${CDN5}/8pnv_connector_g_slot1-scaled.png`,
  '8pnv_2':  `${CDN4}/8pnv_connector_g_slot2-copy-scaled.png`,
  '12p_1':   `${CDN5}/12p_connector_g_slot1-scaled.png`,
  '12p_2':   `${CDN4}/12p_connector_g_slot2-copy-scaled.png`,
  // CM variants (slot1 only from CDN5)
  '2p_cm_1':  `${CDN5}/2p_mpk_connector_g_slot1-scaled.png`,
  '4p_cm_1':  `${CDN5}/4p_mpk_connector_g_slot1-scaled.png`,
  '8p_cm_1':  `${CDN5}/8p_connector_mpk_g_slot1-scaled.png`,
  '12p_cm_1': `${CDN5}/12p_connector_mpk_g_slot1-scaled.png`,
};

// Connector layers — CHAdeMO (H)
const CONNECTORS_CHADEMO: Record<string, string> = {
  'dw_1':    `${CDN5}/dw_connector_h_slot1-1-scaled.png`,
  'dw_2':    `${CDN4}/dw_connector_h_slot2-copy-scaled.png`,
  'mob_1':   `${CDN5}/2pmob_connector_h_slot1-scaled.png`,
  '2p_1':    `${CDN5}/2p_connector_h_slot1-scaled.png`,
  '4p_1':    `${CDN5}/4p_connector_h_slot1-scaled.png`,
  '8p_1':    `${CDN5}/8p_connector_h_slot1-scaled.png`,
  '8pnv_1':  `${CDN5}/8pnv_connector_h_slot1-scaled.png`,
  '12p_1':   `${CDN5}/12p_connector_h_slot1-scaled.png`,
  // CM variants
  '2p_cm_1':  `${CDN5}/2p_mpk_connector_h_slot1-scaled.png`,
  '4p_cm_1':  `${CDN5}/4p_mpk_connector_h_slot1-scaled.png`,
  '8p_cm_1':  `${CDN5}/8p_connector_mpk_h_slot1-scaled.png`,
  '12p_cm_1': `${CDN5}/12p_connector_mpk_h_slot1-scaled.png`,
};

// Terminal layer images
const TERMINAL_IMAGES: Partial<Record<DcStationType, string>> = {
  '2p':   `${CDN4}/2p_terminal-copy-1-scaled.png`,
  '4p':   `${CDN4}/4p_terminal-scaled.png`,
  '8p':   `${CDN4}/8p_terminal-scaled.png`,
  '8pnv': `${CDN4}/8pnv_terminal-copy-scaled.png`,
  '12p':  `${CDN4}/12p_terminal-1-scaled.png`,
};

const CONNECTOR_MAP: Record<DcConnectorType, Record<string, string>> = {
  'ccs2':    CONNECTORS_CCS2,
  'gbt-dc':  CONNECTORS_GBT,
  'chademo': CONNECTORS_CHADEMO,
  'ccs1':    {},
  'nacs-dc': {},
};

export function getDcBodyImageUrl(
  stationType: DcStationType,
  color: DcColorOption,
  hasCableManagement: boolean
): string {
  // 'custom' has no rendered PNG — fall back to the black body as a neutral base.
  const key = color === 'custom' ? 'black' : color;
  if (hasCableManagement) {
    const cmMap = BODY_IMAGES_CM[stationType];
    if (cmMap) return cmMap[key] ?? cmMap.black ?? '';
  }
  const map = BODY_IMAGES[stationType];
  return map[key] ?? map.black ?? '';
}

export function getDcConnectorImageUrl(
  stationType: DcStationType,
  connectorType: DcConnectorType,
  position: number,
  hasCableManagement: boolean
): string {
  const map = CONNECTOR_MAP[connectorType];
  if (!map) return '';
  const keyCm = `${stationType}_cm_${position}`;
  const key = `${stationType}_${position}`;
  if (hasCableManagement && map[keyCm]) return map[keyCm];
  return map[key] || '';
}

export function getDcTerminalImageUrl(stationType: DcStationType): string {
  return TERMINAL_IMAGES[stationType] || '';
}
