import { StationType, ConnectorType } from '../model/charger.types';

// Local body images
import awBodyBlack from '../../../assets/configurator/aw/body_black.png';
import awBodyGrey from '../../../assets/configurator/aw/body_grey.png';
import awBodyGreen from '../../../assets/configurator/aw/body_green.png';
import awBodyWhite from '../../../assets/configurator/aw/body_white.png';
import awStand from '../../../assets/configurator/aw/stand.png';
import nvDuetBodyBlack from '../../../assets/configurator/nv-duet/body_black.png';
import nvDuetBodyGrey from '../../../assets/configurator/nv-duet/body_grey.png';
import nvDuetBodyWhite from '../../../assets/configurator/nv-duet/body_white.png';
import nvTrioBodyBlack from '../../../assets/configurator/nv-trio/body_black.png';
import nvTrioBodyGrey from '../../../assets/configurator/nv-trio/body_grey.png';
import nvTrioBodyWhite from '../../../assets/configurator/nv-trio/body_white.png';

const CDN = 'https://ecofactortech.com/wp-content/uploads/2026/04';

// Body images map (local)
const BODY_IMAGES: Record<StationType, Record<string, string>> = {
  'aw': {
    black: awBodyBlack,
    grey:  awBodyGrey,
    green: awBodyGreen,
    white: awBodyWhite,
  },
  'nv-duet': {
    black: nvDuetBodyBlack,
    grey:  nvDuetBodyGrey,
    white: nvDuetBodyWhite,
  },
  'nv-trio': {
    black: nvTrioBodyBlack,
    grey:  nvTrioBodyGrey,
    white: nvTrioBodyWhite,
  },
};

// Connector layer URLs — CDN
// Format: CONNECTOR_LAYERS[stationType][connectorType][position]
// Y = type1-7, D = type2-7, F = gbt-7, P = type2-22, E = socket-22, B = gbt-22, A/N = nacs-7
const CONNECTOR_LAYERS: Record<StationType, Partial<Record<ConnectorType, Record<number, string>>>> = {
  'aw': {
    'type1-7': {
      1: `${CDN}/aw_stand_connector_y_slot1-scaled.png`,
      2: `${CDN}/aw_stand_connector_y_slot2-scaled.png`,
      3: `${CDN}/aw_stand_connector_y_slot3-scaled.png`,
    },
    'type2-7': {
      1: `${CDN}/aw_stand_connector_d_slot1.png`,
      2: `${CDN}/aw_stand_connector_d_slot2.png`,
      3: `${CDN}/aw_stand_connector_d_slot3-scaled.png`,
    },
    'gbt-7': {
      1: `${CDN}/aw_stand_connector_f_slot1.png`,
      2: `${CDN}/aw_stand_connector_f_slot2.png`,
      3: `${CDN}/aw_stand_connector_f_slot3.png`,
    },
    'type2-22': {
      1: `${CDN}/aw_stand_connector_d_slot1-scaled.png`,
      2: `${CDN}/aw_stand_connector_d_slot2-scaled.png`,
      3: `${CDN}/aw_stand_connector_d_slot3-scaled.png`,
    },
    'type2-socket-22': {
      1: `${CDN}/aw_body_socket.png`,
      2: `${CDN}/aw_body_socket-scaled.png`,
      3: `${CDN}/aw_body_socket-scaled.png`,
    },
    'gbt-22': {
      1: `${CDN}/aw_stand_connector_f_slot1-scaled.png`,
      2: `${CDN}/aw_stand_connector_f_slot2-scaled.png`,
      3: `${CDN}/aw_stand_connector_f_slot3-scaled.png`,
    },
    'nacs-7': {
      1: `${CDN}/aw_stand_connector_a_slot1-scaled.png`,
      2: `${CDN}/aw_stand_connector_a_slot2-scaled.png`,
      3: `${CDN}/aw_stand_connector_a_slot3.png`,
    },
  },
  'nv-duet': {
    'type1-7': {
      1: `${CDN}/nv_duet_connector_y_slot1-scaled.png`,
      2: `${CDN}/nv_duet_connector_y_slot2-scaled.png`,
    },
    'type2-7': {
      1: `${CDN}/nv_duet_connector_d_slot1-scaled.png`,
      2: `${CDN}/nv_duet_connector_d_slot2-scaled.png`,
    },
    'gbt-7': {
      1: `${CDN}/nv_duet_connector_f_slot1-scaled.png`,
      2: `${CDN}/nv_duet_connector_f_slot2-scaled.png`,
    },
    'type2-22': {
      1: `${CDN}/nv_duet_connector_d_slot2-scaled.png`,
      2: `${CDN}/nv_duet_connector_d_slot1-scaled.png`,
    },
    'type2-socket-22': {
      1: `${CDN}/nv_duet_socket1-scaled.png`,
      2: `${CDN}/nv_duet_socket2-scaled.png`,
    },
    'gbt-22': {
      1: `${CDN}/nv_duet_connector_f_slot1-scaled.png`,
      2: `${CDN}/nv_duet_connector_f_slot2-scaled.png`,
    },
  },
  'nv-trio': {
    'type1-7': {
      1: `${CDN}/nv_trio_connector_y_slot1-scaled.png`,
      2: `${CDN}/nv_trio_connector_y_slot2-scaled.png`,
      3: `${CDN}/nv_trio_connector_y_slot3-scaled.png`,
    },
    'type2-7': {
      1: `${CDN}/nv_trio_connector_d_slot1-scaled.png`,
      2: `${CDN}/nv_trio_connector_d_slot2-scaled.png`,
      3: `${CDN}/nv_trio_connector_d_slot3-scaled.png`,
    },
    'gbt-7': {
      1: `${CDN}/nv_trio_connector_f_slot1.png`,
      2: `${CDN}/nv_trio_connector_f_slot2.png`,
      3: `${CDN}/nv_trio_connector_f_slot3.png`,
    },
    'type2-22': {
      1: `${CDN}/nv_trio_connector_d_slot1-scaled.png`,
      2: `${CDN}/nv_trio_connector_d_slot2-scaled.png`,
      3: `${CDN}/nv_trio_connector_d_slot3-scaled.png`,
    },
    'type2-socket-22': {
      1: `${CDN}/nv_trio_socket1-scaled.png`,
      2: `${CDN}/nv_trio_socket2-scaled.png`,
      3: `${CDN}/nv_trio_socket3-scaled.png`,
    },
    'gbt-22': {
      1: `${CDN}/nv_trio_connector_f_slot1-scaled.png`,
      2: `${CDN}/nv_trio_connector_f_slot2-scaled.png`,
      3: `${CDN}/nv_trio_connector_f_slot3-scaled.png`,
    },
  },
};

export function getConnectorImagePath(
  stationType: StationType,
  connectorType: ConnectorType,
  position: number
): string {
  return CONNECTOR_LAYERS[stationType]?.[connectorType]?.[position] ?? '';
}

export function getBodyImagePath(stationType: StationType, color: string): string {
  const set = BODY_IMAGES[stationType];
  if (!set) return '';
  // 'custom' has no rendered PNG — fall back to the black body as a neutral base.
  return set[color] ?? set.black ?? '';
}

export function getStandImagePath(stationType: StationType): string {
  return stationType === 'aw' ? awStand : '';
}
