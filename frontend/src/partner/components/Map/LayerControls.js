import React from 'react';
import './LayerControls.css';

const LayerControls = ({ activeLayers, onToggleLayer }) => {
  return (
    <div className="layer-controls">
      <h3>👁️ Map Layers</h3>
      
      <div className="layer-item">
        <input
          type="checkbox"
          id="extinguishers"
          checked={activeLayers.extinguishers}
          onChange={() => onToggleLayer('extinguishers')}
        />
        <label htmlFor="extinguishers">🧯 Manual Extinguishers</label>
      </div>
      
      <div className="layer-item">
        <input
          type="checkbox"
          id="riskData"
          checked={activeLayers.riskData}
          onChange={() => onToggleLayer('riskData')}
        />
        <label htmlFor="riskData">🔥 Risk Data Points</label>
      </div>
      
      <div className="layer-item">
        <input
          type="checkbox"
          id="autoCoverage"
          checked={activeLayers.autoCoverage}
          onChange={() => onToggleLayer('autoCoverage')}
        />
        <label htmlFor="autoCoverage">🛡️ Auto Coverage</label>
      </div>
    </div>
  );
};

export default LayerControls;