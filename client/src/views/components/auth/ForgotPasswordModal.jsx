import { useState } from 'react';
import { X, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { solicitarRecuperacion } from '../../../services/api.js';

export default function ForgotPasswordModal({ onClose }) {
  const [email,    setEmail]    = useState('');
  const [estado,   setEstado]   = useState('idle'); // idle | loading | success | error
  const [mensaje,  setMensaje]  = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setMensaje('Ingresa un correo válido');
      setEstado('error');
      return;
    }
    setEstado('loading');
    try {
      await solicitarRecuperacion(email);
      setEstado('success');
    } catch {
      setEstado('error');
      setMensaje('Ocurrió un error. Intenta de nuevo.');
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden
                      animate-[fadeInUp_0.25s_ease]">

        {/* Header */}
        <div className="bg-[#1e3a6e] px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-white font-bold text-lg">¿Olvidaste tu contraseña?</p>
            <p className="text-blue-200 text-xs mt-0.5">
              Te enviaremos un enlace de recuperación
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {estado === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-800 mb-1">¡Correo enviado!</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Si tu correo está registrado, recibirás las instrucciones
                para restablecer tu contraseña en los próximos minutos.
              </p>
              <button
                onClick={onClose}
                className="mt-5 w-full bg-[#1e3a6e] hover:bg-[#162d56] text-white
                           font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Ingresa el correo asociado a tu cuenta y te enviaremos
                las instrucciones para recuperarla.
              </p>

              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Correo electrónico
              </label>
              <div className="relative mb-1">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEstado('idle'); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#1e3a6e] transition-colors
                    ${estado === 'error' ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
              </div>
              {estado === 'error' && (
                <p className="text-xs text-red-500 mb-3">{mensaje}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={estado === 'loading'}
                className="mt-4 w-full bg-[#1e3a6e] hover:bg-[#162d56] disabled:opacity-60
                           text-white font-semibold py-2.5 rounded-xl transition-colors
                           text-sm flex items-center justify-center gap-2"
              >
                {estado === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                ) : (
                  'Enviar instrucciones'
                )}
              </button>

              <button
                onClick={onClose}
                className="mt-2 w-full text-gray-500 hover:text-gray-700 text-sm py-2
                           transition-colors"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
