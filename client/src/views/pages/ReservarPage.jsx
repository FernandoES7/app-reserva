import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator          from '../components/reservar/StepIndicator.jsx';
import Step1Fechas            from '../components/reservar/Step1Fechas.jsx';
import Step2DatosPersonales   from '../components/reservar/Step2DatosPersonales.jsx';
import Step3Pago              from '../components/reservar/Step3Pago.jsx';
import Step4Confirmacion      from '../components/reservar/Step4Confirmacion.jsx';
import { crearReserva }       from '../../services/api.js';

const ESTADO_INICIAL = {
  checkin:    null,
  checkout:   null,
  huespedes:  1,
  seleccion:  {},   // { [tipoId]: cantidad }
  tiposInfo:  [],   // copia de tiposDisponibles para calcular totales
  cliente: {
    nombre:   '',
    apellido: '',
    email:    '',
    telefono: '',
    dni:      '',
  },
};

export default function ReservarPage() {
  const navigate   = useNavigate();
  const [step,     setStep]     = useState(1);
  const [datos,    setDatos]    = useState(ESTADO_INICIAL);
  const [reserva,  setReserva]  = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState(null);

  const actualizar = (parcial) => setDatos(d => ({ ...d, ...parcial }));

  /* ── Calcular total a pagar ── */
  const noches = datos.checkin && datos.checkout
    ? Math.round((new Date(datos.checkout + 'T00:00:00') - new Date(datos.checkin + 'T00:00:00')) / (1000*60*60*24))
    : 0;

  const totalPagar = (datos.tiposInfo || []).reduce((acc, tipo) => {
    return acc + (datos.seleccion[tipo.id] || 0) * tipo.precio_noche * noches;
  }, 0);

  /* ── Confirmar reserva (step 3 → step 4) ── */
  const handleConfirmar = async () => {
    setCargando(true);
    setError(null);
    try {
      const seleccionArray = Object.entries(datos.seleccion)
        .filter(([, cant]) => cant > 0)
        .map(([tipoId, cantidad]) => {
          const tipo = datos.tiposInfo.find(t => t.id === Number(tipoId));
          return { tipoId: Number(tipoId), cantidad, precioNoche: tipo?.precio_noche };
        });

      const { data } = await crearReserva({
        cliente:       datos.cliente,
        checkin:       datos.checkin,
        checkout:      datos.checkout,
        numHuespedes:  datos.huespedes,
        seleccion:     seleccionArray,
      });

      setReserva(data);
      setStep(4);
    } catch (e) {
      setError(e.message || 'Error al crear la reserva. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Step indicator */}
      <div className="bg-white border-b border-gray-200 py-6">
        <StepIndicator currentStep={step} />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {step === 1 && (
            <Step1Fechas
              datos={datos}
              onDatosChange={(parcial) => {
                // Cuando llegan tipos disponibles, guardarlos también
                if (parcial.tiposInfo !== undefined) {
                  actualizar(parcial);
                } else {
                  actualizar(parcial);
                }
              }}
              onSiguiente={() => setStep(2)}
              onCancelar={() => navigate('/')}
            />
          )}

          {step === 2 && (
            <Step2DatosPersonales
              datos={datos}
              onDatosChange={actualizar}
              onSiguiente={() => setStep(3)}
              onAnterior={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3Pago
              datos={datos}
              totalPagar={totalPagar}
              onConfirmar={handleConfirmar}
              onAnterior={() => setStep(2)}
              cargando={cargando}
            />
          )}

          {step === 4 && (
            <Step4Confirmacion reserva={reserva} />
          )}
        </div>
      </div>
    </div>
  );
}
