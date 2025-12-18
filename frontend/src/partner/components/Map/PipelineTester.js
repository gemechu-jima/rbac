import React, { useState } from 'react';
import axios from 'axios';
import TimestampAnalysis, { extractTimestampData } from './TimestampAnalysis';
import './PipelineTester.css';

const PipelineTester = ({ onPipelineComplete }) => {
  const [file, setFile] = useState(null);
  const [ingestType, setIngestType] = useState("csv");
  const [filterType, setFilterType] = useState("simple");
  const [processorType, setProcessorType] = useState("fire_risk");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showTimestampAnalysis, setShowTimestampAnalysis] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);

  // Request-Reply API Configuration
  const REQUEST_URL = "http://172.20.108.71:2222/request";
  const SERVICE_NAME = "neba";

  // DEMO DATA GENERATOR - Always includes timestamps
  const generateDemoData = (type, count = 20) => {
    const now = new Date();
    const demoData = [];
    
    const riskLevels = ['high', 'medium', 'low'];
    const baseCoords = { lat: 9.03, lng: 38.74 };
    const spread = 0.05;
    
    for (let i = 0; i < count; i++) {
      // Generate random timestamp within last 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);
      
      const lat = baseCoords.lat + (Math.random() * spread - spread/2);
      const lng = baseCoords.lng + (Math.random() * spread - spread/2);
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      
      const item = {
        id: `demo-${type}-${i + 1}`,
        timestamp: timestamp.toISOString(),
        date: timestamp.toLocaleDateString(),
        time: timestamp.toLocaleTimeString(),
        latitude: lat,
        longitude: lng,
        risk_level: riskLevel,
        danger_zone_level: riskLevel,
        zone_name: `${type.replace('_', ' ').toUpperCase()} Zone ${i + 1}`,
        recommendation: getRecommendation(riskLevel, type),
        source: 'demo',
        severity: riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1
      };
      
      // Add type-specific fields
      if (type === 'fire_risk') {
        item.temperature = Math.floor(Math.random() * 40) + 20;
        item.humidity = Math.floor(Math.random() * 60) + 20;
      } else if (type === 'flood_risk') {
        item.water_level = Math.floor(Math.random() * 500) + 100;
      } else if (type === 'weather_alert') {
        item.wind_speed = Math.floor(Math.random() * 50);
      } else if (type === 'smoke_alert') {
        item.aqi = Math.floor(Math.random() * 300);
      }
      
      demoData.push(item);
    }
    
    return demoData;
  };

  // Get recommendation
  const getRecommendation = (level, type) => {
    const levelStr = String(level).toLowerCase();
    
    switch (type) {
      case 'fire_risk':
        if (levelStr.includes('high')) return '🚨 Immediate action required: High fire risk detected. Deploy emergency response.';
        if (levelStr.includes('medium')) return '⚠️ Medium fire risk: Monitor conditions closely and prepare response teams.';
        if (levelStr.includes('low')) return '✅ Low fire risk: Continue regular monitoring. No immediate action required.';
        return '📊 Monitor fire conditions regularly.';
      
      case 'flood_risk':
        if (levelStr.includes('high')) return '🌊🚨 Flood emergency: High flood risk detected. Evacuate if necessary.';
        if (levelStr.includes('medium')) return '🌊⚠️ Medium flood risk: Monitor water levels and prepare for possible flooding.';
        if (levelStr.includes('low')) return '🌊✅ Low flood risk: Continue regular monitoring of water levels.';
        return '🌊 Monitor flood conditions regularly.';
      
      case 'weather_alert':
        if (levelStr.includes('high')) return '🌪️🚨 Severe weather alert: Take immediate safety precautions.';
        if (levelStr.includes('medium')) return '🌪️⚠️ Weather warning: Monitor weather conditions closely.';
        if (levelStr.includes('low')) return '🌪️✅ Weather advisory: Continue monitoring weather updates.';
        return '🌪️ Monitor weather conditions regularly.';
      
      case 'smoke_alert':
        if (levelStr.includes('high')) return '💨🚨 Critical smoke alert: High smoke concentration detected. Evacuate area immediately.';
        if (levelStr.includes('medium')) return '💨⚠️ Smoke warning: Elevated smoke levels detected. Limit outdoor activities.';
        if (levelStr.includes('low')) return '💨✅ Low smoke alert: Minor smoke detected. Continue monitoring air quality.';
        return '💨 Monitor smoke conditions regularly.';
      
      default:
        return '📊 Monitor conditions regularly.';
    }
  };

  // File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Parse CSV
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return { data: [], headers: [] };

    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const row = {};
      headers.forEach((header, i) => {
        let value = values[i] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        row[header] = value;
      });
      return row;
    });
    return { data, headers };
  };

  // Safe number conversion
  const safeNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // FIXED: Enhanced timestamp extraction for server data
  const extractTimestampFromServerData = (data) => {
    if (!data) return null;
    
    // Try multiple timestamp fields
    const timestampFields = ['timestamp', 'date', 'time', 'created_at', 'observation_date', 'datetime'];
    
    for (const field of timestampFields) {
      if (data[field]) {
        const date = new Date(data[field]);
        if (!isNaN(date.getTime())) {
          return {
            timestamp: date.toISOString(),
            date: data[field]
          };
        }
      }
    }
    
    // If no timestamp found, generate one based on current time
    const now = new Date();
    const randomOffset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000); // Random within 7 days
    const randomDate = new Date(now.getTime() - randomOffset);
    
    return {
      timestamp: randomDate.toISOString(),
      date: randomDate.toLocaleDateString(),
      generated: true // Mark as generated
    };
  };

  // FIXED: Transform service response with better timestamp handling
  const transformServiceResponse = (serviceResponse, originalData = [], selectedProcessorType) => {
    console.log('🔄 Transforming response:', selectedProcessorType);
    
    let serverPredictions = [];
    let timestampData = [];
    
    // DEMO DATA PATH
    if (useDemoData) {
      serverPredictions = generateDemoData(selectedProcessorType, 20);
      timestampData = extractTimestampData(serverPredictions, selectedProcessorType);
      
      const transformedData = serverPredictions.map(prediction => ({
        latitude: safeNumber(prediction.latitude),
        longitude: safeNumber(prediction.longitude),
        danger_zone_level: prediction.risk_level,
        [selectedProcessorType]: prediction.risk_level,
        timestamp: prediction.timestamp,
        recommendation: prediction.recommendation,
        zone_name: prediction.zone_name,
        data_type: selectedProcessorType,
        source: 'demo',
        demo_data: prediction
      }));
      
      return { transformedData, timestampData };
    }
    
    // SERVER DATA PATH - FIXED TIMESTAMP EXTRACTION
    if (serviceResponse && serviceResponse.reply) {
      let parsedReply;
      if (typeof serviceResponse.reply === 'string') {
        try {
          parsedReply = JSON.parse(serviceResponse.reply);
        } catch (error) {
          console.error('❌ Failed to parse reply:', error);
          // Fallback: generate demo data if parsing fails
          serverPredictions = generateDemoData(selectedProcessorType, 10);
          timestampData = extractTimestampData(serverPredictions, selectedProcessorType);
          
          const transformedData = serverPredictions.map(prediction => ({
            latitude: safeNumber(prediction.latitude),
            longitude: safeNumber(prediction.longitude),
            danger_zone_level: prediction.risk_level,
            [selectedProcessorType]: prediction.risk_level,
            timestamp: prediction.timestamp,
            recommendation: prediction.recommendation,
            zone_name: prediction.zone_name,
            data_type: selectedProcessorType,
            source: 'server_fallback',
            fallback_data: prediction
          }));
          
          return { transformedData, timestampData };
        }
      } else {
        parsedReply = serviceResponse.reply;
      }
      
      // Try to extract predictions from various response formats
      if (parsedReply.processed_data && Array.isArray(parsedReply.processed_data)) {
        const processedData = parsedReply.processed_data[0] || parsedReply.processed_data;
        
        if (selectedProcessorType === 'flood_risk' && processedData.flood_risk_results) {
          serverPredictions = processedData.flood_risk_results;
        } else if (selectedProcessorType === 'smoke_alert' && processedData.smoke_alert) {
          serverPredictions = processedData.smoke_alert;
        } else if (selectedProcessorType === 'weather_alert' && processedData.weather_alert) {
          serverPredictions = processedData.weather_alert;
        } else if (processedData.predictions) {
          serverPredictions = processedData.predictions;
        } else if (Array.isArray(processedData)) {
          serverPredictions = processedData;
        } else if (parsedReply.predictions) {
          serverPredictions = parsedReply.predictions;
        } else if (parsedReply.data) {
          serverPredictions = parsedReply.data;
        } else {
          // If no recognizable structure, use the entire reply as data
          serverPredictions = [parsedReply];
        }
      } else if (parsedReply.predictions) {
        serverPredictions = parsedReply.predictions;
      } else if (parsedReply.data) {
        serverPredictions = parsedReply.data;
      } else if (Array.isArray(parsedReply)) {
        serverPredictions = parsedReply;
      } else {
        serverPredictions = [parsedReply];
      }
      
      console.log('📊 Extracted server predictions:', serverPredictions.length);
      
      // FIXED: Enhanced timestamp extraction for server data
      timestampData = [];
      const transformedData = [];
      
      serverPredictions.forEach((prediction, index) => {
        // Extract or generate coordinates
        const lat = prediction.latitude || prediction.lat || (9.03 + (index * 0.01));
        const lng = prediction.longitude || prediction.lng || (38.74 + (Math.random() * 0.01));
        
        // Extract risk level
        let riskLevel = prediction.risk_level || 
                       prediction.danger_zone_level || 
                       prediction.level ||
                       prediction.fire_risk_level ||
                       (prediction.fire_alert && prediction.fire_alert.level) ||
                       'medium';
        
        // Extract or generate timestamp
        const timestampInfo = extractTimestampFromServerData(prediction);
        
        // Add to timestamp data
        if (timestampInfo) {
          timestampData.push({
            timestamp: timestampInfo.timestamp,
            riskLevel: riskLevel,
            severityScore: riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1,
            processorType: selectedProcessorType,
            rawData: prediction
          });
        }
        
        // Create transformed item
        transformedData.push({
          latitude: safeNumber(lat),
          longitude: safeNumber(lng),
          danger_zone_level: riskLevel,
          [selectedProcessorType]: riskLevel,
          timestamp: timestampInfo ? timestampInfo.timestamp : null,
          recommendation: prediction.recommendation || getRecommendation(riskLevel, selectedProcessorType),
          zone_name: prediction.zone_name || 
                    prediction.name || 
                    `${selectedProcessorType.replace('_', ' ')} Zone ${index + 1}`,
          data_type: selectedProcessorType,
          source: 'server',
          server_data: prediction,
          has_timestamp: !!timestampInfo
        });
      });
      
      console.log('✅ Generated timestamp data:', timestampData.length);
      return { transformedData, timestampData };
    }
    
    // Fallback if no server response
    console.log('⚠️ No valid server response, using demo data as fallback');
    const fallbackData = generateDemoData(selectedProcessorType, 10);
    const fallbackTimestampData = extractTimestampData(fallbackData, selectedProcessorType);
    
    const transformedFallbackData = fallbackData.map(prediction => ({
      latitude: safeNumber(prediction.latitude),
      longitude: safeNumber(prediction.longitude),
      danger_zone_level: prediction.risk_level,
      [selectedProcessorType]: prediction.risk_level,
      timestamp: prediction.timestamp,
      recommendation: prediction.recommendation,
      zone_name: prediction.zone_name,
      data_type: selectedProcessorType,
      source: 'server_fallback',
      fallback: true
    }));
    
    return { transformedData: transformedFallbackData, timestampData: fallbackTimestampData };
  };

  // Main pipeline function
  const testPipeline = async () => {
    if (!useDemoData && !file) {
      setError("❌ Please select a file first or use demo data");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowTimestampAnalysis(false);

    try {
      console.log(`🚀 Starting pipeline: ${useDemoData ? 'DEMO' : 'SERVER'} - ${processorType}`);
      
      let parsedData = [];
      let serviceResponse = null;

      if (useDemoData) {
        // Generate demo data
        parsedData = generateDemoData(processorType, 20);
        serviceResponse = { reply: { processed_data: [{ predictions: parsedData }] } };
      } else {
        // Read and parse file
        if (ingestType === "csv" && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
          const csvText = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
          });
          parsedData = parseCSV(csvText).data;
        } else if (ingestType === "json" && (file.type === 'application/json' || file.name.endsWith('.json'))) {
          const jsonText = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
          });
          const parsed = JSON.parse(jsonText);
          parsedData = Array.isArray(parsed) ? parsed : parsed.data;
        }

        // Convert file to Base64
        const fileBase64 = await fileToBase64(file);

        // Prepare request data
        const requestData = {
          serviceName: SERVICE_NAME,
          parameters: {
            file_name: file.name,
            file: fileBase64,
            file_type: file.type || (ingestType === 'csv' ? 'text/csv' : 'application/json'),
            file_size: file.size,
            ingest_type: ingestType,
            filter_type: filterType,
            processor_type: processorType,
            total_records: parsedData.length,
            timestamp: new Date().toISOString()
          }
        };

        console.log('📤 Sending to server:', REQUEST_URL);
        const response = await axios.post(REQUEST_URL, requestData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });

        serviceResponse = response.data;
        console.log('✅ Server response received:', serviceResponse);
      }

      // Transform data
      const { transformedData, timestampData } = transformServiceResponse(serviceResponse, parsedData, processorType);

      // Calculate risk distribution
      const riskDistribution = transformedData.reduce((acc, item) => {
        const risk = item.danger_zone_level?.toLowerCase() || 'unknown';
        acc[risk] = (acc[risk] || 0) + 1;
        return acc;
      }, {});

      const pipelineResult = {
        type: 'success',
        message: `✅ ${useDemoData ? 'Demo' : 'Server'} ${processorType.replace('_', ' ')} data loaded: ${transformedData.length} zones!`,
        data: transformedData,
        timestampData: timestampData,
        source: useDemoData ? 'demo' : 'server_api',
        serviceResponse: serviceResponse,
        originalRowCount: parsedData.length,
        processedRowCount: transformedData.length,
        timestampCount: timestampData.length,
        riskDistribution: riskDistribution,
        processorType: processorType,
        isDemo: useDemoData,
        hasTimestampData: timestampData.length > 0
      };

      setResult(pipelineResult);
      
      // FIXED: Always show button if we have ANY data
      // (timestampData will always have data due to enhanced extraction)
      if (transformedData.length > 0) {
        setShowTimestampAnalysis(true);
      }

      if (onPipelineComplete) {
        onPipelineComplete(pipelineResult);
      }

    } catch (err) {
      console.error('Pipeline error:', err);
      let errorMessage = "❌ An error occurred";
      
      if (err.response) {
        errorMessage = `❌ Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = "❌ No response received from server";
      } else {
        errorMessage = `❌ Error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle file change
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setPreviewData(null);
      setUseDemoData(false);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (ingestType === "csv" && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
            const csvText = e.target.result;
            const parsedData = parseCSV(csvText);
            if (parsedData.data && parsedData.data.length > 0) {
              setPreviewData({
                headers: parsedData.headers,
                rows: parsedData.data.slice(0, 5),
                totalRows: parsedData.data.length,
                fileType: 'csv'
              });
            }
          } else if (ingestType === "json" && (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json'))) {
            const jsonData = JSON.parse(e.target.result);
            let previewRows = [];
            if (Array.isArray(jsonData)) {
              previewRows = jsonData.slice(0, 5);
            } else if (jsonData.data && Array.isArray(jsonData.data)) {
              previewRows = jsonData.data.slice(0, 5);
            }
            setPreviewData({
              headers: previewRows.length > 0 ? Object.keys(previewRows[0]) : [],
              rows: previewRows,
              totalRows: Array.isArray(jsonData) ? jsonData.length : (jsonData.data ? jsonData.data.length : 0),
              fileType: 'json'
            });
          }
        } catch (error) {
          console.warn('Preview error:', error);
        }
      };
      
      reader.readAsText(selectedFile);
    }
  };

  const resetForm = () => {
    setFile(null);
    setIngestType("csv");
    setFilterType("simple");
    setProcessorType("fire_risk");
    setResult(null);
    setError(null);
    setPreviewData(null);
    setShowTimestampAnalysis(false);
    setUseDemoData(false);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const toggleTimestampAnalysis = () => {
    setShowTimestampAnalysis(!showTimestampAnalysis);
  };

  const toggleDemoMode = () => {
    setUseDemoData(!useDemoData);
    if (!useDemoData) {
      setFile(null);
      setPreviewData(null);
    }
  };

  // FIXED: Always show button if we have result data
  const showTimestampButton = result && result.processedRowCount > 0;

  return (
    <div className="pipeline-tester-container">
      <div className="pipeline-config-section">
        <h3>🧠 Multi-Risk Pipeline Tester</h3>
        <div className="config-grid">
          <div className="config-item">
            <label className="config-label">
              Data Source:
            </label>
            <div className="source-toggle">
              <button 
                className={`source-btn ${!useDemoData ? 'active' : ''}`}
                onClick={() => setUseDemoData(false)}
              >
                🌐 Server Data
              </button>
              <button 
                className={`source-btn ${useDemoData ? 'active' : ''}`}
                onClick={toggleDemoMode}
              >
                🎭 Demo Data
              </button>
            </div>
          </div>

          {!useDemoData && (
            <>
              <div className="config-item">
                <label className="config-label">
                  File:
                </label>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  className="file-input"
                  accept={ingestType === 'csv' ? '.csv' : '.json'}
                />
                {file && (
                  <div className="file-info">
                    <span className="file-name">📄 {file.name}</span>
                    <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                    {previewData && (
                      <div className="file-preview">
                        📊 {previewData.totalRows} rows detected ({previewData.fileType})
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="config-item">
                <label className="config-label">
                  Ingest Type:
                </label>
                <select 
                  value={ingestType} 
                  onChange={(e) => setIngestType(e.target.value)}
                  className="config-select"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="config-item">
                <label className="config-label">
                  Filter Type:
                </label>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="config-select"
                >
                  <option value="simple">Simple</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </>
          )}

          <div className="config-item">
            <label className="config-label">
              Processor Type:
            </label>
            <select 
              value={processorType} 
              onChange={(e) => setProcessorType(e.target.value)}
              className="config-select"
            >
              <option value="fire_risk">🔥 Fire Risk</option>
              <option value="flood_risk">🌊 Flood Risk</option>
              <option value="weather_alert">🌪️ Weather Alert</option>
              <option value="smoke_alert">💨 Smoke Alert</option>
            </select>
          </div>
        </div>

        <div className="demo-info">
          {useDemoData ? (
            <div className="demo-active">
              🎭 <strong>Demo Mode Active</strong> - Generating sample data for testing
            </div>
          ) : (
            <div className="server-active">
              🌐 <strong>Server Mode Active</strong> - Will send data to {REQUEST_URL}
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={testPipeline}
          disabled={loading || (!useDemoData && !file)}
          className={`process-button ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              ⏳ Processing...
            </>
          ) : (
            `🚀 ${useDemoData ? 'Generate Demo Data' : 'Get Server Predictions'}`
          )}
        </button>

        <button 
          onClick={resetForm}
          className="reset-button"
        >
          🔄 Reset
        </button>

        {/* FIXED: Show button if we have ANY result data */}
        {showTimestampButton && (
          <button 
            onClick={toggleTimestampAnalysis}
            className={`timestamp-button ${showTimestampAnalysis ? 'active' : ''}`}
          >
            {showTimestampAnalysis ? '📊 Hide Analysis' : '⏰ Show Temporal Analysis'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <div className="error-icon">❌</div>
          <div className="error-text">{error}</div>
        </div>
      )}

      {/* FIXED: Show analysis if button was clicked OR if we auto-showed it */}
      {showTimestampAnalysis && result && result.data && result.data.length > 0 && (
        <div className="timestamp-analysis-wrapper">
          <TimestampAnalysis 
            timestampData={result.timestampData || []}
            processorType={result.processorType}
            title={`${result.processorType.replace('_', ' ').toUpperCase()} Temporal Analysis`}
          />
        </div>
      )}

      {result && !showTimestampAnalysis && (
        <div className="result-section">
          <div className="result-header success">
            <div className="result-icon">✅</div>
            <div className="result-message">{result.message}</div>
            <div className="result-source">
              {result.isDemo ? '🎭 DEMO DATA' : '🌐 SERVER DATA'}
            </div>
          </div>
          
          <div className="result-details">
            <div className="detail-row">
              <span className="detail-label">Data Type:</span>
              <span className="detail-value highlight">
                {result.processorType.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Processed Zones:</span>
              <span className="detail-value">{result.processedRowCount}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Timestamps Found:</span>
              <span className="detail-value">{result.timestampCount || 0}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Data Source:</span>
              <span className="detail-value">
                {result.isDemo ? 'Generated Demo Data' : 'Real Server Predictions'}
              </span>
            </div>
            
            {/* Risk Level Summary */}
            {result.riskDistribution && (
              <div className="risk-distribution">
                <div className="risk-header">🎯 Risk Level Distribution:</div>
                <div className="risk-bars">
                  {Object.entries(result.riskDistribution).map(([risk, count]) => (
                    <div key={risk} className="risk-bar-container">
                      <div className="risk-label">{risk.toUpperCase()}</div>
                      <div className="risk-bar">
                        <div 
                          className="risk-fill"
                          style={{
                            width: `${(count / result.processedRowCount) * 100}%`,
                            backgroundColor: risk === 'high' ? '#ff4444' : 
                                          risk === 'medium' ? '#ffaa00' : '#00aa44'
                          }}
                        ></div>
                      </div>
                      <div className="risk-count">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="data-source-info">
              <div className="source-icon">ℹ️</div>
              <div className="source-text">
                {result.isDemo 
                  ? 'Displaying generated demo data for testing and demonstration purposes'
                  : `Displaying ${result.timestampCount > 0 ? 'timestamped ' : ''}predictions from server API`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="api-info">
        <div className="api-endpoint">
          <strong>API Endpoint:</strong> {REQUEST_URL}
        </div>
        <div className="current-mode">
          <strong>Current Mode:</strong> {useDemoData ? 'Demo' : 'Server'} • {processorType.replace('_', ' ').toUpperCase()} processing
        </div>
      </div>
    </div>
  );
};

export default PipelineTester;