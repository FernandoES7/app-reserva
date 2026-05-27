import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { roomsAPI, reservasAPI } from '../services/api';

const STEPS = [
  { label: 'Fechas y habitación', icon: 'calendar_today' },
  { label: 'Datos personales',     icon: 'person' },
  { label: 'Pago',                 icon: 'credit_card' },
  { label: 'Confirmación',        icon: 'check_circle' },
];

function Calendario({ checkIn, checkOut, onDateChange }) {
  const [mes, setMes] = useState(new Date());
  const [hovered, setHovered] = useState(null);
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dias = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

  const getDias = () => {
    const y = mes.getFullYear(), m = mes.getMonth();
    const arr = [];
    for (let i = 0; i < new Date(y, m, 1).getDay(); i++) arr.push(null);
    for (let i = 1; i <= new Date(y, m + 1, 0).getDate(); i++) arr.push(new Date(y, m, i));
    return arr;
  };

  const mismo  = (a, b) => a && b && a.toDateString() === b.toDateString();
  const enRango = (d) => {
    if (!checkIn) return false;
    const fin = checkOut || hovered;
    if (!fin) return false;
    const [s, e] = checkIn < fin ? [checkIn, fin] : [fin, checkIn];
    return d > s && d < e;
  };
  const esPasado = (d) => { const h = new Date(); h.setHours(0,0,0,0); return d < h; };
  const clickDia = (d) => {
    if (!checkIn || (checkIn && checkOut)) { onDateChange(d, null); return; }
    onDateChange(checkIn < d ? checkIn : d, checkIn < d ? d : checkIn);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm select-none" style={{ padding: '24px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
        <button onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth()-1, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors">
          <span className="material-icons text-gray-400" style={{ fontSize: '20px' }}>chevron_left</span>
        </button>
        <span className="font-bold text-[#191281] tracking-wide">{meses[mes.getMonth()]} {mes.getFullYear()}</span>
        <button onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth()+1, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors">
          <span className="material-icons text-gray-400" style={{ fontSize: '20px' }}>chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1" style={{ marginBottom: '8px' }}>
        {dias.map(d => <div key={d} className="text-center text-xs font-bold text-gray-300 py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {getDias().map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const sel    = mismo(d, checkIn) || mismo(d, checkOut);
          const rango  = enRango(d);
          const pasado = esPasado(d);
          return (
            <button key={i} disabled={pasado}
              onClick={() => clickDia(d)}
              onMouseEnter={() => checkIn && !checkOut && setHovered(d)}
              className="aspect-square flex items-center justify-center rounded-xl text-sm transition-all"
              style={{
                cursor: pasado ? 'not-allowed' : 'pointer',
                background: sel ? '#191281' : rango ? '#dbeafe' : 'transparent',
                color: pasado ? '#d1d5db' : sel ? '#ffffff' : rango ? '#191281' : '#374151',
                fontWeight: sel ? '800' : '500',
              }}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Reservar() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { bookingData, updateBookingData, calculateNights, calculateTotal, resetBooking } = useBooking();
  const [step, setStep]         = useState(1);
  const [rooms, setRooms]       = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [loading, setLoading]   = useState(false);

  const fmtDate = d => d ? d.toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';

  useEffect(() => {
    if (bookingData.checkIn && bookingData.checkOut) {
      roomsAPI.getAll({ disponible: true, capacidad: bookingData.guests || 1 })
        .then(d => setRooms(d.rooms || []))
        .catch(() => {});
    }
  }, [bookingData.checkIn, bookingData.checkOut]);

  const buscarHabitaciones = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return;
    const sel = Object.entries(cantidades)
      .filter(([,q]) => q > 0)
      .map(([id, quantity]) => ({ room: rooms.find(r => String(r.id) === id), quantity }))
      .filter(x => x.room);
    updateBookingData({ selectedRooms: sel });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!bookingData.checkIn || !bookingData.checkOut) return;
      if (!bookingData.selectedRooms?.length) return;
    }
    if (step === 2) {
      const { fullName, document, email, phone } = bookingData.customerInfo;
      if (!fullName || !document || !email || !phone) return;
    }
    if (step === 3) { procesarPago(); return; }
    setStep(s => s + 1);
  };

  const procesarPago = async () => {
    const { cardNumber, cardHolder, expiryDate, cvv } = bookingData.paymentInfo;
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      setLoading(true);
      const data = await reservasAPI.create({
        checkIn:      bookingData.checkIn.toISOString().split('T')[0],
        checkOut:     bookingData.checkOut.toISOString().split('T')[0],
        guests:       bookingData.guests,
        rooms:        bookingData.selectedRooms.map(({ room, quantity }) => ({ roomId: room.id, quantity })),
        customerInfo: bookingData.customerInfo,
        totalPrice:   calculateTotal(),
      });
      updateBookingData({ confirmationCode: data.reservationCode || data.id, totalPrice: calculateTotal() });
      setStep(4);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const InputField = ({ label, icon, ...props }) => (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
        <span className="material-icons" style={{ fontSize: '14px' }}>{icon}</span> {label}
      </label>
      <input {...props}
        className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] focus:bg-white transition-all text-gray-700"
        style={{ padding: '14px 16px' }} />
    </div>
  );

  const ResumenBox = () => (
    <div className="bg-gray-50 rounded-2xl border border-gray-100" style={{ padding: '28px' }}>
      <p className="font-bold text-[#191281] uppercase tracking-widest text-xs" style={{ marginBottom: '20px' }}>Resumen</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          ['calendar_today', 'Check-in',  fmtDate(bookingData.checkIn)],
          ['calendar_today', 'Check-out', fmtDate(bookingData.checkOut)],
          ['nights_stay',    'Noches',    calculateNights()],
          ['groups',         'Huéspedes', bookingData.guests],
        ].map(([icon, label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-400">
              <span className="material-icons" style={{ fontSize: '16px' }}>{icon}</span>{label}
            </span>
            <span className="font-bold text-[#191281]">{value}</span>
          </div>
        ))}
        {bookingData.selectedRooms?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm border-t border-gray-200" style={{ paddingTop: '10px' }}>
            <span className="text-gray-400">{item.room.nombre} ×{item.quantity}</span>
            <span className="font-bold text-[#191281]">S/ {item.room.precio * item.quantity * calculateNights()}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-gray-200" style={{ paddingTop: '12px', marginTop: '4px' }}>
          <span className="font-bold text-[#191281] text-sm">Total</span>
          <span className="font-bold text-[#f59e0b]" style={{ fontSize: '18px' }}>S/ {calculateTotal()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '80px' }}>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl flex flex-col items-center shadow-2xl" style={{ padding: '48px' }}>
            <div className="w-14 h-14 border-4 border-[#191281] border-t-transparent rounded-full animate-spin" style={{ marginBottom: '20px' }} />
            <p className="font-bold text-[#191281] tracking-wide">Procesando pago...</p>
          </div>
        </div>
      )}

      <div className="bg-gray-50" style={{ padding: '46px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold text-[#191281] tracking-wide text-center" style={{ marginBottom: '32px' }}>Reserva tu habitación</h1>

          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center" style={{ flex: 1, marginBottom: '0px'}}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                    style={{
                      background: step > i+1 ? '#16a34a' : step === i+1 ? '#f59e0b' : '#e5e7eb',
                      color: step > i+1 ? '#ffffff' : step === i+1 ? '#ffffff' : '#9ca3af',
                      marginBottom: '8px',
                    }}>
                    {step > i+1
                      ? <span className="material-icons" style={{ fontSize: '18px' }}>check</span>
                      : <span className="material-icons" style={{ fontSize: '18px' }}>{s.icon}</span>
                    }
                  </div>
                  <span className="text-xs font-bold tracking-wide hidden sm:block"
                    style={{ color: step >= i+1 ? '#191281' : '#9ca3af' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2" style={{ background: step > i+1 ? '#16a34a' : '#e5e7eb'}} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 10px' }}>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '48px' }}>
              <h2 className="font-bold text-[#191281] tracking-wide" style={{ fontSize: '22px', marginBottom: '36px' }}>
                Selecciona fechas y habitación
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="grid grid-cols-2 gap-4">
                    {[['Check-in', bookingData.checkIn], ['Check-out', bookingData.checkOut]].map(([label, date]) => (
                      <div key={label} className="bg-gray-50 rounded-xl border border-gray-100" style={{ padding: '16px' }}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ marginBottom: '6px' }}>{label}</p>
                        <p className="font-bold text-[#191281]">{date ? fmtDate(date) : <span style={{ color: '#d1d5db' }}>—</span>}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '12px' }}>
                      <span className="material-icons" style={{ fontSize: '14px' }}>groups</span> Huéspedes
                    </label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateBookingData({ guests: Math.max(1, (bookingData.guests||1)-1) })}
                        className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <span className="material-icons text-gray-500" style={{ fontSize: '20px' }}>remove</span>
                      </button>
                      <span className="font-bold text-[#191281] text-xl w-8 text-center">{bookingData.guests || 1}</span>
                      <button onClick={() => updateBookingData({ guests: (bookingData.guests||1)+1 })}
                        className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <span className="material-icons text-gray-500" style={{ fontSize: '20px' }}>add</span>
                      </button>
                    </div>
                  </div>
                  <Calendario
                    checkIn={bookingData.checkIn}
                    checkOut={bookingData.checkOut}
                    onDateChange={(ci, co) => updateBookingData({ checkIn: ci, checkOut: co })}
                  />
                  {bookingData.checkIn && bookingData.checkOut && (
                    <button onClick={buscarHabitaciones}
                      className="w-full bg-[#191281] hover:bg-[#16304f] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      style={{ padding: '14px' }}>
                      <span className="material-icons" style={{ fontSize: '18px' }}>search</span> Buscar disponibles
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-[#191281] tracking-wide" style={{ marginBottom: '20px' }}>Habitaciones disponibles</h3>
                  {rooms.length === 0 ? (
                    <div className="text-center" style={{ padding: '48px 0' }}>
                      <span className="material-icons text-gray-200" style={{ fontSize: '56px' }}>hotel</span>
                      <p className="text-gray-300 text-sm" style={{ marginTop: '12px' }}>Selecciona fechas y pulsa buscar</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {rooms.map(room => {
                        const qty = cantidades[room.id] || 0;
                        return (
                          <div key={room.id} className="border rounded-2xl transition-all"
                            style={{ padding: '16px', borderColor: qty > 0 ? '#191281' : '#f3f4f6', background: qty > 0 ? '#eff6ff' : 'white' }}>
                            <div className="flex gap-4">
                              <img src={room.imagen} alt={room.nombre} className="rounded-xl object-cover flex-shrink-0" style={{ width: '80px', height: '68px' }} />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#191281] text-sm tracking-wide" style={{ marginBottom: '4px' }}>{room.nombre}</h4>
                                <p className="text-gray-400 text-xs" style={{ marginBottom: '10px' }}>{room.descripcion?.slice(0,55)}...</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#f59e0b] text-sm">S/ {room.precio}<span className="text-xs text-gray-400 font-normal">/noche</span></span>
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => setCantidades(p => ({...p,[room.id]:Math.max(0,(p[room.id]||0)-1)}))}
                                      className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-500">
                                      <span className="material-icons" style={{ fontSize: '14px' }}>remove</span>
                                    </button>
                                    <span className="w-5 text-center text-sm font-bold text-[#191281]">{qty}</span>
                                    <button onClick={() => setCantidades(p => ({...p,[room.id]:(p[room.id]||0)+1}))}
                                      className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-500">
                                      <span className="material-icons" style={{ fontSize: '14px' }}>add</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {bookingData.selectedRooms?.length > 0 && calculateNights() > 0 && (
                    <div style={{ marginTop: '20px' }}><ResumenBox /></div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '48px' }}>
              <h2 className="font-bold text-[#191281] tracking-wide" style={{ fontSize: '22px', marginBottom: '36px' }}>Datos personales</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <InputField label="Nombre completo *" icon="person" type="text" placeholder="Juan Pérez"
                    value={bookingData.customerInfo.fullName}
                    onChange={e => updateBookingData({ customerInfo: {...bookingData.customerInfo, fullName: e.target.value} })} />
                  <InputField label="DNI / Pasaporte *" icon="badge" type="text" placeholder="12345678"
                    value={bookingData.customerInfo.document}
                    onChange={e => updateBookingData({ customerInfo: {...bookingData.customerInfo, document: e.target.value} })} />
                  <InputField label="Correo electrónico *" icon="email" type="email" placeholder="juan@email.com"
                    value={bookingData.customerInfo.email}
                    onChange={e => updateBookingData({ customerInfo: {...bookingData.customerInfo, email: e.target.value} })} />
                  <InputField label="Teléfono *" icon="phone" type="tel" placeholder="+51 999 999 999"
                    value={bookingData.customerInfo.phone}
                    onChange={e => updateBookingData({ customerInfo: {...bookingData.customerInfo, phone: e.target.value} })} />
                </div>
                <ResumenBox />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ padding: '48px' }}>
              <h2 className="font-bold text-[#191281] tracking-wide" style={{ fontSize: '22px', marginBottom: '36px' }}>Datos de pago</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <InputField label="Número de tarjeta *" icon="credit_card" type="text" placeholder="1234 5678 9012 3456" maxLength={19}
                    value={bookingData.paymentInfo.cardNumber}
                    onChange={e => updateBookingData({ paymentInfo: {...bookingData.paymentInfo, cardNumber: e.target.value} })} />
                  <InputField label="Nombre del titular *" icon="person" type="text" placeholder="JUAN PEREZ"
                    value={bookingData.paymentInfo.cardHolder}
                    onChange={e => updateBookingData({ paymentInfo: {...bookingData.paymentInfo, cardHolder: e.target.value} })} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Vencimiento *" icon="date_range" type="text" placeholder="MM/AA" maxLength={5}
                      value={bookingData.paymentInfo.expiryDate}
                      onChange={e => updateBookingData({ paymentInfo: {...bookingData.paymentInfo, expiryDate: e.target.value} })} />
                    <InputField label="CVV *" icon="lock" type="password" placeholder="123" maxLength={4}
                      value={bookingData.paymentInfo.cvv}
                      onChange={e => updateBookingData({ paymentInfo: {...bookingData.paymentInfo, cvv: e.target.value} })} />
                  </div>
                </div>
                <ResumenBox />
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center" style={{ maxWidth: '560px', margin: '0 auto', padding: '64px 48px' }}>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto" style={{ marginBottom: '24px' }}>
                <span className="material-icons text-green-500" style={{ fontSize: '40px' }}>check_circle</span>
              </div>
              <h2 className="font-bold text-[#191281] tracking-wide" style={{ fontSize: '28px', marginBottom: '8px' }}>¡Reserva Confirmada!</h2>
              <p className="text-gray-400" style={{ marginBottom: '40px' }}>Tu reserva fue procesada exitosamente</p>

              <div className="bg-blue-50 rounded-2xl" style={{ padding: '28px', marginBottom: '36px' }}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ marginBottom: '8px' }}>Código de reserva</p>
                <p className="font-bold text-[#191281] tracking-widest" style={{ fontSize: '26px', marginBottom: '24px', letterSpacing: '0.1em' }}>
                  {bookingData.confirmationCode}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    ['person',         bookingData.customerInfo.fullName],
                    ['email',          bookingData.customerInfo.email],
                    ['login',         `Check-in: ${fmtDate(bookingData.checkIn)}`],
                    ['logout',        `Check-out: ${fmtDate(bookingData.checkOut)}`],
                    ['groups',        `${bookingData.guests} huéspedes`],
                  ].map(([icon, value]) => (
                    <div key={icon} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="material-icons text-[#191281]" style={{ fontSize: '16px' }}>{icon}</span>
                      {value}
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-blue-100" style={{ paddingTop: '14px', marginTop: '6px' }}>
                    <span className="font-bold text-[#191281]">Total pagado</span>
                    <span className="font-bold text-[#f59e0b]" style={{ fontSize: '20px' }}>S/ {bookingData.totalPrice}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { resetBooking(); navigate('/'); }}
                  className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold rounded-xl transition-colors"
                  style={{ padding: '14px' }}>Volver al inicio</button>
                <button onClick={() => window.print()}
                  className="flex-1 bg-[#191281] hover:bg-[#16304f] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  style={{ padding: '14px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>download</span> Comprobante
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step < 4 && (
          <div className="flex justify-between" style={{ marginTop: '32px' }}>
            <button onClick={() => step > 1 ? setStep(s => s-1) : navigate('/')}
              className="flex items-center gap-2 border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold rounded-xl transition-colors"
              style={{ padding: '14px 28px' }}>
              <span className="material-icons" style={{ fontSize: '18px' }}>arrow_back</span>
              {step === 1 ? 'Cancelar' : 'Anterior'}
            </button>
            <button onClick={nextStep} disabled={loading}
              className="flex items-center gap-2 bg-[#191281] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-md"
              style={{ padding: '14px 28px' }}>
              {loading ? 'Procesando...' : step === 3 ? 'Confirmar pago' : 'Siguiente'}
              {!loading && <span className="material-icons" style={{ fontSize: '18px' }}>{step === 3 ? 'lock' : 'arrow_forward'}</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}