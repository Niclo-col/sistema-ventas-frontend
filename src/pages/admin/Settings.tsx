import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Printer,
  Barcode,
  Wifi,
  Bluetooth,
  Usb,
  RefreshCw,
  CheckCircle2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { checkBackendHealth, API_BASE_URL } from '../../services/api';
import { DeviceSetting } from '../../types';

interface SettingsProps {
  onBackToMenu: () => void;
}

// Available devices detected on this equipment
const AVAILABLE_DEVICES: DeviceSetting[] = [
  {
    id: 'dev-1',
    name: 'Star TSP100 (Caja)',
    type: 'printer',
    connectionType: 'network',
    address: '192.168.1.45',
    status: 'connected',
    location: 'Caja Principal'
  },
  {
    id: 'dev-2',
    name: 'Epson TM-T88VI (Comandera)',
    type: 'printer',
    connectionType: 'bluetooth',
    address: 'BT-00:22:14:11',
    status: 'connected',
    location: 'Barra y Cocina'
  },
  {
    id: 'dev-3',
    name: 'Zebra ZD421 (Scanner)',
    type: 'scanner',
    connectionType: 'usb',
    address: 'Port 2 [0304:41]',
    status: 'connected',
    location: 'Mostrador'
  }
];

export const Settings: React.FC<SettingsProps> = ({ onBackToMenu }) => {
  const { rate, syncWithBCV, updateRate, isLoading: isSyncingRate } = useCurrency();
  const devices = AVAILABLE_DEVICES;

  // Toggles
  const [autoPrint, setAutoPrint] = useState(true);
  const [duplicateScreen, setDuplicateScreen] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(true);

  // Manual rate
  const [manualRateInput, setManualRateInput] = useState(rate.toString());
  const [isUpdatingManualRate, setIsUpdatingManualRate] = useState(false);
  const [rateFeedback, setRateFeedback] = useState('');

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header matching mockup */}
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
            Administre periféricos detectados, ajustes generales y tasa BCV
          </p>
        </div>
      </div>

      {/* Section 1: Impresores y scanners (SOLO muestra los disponibles, sin botón de agregar ni engranajes) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Impresores y scanners
            </h3>
            <p className="text-xs text-slate-400">Dispositivos detectados y disponibles en el equipo</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            {devices.length} disponibles
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {devices.map(dev => (
            <div key={dev.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  {dev.type === 'printer' ? <Printer className="w-5 h-5" /> : <Barcode className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{dev.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      disponible
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      {dev.connectionType === 'network' && <Wifi className="w-3 h-3 text-slate-400" />}
                      {dev.connectionType === 'bluetooth' && <Bluetooth className="w-3 h-3 text-slate-400" />}
                      {dev.connectionType === 'usb' && <Usb className="w-3 h-3 text-slate-400" />}
                      <span>{dev.address}</span>
                    </span>
                    <span>•</span>
                    <span>{dev.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-medium text-slate-400 capitalize">
                  {dev.type === 'printer' ? 'Impresora Térmica' : 'Lector Óptico'}
                </span>
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
            <p className="text-xs text-slate-400">Conversión de USD a VES para cobros y cálculo de vuelto</p>
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
              Sincronizada con el Banco Central de Venezuela
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
              Permite fijar una tasa en caso de contingencia.
            </p>
          </form>
        </div>
      </div>

      {/* Section 3: Ajustes y soporte */}
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
                Habilitar visor cliente con total y vuelto
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
                Sonidos de confirmación
              </span>
              <span className="text-xs text-slate-400">
                Aviso acústico al confirmar venta
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

        {/* Status card: Registro de conectividad */}
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
    </div>
  );
};
