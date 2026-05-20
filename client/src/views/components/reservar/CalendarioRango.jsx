import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DIAS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES  = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const toDateStr = (d) => d?.toISOString().slice(0, 10) ?? null;
const fromStr   = (s) => s ? new Date(s + 'T00:00:00') : null;

const isSameDay = (a, b) => a && b && toDateStr(a) === toDateStr(b);

const isBetween = (day, start, end) => {
  if (!start || !end) return false;
  const d = day.getTime();
  const s = fromStr(start).getTime();
  const e = fromStr(end).getTime();
  return d > s && d < e;
};

export default function CalendarioRango({ checkin, checkout, onChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  // Selección temporal mientras el usuario elige el 2do click
  const [hoverDate, setHoverDate] = useState(null);

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Generar celdas del mes
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const handleDayClick = (day) => {
    if (!day || day < today) return;
    const str = toDateStr(day);

    // Estado: no hay checkin aún → seleccionar checkin
    if (!checkin || (checkin && checkout)) {
      onChange({ checkin: str, checkout: null });
      return;
    }
    // Hay checkin, no checkout → seleccionar checkout
    if (str <= checkin) {
      // Si hacen clic en una fecha anterior, reiniciar
      onChange({ checkin: str, checkout: null });
    } else {
      onChange({ checkin, checkout: str });
    }
  };

  // Para mostrar rango mientras hover
  const effectiveCheckout = checkout || hoverDate;

  const getDayStyle = (day) => {
    if (!day) return '';
    const str = toDateStr(day);
    const isPast = day < today;
    if (isPast) return 'text-gray-300 cursor-not-allowed';

    const isStart = str === checkin;
    const isEnd   = str === effectiveCheckout && checkout;
    const inRange = isBetween(day, checkin, effectiveCheckout);

    if (isStart || isEnd) {
      return 'bg-[#1e3a6e] text-white rounded-lg font-semibold';
    }
    if (inRange) {
      return 'bg-blue-100 text-[#1e3a6e] rounded-lg';
    }
    return 'hover:bg-gray-100 rounded-lg text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 select-none">
      {/* Header mes */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-[#1e3a6e] text-sm">
          {MESES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Días semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Celdas */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => (
          <div
            key={i}
            className={`text-center py-2 text-sm cursor-pointer transition-colors ${
              day ? getDayStyle(day) : ''
            }`}
            onClick={() => day && handleDayClick(day)}
            onMouseEnter={() => {
              if (day && checkin && !checkout) {
                setHoverDate(toDateStr(day) > checkin ? toDateStr(day) : null);
              }
            }}
            onMouseLeave={() => setHoverDate(null)}
          >
            {day?.getDate() ?? ''}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#1e3a6e] inline-block" />
          Fecha seleccionada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 inline-block" />
          Rango de estadía
        </span>
      </div>
    </div>
  );
}
