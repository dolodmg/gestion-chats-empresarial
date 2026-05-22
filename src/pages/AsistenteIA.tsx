import { useEffect, useState } from 'react';
import { MessageCircle, TrendingUp, BarChart3, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assistantService, AnalyticsStats, ImprovementSuggestion } from '../services/assistantService';
import { faqService, FAQ, FAQStats } from '../services/faqService';
import AnalyticsTab from '../components/AnalyticsTab';
import ImprovementsTab from '../components/ImprovementsTab';

export default function AsistenteIA() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faqs');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  /*
   * Sección de configuración/prompt preservada para futuro.
   * No debe mostrarse ni ser accesible en UI por decisión de producto actual.
   *
   * Código previo:
   * const [isLoading, setIsLoading] = useState(false);
   * const [saving, setSaving] = useState(false);
   * const [promptText, setPromptText] = useState('');
   * const [description, setDescription] = useState('');
   * const [version, setVersion] = useState<number | null>(null);
   * const [workflowId, setWorkflowId] = useState<string | undefined>(undefined);
   * const [nodeId, setNodeId] = useState<string | undefined>(undefined);
   * const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);
   * const [showHistoryModal, setShowHistoryModal] = useState(false);
   * const [history, setHistory] = useState<AssistantPromptRecord[]>([]);
   * const [page, setPage] = useState(1);
   * const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
   *
   * const loadPrompt = async () => { ...assistantService.getPrompt(...)... };
   * const handleSave = async () => { ...assistantService.updatePrompt(...)... };
   * const loadHistory = async (newPage = 1) => { ...assistantService.getHistory(...)... };
   * const handleRestore = async (id: string) => { ...assistantService.restorePrompt(...)... };
   *
   * useEffect(() => {
   *   loadPrompt();
   * }, [user]);
   *
   * tabs:
   * { id: 'config', label: 'Configuración', icon: Settings }
   *
   * UI eliminada temporalmente:
   * - Tab "Configuración"
   * - Editor de prompt
   * - Historial de prompts
   * - Restauración de versiones
   */

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [analyzingFAQs, setAnalyzingFAQs] = useState(false);
  const [faqStats, setFaqStats] = useState<FAQStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});
  /*
   * Edición de respuesta personalizada preservada para futuro.
   *
   * Código previo:
   * const [editingFAQ, setEditingFAQ] = useState<string | null>(null);
   * const [editCustomResponse, setEditCustomResponse] = useState('');
   *
   * const handleUpdateFAQ = async (id: string, updates: any) => {
   *   await faqService.updateFAQ(id, updates);
   *   setStatus('FAQ actualizada correctamente');
   *   await loadFAQs();
   *   setEditingFAQ(null);
   * };
   *
   * UI eliminada temporalmente:
   * - textarea para customResponse
   * - botones Guardar/Cancelar
   * - botón Editar respuesta
   * - render de faq.customResponse
   */

  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [improvements, setImprovements] = useState<ImprovementSuggestion[]>([]);
  const [improvementsLoading, setImprovementsLoading] = useState(false);
  const [generatingImprovements, setGeneratingImprovements] = useState(false);

  const currentClientId = user?.role === 'admin' ? undefined : user?.clientId;

  const loadFAQs = async () => {
    setFaqsLoading(true);
    setError(null);

    try {
      const response = await faqService.getFAQs(currentClientId, {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: 'active',
        limit: 50
      });

      setFaqs(response.faqs);
      setCategories(response.categories);

      const statsResponse = await faqService.getStats(currentClientId);
      setFaqStats(statsResponse.stats);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al cargar FAQs');
    } finally {
      setFaqsLoading(false);
    }
  };

  const handleAnalyzeFAQs = async () => {
    setAnalyzingFAQs(true);
    setError(null);
    setStatus(null);

    try {
      const response = await faqService.analyzeFAQs(currentClientId);
      setStatus(`Análisis completado: ${response.stats.faqsGenerated} preguntas generadas de ${response.stats.messagesAnalyzed} mensajes`);
      await loadFAQs();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al analizar FAQs');
    } finally {
      setAnalyzingFAQs(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta FAQ?')) return;

    try {
      await faqService.deleteFAQ(id);
      setStatus('FAQ eliminada correctamente');
      await loadFAQs();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al eliminar FAQ');
    }
  };

  const toggleFaqDetails = (id: string) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setError(null);

    try {
      const response = await assistantService.getAnalytics(currentClientId);
      setAnalytics(response.stats);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al cargar analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadImprovements = async () => {
    setImprovementsLoading(true);
    setError(null);

    try {
      const response = await assistantService.getImprovements(currentClientId);
      setImprovements(response.suggestions);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al cargar mejoras');
    } finally {
      setImprovementsLoading(false);
    }
  };

  const handleGenerateImprovements = async () => {
    setGeneratingImprovements(true);
    setError(null);
    setStatus(null);

    try {
      const response = await assistantService.generateImprovements(currentClientId);
      setStatus(`Análisis completado: ${response.count} sugerencias generadas`);
      setImprovements(response.suggestions);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al generar mejoras');
    } finally {
      setGeneratingImprovements(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'faqs') {
      loadFAQs();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'improvements') {
      loadImprovements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedCategory]);

  const tabs = [
    { id: 'faqs', label: 'FAQs', icon: MessageCircle },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'improvements', label: 'Mejoras', icon: TrendingUp }
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Asistente IA</h1>
        <p className="text-sm sm:text-base text-gray-600">Configura y optimiza tu asistente virtual de WhatsApp</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="grid grid-cols-3 sm:flex sm:space-x-8 px-4 sm:px-6 min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'faqs' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Preguntas Frecuentes</h3>
                  {faqStats && (
                    <p className="text-sm text-gray-600 mt-1">
                      {faqStats.totalFAQs} preguntas identificadas · {faqStats.totalQuestions} consultas totales
                    </p>
                  )}
                </div>
                <button
                  onClick={handleAnalyzeFAQs}
                  disabled={analyzingFAQs}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${analyzingFAQs ? 'animate-spin' : ''}`} />
                  {analyzingFAQs ? 'Analizando...' : 'Analizar Preguntas'}
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

              {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Todas
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {faqsLoading ? (
                <div className="text-center py-8 text-gray-500">Cargando FAQs...</div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No se encontraron preguntas frecuentes</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Haz clic en "Analizar Preguntas" para generar las preguntas automáticamente
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">
                            {faq.canonicalQuestion}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {faq.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {faq.totalCount} {faq.totalCount === 1 ? 'consulta' : 'consultas'}
                            </span>
                          </div>

                          {faq.commonResponse && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <p className="text-xs text-gray-500 mb-1">Respuesta del bot:</p>
                              <p>{faq.commonResponse}</p>
                            </div>
                          )}

                          {faq.variations.length > 0 && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => toggleFaqDetails(faq._id)}
                                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                              >
                                {expandedFaqs[faq._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                Ver consultas relacionadas ({faq.variations.length})
                              </button>

                              {expandedFaqs[faq._id] && (
                                <div className="mt-3 space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                                  {faq.variations.map((variation, index) => (
                                    <div key={`${faq._id}-${index}`} className="rounded-md bg-white p-3 text-sm text-gray-700">
                                      <p className="font-medium text-gray-900">{variation.question}</p>
                                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                                        <span>{variation.count} {variation.count === 1 ? 'consulta' : 'consultas'}</span>
                                        <span>Última vez: {new Date(variation.lastSeen).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/*
                            Código original preservado para reactivar después:

                            {editingFAQ === faq._id ? (
                              <div className="mt-3">
                                <label className="block text-xs text-gray-600 mb-1">
                                  Respuesta personalizada:
                                </label>
                                <textarea
                                  value={editCustomResponse}
                                  onChange={(e) => setEditCustomResponse(e.target.value)}
                                  rows={3}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  placeholder="Escribe una respuesta personalizada..."
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleUpdateFAQ(faq._id, { customResponse: editCustomResponse })}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingFAQ(null);
                                      setEditCustomResponse('');
                                    }}
                                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : faq.customResponse ? (
                              <div className="mt-2 p-2 bg-green-50 rounded text-sm text-gray-700">
                                <p className="text-xs text-green-600 mb-1">
                                  Respuesta personalizada:
                                </p>
                                <p>{faq.customResponse}</p>
                              </div>
                            ) : null}
                          */}
                        </div>

                        <div className="flex sm:flex-col items-center gap-2">
                          {/*
                            Código original preservado:
                            <button
                              onClick={() => {
                                setEditingFAQ(faq._id);
                                setEditCustomResponse(faq.customResponse || '');
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar respuesta"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          */}
                          <button
                            onClick={() => handleDeleteFAQ(faq._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              analytics={analytics}
              loading={analyticsLoading}
              error={error}
            />
          )}

          {activeTab === 'improvements' && (
            <ImprovementsTab
              improvements={improvements}
              loading={improvementsLoading}
              generating={generatingImprovements}
              error={error}
              status={status}
              onGenerate={handleGenerateImprovements}
            />
          )}
        </div>
      </div>
    </div>
  );
}
