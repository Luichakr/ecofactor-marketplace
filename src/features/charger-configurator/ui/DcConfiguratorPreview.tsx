import React from 'react';
import { DcChargerConfig } from '../model/dc-charger.types';
import {
  getDcBodyImageUrl,
  getDcConnectorImageUrl,
  getDcTerminalImageUrl,
} from '../lib/dcImagePositioning';
import './ConfiguratorPreview.css';

interface DcConfiguratorPreviewProps {
  config: DcChargerConfig;
}

export const DcConfiguratorPreview: React.FC<DcConfiguratorPreviewProps> = ({ config }) => {
  if (!config.stationType) return null;

  const bodyUrl = getDcBodyImageUrl(
    config.stationType,
    config.color,
    config.features.cableManagement
  );
  const terminalUrl = config.features.terminal
    ? getDcTerminalImageUrl(config.stationType)
    : '';

  return (
    <div className={`configurator-preview configurator-preview--dc configurator-preview--${config.stationType}`}>
      <div className="preview-container">
        {bodyUrl && (
          <img src={bodyUrl} alt="Station body" className="preview-body" />
        )}

        {terminalUrl && (
          <img src={terminalUrl} alt="Terminal" className="preview-connector-layer" />
        )}

        {config.connectors.map((connector) => {
          const url = getDcConnectorImageUrl(
            config.stationType!,
            connector.type,
            connector.position,
            config.features.cableManagement
          );
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
