// services/fireRiskApi.js
import { csvData, sampleData } from '../data/fireRiskData';

// Safe number utility functions
export const safeToFixed = (value, decimals = 1, fallback = 'N/A') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return fallback;
  }
  return value.toFixed(decimals);
};

export const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

// API Configuration
const API_CONFIG = {
  baseURL: 'http://172.20.108.46:8006',
  endpoints: {
    predictBatch: '/predict_fire_batch'
  },
  timeout: 30000 // 30 seconds
};

// API Service Class
class FireRiskApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async predictFireRiskBatch(data) {
    try {
      console.log('📨 Sending data to API:', {
        url: `${this.baseURL}${API_CONFIG.endpoints.predictBatch}`,
        dataLength: data.length,
        sampleData: data.slice(0, 2)
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.predictBatch}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.results) {
        throw new Error('No results found in API response');
      }

      console.log('✅ API Response received successfully');
      return result;

    } catch (error) {
      console.error('❌ API Request failed:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('API request timeout - server took too long to respond');
      }
      
      throw error;
    }
  }

  // Transform API response to frontend format
  transformApiResponse(apiResult, originalData) {
    if (!apiResult.results) {
      throw new Error('Invalid API response format');
    }

    return apiResult.results.map((item, index) => {
      const csvItem = originalData.find(d => d.zone_name === item.zone_name) || {};
      
      // Normalize risk level
      let riskLevel = (item.danger_zone || item.predicted_category || 'medium').toLowerCase();
      
      if (riskLevel.includes('high') || riskLevel.includes('danger')) {
        riskLevel = 'high';
      } else if (riskLevel.includes('medium') || riskLevel.includes('caution')) {
        riskLevel = 'medium';
      } else if (riskLevel.includes('low') || riskLevel.includes('safe')) {
        riskLevel = 'low';
      }
      
      return {
        ...item,
        // Safe number conversions with fallbacks
        temperature: safeNumber(item.temperature, safeNumber(csvItem.temperature, 25)),
        humidity: safeNumber(item.humidity, safeNumber(csvItem.humidity, 50)),
        wind_speed: safeNumber(item.wind_speed, safeNumber(csvItem.wind_speed, 10)),
        fire_station_distance: safeNumber(item.fire_station_distance, safeNumber(csvItem.fire_station_distance, 5)),
        fire_risk_index: safeNumber(item.fire_risk_index, 0.1),
        
        // Safe coordinate handling
        latitude: safeNumber(item.latitude, safeNumber(csvItem.latitude, 9.03 + (Math.random() - 0.5) * 0.1)),
        longitude: safeNumber(item.longitude, safeNumber(csvItem.longitude, 38.74 + (Math.random() - 0.5) * 0.1)),
        
        // Safe text fields with fallbacks
        zone_name: item.zone_name || csvItem.zone_name || `Zone ${index + 1}`,
        danger_zone_level: riskLevel,
        recommendation: item.recommendation || 'Monitor conditions regularly'
      };
    });
  }

  // Get CSV data for API
  getCsvData() {
    return csvData;
  }

  // Get sample data for fallback
  getSampleData() {
    return sampleData;
  }

  // Check API health
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.log(error)
      return false;
    }
  }
}

// Create singleton instance
export const fireRiskApi = new FireRiskApiService();

// Helper functions for React components
export const fetchFireRiskData = async (setIsLoading, setApiStatus, setFireRiskData) => {
  setIsLoading(true);
  setApiStatus('Sending data to API...');
  
  try {
    const csvData = fireRiskApi.getCsvData();
    setApiStatus('Connecting to API...');

    const result = await fireRiskApi.predictFireRiskBatch(csvData);
    setApiStatus('Processing response...');

    const formattedData = fireRiskApi.transformApiResponse(result, csvData);
    
    setFireRiskData(formattedData);
    setApiStatus(`✅ Success! Loaded ${formattedData.length} risk zones`);
    
    return formattedData;

  } catch (error) {
    console.error('❌ API Error:', error);
    setApiStatus(`❌ Error: ${error.message}`);
    
    // Fallback to sample data
    const sampleData = fireRiskApi.getSampleData();
    setTimeout(() => {
      setFireRiskData(sampleData);
      setApiStatus('⚠️ Using sample data (API unavailable)');
    }, 2000);
    
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const loadSampleData = (setFireRiskData, setApiStatus) => {
  const sampleData = fireRiskApi.getSampleData();
  setFireRiskData(sampleData);
  setApiStatus('✅ Sample data loaded');
};

export const clearAllData = (setFireRiskData, setApiStatus) => {
  setFireRiskData([]);
  setApiStatus('🗑️ Data cleared');
};

export default fireRiskApi;