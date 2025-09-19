'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StationsList() {
  const [stations, setStations] = useState([]);
  const [waterLevels, setWaterLevels] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    status: '',
    search: ''
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
    let result = stations;

    // Apply filters
    if (filters.state) {
      result = result.filter(station => station.state === filters.state);
    }
    if (filters.district) {
      result = result.filter(station => station.district === filters.district);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(station => 
        station.name.toLowerCase().includes(searchTerm) ||
        station.district.toLowerCase().includes(searchTerm) ||
        station.state.toLowerCase().includes(searchTerm)
      );
    }
    if (filters.status) {
      result = result.filter(station => {
        const latestLevel = getLatestWaterLevel(station.id);
        const status = getStatusText(latestLevel);
        return status === filters.status;
      });
    }

    setFilteredStations(result);
  }, [stations, filters]);

  const getLatestWaterLevel = (stationId) => {
    const stationReadings = waterLevels
      .filter(w => w.station_id === stationId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return stationReadings.length > 0 ? stationReadings[0].water_level_m : null;
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

  const getStatusClass = (level) => {
    if (!level) return 'status-unknown';
    if (level < 11) return 'status-critical';
    if (level < 12) return 'status-warning';
    return 'status-normal';
  };

  // Get unique states and districts for filters
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
      status: '',
      search: ''
    });
  };

  // Get districts based on selected state
  const filteredDistricts = filters.state
    ? [...new Set(stations
        .filter(station => station.state === filters.state)
        .map(station => station.district)
      )].sort()
    : districts;

  return (
    <div className="stations-container">
      <Link href="/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <h1>Stations List</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        {filteredStations.length} of {stations.length} stations found
      </p>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">State</label>
            <div className="custom-select">
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="filter-select"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">District</label>
            <div className="custom-select">
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="filter-select"
                disabled={!filters.state && filteredDistricts.length > 0}
              >
                <option value="">All Districts</option>
                {filteredDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              <span className="select-arrow">▼</span>
            </div>
            {!filters.state && (
              <div className="filter-hint">Select a state first</div>
            )}
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <div className="custom-select">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="Normal">Normal</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
                <option value="Unknown">Unknown</option>
              </select>
              <span className="select-arrow">▼</span>
            </div>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Search Stations</label>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search by name, district, or state..."
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

      {/* Stations Grid */}
      <div className="stations-grid">
        {filteredStations.length === 0 ? (
          <div className="no-stations">
            <p>No stations found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="clear-filters-btn primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredStations.map(station => {
            const latestLevel = getLatestWaterLevel(station.id);
            const status = getStatusText(latestLevel);
            const statusColor = getStatusColor(latestLevel);

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
                    className={`station-status ${getStatusClass(latestLevel)}`}
                    style={{ backgroundColor: statusColor, color: 'white' }}
                  >
                    {status}
                  </span>
                </div>

                <div className="station-details">
                  <div className="detail-item">
                    <div className="detail-value" style={{ color: statusColor }}>
                      {latestLevel ? `${latestLevel}m` : 'N/A'}
                    </div>
                    <div className="detail-label">Current Level</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-value">
                      {waterLevels.filter(w => w.station_id === station.id).length}
                    </div>
                    <div className="detail-label">Readings</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-value">
                      {station.lat.toFixed(4)}
                    </div>
                    <div className="detail-label">Latitude</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-value">
                      {station.lon.toFixed(4)}
                    </div>
                    <div className="detail-label">Longitude</div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
