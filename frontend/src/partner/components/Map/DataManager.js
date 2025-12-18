import React from 'react';
import { fireRiskApi, fetchFireRiskData, loadSampleData, clearAllData } from '../services/fireRiskApi';
import { fireExtinguishersData } from '../data/fireRiskData';

// Safe number utility functions - Export them directly
export const safeToFixed = (value, decimals = 1, fallback = 'N/A') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return fallback;
  }
  return value.toFixed(decimals);
};

export const safeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

// Re-export API functions for convenience
export { fetchFireRiskData, loadSampleData, clearAllData, fireRiskApi };

// Header Stats Component
export const HeaderStats = ({ fireRiskData = [], fireExtinguishers = [] }) => {
  // Safe statistics calculation
  const highRisk = fireRiskData.filter(zone => {
    const riskLevel = (zone.danger_zone_level || zone.predicted_category || '').toLowerCase();
    return riskLevel === 'high';
  }).length;
  
  const mediumRisk = fireRiskData.filter(zone => {
    const riskLevel = (zone.danger_zone_level || zone.predicted_category || '').toLowerCase();
    return riskLevel === 'medium';
  }).length;
  
  const lowRisk = fireRiskData.filter(zone => {
    const riskLevel = (zone.danger_zone_level || zone.predicted_category || '').toLowerCase();
    return riskLevel === 'low';
  }).length;

  const totalExtinguishers = fireExtinguishers.length;

  return (
    <div className="header-stats">
      <div className="stat-badge extinguishers">
        <span className="stat-count">{totalExtinguishers}</span>
        <span className="stat-label">Extinguishers</span>
      </div>
      <div className="stat-badge high-risk">
        <span className="stat-count">{highRisk}</span>
        <span className="stat-label">High Risk</span>
      </div>
      <div className="stat-badge medium-risk">
        <span className="stat-count">{mediumRisk}</span>
        <span className="stat-label">Medium Risk</span>
      </div>
      <div className="stat-badge low-risk">
        <span className="stat-count">{lowRisk}</span>
        <span className="stat-label">Low Risk</span>
      </div>
    </div>
  );
};

// Loading Overlay Component
export const LoadingOverlay = ({ isLoading, apiStatus }) => {
  if (!isLoading) return null;
  
  return (
    <div className="api-loading-overlay">
      <div className="api-loading-content">
        <div className="api-spinner"></div>
        <h3>Fetching Real-time Data</h3>
        <p>{apiStatus}</p>
        <p className="api-loading-sub">Connecting to: http://172.20.59.168:8006</p>
      </div>
    </div>
  );
};

// Status Notification Component
export const StatusNotification = ({ apiStatus, isLoading }) => {
  if (!apiStatus || isLoading) return null;
  
  return (
    <div className={`api-status-notification ${apiStatus.includes('❌') ? 'error' : apiStatus.includes('⚠️') ? 'warning' : 'success'}`}>
      {apiStatus}
    </div>
  );
};

// Data Notification Component
export const DataNotification = ({ mapInitialized, fireRiskData, isLoading, onLoadData, onLoadSampleData, onLoadPipelineData }) => {
  if (!mapInitialized || fireRiskData.length > 0 || isLoading) return null;
  
  return (
    <div className="data-notification">
      <div className="notification-content">
        <h3>Welcome to Fire Safety Map! 🗺️</h3>
        <p>No fire risk data loaded yet. Click the buttons below to load data!</p>
        <div className="notification-buttons">
          <button onClick={onLoadData} className="notification-button primary">
            🚀 Fetch Real Data
          </button>
          <button onClick={onLoadSampleData} className="notification-button secondary">
            📋 Load Sample Data
          </button>
          <button onClick={onLoadPipelineData} className="notification-button pipeline">
            ⚙️ Run Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

// Export fire extinguishers data
export { fireExtinguishersData };

// Create a main object with all exports for backward compatibility
const DataManager = {
  fetchFireRiskData,
  loadSampleData,
  clearAllData,
  HeaderStats,
  LoadingOverlay,
  StatusNotification,
  DataNotification,
  fireExtinguishersData,
  fireRiskApi,
  safeToFixed,
  safeNumber
};

export default DataManager;