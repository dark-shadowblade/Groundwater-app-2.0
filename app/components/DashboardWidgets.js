'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapWidget = dynamic(() => import('./MapWidget'), { ssr: false });
const KeyDataWidget = dynamic(() => import('./KeyDataWidget'), { ssr: false });
const AlertsWidget = dynamic(() => import('./AlertsWidget'), { ssr: false });

export default function DashboardWidgets({ searchQuery }) {
  const [stations, setStations] = useState([]);
  const [waterLevels, setWaterLevels] = useState([]);

  useEffect(() => {
    // Load data
    fetch('/data/stations.json')
      .then(res => res.json())
      .then(setStations);
    fetch('/data/waterlevels.json')
      .then(res => res.json())
      .then(setWaterLevels);
  }, []);

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '5rem' // Space for bottom navigation
    }}>
      {/* Map Widget */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        gridColumn: 'span 2'
      }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Station Map</h3>
        <div style={{ height: '400px' }}>
          <MapWidget stations={filteredStations} />
        </div>
      </div>

      {/* Key Data Widget */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <KeyDataWidget 
          stations={stations} 
          waterLevels={waterLevels} 
        />
      </div>

      {/* Alerts Widget */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <AlertsWidget 
          stations={stations} 
          waterLevels={waterLevels} 
        />
      </div>
    </div>
  );
    }
