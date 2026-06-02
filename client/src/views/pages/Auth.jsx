import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm          from '../components/auth/LoginForm.jsx';
import RegisterForm       from '../components/auth/RegisterForm.jsx';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal.jsx';

const HOTEL_IMAGE = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=85';

export default function AuthPage() {
  const navigate   = useNavigate();
  const [modo,     setModo]     = useState('login');    // 'login' | 'register'
  const [modal,    setModal]    = useState(false);

  const handleSuccess = () => navigate('/');

  return (
    <>
      <div className="min-h-screen flex">

        {/* ── Panel izquierdo: imagen hotel ─────────────────────────────────── */}
        <div
          className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 bg-cover bg-center"
          style={{ backgroundImage: `url(${HOTEL_IMAGE})` }}
        >
          {/* Overlay degradado */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/80 via-[#1e3a6e]/60 to-[#0f172a]/40" />

          {/* Logo */}
          <div className="relative flex items-center gap-3 z-10">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm
                            flex items-center justify-center">
              <span className="text-[#f59e0b] font-bold text-base tracking-wide">JL</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Hostal Boutique</p>
              <p className="text-blue-200/70 text-xs">José Luis</p>
            </div>
          </div>

          {/* Copy */}
          <div className="relative z-10 space-y-4">
            <div className="inline-block bg-[#f59e0b]/20 border border-[#f59e0b]/40 rounded-full
                            px-4 py-1 text-[#f59e0b] text-xs font-medium tracking-widest uppercase">
              Miraflores, Lima · Perú
            </div>
            <h1 className="text-4xl font-bold text-white leading-snug">
              Tu experiencia<br />
              <span className="text-[#f59e0b]">comienza aquí</span>
            </h1>
            <p className="text-blue-100/80 text-sm leading-relaxed max-w-xs">
              Gestiona tus reservas, accede a promociones exclusivas
              y vive la experiencia completa del Hostal Boutique.
            </p>

            {/* Stats */}
            <div className="flex gap-6 pt-2">
              {[['500+','Huéspedes felices'],['4.9★','Calificación'],['10+','Años de experiencia']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-white font-bold text-lg">{val}</p>
                  <p className="text-blue-200/60 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel derecho: formulario ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col">
          {/* Indicador login/registro */}
          <div className="flex border-b border-gray-100">
            {[['login','Iniciar sesión'],['register','Registrarse']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => setModo(m)}
                className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 ${
                  modo === m
                    ? 'border-[#1e3a6e] text-[#1e3a6e]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Formulario con transición */}
          <div className="flex-1 flex items-center justify-center px-8 py-10">
            <div className="w-full max-w-sm">

              {/* Logo móvil */}
              <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-[#1e3a6e] flex items-center justify-center">
                  <span className="text-[#f59e0b] font-bold text-sm">JL</span>
                </div>
                <div>
                  <p className="font-bold text-[#1e3a6e] text-sm">Hostal Boutique</p>
                  <p className="text-gray-400 text-xs">José Luis</p>
                </div>
              </div>

              {/* Animación de cambio de panel */}
              <div
                key={modo}
                className="animate-[fadeInUp_0.3s_ease]"
              >
                {modo === 'login' ? (
                  <LoginForm
                    onSuccess={handleSuccess}
                    onIrRegistro={() => setModo('register')}
                    onOlvidePassword={() => setModal(true)}
                  />
                ) : (
                  <RegisterForm
                    onSuccess={handleSuccess}
                    onIrLogin={() => setModo('login')}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 pb-4">
            © 2025 Hostal Boutique José Luis
          </p>
        </div>
      </div>

      {/* Modal olvidé contraseña */}
      {modal && <ForgotPasswordModal onClose={() => setModal(false)} />}

      {/* Animación fadeInUp */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </>
  );
}
