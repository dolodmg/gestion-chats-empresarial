import { useEffect, useState } from 'react';
import { Bot, MessageCircle, TrendingUp, Settings, Zap, Brain, BarChart3, PlusCircle, Edit, Trash2, History, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assistantService, AssistantPromptRecord, GetPromptResponse } from '../services/assistantService';

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

  useEffect(() => {
    loadPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [prompts, setPrompts] = useState([
    {
      id: '1',
      name: 'Saludo Inicial',
      content: 'Hola! Soy el asistente virtual de [EMPRESA]. ¿En qué puedo ayudarte hoy?',
      active: true
    },
    {
      id: '2',
      name: 'Información de Servicios',
      content: 'Ofrecemos servicios de consultoría, desarrollo y soporte técnico. ¿Sobre cuál te gustaría saber más?',
      active: true
    }
  ]);

  const [faqs, setFaqs] = useState([
    { id: '1', question: '¿Cuáles son sus horarios de atención?', answer: 'Atendemos de lunes a viernes de 9:00 a 18:00 hrs.', count: 45 },
    { id: '2', question: '¿Ofrecen soporte técnico?', answer: 'Sí, ofrecemos soporte técnico 24/7 para nuestros clientes.', count: 32 },
    { id: '3', question: '¿Cómo puedo solicitar una cotización?', answer: 'Puedes solicitar una cotización através de nuestro formulario web.', count: 28 }
  ]);

  const tabs = [
    { id: 'config', label: 'Configuración', icon: Settings },
    { id: 'analytics', label: 'Análisis', icon: BarChart3 },
    { id: 'faqs', label: 'FAQs', icon: MessageCircle },
    { id: 'improvements', label: 'Mejoras', icon: TrendingUp }
  ];

  return (
    <div className="p-4 sm:p-6">
      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Asistente IA</h1>
        <p className="text-sm sm:text-base text-gray-600">Configura y optimiza tu asistente virtual de WhatsApp</p>
      </div>

      {/* Stats Cards - Responsive  */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-2 sm:mb-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
            <div className="sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Consultas Bot</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-2 sm:mb-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
            <div className="sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Precisión</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">89%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-2 sm:mb-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
            <div className="sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Aprendizaje</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">24/7</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-2 sm:mb-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
            </div>
            <div className="sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Chats Hoy</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs - Responsive Grid */}
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

              {/* Prompts Configurados */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <h4 className="text-base font-medium text-gray-900">Prompts Configurados</h4>
                  <button className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Nuevo Prompt
                  </button>
                </div>
                <div className="space-y-3">
                  {prompts.map((prompt) => (
                    <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium text-gray-900 text-sm sm:text-base">{prompt.name}</h5>
                            {prompt.active && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                Activo
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{prompt.content}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-4">
                          <button className="flex-1 sm:flex-none text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="flex-1 sm:flex-none text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Análisis de Rendimiento</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Métricas */}
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">Métricas Clave</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Tasa de Respuesta</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Satisfacción</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Tiempo de Respuesta</span>
                        <span className="font-medium">2.3s</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categorías */}
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">Consultas por Categoría</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Soporte Técnico</span>
                      <span className="font-medium text-sm">342</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ventas</span>
                      <span className="font-medium text-sm">287</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Información</span>
                      <span className="font-medium text-sm">198</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Otros</span>
                      <span className="font-medium text-sm">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Preguntas Frecuentes</h3>
                <button className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Agregar FAQ
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">{faq.question}</h4>
                          <span className="text-xs sm:text-sm text-gray-500 self-start sm:self-auto">
                            {faq.count} consultas
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4">
                        <button className="flex-1 sm:flex-none text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="flex-1 sm:flex-none text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'improvements' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Recomendaciones de Mejora</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-blue-900 text-sm sm:text-base">
                        Optimizar Respuestas de Soporte
                      </h4>
                      <p className="text-blue-800 text-sm mt-1">
                        Las consultas de soporte técnico tienen una tasa de escalación del 35%. 
                        Considera agregar más respuestas automáticas específicas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-yellow-900 text-sm sm:text-base">Actualizar FAQs</h4>
                      <p className="text-yellow-800 text-sm mt-1">
                        Se detectaron 12 preguntas nuevas que no están en tu base de conocimiento. 
                        Añadirlas podría reducir las derivaciones manuales.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Bot className="w-5 h-5 text-green-600 mt-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-green-900 text-sm sm:text-base">
                        Mejora en Horarios Nocturnos
                      </h4>
                      <p className="text-green-800 text-sm mt-1">
                        El bot está manejando el 95% de las consultas fuera del horario laboral. 
                        ¡Excelente desempeño!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Historial - Responsive */}
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