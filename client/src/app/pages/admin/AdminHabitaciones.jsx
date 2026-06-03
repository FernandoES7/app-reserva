import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { roomsAPI } from '../../services/api';

const EMPTY = { nombre:'', tipo:'simple', precio:'', capacidad:1, descripcion:'', imagen:'', disponible:true };

export function AdminHabitaciones() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const cargar = () => {
    setLoading(true);
    roomsAPI.getAll().then(d => setRooms(d.rooms || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(cargar, []);

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.tipo || !form.precio) return;
    try {
      setSaving(true);
      modal === 'new' ? await roomsAPI.create(form) : await roomsAPI.update(form.id, form);
      setModal(null); cargar();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta habitación?')) return;
    try { await roomsAPI.delete(id); cargar(); } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex justify-center" style={{ padding: '80px 0 80px 280px' }}>
      <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '32px 32px 32px 280px', width: '100%', boxSizing: 'border-box' }}>

      <div className="flex items-center justify-between" style={{ width: '100%' }}>
        <div>
          <h1 className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize: '28px', marginBottom: '4px' }}>Habitaciones</h1>
          <p className="text-gray-400 text-sm">{rooms.length} habitaciones registradas</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal('new'); }}
          className="bg-[#1e3a5f] hover:bg-[#16304f] text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md"
          style={{ padding: '12px 24px' }}>
          <span className="material-icons" style={{ fontSize: '18px' }}>add</span> Nueva habitación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" style={{ width: '100%' }}>
        {rooms.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <div className="relative" style={{ height: '180px' }}>
                {room.imagen
                  ? <img src={room.imagen} alt={room.nombre} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="material-icons text-gray-300" style={{ fontSize: '48px' }}>hotel</span>
                    </div>
                }
                <span className="absolute top-3 right-3 text-xs font-bold rounded-full"
                  style={{ padding:'5px 12px', background: room.disponible ? '#dcfce7' : '#fee2e2', color: room.disponible ? '#16a34a' : '#dc2626' }}>
                  {room.disponible ? 'Disponible' : 'Ocupada'}
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                <h3 className="font-black text-[#1e3a5f] tracking-wide" style={{ marginBottom: '4px' }}>{room.nombre}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest capitalize" style={{ marginBottom: '12px' }}>{room.tipo} · {room.capacidad} personas</p>
                <p className="font-black text-[#f59e0b]" style={{ marginBottom: '16px' }}>S/ {room.precio}<span className="text-xs text-gray-400 font-normal">/noche</span></p>
                <div className="flex gap-2">
                  <button onClick={() => { setForm({...room}); setModal(room); }}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold rounded-xl transition-colors"
                    style={{ padding: '10px' }}>
                    <span className="material-icons" style={{ fontSize: '16px' }}>edit</span> Editar
                  </button>
                  <button onClick={() => eliminar(room.id)}
                    className="flex items-center justify-center border border-red-100 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    style={{ padding: '10px 14px' }}>
                    <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {modal !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full overflow-y-auto" style={{ maxWidth:'520px', maxHeight:'90vh', padding:'40px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom:'28px' }}>
              <h3 className="font-black text-[#1e3a5f] tracking-wide" style={{ fontSize:'20px' }}>
                {modal === 'new' ? 'Nueva habitación' : 'Editar habitación'}
              </h3>
              <button onClick={() => setModal(null)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <span className="material-icons text-gray-400" style={{ fontSize:'18px' }}>close</span>
              </button>
            </div>
            
            <form onSubmit={guardar} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:'Nombre *',      field:'nombre',    type:'text',   placeholder:'Hab. Doble' },
                  { label:'Precio/noche *', field:'precio', type:'number', placeholder:'150' },
                  { label:'Capacidad',    field:'capacidad', type:'number', placeholder:'2' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest" style={{ display:'block', marginBottom:'8px' }}>{label}</label>
                    <input type={type} value={form[field]} onChange={e => setForm({...form,[field]: type==='number' ? Number(e.target.value) : e.target.value})}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700"
                      style={{ padding:'12px 14px' }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest" style={{ display:'block', marginBottom:'8px' }}>Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700"
                    style={{ padding:'12px 14px' }}>
                    {['simple','doble','triple','familiar','suite'].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest" style={{ display:'block', marginBottom:'8px' }}>URL imagen</label>
                <input value={form.imagen} onChange={e => setForm({...form, imagen: e.target.value})} placeholder="https://..."
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700"
                  style={{ padding:'12px 14px' }} />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest" style={{ display:'block', marginBottom:'8px' }}>Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={3}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 resize-none"
                  style={{ padding:'12px 14px' }} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="disp" checked={form.disponible} onChange={e => setForm({...form, disponible: e.target.checked})} className="accent-[#1e3a5f] w-4 h-4" />
                <label htmlFor="disp" className="text-sm font-semibold text-gray-600">Disponible</label>
              </div>
              <div className="flex gap-3" style={{ paddingTop:'8px' }}>
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors"
                  style={{ padding:'13px' }}>Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#1e3a5f] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
                  style={{ padding:'13px' }}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}