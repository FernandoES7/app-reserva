import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { statsAPI, reservasAPI } from '../../services/api';

const STATUS = {
  confirmada: { bg:'#dcfce7', color:'#16a34a' },
  completada: { bg:'#f3f4f6', color:'#6b7280' },
  cancelada:  { bg:'#fee2e2', color:'#dc2626' },
  pendiente:  { bg:'#fef9c3', color:'#ca8a04' },
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,     setStats]     = useState({});
  const [recientes, setRecientes] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      statsAPI.getDashboard().catch(() => ({})),
      reservasAPI.getAll().catch(() => ({ reservations: [] })),
    ]).then(([s, r]) => {
      setStats(s.stats || s);
      setRecientes((r.reservations || []).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  const tarjetas = [
    { label:'Total Reservas',     value: stats.totalReservas    ?? '—', icon:'event_available', bg:'#eff6ff', color:'#1e3a5f', change:'+12%' },
    { label:'Habitaciones Activas',value: stats.habitacionesActivas ?? '—', icon:'hotel',       bg:'#f0fdf4', color:'#16a34a', change:'100%' },
    { label:'Huéspedes este mes',  value: stats.huespedesMes    ?? '—', icon:'groups',          bg:'#faf5ff', color:'#7c3aed', change:'+8%' },
    { label:'Ingresos del mes',    value: stats.ingresosMes ? `S/ ${Number(stats.ingresosMes).toLocaleString()}` : '—', icon:'payments', bg:'#fffbeb', color:'#d97706', change:'+15%' },
  ];

  const mensual = stats.mensual || [
    { mes:'Ene', pct:65 },{ mes:'Feb', pct:70 },{ mes:'Mar', pct:80 },
    { mes:'Abr', pct:75 },{ mes:'May', pct:85 },{ mes:'Jun', pct:90 },
  ];

  if (loading) return (
    <div className="flex items-center justify-center" style={{ height: '320px', paddingLeft: '280px' }}>
      <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '32px 32px 32px 280px', width: '100%', boxSizing: 'border-box' }}>

      <div>
        <h1 className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize: '28px', marginBottom: '6px' }}>Dashboard</h1>
        <p className="text-gray-400 text-sm">Resumen general del hostal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" style={{ width: '100%' }}>
        {tarjetas.map((t, i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '24px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.bg }}>
                  <span className="material-icons" style={{ fontSize: '22px', color: t.color }}>{t.icon}</span>
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
                  <span className="material-icons" style={{ fontSize: '14px' }}>trending_up</span>{t.change}
                </span>
              </div>
              <p className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize: '26px', marginBottom: '4px' }}>{t.value}</p>
              <p className="text-gray-400 text-xs">{t.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ width: '100%' }}>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '32px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '28px' }}>
            <span className="material-icons text-[#1e3a5f]" style={{ fontSize: '20px' }}>bar_chart</span>
            <h2 className="font-black text-[#1e3a5f] tracking-wide">Ocupación mensual</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mensual.map(s => (
              <div key={s.mes}>
                <div className="flex justify-between text-sm" style={{ marginBottom: '6px' }}>
                  <span className="font-bold text-gray-600">{s.mes}</span>
                  <span className="font-black text-[#1e3a5f]">{s.pct}%</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: '8px', background: '#f3f4f6' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: '#1e3a5f' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '32px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
            <div className="flex items-center gap-2">
              <span className="material-icons text-[#1e3a5f]" style={{ fontSize: '20px' }}>receipt_long</span>
              <h2 className="font-black text-[#1e3a5f] tracking-wide">Reservas recientes</h2>
            </div>
            <button onClick={() => navigate('/admin/reservas')}
              className="text-xs font-bold text-[#1e3a5f] hover:underline">Ver todas</button>
          </div>
          {recientes.length === 0 ? (
            <div className="text-center" style={{ padding: '40px 0' }}>
              <span className="material-icons text-gray-200" style={{ fontSize: '48px' }}>event_busy</span>
              <p className="text-gray-300 text-sm" style={{ marginTop: '12px' }}>No hay reservas aún</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recientes.map((r, i) => {
                const st = STATUS[r.estado || r.status] || STATUS.pendiente;
                return (
                  <div key={r.id || i} className="flex items-center justify-between border-b border-gray-50 last:border-0"
                    style={{ paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                      <p className="font-bold text-[#1e3a5f] text-sm">{r.nombre_cliente || r.customerName}</p>
                      <p className="text-xs text-gray-400" style={{ marginTop: '2px' }}>{r.habitacion_nombre || r.roomName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#1e3a5f] text-sm">S/ {r.total || r.totalPrice}</p>
                      <span className="text-xs font-bold rounded-full" style={{ padding: '2px 10px', background: st.bg, color: st.color }}>
                        {r.estado || r.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}