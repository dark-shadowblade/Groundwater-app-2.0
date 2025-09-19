'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardWidgets from '../components/DashboardWidgets';
import BottomNavigation from '../components/BottomNavigation';

export default function Dashboard() {
  const [userRole, setUserRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    
    if (!isLoggedIn) {
      router.push('/');
      return;
    }
    
    setUserRole(role);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  if (!userRole) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
              Welcome, {userRole}!
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              Groundwater Monitoring Dashboard
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search stations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  width: '250px'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                🔔
                {notifications > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ff4757',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: '#ff4757',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 1rem'
      }}>
        <DashboardWidgets searchQuery={searchQuery} />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
