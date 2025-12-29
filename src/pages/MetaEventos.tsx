import { useState, useEffect } from 'react';
import { useTagService } from '../hooks/useTagService';
import * as metaService from '../services/metaService';
import { toast } from 'sonner';
import {
    TrendingUp,
    Save,
    Trash2,
    TestTube,
    Plus,
    X,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface TagMapping {
    _id: string;
    tagName: string;
    eventName: string;
    defaultValue: number | null;
    defaultCurrency: string;
}

export default function MetaEventos() {
    const tagService = useTagService();

    // Configuration state
    const [metaDatasetId, setMetaDatasetId] = useState('');
    const [metaAccessToken, setMetaAccessToken] = useState('');
    const [metaTestEventCode, setMetaTestEventCode] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    // Tag mapping state
    const [mappings, setMappings] = useState<TagMapping[]>([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('Purchase'); // Default to Purchase for WhatsApp
    const [defaultValue, setDefaultValue] = useState('');
    const [defaultCurrency] = useState('USD');
    const [isAddingMapping, setIsAddingMapping] = useState(false);

    // Meta standard events for business_messaging (WhatsApp)
    const metaEvents = ['Purchase', 'AddToCart', 'InitiateCheckout', 'CompleteRegistration'];

    useEffect(() => {
        loadMetaConfig();
        loadTagMappings();
        tagService.loadUserTags();
    }, []);

    const loadMetaConfig = async () => {
        try {
            const data = await metaService.getMetaConfig();
            if (data.configured) {
                setMetaDatasetId(data.config.metaDatasetId);
                setMetaTestEventCode(data.config.metaTestEventCode || '');
                setIsConfigured(true);
            }
        } catch (error: any) {
            console.error('Error loading Meta config:', error);
        }
    };

    const loadTagMappings = async () => {
        try {
            const data = await metaService.getTagMappings();
            setMappings(data.mappings || []);
        } catch (error: any) {
            console.error('Error loading tag mappings:', error);
        }
    };

    const handleSaveConfig = async () => {
        if (!metaDatasetId || !metaAccessToken) {
            toast.error('Error', { description: 'Dataset ID y Access Token son requeridos' });
            return;
        }

        setIsSaving(true);
        try {
            await metaService.saveMetaConfig({
                metaDatasetId,
                metaAccessToken,
                metaTestEventCode: metaTestEventCode || undefined
            });

            toast.success('Configuración guardada', {
                description: 'Tu configuración de Meta ha sido guardada exitosamente'
            });

            setIsConfigured(true);
            setMetaAccessToken(''); // Clear token from UI after saving
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.error || 'Error al guardar configuración'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (!metaDatasetId || !metaAccessToken) {
            toast.error('Error', { description: 'Dataset ID y Access Token son requeridos' });
            return;
        }

        setIsTesting(true);
        try {
            const result = await metaService.testConnection({
                metaDatasetId,
                metaAccessToken,
                metaTestEventCode: metaTestEventCode || undefined
            });

            if (result.success) {
                toast.success('Conexión exitosa', {
                    description: 'La conexión con Meta CAPI fue exitosa. Revisa el Events Manager.'
                });
            }
        } catch (error: any) {
            toast.error('Error de conexión', {
                description: error.response?.data?.details || 'No se pudo conectar con Meta CAPI'
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleDeleteConfig = async () => {
        if (!confirm('¿Estás seguro de eliminar la configuración de Meta?')) return;

        try {
            await metaService.deleteMetaConfig();
            toast.success('Configuración eliminada');
            setMetaDatasetId('');
            setMetaAccessToken('');
            setMetaTestEventCode('');
            setIsConfigured(false);
        } catch (error: any) {
            toast.error('Error', { description: 'Error al eliminar configuración' });
        }
    };

    const handleAddMapping = async () => {
        if (!selectedTag) {
            toast.error('Error', { description: 'Selecciona una tag' });
            return;
        }

        setIsAddingMapping(true);
        try {
            await metaService.createTagMapping({
                tagName: selectedTag,
                eventName: selectedEvent,
                defaultValue: defaultValue ? parseFloat(defaultValue) : undefined,
                defaultCurrency
            });

            toast.success('Mapeo creado', {
                description: `Tag "${selectedTag}" → Evento "${selectedEvent}"`
            });

            loadTagMappings();
            setSelectedTag('');
            setDefaultValue('');
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.error || 'Error al crear mapeo'
            });
        } finally {
            setIsAddingMapping(false);
        }
    };

    const handleDeleteMapping = async (tagName: string) => {
        if (!confirm(`¿Eliminar mapeo de la tag "${tagName}"?`)) return;

        try {
            await metaService.deleteTagMapping(tagName);
            toast.success('Mapeo eliminado');
            loadTagMappings();
        } catch (error: any) {
            toast.error('Error', { description: 'Error al eliminar mapeo' });
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Eventos de Meta</h1>
                        <p className="text-gray-600">Configura Meta Conversions API para reportar eventos</p>
                    </div>
                </div>
            </div>

            {/* Configuration Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración de Meta CAPI</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dataset ID / Pixel ID *
                        </label>
                        <input
                            type="text"
                            value={metaDatasetId}
                            onChange={(e) => setMetaDatasetId(e.target.value)}
                            placeholder="123456789012345"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Access Token *
                        </label>
                        <input
                            type="password"
                            value={metaAccessToken}
                            onChange={(e) => setMetaAccessToken(e.target.value)}
                            placeholder={isConfigured ? '••••••••' : 'Tu Meta Access Token'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {isConfigured ? 'Deja vacío para mantener el token actual' : 'Token de larga duración del Administrador de Eventos'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Test Event Code (Opcional)
                        </label>
                        <input
                            type="text"
                            value={metaTestEventCode}
                            onChange={(e) => setMetaTestEventCode(e.target.value)}
                            placeholder="TEST12345"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Para depuración en la pestaña "Probar eventos" del Events Manager
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSaveConfig}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Guardar Configuración
                        </button>

                        <button
                            onClick={handleTestConnection}
                            disabled={isTesting || !metaDatasetId || !metaAccessToken}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isTesting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <TestTube className="w-4 h-4" />
                            )}
                            Probar Conexión
                        </button>

                        {isConfigured && (
                            <button
                                onClick={handleDeleteConfig}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tag Mapping Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mapeo Automático de Etiquetas</h2>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">¿Cómo funciona?</p>
                            <p>
                                Cuando asignes una etiqueta mapeada a un chat, se enviará automáticamente el evento correspondiente a Meta.
                                El número de teléfono del contacto se enviará hasheado (SHA-256) para privacidad.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Add Mapping Form */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta</label>
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Seleccionar tag...</option>
                            {tagService.tags.map((tag) => (
                                <option key={tag.name} value={tag.name}>
                                    {tag.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Evento Meta</label>
                        <select
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {metaEvents.map((event) => (
                                <option key={event} value={event}>
                                    {event}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Valor (Opcional)</label>
                        <input
                            type="number"
                            value={defaultValue}
                            onChange={(e) => setDefaultValue(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleAddMapping}
                            disabled={isAddingMapping || !selectedTag}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isAddingMapping ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Agregar
                        </button>
                    </div>
                </div>

                {/* Mappings Table */}
                {mappings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Etiqueta</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Evento Meta</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Moneda</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {mappings.map((mapping) => (
                                    <tr key={mapping._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                {mapping.tagName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{mapping.eventName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {mapping.defaultValue !== null ? mapping.defaultValue : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{mapping.defaultCurrency}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDeleteMapping(mapping.tagName)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mapeos configurados</h3>
                        <p className="text-gray-600">Crea tu primer mapeo para comenzar a enviar eventos automáticamente</p>
                    </div>
                )}
            </div>
        </div>
    );
}
