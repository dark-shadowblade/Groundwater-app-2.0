'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FilterDropdown from '../components/FilterDropdown';

export default function StationsList() {
  const [stations, setStations] = useState([]);
  const [waterLevels, setWaterLevels] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    district: searchParams.get('district') || '',
    status: searchParams.get('status') || '',
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
    router.replace(`/stations?${params.toString()}`, { scroll: false });
  }, [filters, router]);

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

  // ... rest of the component remains the same ...
}
