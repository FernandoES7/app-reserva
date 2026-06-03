import React, { useState, useEffect } from 'react';
import { reservasAPI } from '../../services/api';

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

  if (loading) return (
    <div className="flex justify-center" style={{ padding:'80px 0 80px 280px' }}>
      <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'28px', padding: '32px 32px 32px 280px', width: '100%', boxSizing: 'border-box' }}>
      <div>
        <h1 className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize:'28px', marginBottom:'4px' }}>Reservas</h1>
        <p className="text-gray-400 text-sm">{reservas.length} reservas en total</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding:'20px', width: '100%' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-icons absolute text-gray-300" style={{ fontSize:'20px', left:'14px', top:'50%', transform:'translateY(-50%)' }}>search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente, habitación o código..."
              className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700"
              style={{ padding:'13px 14px 13px 42px' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700"
            style={{ padding:'13px 14px' }}>
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS).map(([v,c]) => <option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ width: '100%' }}>
        <div style={{ overflowX:'auto', width: '100%' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #f3f4f6' }}>
                {['Código','Cliente','Habitación','Fechas','Total','Estado','Acciones'].map(h => (
                  <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs" style={{ padding:'14px 20px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const st = STATUS[r.estado||r.status] || STATUS.pendiente;
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom:'1px solid #f9fafb' }}>
                    <td style={{ padding:'16px 20px' }}>
                      <span className="font-mono text-xs font-bold text-gray-500">{r.codigo||r.id}</span>
                    </td>
                    <td style={{ padding:'16px 20px' }}>
                      <p className="font-bold text-gray-800">{r.nombre_cliente||r.customerName}</p>
                      <p className="text-xs text-gray-400">{r.email_cliente||r.customerEmail}</p>
                    </td>
                    <td style={{ padding:'16px 20px' }} className="text-gray-500">{r.habitacion_nombre||r.roomName}</td>
                    <td style={{ padding:'16px 20px' }} className="text-gray-400 text-xs">
                      {r.check_in||r.checkIn}<br />{r.check_out||r.checkOut}
                    </td>
                    <td style={{ padding:'16px 20px' }}>
                      <span className="font-black text-[#1e3a5f]">S/ {r.total||r.totalPrice}</span>
                    </td>
                    <td style={{ padding:'16px 20px' }}>
                      <span className="flex items-center gap-1 text-xs font-bold rounded-full w-fit" style={{ padding:'5px 12px', background:st.bg, color:st.color }}>
                        <span className="material-icons" style={{ fontSize:'13px' }}>{st.icon}</span>{st.label}
                      </span>
                    </td>
                    <td style={{ padding:'16px 20px' }}>
                      <div className="flex gap-2">
                        <button onClick={() => setDetalle(r)}
                          className="flex items-center gap-1 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors"
                          style={{ padding:'7px 12px' }}>
                          <span className="material-icons" style={{ fontSize:'14px' }}>visibility</span> Ver
                        </button>
                        {(r.estado||r.status) === 'confirmada' && (
                          <button onClick={() => handleStatus(r.id,'cancelada')}
                            className="flex items-center gap-1 border border-red-100 text-red-400 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                            style={{ padding:'7px 12px' }}>
                            <span className="material-icons" style={{ fontSize:'14px' }}>cancel</span> Cancelar
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
            <div className="text-center" style={{ padding:'60px 24px' }}>
              <span className="material-icons text-gray-200" style={{ fontSize:'48px' }}>search_off</span>
              <p className="text-gray-300 text-sm" style={{ marginTop:'12px' }}>No se encontraron reservas</p>
            </div>
          )}
        </div>
      </div>

      {detalle && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl" style={{ maxWidth:'440px', width:'100%', padding:'40px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom:'24px' }}>
              <h3 className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize:'18px' }}>Detalle de Reserva</h3>
              <button onClick={() => setDetalle(null)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <span className="material-icons text-gray-400" style={{ fontSize:'18px' }}>close</span>
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[
                ['confirmation_number','Código',     detalle.codigo||detalle.id],
                ['person',            'Cliente',    detalle.nombre_cliente||detalle.customerName],
                ['email',             'Email',      detalle.email_cliente||detalle.customerEmail],
                ['hotel',             'Habitación', detalle.habitacion_nombre||detalle.roomName],
                ['login',             'Check-in',   detalle.check_in||detalle.checkIn],
                ['logout',            'Check-out',  detalle.check_out||detalle.checkOut],
                ['groups',            'Huéspedes',  detalle.huespedes||detalle.guests],
                ['payments',          'Total',     `S/ ${detalle.total||detalle.totalPrice}`],
              ].map(([icon, label, value]) => (
                <div key={icon} className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <span className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="material-icons text-[#1e3a5f]" style={{ fontSize:'16px' }}>{icon}</span>{label}
                  </span>
                  <span className="font-bold text-sm text-gray-700">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setDetalle(null)}
              className="w-full bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#16304f] transition-colors"
              style={{ padding:'14px', marginTop:'24px' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}