import { Users } from 'lucide-react';

const fmt = (n) => `S/ ${Number(n).toLocaleString('es-PE')}`;

export default function ListaHabitaciones({ tipos, seleccion, noches, onCambiar }) {
  // seleccion: { [tipoId]: cantidad }

  const handleMenos = (tipo) => {
    const actual = seleccion[tipo.id] || 0;
    if (actual <= 0) return;
    onCambiar({ ...seleccion, [tipo.id]: actual - 1 });
  };

  const handleMas = (tipo) => {
    const actual     = seleccion[tipo.id] || 0;
    const disponible = tipo.disponibles ?? tipo.cantidad_total;
    if (actual >= disponible) return;
    onCambiar({ ...seleccion, [tipo.id]: actual + 1 });
  };

  if (!tipos || tipos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
        <span className="text-3xl">🏨</span>
        <p className="text-sm">No hay habitaciones disponibles para estas fechas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
      {tipos.map((tipo) => {
        const cantidad  = seleccion[tipo.id] || 0;
        const subtotal  = cantidad * tipo.precio_noche * noches;
        const isSelected = cantidad > 0;
        const disponible = tipo.disponibles ?? tipo.cantidad_total;

        return (
          <div
            key={tipo.id}
            className={`rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-[#1e3a6e] shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex gap-3 p-3">
              {/* Imagen */}
              <img
                src={tipo.imagen_url}
                alt={tipo.nombre}
                className="w-20 h-20 object-cover rounded-lg shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1e3a6e] text-sm">{tipo.nombre}</p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{tipo.descripcion}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Users size={12} />
                  <span>Hasta {tipo.capacidad} persona{tipo.capacidad > 1 ? 's' : ''}</span>
                </div>
                <p className="text-[#f59e0b] text-xs font-medium mt-1">
                  {fmt(tipo.precio_noche)} × {noches} noche{noches !== 1 ? 's' : ''}{' '}
                  = {fmt(tipo.precio_noche * noches)}
                </p>
              </div>
            </div>

            {/* Contador + subtotal */}
            <div
              className={`flex items-center px-3 pb-3 ${
                isSelected ? 'justify-between' : 'justify-start'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleMenos(tipo)}
                  disabled={cantidad === 0}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600
                    hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold text-sm">{cantidad}</span>
                <button
                  onClick={() => handleMas(tipo)}
                  disabled={cantidad >= disponible}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600
                    hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none"
                >
                  +
                </button>
              </div>
              {isSelected && (
                <span className="text-sm font-bold text-[#1e3a6e]">
                  Total: {fmt(subtotal)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
