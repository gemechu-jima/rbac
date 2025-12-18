import React, { useEffect } from 'react';
import L from 'leaflet';

const FireRiskDataLayer = ({ map, fireRiskData, dataType = 'fire_risk' }) => {
  useEffect(() => {
    console.log(`🎯 ${dataType.toUpperCase()}DataLayer STARTED - Debug Info:`);
    console.log('- Map exists:', !!map);
    console.log('- Data:', fireRiskData);
    console.log('- Data length:', fireRiskData?.length);
    console.log('- Data Type:', dataType);
    
    if (!map) {
      console.log(`❌ ${dataType.toUpperCase()}DataLayer: No map instance`);
      return;
    }

    if (!fireRiskData || fireRiskData.length === 0) {
      console.log(`❌ ${dataType.toUpperCase()}DataLayer: No data provided`);
      return;
    }

    console.log(`🔄 ${dataType.toUpperCase()}DataLayer: Creating layer with`, fireRiskData.length, 'points');

    // Clear existing risk layers first
    let layersRemoved = 0;
    map.eachLayer((layer) => {
      if (layer._riskDataLayer && layer._dataType === dataType) {
        map.removeLayer(layer);
        layersRemoved++;
      }
    });
    console.log('🧹 Removed', layersRemoved, 'existing risk layers for', dataType);

    // Create feature group for all risk points
    const riskLayer = L.featureGroup();
    riskLayer._riskDataLayer = true;
    riskLayer._dataType = dataType; // Mark which data type this layer belongs to

    let validMarkers = 0;
    let invalidMarkers = 0;

    // ✅ CONSISTENT COLOR SCHEME FOR ALL RISK TYPES
    const colors = {
      high: '#ff0000',    // RED
      medium: '#e6e65cff',  // YELLOW
      low: '#00ff00'      // GREEN
    };

    // Get icon and title based on data type
    const getTypeConfig = () => {
      switch (dataType) {
        case 'fire_risk':
          return { icon: '🔥', title: 'Fire Risk Zone' };
        case 'flood_risk':
          return { icon: '🌊', title: 'Flood Risk Zone' };
        case 'weather_alert':
          return { icon: '🌪️', title: 'Weather Alert Zone' };
        case 'smoke_alert':
          return { icon: '💨', title: 'Smoke Detector' };
        default:
          return { icon: '📍', title: 'Risk Zone' };
      }
    };

    const typeConfig = getTypeConfig();

    // Create markers for each data point
    fireRiskData.forEach((detector, index) => {
      console.log(`📍 Processing ${dataType} detector ${index}:`, detector);

      const { latitude, longitude, danger_zone_level, recommendation } = detector;
      
      // Validate coordinates
      if (!latitude || !longitude) {
        console.warn(`❌ Invalid coordinates for ${dataType} detector ${index}:`, { latitude, longitude });
        invalidMarkers++;
        return;
      }

      const latNum = Number(latitude);
      const lngNum = Number(longitude);
      
      if (isNaN(latNum) || isNaN(lngNum)) {
        console.warn(`❌ Invalid coordinate numbers for ${dataType} detector ${index}:`, { latNum, lngNum });
        invalidMarkers++;
        return;
      }

      console.log(`✅ Valid coordinates for ${dataType} detector ${index}: ${latNum}, ${lngNum}`);

      // ✅ USE CONSISTENT COLORS FOR ALL RISK TYPES
      let markerColor, borderColor, markerSize;
      const riskLevel = (danger_zone_level || 'medium').toLowerCase();
      
      switch (riskLevel) {
        case 'high':
          markerColor = colors.high;      // RED
          borderColor = '#cc0000';
          markerSize = 12;
          break;
        case 'medium':
          markerColor = colors.medium;    // YELLOW
          borderColor = '#e6e65cff';
          markerSize = 10;
          break;
        case 'low':
          markerColor = colors.low;       // GREEN
          borderColor = '#00cc00';
          markerSize = 8;
          break;
        default:
          markerColor = colors.medium;    // YELLOW as default
          borderColor = '#e6e65cff';
          markerSize = 10;
      }

      // Create circle marker with consistent styling
      const marker = L.circleMarker([latNum, lngNum], {
        color: borderColor,
        fillColor: markerColor,
        fillOpacity: 0.8,
        radius: markerSize,
        weight: 2,
        className: `${dataType}-marker-${riskLevel}`
      });

      // ✅ FIXED: DISPLAY REAL SENSOR DATA FOR SMOKE ALERTS
      const getPopupContent = () => {
        if (dataType === 'smoke_alert') {
          return `
            <div style="min-width: 280px;">
              <h3 style="color: ${markerColor}; margin: 0 0 10px 0; border-bottom: 2px solid ${markerColor}; padding-bottom: 5px;">
                ${typeConfig.icon} ${typeConfig.title}
              </h3>
              
              <!-- REAL SENSOR DATA FROM SERVER -->
              ${detector.building_id ? `<p><strong>🏢 Building ID:</strong> ${detector.building_id}</p>` : ''}
              ${detector.floor_number ? `<p><strong>🏗️ Floor Number:</strong> ${detector.floor_number}</p>` : ''}
              ${detector.room_id ? `<p><strong>🚪 Room ID:</strong> ${detector.room_id}</p>` : ''}
              ${detector.detector_id ? `<p><strong>📟 Detector ID:</strong> ${detector.detector_id}</p>` : ''}
              
              <!-- SENSOR READINGS -->
              ${detector.smoke_density !== undefined && detector.smoke_density !== null ? `<p><strong>💨 Smoke Density:</strong> ${detector.smoke_density}</p>` : ''}
              ${detector.carbon_monoxide_ppm !== undefined && detector.carbon_monoxide_ppm !== null ? `<p><strong>☠️ CO Level:</strong> ${detector.carbon_monoxide_ppm} ppm</p>` : ''}
              ${detector.temperature_c !== undefined && detector.temperature_c !== null ? `<p><strong>🌡️ Temperature:</strong> ${detector.temperature_c}°C</p>` : ''}
              ${detector.timestamp ? `<p><strong>🕒 Timestamp:</strong> ${detector.timestamp}</p>` : ''}
              
              <!-- RISK INFORMATION -->
              <p><strong>🚨 Risk Level:</strong> <span style="color: ${markerColor}; font-weight: bold;">${riskLevel.toUpperCase()}</span></p>
              <p><strong>📍 Coordinates:</strong> ${latNum.toFixed(6)}, ${lngNum.toFixed(6)}</p>
              
              ${recommendation ? `
                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; margin: 10px 0;">
                  <strong>💡 Recommendation:</strong> ${recommendation}
                </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; margin: 10px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                <div style="width: 16px; height: 16px; background: ${markerColor}; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 0 3px rgba(0,0,0,0.3);"></div>
                <span><strong>Color Code:</strong> ${riskLevel.toUpperCase()} RISK</span>
              </div>
              
              ${detector.server_prediction_data ? '<p style="font-size: 11px; color: #888;">📊 Source: Real Server Data</p>' : 
                detector.source === 'csv_data' ? '<p style="font-size: 11px; color: #888;">📊 Source: CSV Data</p>' : ''}
            </div>
          `;
        } else {
          // For other risk types (fire, flood, weather)
          return `
            <div style="min-width: 280px;">
              <h3 style="color: ${markerColor}; margin: 0 0 10px 0; border-bottom: 2px solid ${markerColor}; padding-bottom: 5px;">
                ${typeConfig.icon} ${typeConfig.title}
              </h3>
              <p><strong>📍 Zone Name:</strong> ${detector.zone_name || `${dataType.replace('_', ' ')} Zone ${index + 1}`}</p>
              <p><strong>🚨 Risk Level:</strong> <span style="color: ${markerColor}; font-weight: bold;">${riskLevel.toUpperCase()}</span></p>
              <p><strong>📍 Coordinates:</strong> ${latNum.toFixed(6)}, ${lngNum.toFixed(6)}</p>
              
              ${recommendation ? `
                <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; margin: 10px 0;">
                  <strong>💡 Recommendation:</strong> ${recommendation}
                </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; margin: 10px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                <div style="width: 16px; height: 16px; background: ${markerColor}; border-radius: 50%; margin-right: 10px; border: 2px solid white; box-shadow: 0 0 3px rgba(0,0,0,0.3);"></div>
                <span><strong>Color Code:</strong> ${riskLevel.toUpperCase()} RISK</span>
              </div>
              
              ${detector.original_csv_data ? '<p style="font-size: 11px; color: #888;">📊 Source: Pipeline Data</p>' : ''}
            </div>
          `;
        }
      };

      // Add popup with real sensor data
      marker.bindPopup(getPopupContent());

      // Add click event for debugging
      marker.on('click', () => {
        console.log(`🎯 ${dataType} marker clicked:`, detector);
        console.log('📊 Sensor data available:', {
          building_id: detector.building_id,
          floor_number: detector.floor_number,
          room_id: detector.room_id,
          detector_id: detector.detector_id,
          smoke_density: detector.smoke_density,
          carbon_monoxide_ppm: detector.carbon_monoxide_ppm,
          temperature_c: detector.temperature_c,
          timestamp: detector.timestamp
        });
      });

      riskLayer.addLayer(marker);
      validMarkers++;

      console.log(`✅ Added ${dataType} marker ${index} at ${latNum}, ${lngNum}`);
    });

    console.log(`📊 ${dataType} Marker Summary: ${validMarkers} valid, ${invalidMarkers} invalid`);

    // Add the layer to map
    if (validMarkers > 0) {
      riskLayer.addTo(map);
      console.log(`✅ ${dataType.toUpperCase()}DataLayer: Successfully added`, validMarkers, 'markers to map');

      // Auto-zoom to show all points
      setTimeout(() => {
        try {
          const bounds = riskLayer.getBounds();
          if (bounds && bounds.isValid && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [30, 30] });
            console.log(`🗺️ Map zoomed to ${dataType} data bounds`);
          } else {
            console.warn(`⚠️ Could not calculate valid bounds for ${dataType} markers`);
          }
        } catch (error) {
          console.warn(`⚠️ ${dataType} auto-zoom failed:`, error.message);
        }
      }, 500);

    } else {
      console.log(`❌ ${dataType.toUpperCase()}DataLayer: No valid markers to add`);
    }

    // Cleanup function
    return () => {
      console.log(`🧹 ${dataType.toUpperCase()}DataLayer cleanup started`);
      if (riskLayer) {
        try {
          if (map.hasLayer(riskLayer)) {
            map.removeLayer(riskLayer);
            console.log(`✅ ${dataType.toUpperCase()}DataLayer: Cleaned up successfully`);
          }
        } catch (error) {
          console.warn(`⚠️ ${dataType.toUpperCase()}DataLayer cleanup error:`, error.message);
        }
      }
    };
  }, [map, fireRiskData, dataType]);

  console.log(`🔍 ${dataType.toUpperCase()}DataLayer RENDER called`);
  return null;
};

export default FireRiskDataLayer;