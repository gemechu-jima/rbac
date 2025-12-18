import React, { useEffect } from 'react';
import L from 'leaflet';

const MapInitializer = ({ currentView, mapInitialized, setMap, setMapInitialized }) => {
  useEffect(() => {
    if (currentView === 'map' && !mapInitialized) {
      console.log('🚀 Initializing Leaflet map...');
      
      const initMap = setTimeout(() => {
        const mapContainer = document.getElementById('map');
        
        if (!mapContainer) {
          console.error('❌ Map container not found!');
          return;
        }

        const mapInstance = L.map('map', {
          center: [9.03, 38.74],
          zoom: 11,
          zoomControl: false,
          attributionControl: true
        });

        // Add zoom control
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstance);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        // Add scale control
        L.control.scale({ 
          imperial: false,
          position: 'bottomleft'
        }).addTo(mapInstance);

        console.log('✅ Leaflet map created successfully');
        setMap(mapInstance);
        setMapInitialized(true);

        // Force resize
        setTimeout(() => {
          mapInstance.invalidateSize();
        }, 300);

      }, 100);

      return () => clearTimeout(initMap);
    }
  }, [currentView, mapInitialized, setMap, setMapInitialized]);

  return (
    <div id="map" className="map">
      {!mapInitialized && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Initializing Leaflet Map...</p>
          <p className="loading-sub">Loading OpenStreetMap tiles...</p>
        </div>
      )}
    </div>
  );
};

export default MapInitializer;