'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/dashboard' },
    { icon: '⚠️', label: 'Alerts', path: '/alerts' },
    { icon: '📊', label: 'Analytics', path: '/analytics' },
    { icon: '📋', label: 'Reports', path: '/reports' },
    { icon: '👤', label: 'Profile', path: '/profile' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #ddd',
      padding: '0.5rem',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: pathname === item.path ? '#0077cc' : '#666',
              padding: '0.5rem',
              minWidth: '60px'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
