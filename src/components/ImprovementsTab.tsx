import { TrendingUp, RefreshCw, Brain, Users, AlertTriangle } from 'lucide-react';
import { ImprovementSuggestion } from '../services/assistantService';

interface ImprovementsTabProps {
    improvements: ImprovementSuggestion[];
    loading: boolean;
    generating: boolean;
    error: string | null;
    status: string | null;
    onGenerate: () => void;
}

export default function ImprovementsTab({
    improvements,
    loading,
    generating,
    error,
    status,
    onGenerate
}: ImprovementsTabProps) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Sugerencias de mejora</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Análisis con IA de las conversaciones para identificar áreas de mejora
                    </p>
                </div>
                <button
                    onClick={onGenerate}
                    disabled={generating}
                    className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                    {generating ? 'Analizando...' : 'Generar análisis'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
            {status && (
                <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg text-sm">
                    {status}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando sugerencias...</div>
            ) : improvements.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No hay sugerencias de mejora</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Haz clic en "Generar análisis" para analizar las conversaciones
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Agrupar por tipo */}
                    {['knowledge_gap', 'escalation', 'sentiment'].map(type => {
                        const typeSuggestions = improvements.filter(s => s.type === type);
                        if (typeSuggestions.length === 0) return null;

                        const typeConfig = {
                            knowledge_gap: {
                                title: 'Gaps de conocimiento',
                                description: 'El bot no tiene información para responder ciertas preguntas',
                                icon: Brain,
                                color: 'blue'
                            },
                            escalation: {
                                title: 'Derivaciones a humano',
                                description: 'Usuarios piden hablar con una persona o expresan frustración',
                                icon: Users,
                                color: 'yellow'
                            },
                            sentiment: {
                                title: 'Sentimiento negativo',
                                description: 'Quejas, frustración o insatisfacción detectada en las conversaciones',
                                icon: AlertTriangle,
                                color: 'red'
                            }
                        }[type];

                        const Icon = typeConfig?.icon || Brain;

                        return (
                            <div key={type} className="border border-gray-200 rounded-lg p-4">
                                <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className={`w-5 h-5 text-${typeConfig?.color}-600`} />
                                        <h4 className="font-medium text-gray-900">{typeConfig?.title}</h4>
                                        <span className="ml-auto text-sm text-gray-500">{typeSuggestions.length}</span>
                                    </div>
                                    {typeConfig?.description && (
                                        <p className="text-xs text-gray-500 ml-7">{typeConfig.description}</p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {typeSuggestions.map((suggestion) => {
                                        const severityColors = {
                                            high: 'bg-red-100 text-red-800 border-red-200',
                                            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                            low: 'bg-blue-100 text-blue-800 border-blue-200'
                                        };

                                        return (
                                            <div key={suggestion._id} className={`border rounded-lg p-3 ${severityColors[suggestion.severity]}`}>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h5 className="font-medium text-sm">{suggestion.title}</h5>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 whitespace-nowrap">
                                                        {suggestion.severity === 'high' ? 'Alta' : suggestion.severity === 'medium' ? 'Media' : 'Baja'}
                                                    </span>
                                                </div>
                                                <p className="text-sm opacity-90">{suggestion.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
