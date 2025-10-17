import React, { useState } from 'react';
import { Bot, MessageCircle, TrendingUp, Settings, Zap, Brain, BarChart3, PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function AsistenteIA() {
  const [activeTab, setActiveTab] = useState('config');
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
    { id: 'faqs', label: 'Preguntas Frecuentes', icon: MessageCircle },
    { id: 'improvements', label: 'Mejoras', icon: TrendingUp }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Asistente IA</h1>
        <p className="text-gray-600">Configura y optimiza tu asistente virtual de WhatsApp</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Consultas Bot</p>
              <p className="text-2xl font-semibold text-gray-900">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Precisión</p>
              <p className="text-2xl font-semibold text-gray-900">89%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aprendizaje</p>
              <p className="text-2xl font-semibold text-gray-900">24/7</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Satisfacción</p>
              <p className="text-2xl font-semibold text-gray-900">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Bot</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Asistente
                    </label>
                    <input
                      type="text"
                      defaultValue="Asistente Inteligente"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de Respuesta (segundos)
                    </label>
                    <input
                      type="number"
                      defaultValue="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Prompts del Sistema</h3>
                  <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Nuevo Prompt
                  </button>
                </div>
                <div className="space-y-4">
                  {prompts.map((prompt) => (
                    <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            prompt.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {prompt.active ? 'Activo' : 'Inactivo'}
                          </span>
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{prompt.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Análisis de Conversaciones</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Tipos de Consulta Más Frecuentes</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Información de servicios</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Soporte técnico</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Cotizaciones</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">35%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Horarios de Mayor Actividad</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">09:00 - 12:00</span>
                      <span className="text-sm font-medium text-gray-900">Alto</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">12:00 - 15:00</span>
                      <span className="text-sm font-medium text-gray-900">Medio</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">15:00 - 18:00</span>
                      <span className="text-sm font-medium text-gray-900">Alto</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">18:00 - 21:00</span>
                      <span className="text-sm font-medium text-gray-900">Bajo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Preguntas Frecuentes</h3>
                <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nueva FAQ
                </button>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{faq.question}</h4>
                          <span className="text-sm text-gray-500">{faq.count} consultas</span>
                        </div>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
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
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Recomendaciones de Mejora</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-blue-900">Optimizar Respuestas de Soporte</h4>
                      <p className="text-blue-800 text-sm mt-1">
                        Las consultas de soporte técnico tienen una tasa de escalación del 35%. 
                        Considera agregar más respuestas automáticas específicas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-yellow-900">Actualizar FAQs</h4>
                      <p className="text-yellow-800 text-sm mt-1">
                        Se detectaron 12 preguntas nuevas que no están en tu base de conocimiento. 
                        Añadirlas podría reducir las derivaciones manuales.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Bot className="w-5 h-5 text-green-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-green-900">Mejora en Horarios Nocturnos</h4>
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
    </div>
  );
}