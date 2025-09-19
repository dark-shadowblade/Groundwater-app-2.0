'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FilterDropdown from '../components/FilterDropdown';

export default function AlertsList() {
  const [stations, setStations] = useState([]);
  const [waterLevels, setWaterLevels] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    district: searchParams.get('district') || '',
    severity: searchParams.get('severity') || '',
    search: searchParams.get('search') || ''
  });

  useEffect(() => {
    fetch('/data/stations.json')
      .then(res => res.json())
      .then(setStations);
    fetch('/data/waterlevels.json')
      .then(res => res.json())
      .then(setWaterLevels);
  }, []);

  useEffect(() => {
    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.replace(`/alerts?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  useEffect(() => {
    // Get all stations with alerts
    const alertStations = stations.filter(station => {
      const stationLevels = waterLevels.filter(w => w.station_id === station.id);
      const hasCritical = stationLevels.some(level => level.water_level_m < 11);
      const hasWarning = stationLevels.some(level => level.water_level_m >= 11 && level.water_level_m < 12);
      
      if (filters.severity === 'critical') {
        return hasCritical;
      } else if (filters.severity === 'warning') {
        return hasWarning;
      }
      return hasCritical || hasWarning;
    });

    // Apply additional filters
    let result = alertStations.filter(station => {
      if (filters.state && station.state !== filters.state) return false;
      if (filters.district && station.district !== filters.district) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return station.name.toLowerCase().includes(searchTerm) ||
               station.district.toLowerCase().includes(searchTerm) ||
               station.state.toLowerCase().includes(searchTerm);
      }
      return true;
    });

    setFilteredAlerts(result);
  }, [stations, waterLevels, filters]);

  // Get unique states and districts
  const states = [...new Set(stations.map(station => station.state))].sort();
  const districts = [...new Set(stations.map(station => station.district))].sort();

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      state: '',
      district: '',
      severity: '',
      search: ''
    });
  };

  const getLatestWaterLevel = (stationId) => {
    const stationReadings = waterLevels
      .filter(w => w.station_id === stationId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return stationReadings.length > 0 ? stationReadings[0] : null;
  };

  const getStatusText = (level) => {
    if (!level) return 'Unknown';
    if (level < 11) return 'Critical';
    if (level < 12) return 'Warning';
    return 'Normal';
  };

  const getStatusColor = (level) => {
    if (!level) return '#666';
    if (level < 11) return '#ff4757';
    if (level < 12) return '#ffa502';
    return '#2ed573';
  };

  return (
    <div className="stations-container">
      <Link href="/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <h1>Alerts & Critical Stations</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        {filteredAlerts.length} alerting stations found
      </p>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-row">
          <FilterDropdown
            label="State"
            value={filters.state}
            onChange={(value) => handleFilterChange('state', value)}
            options={states.map(state => ({ value: state, label: state }))}
            placeholder="All States"
          />

          <FilterDropdown
            label="District"
            value={filters.district}
            onChange={(value) => handleFilterChange('district', value)}
            options={districts.map(district => ({ value: district, label: district }))}
            placeholder="All Districts"
          />

          <FilterDropdown
            label="Severity"
            value={filters.severity}
            onChange={(value) => handleFilterChange('severity', value)}
            options={[
              { value: '', label: 'All Alerts' },
              { value: 'critical', label: 'Critical Only' },
              { value: 'warning', label: 'Warning Only' }
            ]}
            placeholder="All Severity"
          />
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Search Stations</label>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search alerting stations..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="stations-grid">
        {filteredAlerts.length === 0 ? (
          <div className="no-stations">
            <p>No alerting stations found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="clear-filters-btn primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredAlerts.map(station => {
            const latestReading = getLatestWaterLevel(station.id);
            const status = latestReading ? getStatusText(latestReading.water_level_m) : 'Unknown';
            const statusColor = latestReading ? getStatusColor(latestReading.water_level_m) : '#666';

            return (
              <Link
                key={station.id}
                href={`/station/${station.id}`}
                className="station-card"
              >
                <div className="station-header">
                  <div>
                    <h3 className="station-name">{station.name}</h3>
                    <p className="station-location">
                      {station.district}, {station.state}
                    </p>
                  </div>
                  <span
                    className="station-status"
                    style={{ backgroundColor: statusColor, color: 'white' }}
                  >
                    {status}
                  </span>
                </div>

                {latestReading && (
                  <div className="station-details">
                    <div className="detail-item">
                      <div className="detail-value" style={{ color: statusColor }}>
                        {latestReading.water_level_m}m
                      </div>
                      <div className="detail-label">Current Level</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-value">
                        {new Date(latestReading.timestamp).toLocaleDateString()}
                      </div>
                      <div className="detail-label">Last Reading</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-value">
                        {waterLevels.filter(w => w.station_id === station.id).length}
                      </div>
                      <div className="detail-label">Total Readings</div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
