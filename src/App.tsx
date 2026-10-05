import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Login } from './pages/Login';

// Seller Views
import { SellerMenu } from './pages/seller/SellerMenu';
import { POS } from './pages/seller/POS';
import { SalesHistory } from './pages/seller/SalesHistory';
import { PriceList } from './pages/seller/PriceList';

// Admin Views
import { AdminMenu } from './pages/admin/AdminMenu';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { InventoryManager } from './pages/admin/InventoryManager';
import { Settings } from './pages/admin/Settings';

type SellerView = 'menu' | 'pos' | 'history' | 'prices';
type AdminView = 'menu' | 'dashboard' | 'inventory' | 'history' | 'settings';

const MainApp: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const [sellerView, setSellerView] = useState<SellerView>('menu');
  const [adminView, setAdminView] = useState<AdminView>('menu');

  if (!isAuthenticated) {
    return <Login />;
  }

  // Titles for Navbar
  const getNavbarMeta = () => {
    if (role === 'SELLER') {
      switch (sellerView) {
        case 'pos':
          return { title: 'Punto de Venta', subtitle: 'Catálogo y Registro', showBack: true, onBack: () => setSellerView('menu') };
        case 'history':
          return { title: 'Historial', subtitle: 'Transacciones y Recibos', showBack: true, onBack: () => setSellerView('menu') };
        case 'prices':
          return { title: 'Listado de Precios', subtitle: 'Inventario de Venta', showBack: true, onBack: () => setSellerView('menu') };
        default:
          return { title: 'Panel de Vendedor', subtitle: 'Menú de Operaciones', showBack: false };
      }
    } else {
      switch (adminView) {
        case 'dashboard':
          return { title: 'Dashboard', subtitle: 'Analítica de Negocio', showBack: true, onBack: () => setAdminView('menu') };
        case 'inventory':
          return { title: 'Gestión de Inventario', subtitle: 'Catálogo de Productos', showBack: true, onBack: () => setAdminView('menu') };
        case 'history':
          return { title: 'Historial General', subtitle: 'Auditoría de Ventas', showBack: true, onBack: () => setAdminView('menu') };
        case 'settings':
          return { title: 'Configuración', subtitle: 'Hardware y Parámetros', showBack: true, onBack: () => setAdminView('menu') };
        default:
          return { title: 'Panel Administrador', subtitle: 'Centro de Control', showBack: false };
      }
    }
  };

  const meta = getNavbarMeta();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar
        title={meta.title}
        subtitle={meta.subtitle}
        showBack={meta.showBack}
        onBack={meta.onBack}
      />

      <main className="flex-1">
        {role === 'SELLER' ? (
          <>
            {sellerView === 'menu' && (
              <SellerMenu onNavigate={setSellerView} />
            )}
            {sellerView === 'pos' && (
              <POS onBackToMenu={() => setSellerView('menu')} />
            )}
            {sellerView === 'history' && (
              <SalesHistory
                onBackToMenu={() => setSellerView('menu')}
                onNewSale={() => setSellerView('pos')}
              />
            )}
            {sellerView === 'prices' && (
              <PriceList onBackToMenu={() => setSellerView('menu')} />
            )}
          </>
        ) : (
          <>
            {adminView === 'menu' && (
              <AdminMenu onNavigate={setAdminView} />
            )}
            {adminView === 'dashboard' && (
              <AnalyticsDashboard onBackToMenu={() => setAdminView('menu')} />
            )}
            {adminView === 'inventory' && (
              <InventoryManager onBackToMenu={() => setAdminView('menu')} />
            )}
            {adminView === 'history' && (
              <SalesHistory
                onBackToMenu={() => setAdminView('menu')}
                onNewSale={() => setAdminView('inventory')}
              />
            )}
            {adminView === 'settings' && (
              <Settings onBackToMenu={() => setAdminView('menu')} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
