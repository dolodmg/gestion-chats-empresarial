import { BarChart3, MessageCircle, Users, Bot, Clock, ThumbsUp, Activity } from 'lucide-react';
import { AnalyticsStats } from '../services/assistantService';

interface AnalyticsTabProps {
    analytics: AnalyticsStats | null;
    loading: boolean;
    error: string | null;
}

export default function AnalyticsTab({ analytics, loading, error }: AnalyticsTabProps) {
    if (loading) {
        return <div className="text-center py-8 text-gray-500">Cargando análisis...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm">
                {error}
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay datos de análisis disponibles</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">Análisis de conversaciones</h3>
                <p className="text-sm text-gray-600">Métricas de los últimos 7 días</p>
            </div>

            <div className="space-y-4">
                {/* Volumen de Mensajes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-blue-900">Total de mensajes</h4>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{analytics.total}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-green-600" />
                            <h4 className="font-medium text-green-900">Recibidos</h4>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{analytics.received}</p>
                        <p className="text-xs text-green-700 mt-1">Mensajes de usuarios</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-5 h-5 text-purple-600" />
                            <h4 className="font-medium text-purple-900">Enviados</h4>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{analytics.sent}</p>
                        <p className="text-xs text-purple-700 mt-1">Respuestas del bot</p>
                    </div>
                </div>

                {/* Horas Pico y Satisfacción */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analytics.peakHours.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <h4 className="font-medium text-gray-900">Horas pico</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {analytics.peakHours.map((hour, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                        {hour}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {analytics.satisfactionRate !== null && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ThumbsUp className="w-5 h-5 text-green-600" />
                                <h4 className="font-medium text-gray-900">Tasa de satisfacción</h4>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all"
                                        style={{ width: `${analytics.satisfactionRate}%` }}
                                    />
                                </div>
                                <span className="text-2xl font-bold text-green-600">{analytics.satisfactionRate}%</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Categorías Más Consultadas */}
                {analytics.topCategories.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <h4 className="font-medium text-gray-900">Temas más consultados</h4>
                        </div>
                        <div className="space-y-2">
                            {analytics.topCategories.map((cat, idx) => {
                                // Calculate total of all categories for proper percentage
                                const totalCategoryCount = analytics.topCategories.reduce((sum, c) => sum + c.count, 0);
                                const percentage = totalCategoryCount > 0 ? Math.round((cat.count / totalCategoryCount) * 100) : 0;

                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{cat.category}</span>
                                            <span className="text-gray-600">{cat.count} consultas ({percentage}%)</span>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actividad Diaria */}
                {analytics.dailyTrend.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-medium text-gray-900">Actividad diaria</h4>
                        </div>
                        <div className="space-y-2">
                            {analytics.dailyTrend.map((day, idx) => {
                                const maxTotal = Math.max(...analytics.dailyTrend.map(d => d.total));
                                const percentage = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0;
                                const date = new Date(day._id);
                                const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{formattedDate}</span>
                                            <span className="text-gray-600">{day.total} mensajes</span>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-indigo-500 h-3 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
