import { useState, useEffect } from 'react';
import { templateService, WhatsAppTemplate } from '../services/templateService';
import { toast } from 'sonner';
import {
    FileText,
    Plus,
    RefreshCw,
    Trash2,
    Send,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    Pause
} from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Templates() {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<WhatsAppTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [templates, statusFilter, categoryFilter]);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await templateService.getTemplates();
            setTemplates(data);
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.msg || 'No se pudieron cargar las plantillas'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...templates];

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }

        if (categoryFilter !== 'ALL') {
            filtered = filtered.filter(t => t.category === categoryFilter);
        }

        setFilteredTemplates(filtered);
    };

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            const result = await templateService.syncTemplates();
            toast.success('Sincronización completada', {
                description: `${result.syncedCount} actualizadas, ${result.createdCount} nuevas`
            });
            await loadTemplates();
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.msg || 'No se pudo sincronizar'
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDelete = async (template: WhatsAppTemplate) => {
        if (!confirm(`¿Eliminar la plantilla "${template.name}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            await templateService.deleteTemplate(template._id);
            toast.success('Plantilla eliminada', {
                description: `La plantilla "${template.name}" fue eliminada exitosamente`
            });
            await loadTemplates();
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.msg || 'No se pudo eliminar la plantilla'
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="w-4 h-4" />;
            case 'PENDING':
                return <Clock className="w-4 h-4" />;
            case 'REJECTED':
                return <XCircle className="w-4 h-4" />;
            case 'PAUSED':
                return <Pause className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Plantillas de Mensajes</h1>
                            <p className="text-sm text-gray-600">Gestiona tus plantillas de WhatsApp</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleSync}
                            disabled={isSyncing}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            Sincronizar
                        </Button>
                        <Button
                            onClick={() => toast.info('Próximamente', { description: 'Función en desarrollo' })}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Nueva Plantilla
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filtros:</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="APPROVED">Aprobadas</option>
                        <option value="REJECTED">Rechazadas</option>
                        <option value="PAUSED">Pausadas</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="ALL">Todas las categorías</option>
                        <option value="MARKETING">Marketing</option>
                        <option value="UTILITY">Utilidad</option>
                        <option value="AUTHENTICATION">Autenticación</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {templates.length === 0 ? 'No hay plantillas' : 'No hay plantillas con estos filtros'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {templates.length === 0
                                ? 'Crea tu primera plantilla para comenzar'
                                : 'Intenta cambiar los filtros'}
                        </p>
                        {templates.length === 0 && (
                            <Button
                                onClick={() => toast.info('Próximamente', { description: 'Función en desarrollo' })}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Plantilla
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template) => (
                            <div
                                key={template._id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                {templateService.getCategoryText(template.category)}
                                            </span>
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                {template.language}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${templateService.getStatusColor(template.status)}`}>
                                        {getStatusIcon(template.status)}
                                        {templateService.getStatusText(template.status)}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {templateService.getTemplatePreview(template)}
                                    </p>
                                </div>

                                {/* Rejection Reason */}
                                {template.status === 'REJECTED' && template.rejectionReason && (
                                    <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-xs text-red-700">
                                            <strong>Motivo:</strong> {template.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <Button
                                        onClick={() => toast.info('Próximamente', { description: 'Función en desarrollo' })}
                                        disabled={!templateService.canBeSent(template)}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 flex items-center justify-center gap-1"
                                    >
                                        <Send className="w-3 h-3" />
                                        Enviar
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(template)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
