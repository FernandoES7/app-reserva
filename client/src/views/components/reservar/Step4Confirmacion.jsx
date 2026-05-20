import { CheckCircle, Calendar, Users, Home, Download, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const fmt = (n) => `S/ ${Number(n).toLocaleString('es-PE')}`;

export default function Step4Confirmacion({ reserva }) {
  if (!reserva) return null;

  const noches = Math.round(
    (new Date(reserva.fecha_checkout) - new Date(reserva.fecha_checkin)) / (1000*60*60*24)
  );

  return (
    <div className="text-center">
      {/* Icono de éxito */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="text-green-500" size={42} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#1e3a6e] mb-2">¡Reserva confirmada!</h2>
      <p className="text-gray-500 mb-2">
        Hemos enviado los detalles a <strong className="text-gray-700">{reserva.email}</strong>
      </p>

      {/* Código de reserva */}
      <div className="inline-block bg-[#f0f4ff] border-2 border-[#1e3a6e] rounded-xl px-8 py-4 my-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Código de reserva</p>
        <p className="text-3xl font-bold text-[#1e3a6e] tracking-widest font-mono">
          {reserva.codigo_reserva}
        </p>
      </div>

      {/* Detalle */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto mt-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Calendar size={20} className="text-[#1e3a6e] mx-auto mb-1" />
          <p className="text-xs text-gray-500">Check-in</p>
          <p className="font-semibold text-sm text-gray-800">{reserva.fecha_checkin}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Calendar size={20} className="text-[#1e3a6e] mx-auto mb-1" />
          <p className="text-xs text-gray-500">Check-out</p>
          <p className="font-semibold text-sm text-gray-800">{reserva.fecha_checkout}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Users size={20} className="text-[#1e3a6e] mx-auto mb-1" />
          <p className="text-xs text-gray-500">Huéspedes</p>
          <p className="font-semibold text-sm text-gray-800">{reserva.num_huespedes}</p>
        </div>
      </div>

      {/* Habitaciones asignadas */}
      {reserva.habitaciones?.length > 0 && (
        <div className="max-w-xl mx-auto mt-4 text-left">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Home size={13} /> Habitaciones asignadas
          </p>
          <div className="space-y-2">
            {reserva.habitaciones.map((h) => (
              <div key={h.id} className="bg-gray-50 rounded-lg px-4 py-2.5 flex justify-between text-sm">
                <span className="text-gray-700">
                  {h.tipo_nombre} — Hab. <strong>{h.numero}</strong> (Piso {h.piso})
                </span>
                <span className="text-gray-500">{fmt(h.precio_noche)}/noche</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="max-w-xl mx-auto mt-4 bg-[#f0f4ff] border border-[#c7d6f0] rounded-xl p-4 flex justify-between">
        <div className="text-left">
          <p className="text-sm font-semibold text-[#1e3a6e]">Total pagado</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {noches} noche{noches !== 1 ? 's' : ''} · {reserva.habitaciones?.length} habitación{reserva.habitaciones?.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <p className="text-2xl font-bold text-[#1e3a6e]">{fmt(reserva.total)}</p>
      </div>

      {/* Acciones */}
      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <Download size={15} />
          Descargar comprobante
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 bg-[#1e3a6e] hover:bg-[#162d56] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Ir al inicio
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Guarda tu código de reserva. Lo necesitarás para cualquier consulta o modificación.
      </p>
    </div>
  );
}
