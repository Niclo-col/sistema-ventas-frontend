import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Printer,
  Barcode,
  Wifi,
  Bluetooth,
  Usb,
  Settings as SettingsIcon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Activity,
  DollarSign,
  ShieldCheck,
  Save,
  Users
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { checkBackendHealth, API_BASE_URL } from '../../services/api';
import { INITIAL_DEVICES } from '../../services/mockData';
import { DeviceSetting } from '../../types';

interface SettingsProps {
  onBackToMenu: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBackToMenu }) => {
  const { rate, syncWithBCV, updateRate, isLoading: isSyncingRate } = useCurrency();
  const [devices, setDevices] = useState<DeviceSetting[]>(INITIAL_DEVICES);

  // Toggles
  const [autoPrint, setAutoPrint] = useState(true);
  const [duplicateScreen, setDuplicateScreen] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(true);

  // Manual rate modal
  const [manualRateInput, setManualRateInput] = useState(rate.toString());
  const [isUpdatingManualRate, setIsUpdatingManualRate] = useState(false);
  const [rateFeedback, setRateFeedback] = useState('');

  // Device modal
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'printer' | 'scanner'>('printer');
  const [newDeviceConn, setNewDeviceConn] = useState<'network' | 'bluetooth' | 'usb'>('network');
  const [newDeviceAddress, setNewDeviceAddress] = useState('192.168.1.50');

  // Backend Health Ping
  const [healthStatus, setHealthStatus] = useState<{
    ok: boolean;
    latencyMs: number;
    statusText: string;
  } | null>(null);
  const [isTestingHealth, setIsTestingHealth] = useState(false);

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setIsTestingHealth(true);
    try {
      const result = await checkBackendHealth();
      setHealthStatus(result);
    } catch {
      setHealthStatus({ ok: false, latencyMs: 0, statusText: 'Error en la conexión' });
    } finally {
      setIsTestingHealth(false);
    }
  };

  const handleSyncBCV = async () => {
    setRateFeedback('');
    try {
      await syncWithBCV();
      setRateFeedback('Tasa sincronizada exitosamente con el BCV');
    } catch (e: any) {
      setRateFeedback('Error al sincronizar: ' + (e.message || 'Intente nuevamente'));
    }
  };

  const handleSaveManualRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(manualRateInput);
    if (isNaN(parsed) || parsed <= 0) return;
    setIsUpdatingManualRate(true);
    try {
      await updateRate(parsed);
      setRateFeedback('Tasa manual actualizada exitosamente');
    } catch (e: any) {
      setRateFeedback('Error al actualizar tasa');
    } finally {
      setIsUpdatingManualRate(false);
    }
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    const newDev: DeviceSetting = {
      id: `dev-${Date.now()}`,
      name: newDeviceName.trim(),
      type: newDeviceType,
      connectionType: newDeviceConn,
      address: newDeviceAddress.trim(),
      status: 'connected',
      location: 'Punto de Venta'
    };
    setDevices([...devices, newDev]);
    setIsAddDeviceOpen(false);
    setNewDeviceName('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header matching mockup Page 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">Configuración</h2>
            <p className="text-xs text-slate-500">
              Administre lectores, ajustes generales, tasa BCV y periféricos
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddDeviceOpen(true)}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar un dispositivo</span>
        </button>
      </div>

      {/* Section 1: Impresores y scanners matching mockup */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Impresores y scanners
            </h3>
            <p className="text-xs text-slate-400">Terminales de impresión de tickets y lectores ópticos</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
            {devices.length} vinculados
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {devices.map(dev => (
            <div key={dev.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  {dev.type === 'printer' ? <Printer className="w-5 h-5" /> : <Barcode className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{dev.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      connected
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      {dev.connectionType === 'network' && <Wifi className="w-3 h-3" />}
                      {dev.connectionType === 'bluetooth' && <Bluetooth className="w-3 h-3" />}
                      {dev.connectionType === 'usb' && <Usb className="w-3 h-3" />}
                      <span>{dev.address}</span>
                    </span>
                    <span>•</span>
                    <span>{dev.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {dev.address}
                </span>
                <button
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Configurar dispositivo"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Tasa de cambio BCV & Divisas */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Tasa de Cambio Oficial (BCV)
            </h3>
            <p className="text-xs text-slate-400">Conversión de USD a VES para precios y cálculo de vuelto</p>
          </div>
          <button
            onClick={handleSyncBCV}
            disabled={isSyncingRate}
            className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRate ? 'animate-spin' : ''}`} />
            <span>Sincronizar BCV</span>
          </button>
        </div>

        {rateFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{rateFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasa Vigente</span>
            <div className="text-2xl font-black text-indigo-700">
              $1 USD = {rate.toFixed(4)} Bs
            </div>
            <p className="text-[11px] text-slate-400">
              Actualizada conforme al Banco Central de Venezuela
            </p>
          </div>

          <form onSubmit={handleSaveManualRate} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Ajuste Manual de Tasa
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.0001"
                min="1"
                value={manualRateInput}
                onChange={e => setManualRateInput(e.target.value)}
                placeholder={rate.toFixed(4)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isUpdatingManualRate}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Guardar
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Permite fijar una tasa en caso de contingencia offline.
            </p>
          </form>
        </div>
      </div>

      {/* Section 3: Ajustes y soporte matching mockup Page 5 */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
            Ajustes y soporte
          </h3>
          <p className="text-xs text-slate-400">Comportamiento del flujo de ventas y pantalla</p>
        </div>

        <div className="space-y-4">
          {/* Switch: Imprimir automáticamente los recibos */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-800 block">
                Imprimir automáticamente los recibos
              </span>
              <span className="text-xs text-slate-400">
                Imprimir recibos automáticamente después de confirmar el pago
              </span>
            </div>
            <button
              onClick={() => setAutoPrint(!autoPrint)}
              className="text-indigo-600 cursor-pointer p-1"
            >
              {autoPrint ? (
                <ToggleRight className="w-9 h-9 fill-indigo-600" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-300" />
              )}
            </button>
          </div>

          {/* Switch: Duplicar pantalla */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <span className="text-sm font-bold text-slate-800 block">
                Duplicar pantalla
              </span>
              <span className="text-xs text-slate-400">
                Habilitar vista secundaria para clientes con total a pagar y cambio
              </span>
            </div>
            <button
              onClick={() => setDuplicateScreen(!duplicateScreen)}
              className="text-indigo-600 cursor-pointer p-1"
            >
              {duplicateScreen ? (
                <ToggleRight className="w-9 h-9 fill-indigo-600" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-300" />
              )}
            </button>
          </div>

          {/* Switch: Sonido y alertas */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <span className="text-sm font-bold text-slate-800 block">
                Sonidos de escáner y cobro exitoso
              </span>
              <span className="text-xs text-slate-400">
                Emitir aviso acústico al escanear código de barras o cobrar
              </span>
            </div>
            <button
              onClick={() => setSoundFeedback(!soundFeedback)}
              className="text-indigo-600 cursor-pointer p-1"
            >
              {soundFeedback ? (
                <ToggleRight className="w-9 h-9 fill-indigo-600" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Status card matching mockup: "Registro de conectividad" */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${healthStatus?.ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Registro de conectividad
              </span>
              <span className="text-xs text-slate-500">
                {healthStatus
                  ? `${healthStatus.statusText} • Latencia: ${healthStatus.latencyMs}ms`
                  : 'Comprobando conectividad...'}
              </span>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Backend: {API_BASE_URL}
              </div>
            </div>
          </div>

          <button
            onClick={runHealthCheck}
            disabled={isTestingHealth}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer self-end sm:self-auto"
            title="Probar conectividad de nuevo"
          >
            <RefreshCw className={`w-4 h-4 ${isTestingHealth ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Add Device Modal */}
      {isAddDeviceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Vincular Nuevo Dispositivo</h3>
              <button
                onClick={() => setIsAddDeviceOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Dispositivo</label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={e => setNewDeviceName(e.target.value)}
                  placeholder="Ej: Impresora Fiscal Bixolon, Honeywell Escáner"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={newDeviceType}
                    onChange={e => setNewDeviceType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="printer">Impresora</option>
                    <option value="scanner">Escáner Óptico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Conexión</label>
                  <select
                    value={newDeviceConn}
                    onChange={e => setNewDeviceConn(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  >
                    <option value="network">Red Ethernet / WiFi</option>
                    <option value="bluetooth">Bluetooth</option>
                    <option value="usb">Puerto USB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección / Puerto</label>
                <input
                  type="text"
                  required
                  value={newDeviceAddress}
                  onChange={e => setNewDeviceAddress(e.target.value)}
                  placeholder="192.168.1.100 o COM3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeviceOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Guardar Dispositivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
