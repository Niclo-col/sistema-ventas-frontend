import React from 'react';
import {
  LayoutDashboard,
  Package,
  History,
  Settings,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminMenuProps {
  onNavigate: (view: 'menu' | 'dashboard' | 'inventory' | 'history' | 'settings') => void;
}

export const AdminMenu: React.FC<AdminMenuProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const menuItems = [
    {
      id: 'dashboard' as const,
      title: 'Dashboard',
      description: 'Resumen de ventas, analítica, gráficos y productos top',
      icon: LayoutDashboard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'inventory' as const,
      title: 'Inventario',
      description: 'Administre productos, stock, precios, códigos y categorías',
      icon: Package,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50'
    },
    {
      id: 'history' as const,
      title: 'Historial de ventas',
      description: 'Consulte transacciones, órdenes cerradas y recibos',
      icon: History,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'settings' as const,
      title: 'Configuración',
      description: 'Lectores, impresoras, tasa BCV y ajustes generales',
      icon: Settings,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    }
  ];

  return (
    <div className="w-full">
      {/* Top Banner with purple/indigo gradient matching mockup Page 4 */}
      <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-white/20 flex items-center justify-center mb-3 shadow-lg">
            <UserCircle className="w-14 h-14 text-white stroke-1" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Administrador</h2>
          <p className="text-xs text-indigo-200 mt-0.5">Control de Gestión e Inventario LUIPE</p>
        </div>
      </div>

      {/* Main Container floating upward */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-12">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900">Menú de operaciones</h3>
            <p className="text-xs text-slate-500">Seleccione el módulo al que desea ingresar</p>
          </div>

          {/* 4 Cards Grid matching Mockup Page 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="p-6 bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl shadow-2xs hover:shadow-lg transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-900 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
