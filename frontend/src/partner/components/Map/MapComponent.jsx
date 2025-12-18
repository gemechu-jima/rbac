import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FireExtinguishers from './FireExtinguishers';
import FireRiskDataLayer from './FireRiskDataLayer';
import AutoFireCoverage from './AutoFireCoverage';
import LayerControls from './LayerControls';
import ControlPanel from '../UI/ControlPanel';
import Legend from '../UI/Legend';
import DataManager, { safeNumber, fireExtinguishersData } from './DataManager'; 
import MapInitializer from './MapInitializer';
import PipelineTester from './PipelineTester';
import TimestampAnalysis from './TimestampAnalysis';
import IntroPage from '../UI/IntroPage';

import './MapComponent.css';

// Fix for Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create SIMPLE CIRCLE markers for different data types - CONSISTENT COLORS
const createSimpleMarker = (riskLevel = 'medium', dataType = 'fire_risk') => {
  // ✅ CONSISTENT COLORS FOR ALL RISK TYPES
  const colors = {
    high: '#ff0000',    // Red
    medium: '#ffff00',  // Yellow
    low: '#00ff00'      // Green
  };
  
  const color = colors[riskLevel] || colors.medium;
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color}; 
      width: 12px; 
      height: 12px; 
      border-radius: 50%; 
      border: 2px solid white; 
      box-shadow: 0 0 3px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [12, 12],
    className: `simple-marker ${dataType}`
  });
};

// Universal Risk Data Layer Component - CONSISTENT COLORS
const RiskDataLayer = ({ map, riskData, dataType }) => {
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !riskData || riskData.length === 0) return;

    // Clear existing layers
    if (layerRef.current && map.hasLayer(layerRef.current)) {
      map.removeLayer(layerRef.current);
    }

    const riskLayer = L.featureGroup();
    riskLayer._riskLayer = true;
    riskLayer._dataType = dataType;
    layerRef.current = riskLayer;

    // ✅ CONSISTENT COLORS FOR ALL TYPES
    const colors = {
      high: '#ff0000',    // RED
      medium: '#ffff00',  // YELLOW
      low: '#00ff00'      // GREEN
    };

    // Get icons based on data type (different icons, same colors)
    const getTypeConfig = () => {
      switch (dataType) {
        case 'fire_risk':
          return { icon: '🔥', title: 'Fire Risk Zone' };
        case 'flood_risk':
          return { icon: '🌊', title: 'Flood Risk Zone' };
        case 'weather_alert':
          return { icon: '🌪️', title: 'Weather Alert Zone' };
        case 'smoke_alert':
          return { icon: '💨', title: 'Smoke Alert Zone' };
        default:
          return { icon: '📍', title: 'Risk Zone' };
      }
    };

    const config = getTypeConfig();

    // Create markers
    riskData.forEach((item, index) => {
      const { latitude, longitude, danger_zone_level, recommendation, zone_name, timestamp } = item;
      
      if (!latitude || !longitude) return;

      const latNum = Number(latitude);
      const lngNum = Number(longitude);
      if (isNaN(latNum) || isNaN(lngNum)) return;

      // Use ACTUAL risk level from data
      const riskLevel = (danger_zone_level || 'medium').toLowerCase();

      // ✅ USE CONSISTENT COLORS FOR ALL RISK TYPES
      let markerColor, borderColor, markerSize;
      
      switch (riskLevel) {
        case 'high':
          markerColor = colors.high;      // RED
          borderColor = '#cc0000';
          markerSize = 16;
          break;
        case 'medium':
          markerColor = colors.medium;    // YELLOW
          borderColor = '#cccc00';
          markerSize = 14;
          break;
        case 'low':
          markerColor = colors.low;       // GREEN
          borderColor = '#00cc00';
          markerSize = 12;
          break;
        default:
          markerColor = colors.medium;    // YELLOW as default
          borderColor = '#cccc00';
          markerSize = 12;
      }

      // Create risk marker
      const marker = L.circleMarker([latNum, lngNum], {
        color: borderColor,
        fillColor: markerColor,
        fillOpacity: 0.7,
        radius: markerSize,
        weight: 2,
        className: `${dataType}-marker-${riskLevel}`
      });

      // Format timestamp for popup
      const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'No timestamp';
        try {
          const date = new Date(timestamp);
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (error) {
          console.log(error)
          return 'Invalid timestamp';
        }
      };

      // Add popup with risk information including timestamp
      marker.bindPopup(`
        <div class="risk-popup">
          <h3 style="color: ${markerColor};">
            ${config.icon} ${config.title}
          </h3>
          <p><strong>📍 Zone Name:</strong> ${zone_name || `${dataType.replace('_', ' ')} Zone ${index + 1}`}</p>
          <p><strong>🚨 Risk Level:</strong> <span style="color: ${markerColor}; font-weight: bold;">${riskLevel.toUpperCase()}</span></p>
          ${timestamp ? `<p><strong>⏰ Timestamp:</strong> ${formatTimestamp(timestamp)}</p>` : ''}
          <p><strong>📊 Recommendation:</strong> ${recommendation || 'No specific recommendation'}</p>
          <p><strong>📍 Coordinates:</strong> ${latNum.toFixed(6)}, ${lngNum.toFixed(6)}</p>
          <div style="display: flex; align-items: center; margin: 10px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
            <div style="width: 16px; height: 16px; background: ${markerColor}; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 0 3px rgba(0,0,0,0.3);"></div>
            <span><strong>Color Code:</strong> ${riskLevel.toUpperCase()} RISK</span>
          </div>
        </div>
      `);

      // Add to layer
      riskLayer.addLayer(marker);
    });

    // Add the layer to map
    if (riskData.length > 0) {
      riskLayer.addTo(map);
      console.log(`✅ ${dataType.toUpperCase()} Layer: Added`, riskData.length, 'markers with consistent colors');
    }

    // Cleanup function
    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, riskData, dataType]);

  return null;
};

