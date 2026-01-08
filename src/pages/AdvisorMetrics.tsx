import { useState, useEffect } from 'react';
import { advisorMetricsService, type AdvisorMetrics } from '../services/advisorMetricsService';
import { BarChart3, TrendingUp, Users, Tag, ArrowUpDown } from 'lucide-react';

type SortField = 'advisorName' | 'totalChats' | 'taggedChats';
type SortDirection = 'asc' | 'desc';

export default function AdvisorMetrics() {
    const [metrics, setMetrics] = useState<AdvisorMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('totalChats');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await advisorMetricsService.getMetrics();
            setMetrics(data);
        } catch (err) {
            setError('Error cargando métricas de asesores');
            console.error('Error loading advisor metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedMetrics = [...metrics].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        const multiplier = sortDirection === 'asc' ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue) * multiplier;
        }
        return ((aValue as number) - (bValue as number)) * multiplier;
    });

    const totalChatsAcrossAdvisors = metrics.reduce((sum, m) => sum + m.totalChats, 0);
    const totalTaggedChats = metrics.reduce((sum, m) => sum + m.taggedChats, 0);
    const avgChatsPerAdvisor = metrics.length > 0 ? Math.round(totalChatsAcrossAdvisors / metrics.length) : 0;

    // Get all unique tags across all advisors
    const allTags = new Set<string>();
    metrics.forEach(m => {
        Object.keys(m.tagBreakdown).forEach(tag => allTags.add(tag));
    });

    // Calculate total usage per tag
    const tagTotals: Record<string, number> = {};
    metrics.forEach(m => {
        Object.entries(m.tagBreakdown).forEach(([tag, count]) => {
            tagTotals[tag] = (tagTotals[tag] || 0) + count;
        });
    });

    const topTags = Object.entries(tagTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando métricas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={loadMetrics}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Métricas de Asesores</h1>
                    <p className="text-gray-600">Estadísticas de rendimiento y uso de etiquetas por asesor</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Total Asesores</h3>
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{metrics.length}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Total Chats</h3>
                            <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{totalChatsAcrossAdvisors}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Promedio por Asesor</h3>
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{avgChatsPerAdvisor}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Chats Etiquetados</h3>
                            <Tag className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{totalTaggedChats}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {totalChatsAcrossAdvisors > 0
                                ? `${Math.round((totalTaggedChats / totalChatsAcrossAdvisors) * 100)}%`
                                : '0%'
                            }
                        </p>
                    </div>
                </div>

                {/* Top Tags */}
                {topTags.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Etiquetas Más Usadas</h2>
                        <div className="space-y-3">
                            {topTags.map(([tag, count]) => {
                                const percentage = totalTaggedChats > 0 ? (count / totalTaggedChats) * 100 : 0;
                                return (
                                    <div key={tag}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700 capitalize">{tag}</span>
                                            <span className="text-sm text-gray-600">{count} usos</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Advisors Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Detalle por Asesor</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('advisorName')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Asesor
                                            <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('totalChats')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Total Chats
                                            <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('taggedChats')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Chats Etiquetados
                                            <ArrowUpDown className="w-4 h-4" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Etiquetas Usadas
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedMetrics.map((advisor) => {
                                    const tagPercentage = advisor.totalChats > 0
                                        ? Math.round((advisor.taggedChats / advisor.totalChats) * 100)
                                        : 0;

                                    return (
                                        <tr key={advisor.advisorId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{advisor.advisorName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{advisor.advisorEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{advisor.totalChats}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900">{advisor.taggedChats}</span>
                                                    <span className="text-xs text-gray-500">({tagPercentage}%)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(advisor.tagBreakdown)
                                                        .sort(([, a], [, b]) => b - a)
                                                        .slice(0, 3)
                                                        .map(([tag, count]) => (
                                                            <span
                                                                key={tag}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                            >
                                                                {tag}: {count}
                                                            </span>
                                                        ))}
                                                    {Object.keys(advisor.tagBreakdown).length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{Object.keys(advisor.tagBreakdown).length - 3} más
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {metrics.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No hay asesores con chats asignados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
