import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './TimestampAnalysis.css';

const TimestampAnalysis = ({ timestampData, processorType, title = "Temporal Analysis" }) => {
  const [timeViewMode, setTimeViewMode] = useState('daily');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [comparisonMetrics, setComparisonMetrics] = useState(null);
  const [activeChart, setActiveChart] = useState('eventsOverTime');

  // Color schemes
  const CHART_COLORS = {
    high: '#ff4444',
    medium: '#ffaa00',
    low: '#00aa44',
    fire: '#ff4444',
    flood: '#4488ff',
    weather: '#44aaff',
    smoke: '#888888'
  };

  // Format timestamp
  const formatTimestamp = (timestamp, format = 'full') => {
    if (!timestamp) return 'No timestamp';
    
    try {
      const date = new Date(timestamp);
      
      switch (format) {
        case 'date':
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
        case 'time':
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        case 'week':
          const weekNumber = Math.ceil(date.getDate() / 7);
          return `Week ${weekNumber}, ${date.toLocaleDateString('en-US', { month: 'short' })}`;
        case 'month':
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
          });
        case 'day':
          return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          });
        case 'hour':
          return `${date.getHours().toString().padStart(2, '0')}:00`;
        case 'full':
        default:
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
      }
    } catch (error) {
      return 'Invalid timestamp';
    }
  };

  // Filter data by date range
  const filterDataByDateRange = () => {
    if (!timestampData || timestampData.length === 0) return [];

    let filtered = timestampData;

    if (startDate) {
      filtered = filtered.filter(item => 
        new Date(item.timestamp) >= new Date(startDate.setHours(0, 0, 0, 0))
      );
    }

    if (endDate) {
      filtered = filtered.filter(item => 
        new Date(item.timestamp) <= new Date(endDate.setHours(23, 59, 59, 999))
      );
    }

    return filtered;
  };

  // Aggregate data based on view mode
  const aggregateData = (data, mode) => {
    if (!data || data.length === 0) return [];

    const aggregated = {};
    
    data.forEach(item => {
      let key;
      const date = new Date(item.timestamp);
      
      switch (mode) {
        case 'hourly':
          const dayKey = date.toISOString().split('T')[0];
          key = `${dayKey} ${date.getHours().toString().padStart(2, '0')}:00`;
          break;
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const year = date.getFullYear();
          const weekNumber = Math.ceil(date.getDate() / 7);
          key = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!aggregated[key]) {
        aggregated[key] = {
          timePeriod: key,
          total: 0,
          high: 0,
          medium: 0,
          low: 0,
          avgSeverity: 0,
          events: [],
          startTime: date,
          endTime: date
        };
      }
      
      aggregated[key].total++;
      aggregated[key][item.riskLevel.toLowerCase()]++;
      aggregated[key].events.push(item);
      aggregated[key].avgSeverity = ((aggregated[key].avgSeverity * (aggregated[key].total - 1)) + item.severityScore) / aggregated[key].total;
      
      if (date < aggregated[key].startTime) aggregated[key].startTime = date;
      if (date > aggregated[key].endTime) aggregated[key].endTime = date;
    });
    
    return Object.values(aggregated).sort((a, b) => a.startTime - b.startTime);
  };

  // Calculate comparison metrics
  const calculateMetrics = (data) => {
    if (!data || data.length === 0) return null;
    
    const totalEvents = data.reduce((sum, period) => sum + period.total, 0);
    const totalHigh = data.reduce((sum, period) => sum + period.high, 0);
    const totalMedium = data.reduce((sum, period) => sum + period.medium, 0);
    const totalLow = data.reduce((sum, period) => sum + period.low, 0);
    
    // Find peak period
    const peakPeriod = data.reduce((max, period) => 
      period.total > max.total ? period : max, data[0]);
    
    // Calculate trends
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, period) => sum + period.total, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, period) => sum + period.total, 0) / secondHalf.length;
    const trendDirection = secondHalfAvg > firstHalfAvg ? 'increasing' : 'decreasing';
    const trendPercentage = Math.abs(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
    
    // Calculate day of week distribution
    const dayDistribution = {};
    data.forEach(period => {
      period.events.forEach(event => {
        const day = new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
        dayDistribution[day] = (dayDistribution[day] || 0) + 1;
      });
    });

    return {
      totalEvents,
      distribution: {
        high: ((totalHigh / totalEvents) * 100).toFixed(1),
        medium: ((totalMedium / totalEvents) * 100).toFixed(1),
        low: ((totalLow / totalEvents) * 100).toFixed(1)
      },
      peakPeriod: {
        time: peakPeriod.timePeriod,
        events: peakPeriod.total,
        severity: peakPeriod.avgSeverity.toFixed(2),
        date: formatTimestamp(peakPeriod.startTime, 'full')
      },
      trends: {
        direction: trendDirection,
        percentage: trendPercentage.toFixed(1),
        firstHalfAvg: firstHalfAvg.toFixed(1),
        secondHalfAvg: secondHalfAvg.toFixed(1)
      },
      timeRange: {
        start: formatTimestamp(data[0].startTime, 'full'),
        end: formatTimestamp(data[data.length - 1].endTime, 'full'),
        duration: data.length
      },
      dayDistribution
    };
  };

  // Format aggregated data for display
  const formatAggregatedData = (data) => {
    return data.map(period => ({
      ...period,
      formattedTime: formatTimestamp(period.startTime, timeViewMode === 'hourly' ? 'hour' : timeViewMode),
      displayPeriod: period.timePeriod
    }));
  };

  // Initialize on component mount and data changes
  useEffect(() => {
    if (timestampData && timestampData.length > 0) {
      const filtered = filterDataByDateRange();
      setFilteredData(filtered);
      
      const aggregated = aggregateData(filtered, timeViewMode);
      setAggregatedData(aggregated);
      
      const metrics = calculateMetrics(aggregated);
      setComparisonMetrics(metrics);
    }
  }, [timestampData, timeViewMode, startDate, endDate]);

  // Render chart based on selection
  const renderChart = () => {
    if (!aggregatedData || aggregatedData.length === 0) return null;

    const formattedData = formatAggregatedData(aggregatedData);

    switch (activeChart) {
      case 'eventsOverTime':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayPeriod" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} events`, 'Count']}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke={CHART_COLORS[processorType.split('_')[0]] || '#007bff'} 
                fill={CHART_COLORS[processorType.split('_')[0]] || '#007bff'}
                fillOpacity={0.6}
                name="Total Events"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'riskDistribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayPeriod" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="high" fill={CHART_COLORS.high} name="High Risk" />
              <Bar dataKey="medium" fill={CHART_COLORS.medium} name="Medium Risk" />
              <Bar dataKey="low" fill={CHART_COLORS.low} name="Low Risk" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'severityTrends':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayPeriod" />
              <YAxis domain={[0, 3]} />
              <Tooltip 
                formatter={(value) => [`${parseFloat(value).toFixed(2)}`, 'Avg Severity']}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="avgSeverity" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Average Severity"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'riskPie':
        const pieData = [
          { name: 'High Risk', value: comparisonMetrics?.distribution.high || 0, color: CHART_COLORS.high },
          { name: 'Medium Risk', value: comparisonMetrics?.distribution.medium || 0, color: CHART_COLORS.medium },
          { name: 'Low Risk', value: comparisonMetrics?.distribution.low || 0, color: CHART_COLORS.low }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!timestampData || timestampData.length === 0) {
    return (
      <div className="timestamp-analysis empty-state">
        <div className="empty-icon">⏰</div>
        <h3>No Timestamp Data Available</h3>
        <p>Upload data with timestamps to enable temporal analysis</p>
      </div>
    );
  }

  return (
    <div className="timestamp-analysis">
      {/* Header */}
      <div className="analysis-header">
        <div className="header-left">
          <h2>{title}</h2>
          <div className="data-summary">
            <span className="summary-item">
              <strong>Total Events:</strong> {timestampData.length}
            </span>
            <span className="summary-item">
              <strong>Time Range:</strong> {formatTimestamp(timestampData[0].timestamp)} to {formatTimestamp(timestampData[timestampData.length - 1].timestamp)}
            </span>
            <span className="summary-item">
              <strong>Type:</strong> {processorType.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="header-controls">
          <div className="view-controls">
            <select 
              value={timeViewMode} 
              onChange={(e) => setTimeViewMode(e.target.value)}
              className="time-select"
            >
              <option value="hourly">Hourly View</option>
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>
            
            <div className="date-range-controls">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="date-picker"
                isClearable
              />
              <span className="date-separator">to</span>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className="date-picker"
                isClearable
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {comparisonMetrics && (
        <div className="metrics-dashboard">
          <div className="metrics-grid">
            <div className="metric-card total-events">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{comparisonMetrics.totalEvents}</div>
                <div className="metric-label">Total Events</div>
              </div>
            </div>
            
            <div className="metric-card peak-activity">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <div className="metric-value">{comparisonMetrics.peakPeriod.events}</div>
                <div className="metric-label">Peak Activity</div>
                <div className="metric-sub">{comparisonMetrics.peakPeriod.time}</div>
              </div>
            </div>
            
            <div className="metric-card trend-direction">
              <div className="metric-icon">
                {comparisonMetrics.trends.direction === 'increasing' ? '📈' : '📉'}
              </div>
              <div className="metric-content">
                <div className="metric-value" style={{ 
                  color: comparisonMetrics.trends.direction === 'increasing' ? CHART_COLORS.high : CHART_COLORS.low 
                }}>
                  {comparisonMetrics.trends.percentage}%
                </div>
                <div className="metric-label">Trend</div>
                <div className="metric-sub">{comparisonMetrics.trends.direction}</div>
              </div>
            </div>
            
            <div className="metric-card risk-distribution">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <div className="metric-value">
                  <span style={{ color: CHART_COLORS.high }}>{comparisonMetrics.distribution.high}%</span>
                </div>
                <div className="metric-label">High Risk</div>
                <div className="metric-sub">
                  <span style={{ color: CHART_COLORS.medium }}>{comparisonMetrics.distribution.medium}%</span> Med
                  <span style={{ color: CHART_COLORS.low }}> {comparisonMetrics.distribution.low}%</span> Low
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Selection */}
      <div className="chart-selection">
        <div className="chart-tabs">
          {['eventsOverTime', 'riskDistribution', 'severityTrends', 'riskPie'].map(chart => (
            <button
              key={chart}
              className={`chart-tab ${activeChart === chart ? 'active' : ''}`}
              onClick={() => setActiveChart(chart)}
            >
              {chart === 'eventsOverTime' && '📊 Events Over Time'}
              {chart === 'riskDistribution' && '📈 Risk Distribution'}
              {chart === 'severityTrends' && '📉 Severity Trends'}
              {chart === 'riskPie' && '🥧 Risk Pie Chart'}
            </button>
          ))}
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h3>
              {activeChart === 'eventsOverTime' && 'Events Over Time'}
              {activeChart === 'riskDistribution' && 'Risk Level Distribution'}
              {activeChart === 'severityTrends' && 'Severity Trends'}
              {activeChart === 'riskPie' && 'Risk Distribution Overview'}
            </h3>
            <div className="time-range-info">
              {timeViewMode.toUpperCase()} View • {aggregatedData.length} periods
            </div>
          </div>
          <div className="chart-wrapper">
            {renderChart()}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-section">
        <h3>📋 Detailed Time Period Analysis</h3>
        <div className="table-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Time Period</th>
                <th>Total Events</th>
                <th>High Risk</th>
                <th>Medium Risk</th>
                <th>Low Risk</th>
                <th>Avg Severity</th>
                <th>Time Range</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedData.slice(0, 10).map((period, index) => (
                <tr key={index}>
                  <td>
                    <div className="period-cell">
                      <div className="period-label">{period.timePeriod}</div>
                      <div className="period-date">
                        {formatTimestamp(period.startTime, 'date')}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="total-events-cell">
                      <span className="event-count">{period.total}</span>
                    </div>
                  </td>
                  <td>
                    <span className="risk-count high-risk">{period.high}</span>
                  </td>
                  <td>
                    <span className="risk-count medium-risk">{period.medium}</span>
                  </td>
                  <td>
                    <span className="risk-count low-risk">{period.low}</span>
                  </td>
                  <td>
                    <div className="severity-cell">
                      <div className="severity-bar">
                        <div 
                          className="severity-fill"
                          style={{ width: `${(period.avgSeverity / 3) * 100}%` }}
                        ></div>
                      </div>
                      <span className="severity-value">{period.avgSeverity.toFixed(2)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="time-range-cell">
                      <div>{formatTimestamp(period.startTime, 'time')}</div>
                      <div className="time-to">to</div>
                      <div>{formatTimestamp(period.endTime, 'time')}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {aggregatedData.length > 10 && (
          <div className="table-footer">
            Showing 10 of {aggregatedData.length} periods. Use filters to narrow results.
          </div>
        )}
      </div>

      {/* Insights Panel */}
      <div className="insights-panel">
        <h3>🔍 Key Insights & Analysis</h3>
        {comparisonMetrics && (
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Risk Profile</h4>
                <p>
                  This dataset shows a predominance of 
                  <span style={{ color: CHART_COLORS.high, fontWeight: 'bold' }}>
                    {' '}{comparisonMetrics.distribution.high}% high-risk{' '}
                  </span>
                  events, indicating elevated threat levels during the analyzed period.
                </p>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Temporal Pattern</h4>
                <p>
                  Event frequency is 
                  <span style={{ 
                    color: comparisonMetrics.trends.direction === 'increasing' ? CHART_COLORS.high : CHART_COLORS.low,
                    fontWeight: 'bold'
                  }}>
                    {' '}{comparisonMetrics.trends.direction} by {comparisonMetrics.trends.percentage}%
                  </span>
                  {' '}over time, suggesting {comparisonMetrics.trends.direction} risk conditions.
                </p>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">⏱️</div>
              <div className="insight-content">
                <h4>Peak Analysis</h4>
                <p>
                  Highest activity occurred during 
                  <span style={{ fontWeight: 'bold' }}> {comparisonMetrics.peakPeriod.time}</span>
                  {' '}with {comparisonMetrics.peakPeriod.events} events 
                  (severity: {comparisonMetrics.peakPeriod.severity}/3.0).
                </p>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <h4>Recommendations</h4>
                <ul>
                  <li>Focus resources during peak periods</li>
                  <li>Monitor {comparisonMetrics.trends.direction} trend closely</li>
                  <li>Review high-risk events for pattern analysis</li>
                  <li>Consider seasonal factors in risk assessment</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export/Share Options */}
      <div className="export-section">
        <h3>📤 Export Options</h3>
        <div className="export-buttons">
          <button className="export-btn">
            📄 Download CSV Report
          </button>
          <button className="export-btn">
            📊 Export Charts
          </button>
          <button className="export-btn">
            📧 Share Analysis
          </button>
          <button className="export-btn">
            🔄 Refresh Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to extract timestamp data (to be used in parent component)
export const extractTimestampData = (serverPredictions, processorType) => {
  if (!serverPredictions || !Array.isArray(serverPredictions)) return [];
  
  return serverPredictions
    .map(prediction => {
      const timestamp = 
        prediction.timestamp || 
        prediction.date || 
        prediction.time || 
        prediction.created_at ||
        prediction.observation_date;
      
      if (!timestamp) return null;
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return null;
      
      const riskLevel = prediction.risk_level || 
                       prediction.danger_zone_level || 
                       prediction.level ||
                       'medium';
      
      const severityScore = {
        high: 3,
        medium: 2,
        low: 1
      }[riskLevel.toLowerCase()] || 1;
      
      return {
        timestamp: date.toISOString(),
        riskLevel: riskLevel,
        severityScore: severityScore,
        processorType: processorType,
        rawData: prediction
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

export default TimestampAnalysis;