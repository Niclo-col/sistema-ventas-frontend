import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LuipeLogo } from '../components/common/LuipeLogo';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [pinOrPass, setPinOrPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotMsg, setShowForgotMsg] = useState(false);

  // Normalize username or email
  const normalizeEmail = (input: string) => {
    const val = input.trim();
    if (val.toLowerCase() === 'admin') return 'admin@sistema-ventas.dev';
    if (val.toLowerCase() === 'seller' || val.toLowerCase() === 'vendedor') return 'seller@sistema-ventas.dev';
    return val;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUser.trim() || !pinOrPass.trim()) {
      setErrorMsg('Por favor complete todos los campos');
      return;
    }
    setErrorMsg('');
    const targetEmail = normalizeEmail(emailOrUser);

    try {
      await login(targetEmail, pinOrPass.trim());
    } catch (err: any) {
      if (err.status === 429) {
        setErrorMsg('El servidor tiene límite de intentos temporal (Rate limit). Por favor espere unos minutos antes de reintentar.');
      } else {
        setErrorMsg(err.message || 'Credenciales incorrectas');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Top Gradient Banner matching FlutterFlow Mockup */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-linear-to-b from-indigo-600 via-indigo-700 to-indigo-800 -z-0 shadow-inner">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Brand Logo in floating white card above form */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white px-7 py-4 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center transform hover:scale-102 transition-transform">
            <LuipeLogo size="md" />
          </div>

          {/* High-contrast subtitle badge with solid backdrop ensuring 100% visibility on all screen sizes */}
          <div className="mt-3.5 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5 border border-white/10">
            <span>Iniciar sesión</span>
          </div>
        </div>

        {/* Login Card matching mockup */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-6">
          <div className="text-center pb-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Acceso al Sistema</h1>
            <p className="text-xs text-slate-400 mt-1">Ingrese sus credenciales autorizadas</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Usuario o Correo
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrUser}
                  onChange={e => setEmailOrUser(e.target.value)}
                  placeholder="Ingrese su correo o usuario"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* PIN / Password field with eye toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                PIN o Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={pinOrPass}
                  onChange={e => setPinOrPass(e.target.value)}
                  placeholder="Inserte el pin"
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Iniciando sesión...</span>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot password link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setShowForgotMsg(!showForgotMsg)}
              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              ¿Olvidó su contraseña?
            </button>
            {showForgotMsg && (
              <p className="text-[11px] text-slate-500 mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                Contacte al administrador del sistema para restablecer sus credenciales.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Sistema de Ventas & Inventario • Impresiones LUIPE C.A.
        </p>
      </div>
    </div>
  );
};
