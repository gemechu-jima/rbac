import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({ 
  fireRiskData = [],
  floodRiskData = [],
  weatherAlertData = [],
  smokeAlertData = [],
  fireExtinguishers = [],
  isLoading = false,
  apiStatus = '',
  activeDataType = 'fire_risk',
  onClearDataType
}) => {
  
  const totalZones = 
    (fireRiskData?.length || 0) + 
    (floodRiskData?.length || 0) + 
    (weatherAlertData?.length || 0) + 
    (smokeAlertData?.length || 0);
  
  const getRiskDistribution = (data) => {
    if (!data || !Array.isArray(data)) return { high: 0, medium: 0, low: 0 };
    
    return data.reduce((acc, item) => {
      const riskLevel = item.danger_zone_level?.toLowerCase() || 'unknown';
      if (riskLevel.includes('high')) acc.high++;
      else if (riskLevel.includes('medium')) acc.medium++;
      else if (riskLevel.includes('low')) acc.low++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });
  };

  const fireRiskDistribution = getRiskDistribution(fireRiskData);
  const floodRiskDistribution = getRiskDistribution(floodRiskData);
  const weatherRiskDistribution = getRiskDistribution(weatherAlertData);
  const smokeRiskDistribution = getRiskDistribution(smokeAlertData);

  const getActiveDataTypeCount = () => {
    switch (activeDataType) {
      case 'fire_risk': return fireRiskData?.length || 0;
      case 'flood_risk': return floodRiskData?.length || 0;
      case 'weather_alert': return weatherAlertData?.length || 0;
      case 'smoke_alert': return smokeAlertData?.length || 0;
      default: return 0;
    }
  };

  return (
    <div className="control-panel-container">
      <div className="panel-header">
        <h3>📊 Data Overview</h3>
        <div className="data-summary">
          <span className="data-badge total">Total: {totalZones}</span>
          <span className="data-badge extinguisher">🧯 {fireExtinguishers?.length || 0}</span>
        </div>
      </div>

      <div className="panel-section">
        <h4>🎯 Active Data Type</h4>
        <div className="active-data-info">
          <div className={`data-type-indicator ${activeDataType}`}>
            {activeDataType === 'fire_risk' && '🔥'}
            {activeDataType === 'flood_risk' && '🌊'}
            {activeDataType === 'weather_alert' && '🌪️'}
            {activeDataType === 'smoke_alert' && '💨'}
          </div>
          <div className="active-data-details">
            <div className="data-type-title">
              {activeDataType.replace('_', ' ').toUpperCase()}
            </div>
            <div className="data-type-count">
              {getActiveDataTypeCount()} zones
            </div>
            <button 
              className="clear-data-btn"
              onClick={() => onClearDataType && onClearDataType(activeDataType)}
              disabled={getActiveDataTypeCount() === 0}
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h4>📈 Risk Distribution</h4>
        <div className="risk-distribution-grid">
          <div className="risk-category">
            <div className="risk-label high">🔥 High Risk</div>
            <div className="risk-value">{fireRiskDistribution.high}</div>
          </div>
          <div className="risk-category">
            <div className="risk-label medium">🌊 Medium Risk</div>
            <div className="risk-value">{fireRiskDistribution.medium}</div>
          </div>
          <div className="risk-category">
            <div className="risk-label low">💨 Low Risk</div>
            <div className="risk-value">{fireRiskDistribution.low}</div>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h4>📊 Data Breakdown</h4>
        <div className="data-breakdown">
          <div className="breakdown-item">
            <div className="breakdown-label">
              <span className="breakdown-icon">🔥</span>
              Fire Risk
            </div>
            <div className="breakdown-value">{fireRiskData?.length || 0}</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">
              <span className="breakdown-icon">🌊</span>
              Flood Risk
            </div>
            <div className="breakdown-value">{floodRiskData?.length || 0}</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">
              <span className="breakdown-icon">🌪️</span>
              Weather Alert
            </div>
            <div className="breakdown-value">{weatherAlertData?.length || 0}</div>
          </div>
          <div className="breakdown-item">
            <div className="breakdown-label">
              <span className="breakdown-icon">💨</span>
              Smoke Alert
            </div>
            <div className="breakdown-value">{smokeAlertData?.length || 0}</div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="panel-section">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Processing data...</span>
          </div>
        </div>
      )}

      {apiStatus && !isLoading && (
        <div className="panel-section">
          <div className={`status-message ${apiStatus.includes('✅') ? 'success' : apiStatus.includes('❌') ? 'error' : 'info'}`}>
            {apiStatus.includes('✅') && '✅ '}
            {apiStatus.includes('❌') && '❌ '}
            {apiStatus}
          </div>
        </div>
      )}

      <div className="panel-footer">
        <div className="footer-note">
          ℹ️ Data updates in real-time from server predictions
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;