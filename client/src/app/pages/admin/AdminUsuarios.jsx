import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { AdminPage } from '../../components/admin/AdminPage';

export function AdminUsuarios() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    usersAPI.getAll().then(d => setUsers(d.users||[])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hacerAdmin = async (id) => {
    if (!window.confirm('¿Convertir a este cliente en administrador? Podrá acceder al panel de admin con su email.')) return;
    try {
      const res = await usersAPI.update(id, { role: 'admin' });
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, role: 'admin' } : u)));
      if (res.message) alert(res.message);
    } catch (err) {
      alert(err.message || 'No se pudo promover al usuario');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message || 'No se pudo eliminar el cliente');
    }
  };

  const filtered = users.filter(u =>
    (u.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (u.email||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPage loading={loading}>
      <div>
        <h1 className="text-2xl sm:text-[28px] font-black text-[#1e3a5f] tracking-wide mb-1">Usuarios</h1>
        <p className="text-gray-400 text-sm">{users.length} clientes registrados</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="relative">
          <span className="material-icons absolute text-gray-300 text-xl left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuario por nombre o email..."
            className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 pl-11 pr-3.5 py-3"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 sm:border-x">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Cliente','Email','Teléfono','Rol','Reservas','Registro','Acciones'].map(h => (
                  <th key={h} className="text-left font-black text-gray-400 uppercase tracking-widest text-xs px-3 sm:px-5 py-3.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                  <td className="px-3 sm:px-5 py-4 min-w-[140px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm bg-gray-100 text-gray-500 shrink-0">
                        {(u.name||'?')[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-4 text-gray-500 text-sm max-w-[180px]">
                    <span className="break-all">{u.email}</span>
                  </td>
                  <td className="px-3 sm:px-5 py-4 text-gray-500 text-sm whitespace-nowrap">{u.telefono || '—'}</td>
                  <td className="px-3 sm:px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 whitespace-nowrap ${
                        u.role === 'admin' ? 'bg-blue-50 text-[#1e3a5f]' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className="material-icons text-[13px]">{u.role === 'admin' ? 'shield' : 'person'}</span>
                      {u.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-4 text-center text-gray-500 font-bold">{u.reservations ?? 0}</td>
                  <td className="px-3 sm:px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="px-3 sm:px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => hacerAdmin(u.id)}
                          className="inline-flex items-center gap-1 border border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-blue-50 text-xs font-bold rounded-xl transition-colors px-2.5 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap"
                        >
                          <span className="material-icons text-sm">shield</span>
                          <span className="hidden md:inline">Hacer admin</span>
                          <span className="md:hidden">Admin</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => eliminar(u.id)}
                        className="inline-flex items-center gap-1 border border-red-100 text-red-400 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors px-2.5 py-1.5 sm:px-3 sm:py-2"
                      >
                        <span className="material-icons text-sm">delete</span>
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4">
              <span className="material-icons text-gray-200 text-5xl">person_off</span>
              <p className="text-gray-300 text-sm mt-3">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
