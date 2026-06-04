import React, { useState, useEffect } from 'react';
import { reservasAPI } from '../../services/api';
import { AdminPage } from '../../components/admin/AdminPage';

const STATUS = {
  confirmada: { label:'Confirmada', bg:'#dcfce7', color:'#16a34a', icon:'check_circle' },
  completada: { label:'Completada', bg:'#f3f4f6', color:'#6b7280', icon:'task_alt' },
  cancelada:  { label:'Cancelada',  bg:'#fee2e2', color:'#dc2626', icon:'cancel' },
  pendiente:  { label:'Pendiente',  bg:'#fef9c3', color:'#ca8a04', icon:'hourglass_top' },
};

export function AdminReservas() {
  const [reservas,     setReservas]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detalle,      setDetalle]      = useState(null);

  useEffect(() => {
    reservasAPI.getAll().then(d => setReservas(d.reservations || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await reservasAPI.updateStatus(id, status);
      setReservas(prev => prev.map(r => r.id === id ? {...r, estado: status} : r));
    } catch (err) { console.error(err); }
  };

  const filtered = reservas.filter(r => {
    const txt = search.toLowerCase();
    const match = (r.nombre_cliente||r.customerName||'').toLowerCase().includes(txt)
      || String(r.codigo||r.id).toLowerCase().includes(txt)
      || (r.habitacion_nombre||r.roomName||'').toLowerCase().includes(txt);
    return match && (statusFilter === 'all' || (r.estado||r.status) === statusFilter);
  });

  return (
    <AdminPage loading={loading}>
      <div>
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide mb-1">Reservas</h1>
        <p className="text-gray-400 text-sm">{reservas.length} reservas en total</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative min-w-0">
            <span className="material-icons absolute text-gray-300 text-xl left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente, habitación o código..."
              className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 pl-11 pr-3.5 py-3"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto sm:min-w-[180px] border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 px-3.5 py-3"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border-x">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Código','Cliente','Habitación','Fechas','Total','Estado','Acciones'].map(h => (
                  <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs px-3 sm:px-5 py-3.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const st = STATUS[r.estado||r.status] || STATUS.pendiente;
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                    <td className="px-3 sm:px-5 py-4">
                      <span className="font-mono text-xs font-bold text-gray-500">{r.codigo||r.id}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-4 min-w-[140px]">
                      <p className="font-bold text-gray-800">{r.nombre_cliente||r.customerName}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.email_cliente||r.customerEmail}</p>
                    </td>
                    <td className="px-3 sm:px-5 py-4 text-gray-500 max-w-[160px]">
                      <span className="line-clamp-2">{r.habitacion_nombre||r.roomName}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {r.check_in||r.checkIn}<br />{r.check_out||r.checkOut}
                    </td>
                    <td className="px-3 sm:px-5 py-4 whitespace-nowrap">
                      <span className="font-black text-[#1e3a5f]">S/ {r.total||r.totalPrice}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1.5 whitespace-nowrap"
                        style={{ background: st.bg, color: st.color }}
                      >
                        <span className="material-icons text-[13px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setDetalle(r)}
                          className="inline-flex items-center gap-1 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors px-2.5 py-1.5 sm:px-3 sm:py-2"
                        >
                          <span className="material-icons text-sm">visibility</span>
                          <span className="hidden sm:inline">Ver</span>
                        </button>
                        {(r.estado||r.status) === 'confirmada' && (
                          <button
                            type="button"
                            onClick={() => handleStatus(r.id,'cancelada')}
                            className="inline-flex items-center gap-1 border border-red-100 text-red-400 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors px-2.5 py-1.5 sm:px-3 sm:py-2"
                          >
                            <span className="material-icons text-sm">cancel</span>
                            <span className="hidden sm:inline">Cancelar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4">
              <span className="material-icons text-gray-200 text-5xl">search_off</span>
              <p className="text-gray-300 text-sm mt-3">No se encontraron reservas</p>
            </div>
          )}
        </div>
      </div>

      {detalle && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-[#1e3a5f] tracking-wide">Detalle de Reserva</h3>
              <button
                type="button"
                onClick={() => setDetalle(null)}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <span className="material-icons text-gray-400 text-lg">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                ['confirmation_number','Código',     detalle.codigo||detalle.id],
                ['person',            'Cliente',    detalle.nombre_cliente||detalle.customerName],
                ['email',             'Email',      detalle.email_cliente||detalle.customerEmail],
                ['hotel',             'Habitación', detalle.habitacion_nombre||detalle.roomName],
                ['login',             'Check-in',   detalle.check_in||detalle.checkIn],
                ['logout',            'Check-out',  detalle.check_out||detalle.checkOut],
                ['groups',            'Huéspedes',  detalle.huespedes||detalle.guests],
                ['payments',          'Total',      `S/ ${detalle.total||detalle.totalPrice}`],
              ].map(([icon, label, value]) => (
                <div key={icon} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-gray-50 pb-3">
                  <span className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="material-icons text-[#1e3a5f] text-base">{icon}</span>
                    {label}
                  </span>
                  <span className="font-bold text-sm text-gray-700 sm:text-right break-all">{value}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDetalle(null)}
              className="w-full bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#16304f] transition-colors py-3.5 mt-6"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
