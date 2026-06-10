import React from 'react';
import { ChargerConfig, TERMINAL_IMAGE_URL } from '../model/charger.types';
import {
  getBodyImagePath,
  getConnectorImagePath,
  getStandImagePath,
  getMaskImagePath,
} from '../lib/imagePositioning';
import { RecolorCanvas, recolorSourceKey } from './RecolorCanvas';
import './ConfiguratorPreview.css';

interface ConfiguratorPreviewProps {
  config: ChargerConfig;
}

export const ConfiguratorPreview: React.FC<ConfiguratorPreviewProps> = ({ config }) => {
  const isCustom = config.color === 'custom';
  const bodyImagePath = getBodyImagePath(config.stationType, config.color);
  // Custom: black base shows baked-in details (screen, LED, logo, light)
  // through the mask cutouts; grey/black source feeds the recolour's shading.
  const baseBlackPath = getBodyImagePath(config.stationType, 'black');
  const recolorSrc = getBodyImagePath(config.stationType, recolorSourceKey(config.customColor));
  const maskPath = getMaskImagePath(config.stationType);
  const standImagePath = getStandImagePath(config.stationType);

  return (
    <div className={`configurator-preview configurator-preview--${config.stationType}`}>
      <div className="preview-container">
        {standImagePath && (
          <img src={standImagePath} alt="" className="preview-stand" />
        )}
        {isCustom && recolorSrc ? (
          <>
            {baseBlackPath && (
              <img src={baseBlackPath} alt="Station body" className="preview-body" />
            )}
            <RecolorCanvas
              src={recolorSrc}
              hex={config.customColor}
              maskSrc={maskPath || undefined}
              className="preview-body"
            />
          </>
        ) : (
          bodyImagePath && (
            <img src={bodyImagePath} alt="Station body" className="preview-body" />
          )
        )}
        {/* Terminal sits above the body but below the connectors (layer 2),
            so cables overlay it — render it before the connector layers. */}
        {config.hasTerminal && config.stationType === 'nv-duet' && (
          <img
            src={TERMINAL_IMAGE_URL}
            alt="Terminal"
            className="preview-connector-layer"
          />
        )}
        {config.connectors.map((connector) => {
          const url = getConnectorImagePath(config.stationType, connector.type, connector.position);
          if (!url) return null;
          return (
            <img
              key={connector.id}
              src={url}
              alt={`Connector ${connector.position}`}
              className="preview-connector-layer"
            />
          );
        })}
      </div>
    </div>
  );
};
