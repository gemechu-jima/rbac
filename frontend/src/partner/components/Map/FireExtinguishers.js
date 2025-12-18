import React, { useEffect } from 'react';
import L from 'leaflet';

const FireExtinguishers = ({ map, fireExtinguishers }) => {
  useEffect(() => {
    if (!map || !fireExtinguishers.length) return;

    const extinguisherGroup = L.layerGroup().addTo(map);

    // Create custom icons
    const createExtinguisherIcon = (riskLevel) => {
      let iconColor;
      switch (riskLevel) {
        case 'high':
          iconColor = '#e74c3c';
          break;
        case 'medium':
          iconColor = '#f39c12';
          break;
        case 'low':
          iconColor = '#27ae60';
          break;
        default:
          iconColor = '#95a5a6';
      }

      return L.divIcon({
        className: 'extinguisher-icon',
        html: `
          <div style="
            background: ${iconColor};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    };

    fireExtinguishers.forEach(extinguisher => {
      // Safe coordinate handling
      const lat = typeof extinguisher.position?.latitude === 'number' ? extinguisher.position.latitude : null;
      const lng = typeof extinguisher.position?.longitude === 'number' ? extinguisher.position.longitude : null;

      if (!lat || !lng) {
        console.warn('Invalid extinguisher coordinates:', extinguisher.id);
        return;
      }

      // Safe risk level
      const riskLevel = extinguisher.riskLevel || 'medium';

      const marker = L.marker([lat, lng], {
        icon: createExtinguisherIcon(riskLevel)
      });

      const popupContent = `
        <div class="extinguisher-popup">
          <h3>Fire Extinguisher #${extinguisher.id || 'Unknown'}</h3>
          <div class="extinguisher-details">
            <p><strong>Type:</strong> ${extinguisher.type || 'Unknown'}</p>
            <p><strong>Risk Level:</strong> <span class="risk-${riskLevel}">${riskLevel.toUpperCase()}</span></p>
            <p><strong>Last Inspection:</strong> ${extinguisher.lastInspection || 'Unknown'}</p>
            <p><strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(extinguisherGroup);
    });

    return () => {
      map.removeLayer(extinguisherGroup);
    };
  }, [map, fireExtinguishers]);

  return null;
};

export default FireExtinguishers;