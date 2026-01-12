import { useState, useEffect } from 'react';
import { X, FileText, Loader2, Calendar, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import summaryService, { ChatSummary } from '@/services/summaryService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
    chatName: string;
}

export function ChatSummaryModal({ isOpen, onClose, chatId, chatName }: ChatSummaryModalProps) {
    const [summaries, setSummaries] = useState<ChatSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadSummaries();
        }
    }, [isOpen, chatId]);

    const loadSummaries = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await summaryService.getChatSummaries(chatId);

            // Si no hay resúmenes, generar uno automáticamente
            if (response.summaries.length === 0) {
                console.log('No hay resúmenes, generando uno automáticamente...');
                await generateFirstSummary();
            } else {
                setSummaries(response.summaries);
            }
        } catch (err: any) {
            console.error('Error loading summaries:', err);
            if (err.response?.status === 404) {
                // No hay resúmenes (404), generar uno automáticamente
                console.log('No hay resúmenes (404), generando uno automáticamente...');
                await generateFirstSummary();
            } else {
                setError(err.response?.data?.error || 'Error al cargar resúmenes');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateFirstSummary = async () => {
        try {
            const response = await summaryService.generateSummary(chatId);

            if (response.success) {
                // Recargar la lista para mostrar el resumen generado
                const summariesResponse = await summaryService.getChatSummaries(chatId);
                setSummaries(summariesResponse.summaries);
            }
        } catch (err: any) {
            console.error('Error generating first summary:', err);
            // Si falla la generación automática, solo mostramos empty state
            // No mostramos error para no confundir al usuario
            setSummaries([]);
        }
    };

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await summaryService.generateSummary(chatId);

            if (response.success) {
                toast.success('Resumen generado', {
                    description: 'El resumen se ha generado correctamente'
                });

                // Recargar la lista de resúmenes
                await loadSummaries();
            }
        } catch (err: any) {
            console.error('Error generating summary:', err);
            const errorMessage = err.response?.data?.error || 'Error al generar resumen';
            const hoursSinceOpened = err.response?.data?.hoursSinceOpened;

            if (hoursSinceOpened !== undefined) {
                const hoursRemaining = Math.max(0, 24 - hoursSinceOpened);
                toast.error('Chat abierto recientemente', {
                    description: `Espera ${Math.ceil(hoursRemaining)} horas más para generar un nuevo resumen`
                });
            } else {
                toast.error('Error', { description: errorMessage });
            }
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
        } catch {
            return dateString;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col m-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Resúmenes de Conversación</h2>
                            <p className="text-sm text-gray-500">{chatName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        // Loading skeleton
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : error && summaries.length === 0 ? (
                        // Error state
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar resúmenes</h3>
                            <p className="text-gray-600 text-center">{error}</p>
                        </div>
                    ) : summaries.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay resúmenes aún</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Genera el primer resumen de esta conversación para obtener un análisis rápido
                            </p>
                        </div>
                    ) : (
                        // Summaries list
                        <div className="space-y-6">
                            {summaries.map((summary, index) => (
                                <div
                                    key={summary._id}
                                    className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-blue-300 transition-colors"
                                >
                                    {/* Summary header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Sparkles className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        Resumen #{summaries.length - index}
                                                    </span>
                                                    {index === 0 && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                            Más reciente
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(summary.generatedAt)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        {summary.messageCount} mensajes
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary content */}
                                    <div className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {summary.summary}
                                    </div>

                                    {/* Summary footer */}
                                    {summary.generatedBy && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                            Generado por {summary.generatedBy.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            {summaries.length > 0
                                ? `${summaries.length} resumen${summaries.length !== 1 ? 'es' : ''} generado${summaries.length !== 1 ? 's' : ''}`
                                : 'Los resúmenes se generan con IA y se guardan por fecha'
                            }
                        </p>
                        <button
                            onClick={handleGenerateSummary}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generar Nuevo Resumen
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
