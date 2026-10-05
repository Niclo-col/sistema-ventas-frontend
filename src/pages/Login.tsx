import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
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
        setErrorMsg('El servidor en Render tiene límite de intentos temporal (Rate limit). Por favor espere unos minutos o intente desde su navegador.');
      } else {
        setErrorMsg(err.message || 'Credenciales incorrectas');
      }
    }
  };

  const handleQuickLogin = (role: 'ADMIN' | 'SELLER') => {
    const email = role === 'ADMIN' ? 'admin@sistema-ventas.dev' : 'seller@sistema-ventas.dev';
    const pass = 'changeme123';
    setEmailOrUser(email);
    setPinOrPass(pass);
    login(email, pass).catch(err => {
      setErrorMsg(err.message || 'Error al iniciar sesión');
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Top Gradient Banner matching FlutterFlow Mockup */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-linear-to-b from-indigo-500 via-indigo-600 to-indigo-700/80 -z-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Brand Logo in floating white card above form */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white px-6 py-3.5 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center transform -translate-y-2 transition-transform">
            <LuipeLogo size="md" />
          </div>
          <h2 className="text-white font-semibold text-sm mt-3 tracking-wide drop-shadow-xs">
            Iniciar sesión
          </h2>
        </div>

        {/* Login Card matching mockup */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email field */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrUser}
                  onChange={e => setEmailOrUser(e.target.value)}
                  placeholder="Ingrese su correo o usuario (ej: admin@sistema-ventas.dev)"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* PIN / Password field with eye toggle */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={pinOrPass}
                  onChange={e => setPinOrPass(e.target.value)}
                  placeholder="Inserte el pin o contraseña"
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
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Conectando a la API...</span>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot password link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotMsg(!showForgotMsg)}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              ¿Olvidó su contraseña?
            </button>
            {showForgotMsg && (
              <p className="text-[11px] text-slate-400 mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                Contacte al administrador del sistema o use las credenciales registradas.
              </p>
            )}
          </div>

          {/* Fast Access / One-click credentials for instant review */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Acceso Rápido con Credenciales Reales</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-800 transition-all text-center cursor-pointer"
              >
                Admin (admin@sistema-ventas.dev)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('SELLER')}
                className="py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-800 transition-all text-center cursor-pointer"
              >
                Vendedor (seller@sistema-ventas.dev)
              </button>
            </div>
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
