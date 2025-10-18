import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customTableService, CustomTable } from '../services/customTableService';
import { Database, ChevronLeft, Loader2 } from 'lucide-react';

export default function UserTables() {
  const { clientId, userName } = useParams<{ clientId: string; userName: string }>();
  const navigate = useNavigate();
  
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<CustomTable | null>(null);

  useEffect(() => {
    if (!clientId) return;

    const fetchTables = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userTables = await customTableService.getTables(clientId);
        setTables(userTables);
        if (userTables.length > 0) {
          setActiveTable(userTables[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar las tablas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, [clientId]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center text-sm text-blue-600 hover:underline mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a Admin
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Tablas de {userName || 'Usuario'}
        </h1>
        <p className="text-gray-600">Tablas personalizadas asociadas a este cliente.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!isLoading && !error && tables.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tablas</h3>
          <p className="text-gray-600">Este usuario no tiene tablas personalizadas.</p>
        </div>
      )}

      {!isLoading && !error && tables.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* navegación de tablas */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Tablas Disponibles</h3>
              <nav className="space-y-2">
                {tables.map((table) => (
                  <button
                    key={table._id}
                    onClick={() => setActiveTable(table)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTable?._id === table._id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{table.tableName}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* contenido principal de la tabla */}
          <div className="lg:w-3/4">
            {activeTable ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{activeTable.tableName}</h2>
                  <p className="text-sm text-gray-600">{activeTable.description}</p>
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-gray-900 mb-2">Columnas</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {activeTable.fields.map(field => (
                      <li key={field.name}>
                        {field.label} (<code>{field.type}</code>)
                      </li>
                    ))}
                  </ul>
                  {/* Aquí iría la lógica para mostrar los datos de la tabla (getTableData) */}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900">Selecciona una tabla</h3>
                <p className="text-gray-600">Elige una tabla de la lista para ver sus detalles.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}