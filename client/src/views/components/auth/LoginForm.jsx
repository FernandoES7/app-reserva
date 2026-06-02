import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUsuario } from '../../../services/api.js';

export default function LoginForm({ onSuccess, onIrRegistro, onOlvidePassword }) {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [mostrarPw, setMostrarPw] = useState(false);
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState('');

  const update = (campo, valor) => {
    setForm(f => ({ ...f, [campo]: valor }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      const { data } = await loginUsuario(form);
      // Guardar token
      localStorage.setItem('hb_token',   data.token);
      localStorage.setItem('hb_usuario', JSON.stringify(data.usuario));
      onSuccess?.(data);
    } catch (e) {
      setError(e.message || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1e3a6e]">Bienvenido de vuelta</h2>
        <p className="text-gray-400 text-sm mt-1">Ingresa a tu cuenta para continuar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm
                       bg-gray-50 focus:bg-white focus:border-[#1e3a6e] focus:outline-none
                       focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Contraseña
          </label>
          <button
            type="button"
            onClick={onOlvidePassword}
            className="text-xs text-[#1e3a6e] hover:text-[#f59e0b] font-medium transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={mostrarPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-10 text-sm
                       bg-gray-50 focus:bg-white focus:border-[#1e3a6e] focus:outline-none
                       focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setMostrarPw(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mostrarPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={cargando}
        className="w-full bg-[#1e3a6e] hover:bg-[#162d56] disabled:opacity-60
                   text-white font-bold py-3 rounded-xl transition-all text-sm
                   flex items-center justify-center gap-2 shadow-lg shadow-[#1e3a6e]/20
                   hover:shadow-[#1e3a6e]/30 hover:-translate-y-0.5"
      >
        {cargando ? (
          <><Loader2 size={16} className="animate-spin" /> Ingresando...</>
        ) : (
          'Iniciar sesión'
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <button
          onClick={onIrRegistro}
          className="text-[#1e3a6e] font-semibold hover:text-[#f59e0b] transition-colors"
        >
          Regístrate gratis
        </button>
      </p>
    </div>
  );
}
