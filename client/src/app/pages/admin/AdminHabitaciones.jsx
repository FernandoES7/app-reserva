import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { habitacionesAPI } from '../../services/api';
import { mapTiposHabitacion, mapFormToTipo } from '../../utils/mapTipoHabitacion';
import { AdminPage, AdminPageHeader } from '../../components/admin/AdminPage';

const EMPTY = {
  nombre: '',
  tipo: 'simple',
  precio: '',
  capacidad: 1,
  cantidad_total: 1,
  descripcion: '',
  imagen: '',
  disponible: true,
};

export function AdminHabitaciones() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const cargar = () => {
    setLoading(true);
    habitacionesAPI
      .getTiposAdmin()
      .then((d) => setRooms(mapTiposHabitacion(d.data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio) return;
    try {
      setSaving(true);
      const payload = mapFormToTipo(form);
      if (modal === 'new') {
        await habitacionesAPI.createTipo(payload);
      } else {
        await habitacionesAPI.updateTipo(form.id, payload);
      }
      setModal(null);
      cargar();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Desactivar este tipo de habitación?')) return;
    try {
      await habitacionesAPI.deleteTipo(id);
      cargar();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminPage loading={loading}>
      <AdminPageHeader
        title="Habitaciones"
        subtitle={`${rooms.length} tipos de habitación registrados`}
        action={
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setModal('new'); }}
            className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#16304f] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md px-6 py-3"
          >
            <span className="material-icons text-lg">add</span>
            Nueva habitación
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {rooms.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <div className="relative h-40 sm:h-[180px]">
                {room.imagen ? (
                  <img src={room.imagen} alt={room.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="material-icons text-gray-300 text-5xl">hotel</span>
                  </div>
                )}
                <span
                  className="absolute top-3 right-3 text-xs font-bold rounded-full px-3 py-1.5"
                  style={{
                    background: room.disponible ? '#dcfce7' : '#fee2e2',
                    color: room.disponible ? '#16a34a' : '#dc2626',
                  }}
                >
                  {room.disponible ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-black text-[#1e3a5f] tracking-wide mb-1">{room.nombre}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest capitalize mb-3">
                  {room.tipo} · {room.capacidad} personas · {room.cantidad_total} unidad{room.cantidad_total !== 1 ? 'es' : ''}
                </p>
                <p className="font-black text-[#f59e0b] mb-4">
                  S/ {room.precio}
                  <span className="text-xs text-gray-400 font-normal">/noche</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setForm({ ...room }); setModal(room); }}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold rounded-xl transition-colors py-2.5"
                  >
                    <span className="material-icons text-base">edit</span>
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminar(room.id)}
                    className="flex items-center justify-center border border-red-100 text-red-400 hover:bg-red-50 rounded-xl transition-colors px-3.5 py-2.5"
                  >
                    <span className="material-icons text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {modal !== null && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-10">
            <div className="flex items-center justify-between mb-6 sm:mb-7">
              <h3 className="text-lg sm:text-xl font-black text-[#1e3a5f] tracking-wide">
                {modal === 'new' ? 'Nueva habitación' : 'Editar habitación'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <span className="material-icons text-gray-400 text-lg">close</span>
              </button>
            </div>

            <form onSubmit={guardar} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Nombre *', field: 'nombre', type: 'text', placeholder: 'Hab. Doble' },
                  { label: 'Precio/noche *', field: 'precio', type: 'number', placeholder: '150' },
                  { label: 'Capacidad', field: 'capacidad', type: 'number', placeholder: '2' },
                  { label: 'Cantidad total', field: 'cantidad_total', type: 'number', placeholder: '1' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(e) => setForm({
                        ...form,
                        [field]: type === 'number' ? Number(e.target.value) : e.target.value,
                      })}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 px-3.5 py-3"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">URL imagen</label>
                <input
                  value={form.imagen}
                  onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 px-3.5 py-3"
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-gray-700 resize-none px-3.5 py-3"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="disp"
                  checked={form.disponible}
                  onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                  className="accent-[#1e3a5f] w-4 h-4"
                />
                <label htmlFor="disp" className="text-sm font-semibold text-gray-600">Activa (visible para reservas)</label>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors py-3.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#1e3a5f] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors py-3.5"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
