import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, CalendarDays, MessageSquare, RotateCcw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { userService, type ClientAdminMetrics } from '../services/userService';

const formatNumber = (value: number) => new Intl.NumberFormat('es-AR').format(value);

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPresetRange = (preset: '7d' | '30d' | '90d' | 'month') => {
  const today = new Date();
  const endDate = formatDateInput(today);
  const start = new Date(today);

  if (preset === 'month') {
    start.setDate(1);
    return { startDate: formatDateInput(start), endDate };
  }

  const days = preset === '7d' ? 6 : preset === '30d' ? 29 : 89;
  start.setDate(start.getDate() - days);
  return { startDate: formatDateInput(start), endDate };
};

export default function ClientMetrics() {
  const navigate = useNavigate();
  const { clientId, userName } = useParams();
  const initialRange = useMemo(() => getPresetRange('30d'), []);

  const [metrics, setMetrics] = useState<ClientAdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!clientId) {
        toast.error('Falta clientId');
        navigate('/admin');
        return;
      }

      try {
        setLoading(true);
        const data = await userService.getClientMetrics({
          clientId,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        });
        setMetrics(data);
      } catch (error: any) {
        const message =
          error.response?.data?.message || error.response?.data?.msg || 'Error al cargar metricas';
        toast.error('Error al cargar metricas', { description: message });
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [clientId, endDate, navigate, startDate]);

  const applyPresetRange = (preset: '7d' | '30d' | '90d' | 'month') => {
    const range = getPresetRange(preset);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const clearRange = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-3 px-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al panel admin
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Metricas del cliente</h1>
        <p className="text-gray-600">
          Cliente: {userName ? decodeURIComponent(userName) : clientId}
        </p>
        <p className="text-sm text-gray-500">Client ID: {clientId}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtro de fechas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Desde</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Hasta</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex flex-wrap items-end gap-2">
            <Button type="button" variant="outline" onClick={() => applyPresetRange('7d')}>
              7 dias
            </Button>
            <Button type="button" variant="outline" onClick={() => applyPresetRange('30d')}>
              30 dias
            </Button>
            <Button type="button" variant="outline" onClick={() => applyPresetRange('90d')}>
              90 dias
            </Button>
            <Button type="button" variant="outline" onClick={() => applyPresetRange('month')}>
              Este mes
            </Button>
            <Button type="button" variant="ghost" onClick={clearRange}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          Cargando metricas...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Mensajes entrantes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(metrics?.incomingMessages || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-sky-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Mensajes bot</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(metrics?.botMessages || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total mensajes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(metrics?.totalMessages || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chats unicos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(metrics?.activeChatsInRange || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
