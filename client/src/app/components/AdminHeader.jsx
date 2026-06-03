import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin',             icon: 'dashboard',       label: 'Dashboard' },
  { to: '/admin/habitaciones', icon: 'hotel',           label: 'Habitaciones' },
  { to: '/admin/reservas',    icon: 'event_available', label: 'Reservas' },
  { to: '/admin/usuarios',    icon: 'group',           label: 'Usuarios' },
];

export function AdminHeader() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const handleLogout = async () => { await logout(); window.location.href = '/'; };

  return (
    <aside className="fixed h-full bg-[#191281] text-white flex flex-col z-40" style={{ width: '256px' }}>
      <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f59e0b] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-[#191281] font-bold">JL</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-wide">Panel Admin</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Hostal José Luis</p>
          </div>
        </div>
      </div>

      <nav className="flex-1" style={{ padding: '24px 12px' }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)', padding: '0 12px', marginBottom: '12px' }}>Menú</p>
        {NAV.map(({ to, icon, label }) => (
          <Link key={to} to={to}
            className="flex items-center gap-3 rounded-xl transition-all duration-200 font-semibold text-sm"
            style={{
              padding: '12px 16px',
              marginBottom: '4px',
              background: pathname === to ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: pathname === to ? '#ffffff' : 'rgba(255,255,255,0.55)',
            }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '20px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>

        <div className="flex items-center gap-3 rounded-xl" style={{ padding: '12px', marginBottom: '12px', background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-9 h-9 rounded-full bg-[#f59e0b] flex items-center justify-center font-bold text-[#191281] text-sm flex-shrink-0 shadow-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate" style={{ lineHeight: '1.2' }}>{user?.name || 'Administrador'}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>Admin activo</p>
          </div>
        </div>
        
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs rounded-xl font-bold transition-all bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent active:scale-[0.98]"
          style={{ padding: '12px' }}>
          <span className="material-icons" style={{ fontSize: '16px' }}>logout</span> 
          Cerrar sesión
        </button>

      </div>
    </aside>
  );
}