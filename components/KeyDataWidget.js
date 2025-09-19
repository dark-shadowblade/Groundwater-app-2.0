'use client';

export default function KeyDataWidget({ stations, waterLevels }) {
  const totalStations = stations.length;
  const criticalStations = stations.filter(station => {
    const stationLevels = waterLevels.filter(w => w.station_id === station.id);
    return stationLevels.some(level => level.water_level_m < 11);
  }).length;

  const avgWaterLevel = waterLevels.length > 0 
    ? (waterLevels.reduce((sum, level) => sum + level.water_level_m, 0) / waterLevels.length).toFixed(2)
    : '0.00';

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#333' }}>Key Metrics</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{
          background: '#e3f2fd',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
            {totalStations}
          </div>
          <div style={{ color: '#666' }}>Total Stations</div>
        </div>

        <div style={{
          background: '#fff3e0',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f57c00' }}>
            {criticalStations}
          </div>
          <div style={{ color: '#666' }}>Critical Stations</div>
        </div>

        <div style={{
          background: '#e8f5e9',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c' }}>
            {avgWaterLevel}m
          </div>
          <div style={{ color: '#666' }}>Avg Water Level</div>
        </div>
      </div>
    </div>
  );
}
