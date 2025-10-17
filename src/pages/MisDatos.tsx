import React, { useState } from 'react';
import { DataTable } from '../types';
import { Plus, Edit2, Trash2, Search, Download, Filter } from 'lucide-react';

export default function MisDatos() {
  const [dataTables] = useState<DataTable[]>([
    {
      id: '1',
      name: 'Clientes',
      columns: ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Fecha Registro'],
      data: [
        { 
          id: '1', 
          Nombre: 'Juan Pérez', 
          Email: 'juan@email.com', 
          Teléfono: '+54 11 1234-5678', 
          Empresa: 'Tech Corp',
          'Fecha Registro': '2024-01-15'
        },
        { 
          id: '2', 
          Nombre: 'Ana López', 
          Email: 'ana@email.com', 
          Teléfono: '+54 11 8765-4321', 
          Empresa: 'Innovate SA',
          'Fecha Registro': '2024-01-20'
        },
        { 
          id: '3', 
          Nombre: 'Carlos Martinez', 
          Email: 'carlos@email.com', 
          Teléfono: '+54 11 5555-1111', 
          Empresa: 'Digital Plus',
          'Fecha Registro': '2024-01-25'
        }
      ]
    },
    {
      id: '2',
      name: 'Productos',
      columns: ['Nombre', 'Precio', 'Categoría', 'Stock', 'Estado'],
      data: [
        { 
          id: '1', 
          Nombre: 'Laptop Pro', 
          Precio: '$1200', 
          Categoría: 'Tecnología', 
          Stock: '15',
          Estado: 'Disponible'
        },
        { 
          id: '2', 
          Nombre: 'Mouse Inalámbrico', 
          Precio: '$25', 
          Categoría: 'Accesorios', 
          Stock: '50',
          Estado: 'Disponible'
        },
        { 
          id: '3', 
          Nombre: 'Monitor 4K', 
          Precio: '$300', 
          Categoría: 'Pantallas', 
          Stock: '8',
          Estado: 'Bajo Stock'
        }
      ]
    }
  ]);

  const [activeTable, setActiveTable] = useState<DataTable | null>(dataTables[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const filteredData = activeTable?.data.filter(row =>
    Object.values(row).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Datos</h1>
        <p className="text-gray-600">Gestiona tus tablas de datos y registros</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Tablas Disponibles</h3>
            <nav className="space-y-2">
              {dataTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setActiveTable(table)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTable?.id === table.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{table.name}</span>
                    <span className="text-sm text-gray-500">{table.data.length}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {activeTable ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{activeTable.name}</h2>
                    <p className="text-sm text-gray-600">{activeTable.data.length} registros</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </button>
                    
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditingRecord(null);
                        setShowAddModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Registro
                    </button>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar en la tabla..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {activeTable.columns.map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {activeTable.columns.map((column) => (
                          <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[column]}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingRecord(row);
                                setShowAddModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredData.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-600">Intenta cambiar los términos de búsqueda</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una tabla</h3>
              <p className="text-gray-600">Elige una tabla de la lista para ver y editar los datos</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingRecord ? 'Editar Registro' : 'Nuevo Registro'}
            </h3>
            <div className="space-y-4">
              {activeTable?.columns.map((column) => (
                <div key={column}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column}
                  </label>
                  <input
                    type="text"
                    defaultValue={editingRecord?.[column] || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                {editingRecord ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}