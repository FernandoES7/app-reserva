import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginData.email || !loginData.password) { setError('Completa todos los campos'); return; }
    try {
      setLoading(true);
      const user = await login(loginData.email, loginData.password);
      navigate(user.role === 'admin' ? '/admin' : '/mis-reservas');
    } catch (err) { setError(err.message || 'Credenciales incorrectas'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regData.name || !regData.email || !regData.password) { setError('Completa todos los campos'); return; }
    if (regData.password !== regData.confirm) { setError('Las contraseñas no coinciden'); return; }
    if (regData.password.length < 6) { setError('Contraseña mínimo 6 caracteres'); return; }
    try {
      setLoading(true);
      await register(regData.name, regData.email, regData.password);
      navigate('/mis-reservas');
    } catch (err) { setError(err.message || 'Error al registrar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #191281 0%, #16304f 50%, #0f2240 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px' }}>

        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', marginBottom: '20px' }}>
            <span className="text-[#f59e0b] font-bold" style={{ fontSize: '36px' }}>JL</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide" style={{ marginBottom: '8px' }}>Hostal Boutique</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>José Luis · Miraflores, Lima</p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-gray-100">
            {[['login', 'Iniciar Sesión'], ['register', 'Registrarse']].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className="flex-1 text-sm font-bold tracking-wide transition-all"
                style={{
                  padding: '18px',
                  background: tab === t ? '#191281' : 'transparent',
                  color: tab === t ? '#ffffff' : '#9ca3af',
                }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '40px' }}>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl"
                style={{ padding: '14px 16px', marginBottom: '24px' }}>
                <span className="material-icons" style={{ fontSize: '18px' }}>error_outline</span>
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'Correo electrónico', icon: 'email',    type: 'email',    field: 'email',    placeholder: 'tu@email.com' },
                  { label: 'Contraseña',          icon: 'lock',     type: 'password', field: 'password', placeholder: '••••••••' },
                ].map(({ label, icon, type, field, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                      <span className="material-icons" style={{ fontSize: '14px' }}>{icon}</span> {label}
                    </label>
                    <input type={type} value={loginData[field]} onChange={e => setLoginData({ ...loginData, [field]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] focus:bg-white transition-all text-gray-700"
                      style={{ padding: '14px 16px' }} />
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#191281] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                  style={{ padding: '16px', marginTop: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>login</span>
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[
                  { label: 'Nombre completo',     icon: 'person',  type: 'text',     field: 'name',     placeholder: 'Juan Pérez' },
                  { label: 'Correo electrónico',  icon: 'email',   type: 'email',    field: 'email',    placeholder: 'tu@email.com' },
                  { label: 'Contraseña',          icon: 'lock',    type: 'password', field: 'password', placeholder: 'Mínimo 6 caracteres' },
                  { label: 'Confirmar contraseña',icon: 'lock',    type: 'password', field: 'confirm',  placeholder: 'Repite tu contraseña' },
                ].map(({ label, icon, type, field, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={{ marginBottom: '10px' }}>
                      <span className="material-icons" style={{ fontSize: '14px' }}>{icon}</span> {label}
                    </label>
                    <input type={type} value={regData[field]} onChange={e => setRegData({ ...regData, [field]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#191281] focus:bg-white transition-all text-gray-700"
                      style={{ padding: '14px 16px' }} />
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#191281] hover:bg-[#16304f] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                  style={{ padding: '16px', marginTop: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>person_add</span>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center" style={{ marginTop: '24px' }}>
          <button onClick={() => navigate('/')}
            className="text-sm flex items-center gap-1.5 mx-auto transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>arrow_back</span> Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}