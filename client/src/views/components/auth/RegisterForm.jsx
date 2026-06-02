import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { registrarUsuario } from '../../../services/api.js';

// Reglas de contraseña
const REGLAS = [
  { id: 'length',    label: 'Mínimo 8 caracteres',           test: (p) => p.length >= 8             },
  { id: 'upper',     label: 'Al menos una letra mayúscula',  test: (p) => /[A-Z]/.test(p)           },
  { id: 'number',    label: 'Al menos un número',            test: (p) => /\d/.test(p)              },
  { id: 'special',   label: 'Al menos un carácter especial', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const passwordValida = (pw) => REGLAS.every(r => r.test(pw));

export default function RegisterForm({ onSuccess, onIrLogin }) {
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmar: ''
  });
  const [mostrarPw,   setMostrarPw]   = useState(false);
  const [mostrarConf, setMostrarConf] = useState(false);
  const [cargando,    setCargando]    = useState(false);
  const [error,       setError]       = useState('');
  const [errores,     setErrores]     = useState({});
  const [pwFocus,     setPwFocus]     = useState(false);

  const update = (campo, valor) => {
    setForm(f => ({ ...f, [campo]: valor }));
    setError('');
    if (errores[campo]) setErrores(e => ({ ...e, [campo]: null }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())    e.nombre    = 'Requerido';
    if (!form.apellido.trim())  e.apellido  = 'Requerido';
    if (!form.email.trim())     e.email     = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!passwordValida(form.password)) e.password = 'La contraseña no cumple los requisitos';
    if (form.password !== form.confirmar)  e.confirmar = 'Las contraseñas no coinciden';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    setCargando(true);
    try {
      const { data } = await registrarUsuario({
        nombre:   form.nombre,
        apellido: form.apellido,
        email:    form.email,
        password: form.password,
      });
      localStorage.setItem('hb_token',   data.token);
      localStorage.setItem('hb_usuario', JSON.stringify(data.usuario));
      onSuccess?.(data);
    } catch (e) {
      setError(e.message || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const inputClass = (campo) =>
    `w-full border rounded-xl py-3 pl-10 pr-4 text-sm bg-gray-50
     focus:bg-white focus:outline-none focus:ring-2 transition-all
     ${errores[campo]
       ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
       : 'border-gray-200 focus:border-[#1e3a6e] focus:ring-[#1e3a6e]/20'}`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-[#1e3a6e]">Crea tu cuenta</h2>
        <p className="text-gray-400 text-sm mt-1">Regístrate para gestionar tus reservas</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-2 gap-3">
        {[['nombre','Nombre','Juan'], ['apellido','Apellido','Pérez']].map(([campo, label, ph]) => (
          <div key={campo}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              {label}
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={ph}
                value={form[campo]}
                onChange={(e) => update(campo, e.target.value)}
                className={inputClass(campo)}
              />
            </div>
            {errores[campo] && <p className="text-xs text-red-500 mt-0.5">{errores[campo]}</p>}
          </div>
        ))}
      </div>

      {/* Email */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass('email')}
          />
        </div>
        {errores.email && <p className="text-xs text-red-500 mt-0.5">{errores.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Contraseña
        </label>
        <div className="relative">
          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={mostrarPw ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            onFocus={() => setPwFocus(true)}
            onBlur={() => setPwFocus(false)}
            className={`${inputClass('password')} pr-10`}
          />
          <button
            type="button"
            onClick={() => setMostrarPw(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mostrarPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Indicador de requisitos */}
        {(pwFocus || form.password) && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 space-y-1.5">
            {REGLAS.map(({ id, label, test }) => {
              const ok = test(form.password);
              return (
                <div key={id} className="flex items-center gap-2">
                  <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    ok ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    {ok
                      ? <Check size={10} className="text-white" />
                      : <X size={9} className="text-gray-400" />
                    }
                  </span>
                  <span className={`text-xs transition-colors ${ok ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmar password */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={mostrarConf ? 'text' : 'password'}
            placeholder="Repite tu contraseña"
            value={form.confirmar}
            onChange={(e) => update('confirmar', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className={`${inputClass('confirmar')} pr-10`}
          />
          <button
            type="button"
            onClick={() => setMostrarConf(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mostrarConf ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {errores.confirmar && <p className="text-xs text-red-500 mt-0.5">{errores.confirmar}</p>}
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
          <><Loader2 size={16} className="animate-spin" /> Creando cuenta...</>
        ) : (
          'Crear cuenta'
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={onIrLogin}
          className="text-[#1e3a6e] font-semibold hover:text-[#f59e0b] transition-colors"
        >
          Inicia sesión
        </button>
      </p>
    </div>
  );
}
