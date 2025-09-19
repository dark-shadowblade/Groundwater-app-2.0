'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Link from 'next/link';
import FilterDropdown from '../../components/FilterDropdown';

export default function StationDetail() {
  const params = useParams();
  const router = useRouter();
  const [station, setStation] = useState(null);
  const [waterLevels, setWaterLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stations data
        const stationsRes = await fetch('/data/stations.json');
        const stationsData = await stationsRes.json();
        const currentStation = stationsData.find(s => s.id === params.id);
        
        if (!currentStation) {
          router.push('/dashboard');
          return;
        }
        
        setStation(currentStation);

        // Fetch water levels data
        const levelsRes = await fetch('/data/waterlevels.json');
        const levelsData = await levelsRes.json();
        const stationLevels = levelsData
          .filter(w => w.station_id === params.id)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setWaterLevels(stationLevels);
        setFilteredLevels(stationLevels);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  useEffect(() => {
    if (waterLevels.length === 0) return;

    const now = new Date();
    let filtered = waterLevels;

    switch (timeFilter) {
      case '7days':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        filtered = waterLevels.filter(level => new Date(level.timestamp) >= sevenDaysAgo);
        break;
      case '30days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        filtered = waterLevels.filter(level => new Date(level.timestamp) >= thirtyDaysAgo);
        break;
      case '3months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        filtered = waterLevels.filter(level => new Date(level.timestamp) >= threeMonthsAgo);
        break;
      case '6months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        filtered = waterLevels.filter(level => new Date(level.timestamp) >= sixMonthsAgo);
        break;
      case '1year':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        filtered = waterLevels.filter(level => new Date(level.timestamp) >= oneYearAgo);
        break;
      case 'season':
        // Simple seasonal filter (you can enhance this)
        const currentMonth = new Date().getMonth();
        filtered = waterLevels.filter(level => {
          const month = new Date(level.timestamp).getMonth();
          return month >= 2 && month <= 5; // Spring months example
        });
        break;
      default:
        filtered = waterLevels;
    }

    setFilteredLevels(filtered);
  }, [waterLevels, timeFilter]);

  const getStatusColor = (level) => {
    if (!level) return '#666';
    if (level < 11) return '#ff4757';
    if (level < 12) return '#ffa502';
    return '#2ed573';
  };

  const getStatusText = (level) => {
    if (!level) return 'Unknown';
    if (level < 11) return 'Critical';
    if (level < 12) return 'Warning';
    return 'Normal';
  };

  if (loading) {
    return <div className="station-detail-container">Loading station data...</div>;
  }

  if (!station) {
    return (
      <div className="station-detail-container">
        <div>Station not found</div>
        <Link href="/dashboard" className="back-link">← Back to Dashboard</Link>
      </div>
    );
  }

  const latestReading = waterLevels.length > 0 ? waterLevels[waterLevels.length - 1] : null;

  return (
    <div className="station-detail-container">
      {/* Header */}
      <div className="station-header">
        <Link href="/dashboard" className="back-link">← Back to Dashboard</Link>
        <h1>{station.name}</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {station.district}, {station.state} • Lat: {station.lat}, Lon: {station.lon}
        </p>
        
        {latestReading && (
          <div className="station-status">
            <div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Current Water Level</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getStatusColor(latestReading.water_level_m) }}>
                {latestReading.water_level_m}m
              </div>
            </div>
            <div className={`status-badge ${getStatusText(latestReading.water_level_m).toLowerCase()}`}>
              {getStatusText(latestReading.water_level_m)}
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Last Updated</div>
              <div style={{ fontSize: '0.9rem', color: '#333' }}>
                {new Date(latestReading.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Period Filters */}
      <div className="filters-container" style={{ marginBottom: '2rem' }}>
        <h3>Time Period Analysis</h3>
        <div className="filter-row">
          <FilterDropdown
            label="Select Time Period"
            value={timeFilter}
            onChange={setTimeFilter}
            options={[
              { value: 'all', label: 'All Time' },
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
              { value: '3months', label: 'Last 3 Months' },
              { value: '6months', label: 'Last 6 Months' },
              { value: '1year', label: 'Last Year' },
              { value: 'season', label: 'Seasonal View' }
            ]}
            placeholder="Select Time Period"
          />
        </div>
        
        {/* Time Period Info */}
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            <strong>Showing:</strong> {timeFilter === 'all' ? 'All time data' : 
              timeFilter === '7days' ? 'Last 7 days' :
              timeFilter === '30days' ? 'Last 30 days' :
              timeFilter === '3months' ? 'Last 3 months' :
              timeFilter === '6months' ? 'Last 6 months' :
              timeFilter === '1year' ? 'Last year' : 'Seasonal data'}
            {' '}({filteredLevels.length} readings)
          </p>
        </div>
      </div>

      {/* Water Level Chart */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Water Level Trends</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredLevels}>
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (timeFilter === '7days' || timeFilter === '30days') {
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: timeFilter === '7days' ? '2-digit' : undefined
                    });
                  }
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip 
                formatter={(value) => [`${value}m`, 'Water Level']}
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Area 
                type="monotone" 
                dataKey="water_level_m" 
                stroke="#0077cc" 
                fill="rgba(0, 119, 204, 0.1)"
                strokeWidth={2}
                dot={{ r: timeFilter === 'all' || timeFilter === '1year' ? 0 : 2 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Statistics</h2>
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="metric-card">
            <div className="metric-value">{filteredLevels.length}</div>
            <div className="metric-label">Readings</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {filteredLevels.length > 0 ? Math.min(...filteredLevels.map(l => l.water_level_m)).toFixed(2) : '0.00'}m
            </div>
            <div className="metric-label">Minimum</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {filteredLevels.length > 0 ? Math.max(...filteredLevels.map(l => l.water_level_m)).toFixed(2) : '0.00'}m
            </div>
            <div className="metric-label">Maximum</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {filteredLevels.length > 0 ? (filteredLevels.reduce((sum, l) => sum + l.water_level_m, 0) / filteredLevels.length).toFixed(2) : '0.00'}m
            </div>
            <div className="metric-label">Average</div>
          </div>
        </div>
      </div>

      {/* Recent Readings Table */}
      <div>
        <h2>Recent Readings</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Water Level (m)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLevels.slice(-10).reverse().map((reading, index) => (
              <tr key={index}>
                <td>{new Date(reading.timestamp).toLocaleString()}</td>
                <td style={{ fontWeight: 'bold' }}>{reading.water_level_m}m</td>
                <td>
                  <span className={`status-badge ${getStatusText(reading.water_level_m).toLowerCase()}`}>
                    {getStatusText(reading.water_level_m)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
