import { useEffect, useState } from 'react';
import { Bot, MessageCircle, TrendingUp, Settings, Zap, Brain, BarChart3, PlusCircle, Edit, Trash2, History, Save, X, RefreshCw, Pin, Archive, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assistantService, AssistantPromptRecord, GetPromptResponse } from '../services/assistantService';
import { faqService, FAQ, FAQStats } from '../services/faqService';

export default function AsistenteIA() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('config');
  
  // Estado del prompt actual
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState<number | null>(null);
  const [workflowId, setWorkflowId] = useState<string | undefined>(undefined);
  const [nodeId, setNodeId] = useState<string | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);
  
  // Historial
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState<AssistantPromptRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);

  // FAQs
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [analyzingFAQs, setAnalyzingFAQs] = useState(false);
  const [faqStats, setFaqStats] = useState<FAQStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<string | null>(null);
  const [editCustomResponse, setEditCustomResponse] = useState('');

  const currentClientId = user?.role === 'admin' ? undefined : user?.clientId;

  const loadPrompt = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    setStatus(null);
    try {
      const data: GetPromptResponse = await assistantService.getPrompt(currentClientId);
      setPromptText(data.prompt || '');
      setVersion(data.version ?? null);
      setWorkflowId(data.workflowId);
      setNodeId(data.nodeId);
      setLastUpdated(data.lastUpdated);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al cargar el prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!promptText.trim()) {
      setError('El prompt no puede estar vacío');
      return;
    }
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const res = await assistantService.updatePrompt({ prompt: promptText, description }, currentClientId);
      setStatus(`Guardado correctamente. Versión ${res.version}`);
      setVersion(res.version);
      setLastUpdated(res.updatedAt);
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al guardar el prompt');
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async (newPage = 1) => {
    setError(null);
    try {
      const res = await assistantService.getHistory(newPage, 10, currentClientId);
      setHistory(res.prompts);
      setPagination(res.pagination);
      setPage(newPage);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al cargar el historial');
    }
  };

  const handleRestore = async (id: string) => {
    setError(null);
    try {
      await assistantService.restorePrompt(id, currentClientId);
      await loadPrompt();
      await loadHistory(page);
      setStatus('Versión restaurada correctamente');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al restaurar el prompt');
    }
  };

  // Funciones para FAQs
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
      
      // Cargar stats
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

  const handleUpdateFAQ = async (id: string, updates: any) => {
    try {
      await faqService.updateFAQ(id, updates);
      setStatus('FAQ actualizada correctamente');
      await loadFAQs();
      setEditingFAQ(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al actualizar FAQ');
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

  useEffect(() => {
    loadPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (activeTab === 'faqs') {
      loadFAQs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedCategory]);

  const tabs = [
    { id: 'config', label: 'Configuración', icon: Settings },
    { id: 'faqs', label: 'FAQs', icon: MessageCircle },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'improvements', label: 'Mejoras', icon: TrendingUp }
  ];

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Asistente IA</h1>
        <p className="text-sm sm:text-base text-gray-600">Configura y optimiza tu asistente virtual de WhatsApp</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="grid grid-cols-2 sm:flex sm:space-x-8 px-4 sm:px-6 min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-1 sm:space-y-0 sm:space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
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

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* Configuración Tab */}
          {activeTab === 'config' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Configuración del Prompt</h3>
                <button
                  onClick={() => {
                    loadHistory(1);
                    setShowHistoryModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Ver Historial
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

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Cargando...</div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt del Asistente
                    </label>
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Escribe el prompt que guiará el comportamiento del asistente..."
                    />
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                      <span>
                        {version !== null ? `Versión actual: ${version}` : 'Sin versión guardada'}
                      </span>
                      {lastUpdated && (
                        <span>Última actualización: {new Date(lastUpdated).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del cambio (opcional)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Ej: Mejora en saludos iniciales"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header con stats */}
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

              {/* Filtros */}
              {categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                      selectedCategory === 'all'
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
                      className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Lista de FAQs */}
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
                          <div className="flex items-start gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
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
                            </div>
                          </div>

                          {/* Respuesta común del bot */}
                          {faq.commonResponse && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <p className="text-xs text-gray-500 mb-1">Respuesta del bot:</p>
                              <p>{faq.commonResponse}</p>
                            </div>
                          )}

                          {/* Respuesta personalizada */}
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
                              <p className="text-xs text-green-600 mb-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Respuesta personalizada:
                              </p>
                              <p>{faq.customResponse}</p>
                            </div>
                          ) : null}

                          {/* Variaciones */}
                          <details className="mt-2">
                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                              Ver {faq.variations.length} variaciones
                            </summary>
                            <ul className="mt-2 space-y-1 ml-4">
                              {faq.variations.slice(0, 5).map((variation, idx) => (
                                <li key={idx} className="text-xs text-gray-600">
                                  • {variation.question} ({variation.count}x)
                                </li>
                              ))}
                              {faq.variations.length > 5 && (
                                <li className="text-xs text-gray-500 italic">
                                  ... y {faq.variations.length - 5} más
                                </li>
                              )}
                            </ul>
                          </details>
                        </div>

                        {/* Acciones */}
                        <div className="flex sm:flex-col items-center gap-2">
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

          {/* Otros tabs (Analytics, Improvements) */}
          {(activeTab === 'analytics' || activeTab === 'improvements') && (
            <div className="text-gray-600 text-sm">Próximamente</div>
          )}
        </div>
      </div>

      {/* Modal Historial */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Historial de Prompts</h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">Versión</span>
                          <span className="text-xs sm:text-sm font-medium text-gray-900">{item.version}</span>
                          {item.isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                              Activa
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-gray-700 mb-1">{item.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString()}
                          {item.createdBy && ` · ${item.createdBy}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRestore(item._id)}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
                      >
                        Restaurar
                      </button>
                    </div>
                    <details className="mt-3">
                      <summary className="text-xs sm:text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                        Ver prompt
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap break-words text-xs sm:text-sm text-gray-800 bg-gray-50 p-2 rounded">
                        {item.promptText}
                      </pre>
                    </details>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center text-gray-500 py-8 text-sm">Sin registros de historial</div>
                )}
              </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Página {pagination.page} de {pagination.totalPages}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page <= 1}
                      onClick={() => loadHistory(1)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 hover:bg-gray-50"
                      title="Primera página"
                    >
                      «
                    </button>
                    <button
                      disabled={page <= 1}
                      onClick={() => loadHistory(page - 1)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      ‹
                    </button>
                    <button
                      disabled={pagination && page >= pagination.totalPages}
                      onClick={() => loadHistory(page + 1)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      ›
                    </button>
                    <button
                      disabled={pagination && page >= pagination.totalPages}
                      onClick={() => loadHistory(pagination ? pagination.totalPages : page)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 hover:bg-gray-50"
                      title="Última página"
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}