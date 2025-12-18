import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const AutoFireCoverage = ({ 
  map, 
  fireRiskData, 
  fireExtinguishers,
  dataType = 'fire_risk',  // New prop for different risk types
  isActive = true          // New prop to control visibility
}) => {
  const coverageLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !fireRiskData || fireRiskData.length === 0 || !isActive) {
      console.log(`❌ AutoFireCoverage (${dataType}): Missing required data or inactive`);
      // Cleanup existing layers
      if (coverageLayerRef.current && map.hasLayer(coverageLayerRef.current)) {
        map.removeLayer(coverageLayerRef.current);
      }
      return;
    }

    console.log(`🎯 AutoFireCoverage (${dataType}): Creating coverage with`, fireRiskData.length, 'risk zones');

    // Clear existing coverage layers
    if (coverageLayerRef.current && map.hasLayer(coverageLayerRef.current)) {
      map.removeLayer(coverageLayerRef.current);
    }

    // Create feature group for all coverage areas
    const coverageLayer = L.featureGroup();
    coverageLayer._coverageLayer = true;
    coverageLayer._dataType = dataType; // Mark which data type this layer belongs to
    coverageLayerRef.current = coverageLayer;

    let coverageZonesCreated = 0;

    // ✅ UPDATED: Coverage configuration with CONSISTENT RED/YELLOW/GREEN colors
    const getCoverageConfig = (riskLevel) => {
      const baseConfig = {
        fire_risk: {
          high: { radius: 100, color: '#ff0000', icon: '🔥', title: 'Fire Coverage Zone' },       // RED
          medium: { radius: 200, color: '#cece40ff', icon: '🔥', title: 'Fire Coverage Zone' },     // YELLOW
          low: { radius: 200, color: '#00ff00', icon: '🔥', title: 'Fire Coverage Zone' }         // GREEN
        },
        flood_risk: {
          high: { radius: 300, color: '#ff0000', icon: '🌊', title: 'Flood Coverage Zone' },      // RED
          medium: { radius: 200, color: '#c4c446ff', icon: '🌊', title: 'Flood Coverage Zone' },    // YELLOW
          low: { radius: 150, color: '#00ff00', icon: '🌊', title: 'Flood Coverage Zone' }        // GREEN
        },
        weather_alert: {
          high: { radius: 500, color: '#ff0000', icon: '🌪️', title: 'Weather Coverage Zone' },   // RED
          medium: { radius: 300, color: '#adad3aff', icon: '🌪️', title: 'Weather Coverage Zone' }, // YELLOW
          low: { radius: 200, color: '#00ff00', icon: '🌪️', title: 'Weather Coverage Zone' }     // GREEN
        },
        smoke_alert: {
          high: { radius: 400, color: '#ff0000', icon: '💨', title: 'Smoke Coverage Zone' },      // RED
          medium: { radius: 250, color:'#adad3aff', icon: '💨', title: 'Smoke Coverage Zone' },    // YELLOW
          low: { radius: 150, color: '#00ff00', icon: '💨', title: 'Smoke Coverage Zone' }        // GREEN
        }
      };

      // Fallback to fire_risk config if dataType not found
      const config = baseConfig[dataType] || baseConfig.fire_risk;
      return config[riskLevel] || config.medium;
    };

    // Get description based on data type and risk level
    const getCoverageDescription = (riskLevel, dataType) => {
      const descriptions = {
        fire_risk: {
          high: 'High fire risk area requiring immediate attention',
          medium: 'Medium fire risk area - monitor closely',
          low: 'Low fire risk area - routine monitoring'
        },
        flood_risk: {
          high: 'High flood risk area - potential flooding expected',
          medium: 'Medium flood risk - possible flooding',
          low: 'Low flood risk - minor water accumulation possible'
        },
        weather_alert: {
          high: 'Severe weather alert area - take precautions',
          medium: 'Weather warning area - monitor conditions',
          low: 'Weather advisory area - stay informed'
        },
        smoke_alert: {
          high: 'High smoke concentration - health hazard',
          medium: 'Elevated smoke levels - limit exposure',
          low: 'Low smoke levels - minor air quality impact'
        }
      };

      const typeDesc = descriptions[dataType] || descriptions.fire_risk;
      return typeDesc[riskLevel] || typeDesc.medium;
    };

    // Calculate coverage based on risk levels
    fireRiskData.forEach((riskZone, index) => {
      const { latitude, longitude, danger_zone_level, zone_name, recommendation } = riskZone;
      
      if (!latitude || !longitude) return;

      // Validate coordinates
      const latNum = Number(latitude);
      const lngNum = Number(longitude);
      if (isNaN(latNum) || isNaN(lngNum)) return;

      const riskLevel = (danger_zone_level || 'medium').toLowerCase();
      const coverageConfig = getCoverageConfig(riskLevel);
      const description = getCoverageDescription(riskLevel, dataType);

      // Create coverage circle
      const coverageCircle = L.circle([latNum, lngNum], {
        color: coverageConfig.color,
        fillColor: coverageConfig.color,
        fillOpacity: 0.15,
        radius: coverageConfig.radius,
        weight: 2,
        className: `${dataType}-coverage-${riskLevel}` // Add class for styling
      });

      // Add to coverage layer
      coverageLayer.addLayer(coverageCircle);
      coverageZonesCreated++;

      // Add popup with coverage information
      coverageCircle.bindPopup(`
        <div style="min-width: 250px;">
          <h3 style="color: ${coverageConfig.color}; margin: 0 0 10px 0;">
            ${coverageConfig.icon} ${coverageConfig.title}
          </h3>
          <p><strong>📍 Zone:</strong> ${zone_name || `${dataType.replace('_', ' ')} Zone ${index + 1}`}</p>
          <p><strong>🚨 Risk Level:</strong> <span style="color: ${coverageConfig.color}; font-weight: bold;">
            ${riskLevel.toUpperCase()}
          </span></p>
          <p><strong>📏 Coverage Radius:</strong> ${coverageConfig.radius}m</p>
          <p><strong>📝 Description:</strong> ${description}</p>
          ${recommendation ? `<p><strong>💡 Recommendation:</strong> ${recommendation}</p>` : ''}
          <div style="display: flex; align-items: center; margin: 10px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
            <div style="width: 16px; height: 16px; background: ${coverageConfig.color}; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 0 3px rgba(0,0,0,0.3);"></div>
            <span><strong>Color Code:</strong> ${riskLevel.toUpperCase()} RISK</span>
          </div>
        </div>
      `);
    });

    // Add the coverage layer to map
    if (coverageZonesCreated > 0) {
      coverageLayer.addTo(map);
      console.log(`✅ AutoFireCoverage (${dataType}): Added`, coverageZonesCreated, 'coverage zones with consistent colors');
    }

    // Cleanup function
    return () => {
      console.log(`🧹 Cleaning up AutoFireCoverage (${dataType})`);
      if (coverageLayerRef.current && map.hasLayer(coverageLayerRef.current)) {
        map.removeLayer(coverageLayerRef.current);
      }
    };
  }, [map, fireRiskData, fireExtinguishers, dataType, isActive]);

  return null;
};

export default AutoFireCoverage;