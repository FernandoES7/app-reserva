import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';

export function AdminUsuarios() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    usersAPI.getAll().then(d => setUsers(d.users||[])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggleRol = async (id, currentRole) => {
    try {
      await usersAPI.update(id, { role: currentRole === 'admin' ? 'customer' : 'admin' });
      setUsers(prev => prev.map(u => u.id === id ? {...u, role: currentRole==='admin'?'customer':'admin'} : u));
    } catch (err) { console.error(err); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try { await usersAPI.delete(id); setUsers(prev => prev.filter(u => u.id !== id)); } catch (err) { console.error(err); }
  };

  const filtered = users.filter(u =>
    (u.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (u.email||'').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center" style={{ padding:'80px 0 80px 280px' }}>
      <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'28px', padding: '32px 32px 32px 280px', width: '100%', boxSizing: 'border-box' }}>
      <div>
        <h1 className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize:'28px', marginBottom:'4px' }}>Usuarios</h1>
        <p className="text-gray-400 text-sm">{users.length} usuarios registrados</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding:'20px', width: '100%' }}>
        <div className="relative">
          <span className="material-icons absolute text-gray-300" style={{ fontSize:'20px', left:'14px', top:'50%', transform:'translateY(-50%)' }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario por nombre o email..."
            className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700"
            style={{ padding:'13px 14px 13px 42px' }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ width: '100%' }}>
        <div style={{ overflowX:'auto', width: '100%' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #f3f4f6' }}>
                {['Usuario','Email','Rol','Reservas','Registro','Acciones'].map(h => (
                  <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs" style={{ padding:'14px 20px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom:'1px solid #f9fafb' }}>
                  <td style={{ padding:'16px 20px' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                        style={{ background: u.role==='admin' ? '#eff6ff' : '#f3f4f6', color: u.role==='admin' ? '#1e3a5f' : '#6b7280' }}>
                        {(u.name||'?')[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'16px 20px' }} className="text-gray-500 text-sm">{u.email}</td>
                  <td style={{ padding:'16px 20px' }}>
                    <span className="flex items-center gap-1.5 text-xs font-bold rounded-full w-fit"
                      style={{ padding:'5px 12px', background: u.role==='admin'?'#eff6ff':'#f3f4f6', color: u.role==='admin'?'#1e3a5f':'#6b7280' }}>
                      <span className="material-icons" style={{ fontSize:'13px' }}>{u.role==='admin'?'shield':'person'}</span>
                      {u.role==='admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td style={{ padding:'16px 20px' }} className="text-center text-gray-500 font-bold">{u.reservations ?? 0}</td>
                  <td style={{ padding:'16px 20px' }} className="text-gray-400 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td style={{ padding:'16px 20px' }}>
                    <div className="flex gap-2">
                      <button onClick={() => toggleRol(u.id, u.role)}
                        className="flex items-center gap-1 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors"
                        style={{ padding:'7px 12px' }}>
                        <span className="material-icons" style={{ fontSize:'14px' }}>swap_horiz</span> Rol
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => eliminar(u.id)}
                          className="flex items-center gap-1 border border-red-100 text-red-400 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                          style={{ padding:'7px 12px' }}>
                          <span className="material-icons" style={{ fontSize:'14px' }}>delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center" style={{ padding:'60px 24px' }}>
              <span className="material-icons text-gray-200" style={{ fontSize:'48px' }}>person_off</span>
              <p className="text-gray-300 text-sm" style={{ marginTop:'12px' }}>No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}