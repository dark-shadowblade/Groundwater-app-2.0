'use client';

export default function AlertsWidget({ stations, waterLevels }) {
  const criticalStations = stations.filter(station => {
    const stationLevels = waterLevels.filter(w => w.station_id === station.id);
    return stationLevels.some(level => level.water_level_m < 11);
  });

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#333' }}>Recent Alerts</h3>
      {criticalStations.length === 0 ? (
        <div style={{
          background: '#e8f5e9',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#388e3c'
        }}>
          No critical alerts at this time
        </div>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {criticalStations.slice(0, 5).map(station => {
            const latestReading = waterLevels
              .filter(w => w.station_id === station.id)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            
            return (
              <div
                key={station.id}
                style={{
                  background: '#ffebee',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  borderLeft: '4px solid #f44336'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>
                  ⚠️ {station.name}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Water level: {latestReading.water_level_m}m
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  Last updated: {new Date(latestReading.timestamp).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
