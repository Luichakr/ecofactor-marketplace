import React from 'react';
import { ChargerConfig, TERMINAL_IMAGE_URL } from '../model/charger.types';
import { getBodyImagePath, getConnectorImagePath, getStandImagePath } from '../lib/imagePositioning';
import './ConfiguratorPreview.css';

interface ConfiguratorPreviewProps {
  config: ChargerConfig;
}

export const ConfiguratorPreview: React.FC<ConfiguratorPreviewProps> = ({ config }) => {
  const bodyImagePath = getBodyImagePath(config.stationType, config.color);
  const standImagePath = getStandImagePath(config.stationType);

  return (
    <div className={`configurator-preview configurator-preview--${config.stationType}`}>
      <div className="preview-container">
        {standImagePath && (
          <img src={standImagePath} alt="" className="preview-stand" />
        )}
        {bodyImagePath && (
          <img src={bodyImagePath} alt="Station body" className="preview-body" />
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
