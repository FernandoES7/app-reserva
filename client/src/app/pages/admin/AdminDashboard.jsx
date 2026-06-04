import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { statsAPI, reservasAPI } from '../../services/api';
import { AdminPage } from '../../components/admin/AdminPage';

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
    { label:'Total Reservas',      value: stats.totalReservas    ?? '—', icon:'event_available', bg:'#eff6ff', color:'#1e3a5f', change:'+12%' },
    { label:'Habitaciones Activas', value: stats.habitacionesActivas ?? '—', icon:'hotel', bg:'#f0fdf4', color:'#16a34a', change:'100%' },
    { label:'Huéspedes este mes',   value: stats.huespedesMes    ?? '—', icon:'groups', bg:'#faf5ff', color:'#7c3aed', change:'+8%' },
    { label:'Ingresos del mes',     value: stats.ingresosMes ? `S/ ${Number(stats.ingresosMes).toLocaleString()}` : '—', icon:'payments', bg:'#fffbeb', color:'#d97706', change:'+15%' },
  ];

  const mensual = stats.mensual || [
    { mes:'Ene', pct:65 },{ mes:'Feb', pct:70 },{ mes:'Mar', pct:80 },
    { mes:'Abr', pct:75 },{ mes:'May', pct:85 },{ mes:'Jun', pct:90 },
  ];

  return (
    <AdminPage loading={loading}>
      <div>
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Resumen general del hostal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {tarjetas.map((t, i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: t.bg }}>
                  <span className="material-icons text-[22px]" style={{ color: t.color }}>{t.icon}</span>
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center gap-0.5">
                  <span className="material-icons text-sm">trending_up</span>{t.change}
                </span>
              </div>
              <p className="text-xl sm:text-[26px] font-black text-[#1e3a5f] tracking-wide mb-1">{t.value}</p>
              <p className="text-gray-400 text-xs">{t.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
          <div className="flex items-center gap-2 mb-6 sm:mb-7">
            <span className="material-icons text-[#1e3a5f] text-xl">bar_chart</span>
            <h2 className="font-black text-[#1e3a5f] tracking-wide text-lg sm:text-xl">Ocupación mensual</h2>
          </div>
          <div className="flex flex-col gap-4">
            {mensual.map(s => (
              <div key={s.mes}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-bold text-gray-600">{s.mes}</span>
                  <span className="font-black text-[#1e3a5f]">{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full transition-all bg-[#1e3a5f]" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-7">
            <div className="flex items-center gap-2">
              <span className="material-icons text-[#1e3a5f] text-xl">receipt_long</span>
              <h2 className="font-black text-[#1e3a5f] tracking-wide text-lg sm:text-xl">Reservas recientes</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/reservas')}
              className="text-xs font-bold text-[#1e3a5f] hover:underline text-left sm:text-right"
            >
              Ver todas
            </button>
          </div>
          {recientes.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-icons text-gray-200 text-5xl">event_busy</span>
              <p className="text-gray-300 text-sm mt-3">No hay reservas aún</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recientes.map((r, i) => {
                const st = STATUS[r.estado || r.status] || STATUS.pendiente;
                return (
                  <div
                    key={r.id || i}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#1e3a5f] text-sm truncate">{r.nombre_cliente || r.customerName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{r.habitacion_nombre || r.roomName}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0">
                      <p className="font-black text-[#1e3a5f] text-sm">S/ {r.total || r.totalPrice}</p>
                      <span className="text-xs font-bold rounded-full px-2.5 py-0.5" style={{ background: st.bg, color: st.color }}>
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
    </AdminPage>
  );
}