const MapComponent = () => {
  const [currentView, setCurrentView] = useState('intro');
  const [showPipelineTester, setShowPipelineTester] = useState(false);
  const [showTimestampAnalysis, setShowTimestampAnalysis] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    extinguishers: true,
    riskData: true,
    autoCoverage: true,
    fireData: true,
    floodData: true,
    weatherData: true,
    smokeData: true
  });
  
  // Data states for all types
  const [riskData, setRiskData] = useState({
    fire_risk: [],
    flood_risk: [],
    weather_alert: [],
    smoke_alert: []
  });
  
  // Timestamp analysis data
  const [timestampData, setTimestampData] = useState([]);
  const [timestampDataType, setTimestampDataType] = useState('fire_risk');
  
  const [activeDataType, setActiveDataType] = useState('fire_risk'); // Track current data type
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('');

  // Refs
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const dataRef = useRef({
    fire_risk: [],
    flood_risk: [],
    weather_alert: [],
    smoke_alert: []
  });

  // Use fire extinguishers data
  const [fireExtinguishers] = useState(fireExtinguishersData || []);

  // Initialize map
  useEffect(() => {
    if (currentView === 'map' && !mapInitialized && mapContainerRef.current) {
      console.log('🗺️ INITIALIZING MAP...');
      
      try {
        // Create map directly
        const map = L.map(mapContainerRef.current).setView([9.03, 38.74], 13);
        mapRef.current = map;
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        setMapInitialized(true);
        console.log('✅ Map initialized successfully!');
        
        // Force initial size calculation
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
      } catch (error) {
        console.error('❌ Map initialization failed:', error);
      }
    }
  }, [currentView, mapInitialized]);

  // FIXED: Improved pipeline result handler with comprehensive debugging
  const handlePipelineResult = (result) => {
    console.log('🎯 Pipeline result received - FULL STRUCTURE:', result);
    
    if (result && result.data && mapRef.current) {
      console.log('🎯 Result data length:', result.data.length);
      console.log('🎯 Result data type:', typeof result.data);
      console.log('🎯 Processor type:', result.processorType);
      
      // Check if data is actually an array
      if (!Array.isArray(result.data)) {
        console.error('❌ result.data is not an array:', result.data);
        setApiStatus('❌ Error: Received data is not in array format');
        return;
      }
      
      console.log('🎯 First data item:', result.data[0]);
      
      // Determine data type from processor type
      const dataType = result.processorType || 'fire_risk';
      
      // Transform data using DataManager utilities
      const transformedData = result.data.map((item, index) => {
        console.log(`🔄 MapComponent transforming item ${index}:`, item);
        
        // Use existing coordinates or create spread out coordinates
        const baseLat = 9.03;
        const baseLng = 38.74;
        const spread = 0.05; // ~5km spread
        
        const lat = safeNumber(
          item.latitude || item.lat, 
          baseLat + (index * spread / result.data.length) - (spread / 2)
        );
        const lng = safeNumber(
          item.longitude || item.lng, 
          baseLng + (Math.random() * spread - spread / 2)
        );
        
        console.log(`📍 Item ${index} final coordinates:`, lat, lng);
        
        // Determine risk level based on data type
        let riskLevel;
        switch (dataType) {
          case 'fire_risk':
            riskLevel = (item.danger_zone_level || item.fire_risk || item.risk_level || 'medium').toLowerCase();
            break;
          case 'flood_risk':
            riskLevel = (item.danger_zone_level || item.flood_risk || item.risk_level || 'medium').toLowerCase();
            break;
          case 'weather_alert':
            riskLevel = (item.danger_zone_level || item.weather_alert || item.risk_level || 'medium').toLowerCase();
            break;
          case 'smoke_alert':
            riskLevel = (item.danger_zone_level || item.smoke_alert || item.risk_level || 'medium').toLowerCase();
            break;
          default:
            riskLevel = (item.danger_zone_level || item.risk_level || 'medium').toLowerCase();
        }

        // Normalize risk levels for consistent colors
        if (riskLevel.includes('high')) riskLevel = 'high';
        else if (riskLevel.includes('medium')) riskLevel = 'medium';
        else if (riskLevel.includes('low')) riskLevel = 'low';

        return {
          ...item,
          latitude: lat,
          longitude: lng,
          danger_zone_level: riskLevel,
          [dataType]: riskLevel, // Set the specific risk field
          zone_name: item.zone_name || `${dataType.replace('_', ' ')} Zone ${index + 1}`,
          recommendation: getRecommendation(riskLevel, dataType),
          timestamp: item.timestamp || null,
          data_type: dataType
        };
      });

      console.log('✅ Final transformed data length in MapComponent:', transformedData.length);
      console.log('✅ Final transformed data preview:', transformedData.slice(0, 3));
      
      // Check for duplicate coordinates and ensure uniqueness
      const coordinateSet = new Set();
      const uniqueData = transformedData.filter(item => {
        const coordKey = `${item.latitude.toFixed(6)}_${item.longitude.toFixed(6)}`;
        if (coordinateSet.has(coordKey)) {
          console.log('⚠️ Removing duplicate coordinate:', coordKey);
          // Add small offset to make it unique
          item.latitude += (Math.random() - 0.5) * 0.001;
          item.longitude += (Math.random() - 0.5) * 0.001;
          const newCoordKey = `${item.latitude.toFixed(6)}_${item.longitude.toFixed(6)}`;
          if (coordinateSet.has(newCoordKey)) {
            return false; // Still duplicate, skip this item
          }
          coordinateSet.add(newCoordKey);
          return true;
        }
        coordinateSet.add(coordKey);
        return true;
      });

      console.log(`📍 Unique coordinates: ${uniqueData.length} out of ${transformedData.length}`);
      
      // Store data in the correct category
      dataRef.current[dataType] = uniqueData;
      setRiskData(prev => ({
        ...prev,
        [dataType]: uniqueData
      }));
      
      // Auto-switch to show the new data type
      setActiveDataType(dataType);
      
      // Store timestamp data for analysis
      if (result.timestampData && result.timestampData.length > 0) {
        setTimestampData(result.timestampData);
        setTimestampDataType(dataType);
        setShowTimestampAnalysis(true);
        console.log(`📅 Loaded ${result.timestampData.length} timestamp records for analysis`);
      } else {
        // Extract timestamps from transformed data if not provided
        const extractedTimestamps = uniqueData
          .filter(item => item.timestamp)
          .map(item => ({
            timestamp: item.timestamp,
            riskLevel: item.danger_zone_level,
            severityScore: {
              high: 3,
              medium: 2,
              low: 1
            }[item.danger_zone_level.toLowerCase()] || 1,
            processorType: dataType,
            rawData: item
          }));
        
        if (extractedTimestamps.length > 0) {
          setTimestampData(extractedTimestamps);
          setTimestampDataType(dataType);
          setShowTimestampAnalysis(true);
          console.log(`📅 Extracted ${extractedTimestamps.length} timestamps from data`);
        }
      }
      
      setApiStatus(`✅ ${dataType.replace('_', ' ').toUpperCase()} data loaded: ${uniqueData.length} zones`);
      console.log(`✅ Loaded ${uniqueData.length} ${dataType} data points`);
      
      // Auto-fit map to show all points if we have data
      if (uniqueData.length > 0) {
        setTimeout(() => {
          try {
            const group = L.featureGroup();
            uniqueData.forEach(item => {
              if (item.latitude && item.longitude) {
                group.addLayer(L.marker([item.latitude, item.longitude]));
              }
            });
            if (group.getLayers().length > 0) {
              mapRef.current.fitBounds(group.getBounds().pad(0.1));
              console.log('🗺️ Map auto-fitted to show all data points');
            }
          } catch (error) {
            console.warn('Could not auto-fit map:', error);
          }
        }, 500);
      }
      
      setShowPipelineTester(false);
    } else {
      console.error('❌ Invalid pipeline result:', result);
      setApiStatus('❌ Error: Invalid data received from pipeline');
    }
  };

  // Generate recommendations based on risk level and data type
  const getRecommendation = (riskLevel, dataType) => {
    switch (dataType) {
      case 'fire_risk':
        switch (riskLevel) {
          case 'high': return '🚨 Immediate action required: High fire risk detected. Deploy emergency response.';
          case 'medium': return '⚠️ Medium fire risk: Monitor conditions closely and prepare response teams.';
          case 'low': return '✅ Low fire risk: Continue regular monitoring. No immediate action required.';
          default: return '📊 Monitor fire conditions regularly.';
        }
      case 'flood_risk':
        switch (riskLevel) {
          case 'high': return '🌊🚨 Flood emergency: High flood risk detected. Evacuate if necessary.';
          case 'medium': return '🌊⚠️ Medium flood risk: Monitor water levels and prepare for possible flooding.';
          case 'low': return '🌊✅ Low flood risk: Continue regular monitoring of water levels.';
          default: return '🌊 Monitor flood conditions regularly.';
        }
      case 'weather_alert':
        switch (riskLevel) {
          case 'high': return '🌪️🚨 Severe weather alert: Take immediate safety precautions.';
          case 'medium': return '🌪️⚠️ Weather warning: Monitor weather conditions closely.';
          case 'low': return '🌪️✅ Weather advisory: Continue monitoring weather updates.';
          default: return '🌪️ Monitor weather conditions regularly.';
        }
      case 'smoke_alert':
        switch (riskLevel) {
          case 'high': return '💨🚨 Critical smoke alert: High smoke concentration detected. Evacuate area immediately.';
          case 'medium': return '💨⚠️ Smoke warning: Elevated smoke levels detected. Limit outdoor activities.';
          case 'low': return '💨✅ Low smoke alert: Minor smoke detected. Continue monitoring air quality.';
          default: return '💨 Monitor smoke conditions regularly.';
        }
      default:
        return '📊 Monitor conditions regularly.';
    }
  };

  // Data loading functions using DataManager
  const handleLoadData = () => {
    DataManager.fetchFireRiskData(setIsLoading, setApiStatus, (data) => {
      dataRef.current.fire_risk = data;
      setRiskData(prev => ({ ...prev, fire_risk: data }));
    });
  };

  const handleLoadSampleData = () => {
    DataManager.loadSampleData((data) => {
      dataRef.current.fire_risk = data;
      setRiskData(prev => ({ ...prev, fire_risk: data }));
      setApiStatus('Sample fire data loaded');
    }, setApiStatus);
  };

  const handleClearData = () => {
    DataManager.clearAllData(() => {
      dataRef.current = { fire_risk: [], flood_risk: [], weather_alert: [], smoke_alert: [] };
      setRiskData({ fire_risk: [], flood_risk: [], weather_alert: [], smoke_alert: [] });
      setTimestampData([]);
      setShowTimestampAnalysis(false);
      setApiStatus('All data cleared');
    }, setApiStatus);
  };

  // Clear specific data type
  const handleClearDataType = (dataType) => {
    dataRef.current[dataType] = [];
    setRiskData(prev => ({ ...prev, [dataType]: [] }));
    setApiStatus(`${dataType.replace('_', ' ')} data cleared`);
    
    // Clear timestamp analysis if it's for this data type
    if (timestampDataType === dataType) {
      setTimestampData([]);
      setShowTimestampAnalysis(false);
    }
  };

  // Toggle timestamp analysis
  const toggleTimestampAnalysis = () => {
    if (timestampData.length > 0) {
      setShowTimestampAnalysis(!showTimestampAnalysis);
    }
  };

  // Test function to add a SIMPLE marker (no blue icon)
  const testAddMarker = () => {
    if (mapRef.current) {
      const simpleIcon = createSimpleMarker('medium', activeDataType);
      const marker = L.marker([9.03, 38.74], { icon: simpleIcon }).addTo(mapRef.current);
      marker.bindPopup(`TEST MARKER - ${activeDataType.replace('_', ' ')}`).openPopup();
      console.log('🧪 Simple test marker added');
    }
  };

  // Handle back to intro
  const handleBackToIntro = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      setMapInitialized(false);
    }
    setRiskData({ fire_risk: [], flood_risk: [], weather_alert: [], smoke_alert: [] });
    setTimestampData([]);
    dataRef.current = { fire_risk: [], flood_risk: [], weather_alert: [], smoke_alert: [] };
    setShowTimestampAnalysis(false);
    setCurrentView('intro');
  };

  // if (currentView === 'intro') {
  //   return <IntroPage onEnterMap={() => setCurrentView('map')} />;
  // }

  return (
    <div className="map-container">
      {/* Header */}
      <div className="map-header">
        <div className="header-left">
          <h1 className="map-title">🚨 Multi-Risk Monitoring System</h1>
          <div className="data-counters">
            <span className="counter-item fire">🔥 Fire: {riskData.fire_risk.length}</span>
            <span className="counter-item flood">🌊 Flood: {riskData.flood_risk.length}</span>
            <span className="counter-item weather">🌪️ Weather: {riskData.weather_alert.length}</span>
            <span className="counter-item smoke">💨 Smoke: {riskData.smoke_alert.length}</span>
            <span className="counter-item extinguisher">🧯 Extinguishers: {fireExtinguishers.length}</span>
            {timestampData.length > 0 && (
              <span className="counter-item timestamp">⏰ Timestamps: {timestampData.length}</span>
            )}
          </div>
        </div>
        
        <div className="header-controls">
          {/* Data Type Selector */}
          <div className="data-type-selector">
            <button 
              onClick={() => setActiveDataType('fire_risk')}
              className={`data-type-button ${activeDataType === 'fire_risk' ? 'active' : 'inactive'} ${activeDataType === 'fire_risk' ? 'fire' : ''}`}
            >
              🔥 Fire
            </button>
            <button 
              onClick={() => setActiveDataType('flood_risk')}
              className={`data-type-button ${activeDataType === 'flood_risk' ? 'active' : 'inactive'} ${activeDataType === 'flood_risk' ? 'flood' : ''}`}
            >
              🌊 Flood
            </button>
            <button 
              onClick={() => setActiveDataType('weather_alert')}
              className={`data-type-button ${activeDataType === 'weather_alert' ? 'active' : 'inactive'} ${activeDataType === 'weather_alert' ? 'weather' : ''}`}
            >
              🌪️ Weather
            </button>
            <button 
              onClick={() => setActiveDataType('smoke_alert')}
              className={`data-type-button ${activeDataType === 'smoke_alert' ? 'active' : 'inactive'} ${activeDataType === 'smoke_alert' ? 'smoke' : ''}`}
            >
              💨 Smoke
            </button>
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => setShowPipelineTester(true)}
              className="control-button pipeline"
            >
              📊 Data Pipeline
            </button>
            
            {timestampData.length > 0 && (
              <button 
                onClick={toggleTimestampAnalysis}
                className={`control-button timestamp ${showTimestampAnalysis ? 'active' : ''}`}
              >
                {showTimestampAnalysis ? '🗺️ Hide Analysis' : '⏰ Show Analysis'}
              </button>
            )}
            
            <button 
              onClick={testAddMarker}
              className="control-button test"
            >
              🧪 Test Marker
            </button>
            
            <button 
              onClick={() => handleClearDataType(activeDataType)}
              disabled={riskData[activeDataType].length === 0}
              className={`control-button clear ${riskData[activeDataType].length === 0 ? 'disabled' : ''}`}
            >
              🧹 Clear {activeDataType.replace('_', ' ')}
            </button>
            
            <button 
              onClick={handleBackToIntro}
              className="control-button back"
            >
              ← Back to Intro
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Map and Panels */}
      <div className="main-content">
        {/* Map Container - Always visible */}
        <div 
          ref={mapContainerRef}
          className="map-area"
        >
          {!mapInitialized && (
            <div className="loading-overlay">
              <div className="spinner-large"></div>
              <div>Loading map...</div>
            </div>
          )}

          {/* Map Controls */}
          {mapInitialized && mapRef.current && (
            <>
              <LayerControls 
                activeLayers={activeLayers} 
                onToggleLayer={(layer) => setActiveLayers(prev => ({...prev, [layer]: !prev[layer]}))} 
              />
              <Legend 
                fireZoneCount={riskData.fire_risk.length}
                floodZoneCount={riskData.flood_risk.length}
                weatherZoneCount={riskData.weather_alert.length}
                smokeZoneCount={riskData.smoke_alert.length}
                activeDataType={activeDataType}
                timestampCount={timestampData.length}
              />
            </>
          )}

          {/* Map Layers - Using consistent colors */}
          {mapInitialized && mapRef.current && (
            <>
              {/* Fire Extinguishers (only for fire data) */}
              {activeLayers.extinguishers && (
                <FireExtinguishers
                  map={mapRef.current}
                  fireExtinguishers={fireExtinguishers}
                />
              )}
              
              {/* Risk Data Layers for each type using FireRiskDataLayer */}
              {activeLayers.fireData && riskData.fire_risk.length > 0 && (
                <FireRiskDataLayer
                  map={mapRef.current}
                  fireRiskData={riskData.fire_risk}
                  dataType="fire_risk"
                />
              )}
              
              {activeLayers.floodData && riskData.flood_risk.length > 0 && (
                <FireRiskDataLayer
                  map={mapRef.current}
                  fireRiskData={riskData.flood_risk}
                  dataType="flood_risk"
                />
              )}
              
              {activeLayers.weatherData && riskData.weather_alert.length > 0 && (
                <FireRiskDataLayer
                  map={mapRef.current}
                  fireRiskData={riskData.weather_alert}
                  dataType="weather_alert"
                />
              )}
              
              {activeLayers.smokeData && riskData.smoke_alert.length > 0 && (
                <FireRiskDataLayer
                  map={mapRef.current}
                  fireRiskData={riskData.smoke_alert}
                  dataType="smoke_alert"
                />
              )}
              
              {/* Auto Coverage for all risk types */}
              {activeLayers.autoCoverage && riskData.fire_risk.length > 0 && (
                <AutoFireCoverage
                  map={mapRef.current}
                  fireRiskData={riskData.fire_risk}
                  fireExtinguishers={fireExtinguishers}
                  dataType="fire_risk"
                  isActive={activeLayers.autoCoverage}
                />
              )}
              
              {activeLayers.autoCoverage && riskData.flood_risk.length > 0 && (
                <AutoFireCoverage
                  map={mapRef.current}
                  fireRiskData={riskData.flood_risk}
                  fireExtinguishers={[]}
                  dataType="flood_risk"
                  isActive={activeLayers.autoCoverage}
                />
              )}
              
              {activeLayers.autoCoverage && riskData.weather_alert.length > 0 && (
                <AutoFireCoverage
                  map={mapRef.current}
                  fireRiskData={riskData.weather_alert}
                  fireExtinguishers={[]}
                  dataType="weather_alert"
                  isActive={activeLayers.autoCoverage}
                />
              )}
              
              {activeLayers.autoCoverage && riskData.smoke_alert.length > 0 && (
                <AutoFireCoverage
                  map={mapRef.current}
                  fireRiskData={riskData.smoke_alert}
                  fireExtinguishers={[]}
                  dataType="smoke_alert"
                  isActive={activeLayers.autoCoverage}
                />
              )}
            </>
          )}
        </div>

        {/* Timestamp Analysis Panel - Slides in when active */}
        {showTimestampAnalysis && timestampData.length > 0 && (
          <div className="timestamp-analysis-panel">
            <div className="timestamp-panel-header">
              <h3>⏰ Temporal Analysis - {timestampDataType.replace('_', ' ').toUpperCase()}</h3>
              <button 
                onClick={() => setShowTimestampAnalysis(false)}
                className="close-button"
              >
                ✕ Close
              </button>
            </div>
            <div className="timestamp-panel-content">
              <TimestampAnalysis 
                timestampData={timestampData}
                processorType={timestampDataType}
                title={`${timestampDataType.replace('_', ' ').toUpperCase()} Temporal Analysis`}
              />
            </div>
          </div>
        )}

        {/* Control Panel - Always visible on right */}
        {!showTimestampAnalysis && (
          <div className="control-panel">
            <div className="panel-content">
              <ControlPanel 
                onLoadData={handleLoadData}
                onLoadSampleData={handleLoadSampleData}
                onLoadPipelineData={() => setShowPipelineTester(true)}
                onClearData={handleClearData}
                fireRiskData={riskData.fire_risk}
                floodRiskData={riskData.flood_risk}
                weatherAlertData={riskData.weather_alert}
                smokeAlertData={riskData.smoke_alert}
                fireExtinguishers={fireExtinguishers}
                isLoading={isLoading}
                apiStatus={apiStatus}
                activeDataType={activeDataType}
                onClearDataType={handleClearDataType}
                timestampData={timestampData}
                onShowTimestampAnalysis={toggleTimestampAnalysis}
                showTimestampAnalysis={showTimestampAnalysis}
              />
            </div>
          </div>
        )}

        {/* Pipeline Tester Panel - Slides in over Control Panel */}
        {showPipelineTester && (
          <div className="pipeline-panel">
            <div className="pipeline-header">
              <h3 style={{ margin: 0 }}>📊 Multi-Risk Pipeline Tester</h3>
              <button 
                onClick={() => setShowPipelineTester(false)}
                className="close-button"
              >
                ✕ Close
              </button>
            </div>
            <div className="pipeline-content">
              <PipelineTester onPipelineComplete={handlePipelineResult} />
            </div>
          </div>
        )}
      </div>

      {/* Status Notifications */}
      {isLoading && (
        <div className="loading-notification">
          <div className="loading-spinner"></div>
          <span>⏳ Loading data... {apiStatus}</span>
        </div>
      )}
      
      {apiStatus && !isLoading && (
        <div className={`status-notification ${apiStatus.includes('❌') ? 'error' : apiStatus.includes('✅') ? 'success' : 'info'}`}>
          {apiStatus}
        </div>
      )}

      {/* Footer */}
      <div className="map-footer">
        {showPipelineTester 
          ? '📊 Upload CSV/JSON file and select processor type to see data on map'
          : showTimestampAnalysis
          ? `⏰ Temporal Analysis Active | ${timestampDataType.replace('_', ' ').toUpperCase()} | ${timestampData.length} timestamps`
          : `🗺️ Active: ${activeDataType.replace('_', ' ').toUpperCase()} | 🔥 Fire: ${riskData.fire_risk.length} | 🌊 Flood: ${riskData.flood_risk.length} | 🌪️ Weather: ${riskData.weather_alert.length} | 💨 Smoke: ${riskData.smoke_alert.length} | 🎨 Colors: 🔴 High | 🟡 Medium | 🟢 Low`
        }
      </div>
    </div>
  );
};

export default MapComponent;