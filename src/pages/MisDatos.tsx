import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { customTableService, CustomTable, TableRecord } from '../services/customTableService';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import ExportCSVButton from '@/components/ui/export-csv-button';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function MisDatos() {
  const { user } = useAuth();
  const { navigateToChatByPhone } = useChat();
  const navigate = useNavigate();

  const [tables, setTables] = useState<CustomTable[]>([]);
  const [tableData, setTableData] = useState<TableRecord[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<CustomTable | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null);
  const [viewText, setViewText] = useState<{ label: string; value: string } | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Función para manejar click en números de teléfono
  const handlePhoneClick = async (phoneNumber: string) => {

    // Mostrar toast de carga
    const loadingToast = toast.loading('Buscando chat...', {
      description: `Buscando chat para ${phoneNumber}`
    });

    try {
      const found = await navigateToChatByPhone(phoneNumber);


      // Cerrar toast de carga
      toast.dismiss(loadingToast);

      if (found) {
        navigate('/dashboard');
        toast.success('Chat encontrado', {
          description: `Navegando al chat de ${phoneNumber}`
        });
      } else {
        toast.error('Chat no encontrado', {
          description: `No se encontró un chat para el número ${phoneNumber}`
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error', {
        description: 'Ocurrió un error al buscar el chat'
      });
    }
  };

  // Función para detectar si un campo es de teléfono
  const isPhoneField = (fieldName: string): boolean => {
    const phoneKeywords = [
      'phone', 'telefono', 'teléfono', 'tel', 'celular',
      'movil', 'móvil', 'whatsapp', 'wsp', 'contacto',
      'numero', 'número', 'fono', 'cell'
    ];
    const lowerFieldName = fieldName.toLowerCase();
    const isPhone = phoneKeywords.some(keyword => lowerFieldName.includes(keyword));

    // 🔍 DEBUG
    if (fieldName.toLowerCase().includes('tel')) {
      console.log('🔍 Detectando campo:', fieldName, '→', isPhone ? '✅ ES TELÉFONO' : '❌ NO ES TELÉFONO');
    }

    return isPhone;
  };

  // Cargar tablas del cliente
  useEffect(() => {
    const fetchTables = async () => {
      if (!user) return;

      setIsLoadingTables(true);
      setError(null);
      try {
        // Si el usuario tiene un clientId, lo usamos para obtener sus tablas
        const clientId = user.clientId;
        const fetchedTables = await customTableService.getTables(clientId);

        setTables(fetchedTables);

        // Activar la primera tabla si hay tablas disponibles
        if (fetchedTables.length > 0) {
          setActiveTable(fetchedTables[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar las tablas');
        console.error('Error loading tables:', err);
      } finally {
        setIsLoadingTables(false);
      }
    };

    fetchTables();
  }, [user]);

  // Cargar datos cuando cambia la tabla activa
  useEffect(() => {
    if (!activeTable) return;

    const fetchTableData = async () => {
      setIsLoadingData(true);
      try {
        const result = await customTableService.getTableData(
          activeTable._id,
          pagination.page,
          pagination.limit,
          searchTerm
        );

        // Los datos ya vienen ordenados desde el backend (createdAt: -1)
        // Pero si quieres asegurarte, puedes ordenarlos aquí:
        const sortedData = [...result.data].sort((a, b) => {
          // Convertir a fechas y ordenar por más reciente primero
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setTableData(sortedData);
        setPagination(result.pagination);

        // Hacer scroll al principio de la tabla cuando cambian los datos
        const tableContainer = document.querySelector(".table-container");
        if (tableContainer) {
          tableContainer.scrollTop = 0;
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar los datos de la tabla');
        console.error('Error loading table data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchTableData();
  }, [activeTable, pagination.page, searchTerm]);

  // Función para crear un nuevo registro
  const handleCreateRecord = async (formData: any) => {
    if (!activeTable) return;

    try {
      await customTableService.createRecord(activeTable._id, formData);

      // Recargar datos después de crear
      const result = await customTableService.getTableData(
        activeTable._id,
        pagination.page,
        pagination.limit,
        searchTerm
      );

      setTableData(result.data);
      setPagination(result.pagination);
      setShowAddModal(false);
      toast.success('Registro creado', { description: 'El registro se ha creado correctamente.' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el registro');
      toast.error('Error al crear', { description: err.response?.data?.message || 'Ocurrió un error al crear el registro.' });
    }
  };

  // Función para actualizar un registro
  const handleUpdateRecord = async (recordId: string, formData: any) => {
    if (!activeTable) return;

    try {
      await customTableService.updateRecord(activeTable._id, recordId, formData);

      // Recargar datos después de actualizar
      const result = await customTableService.getTableData(
        activeTable._id,
        pagination.page,
        pagination.limit,
        searchTerm
      );

      setTableData(result.data);
      setPagination(result.pagination);
      setShowAddModal(false);
      setEditingRecord(null);
      toast.success('Registro actualizado', { description: 'Los cambios se han guardado correctamente.' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el registro');
      toast.error('Error al actualizar', { description: err.response?.data?.message || 'Ocurrió un error al actualizar el registro.' });
    }
  };

  // Función para eliminar un registro
  const handleDeleteRecord = async (recordId: string) => {
    if (!activeTable) return;

    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        await customTableService.deleteRecord(activeTable._id, recordId);

        // Recargar datos después de eliminar
        const result = await customTableService.getTableData(
          activeTable._id,
          pagination.page,
          pagination.limit,
          searchTerm
        );

        setTableData(result.data);
        setPagination(result.pagination);
        toast.success('Registro eliminado', { description: 'El registro ha sido eliminado exitosamente.' });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar el registro');
        toast.error('Error al eliminar', { description: err.response?.data?.message || 'Ocurrió un error al eliminar el registro.' });
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination({ ...pagination, page: newPage });
  };

  // Exportar CSV de los datos visibles usando el componente reutilizable
  const handleExportCSV = async (): Promise<Blob> => {
    if (!activeTable) throw new Error('No hay tabla activa para exportar');
    const headers = activeTable.fields.map((f) => f.label);
    const keys = activeTable.fields.map((f) => f.name);

    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      let str = '';
      if (typeof value === 'object') {
        try { str = JSON.stringify(value); } catch { str = String(value); }
      } else if (typeof value === 'boolean') {
        str = value ? 'true' : 'false';
      } else {
        str = String(value);
      }
      str = str.replace(/"/g, '""');
      if (/[",\n\r]/.test(str)) {
        str = `"${str}"`;
      }
      return str;
    };

    const lines: string[] = [];
    lines.push(headers.join(','));
    tableData.forEach((row) => {
      const line = keys.map((k) => escapeCSV(row[k])).join(',');
      lines.push(line);
    });
    const csv = lines.join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Datos</h1>
        <p className="text-gray-600">Gestiona tus tablas de datos y registros</p>
      </div>

      {/* Mostrar error si hay alguno */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Cargando tablas */}
      {isLoadingTables && (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Sin tablas */}
      {!isLoadingTables && tables.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes tablas disponibles</h3>
          <p className="text-gray-600">Contacta al administrador para configurar tus tablas personalizadas</p>
        </div>
      )}

      {/* Tablas disponibles */}
      {!isLoadingTables && tables.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Navegación de tablas */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Tablas Disponibles</h3>
              <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-2 lg:overflow-visible">
                {tables.map((table) => (
                  <button
                    key={table._id}
                    onClick={() => setActiveTable(table)}
                    className={`px-3 py-2 rounded-lg transition-colors text-left min-w-[200px] lg:min-w-0 ${activeTable?._id === table._id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{table.tableName}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:w-3/4">
            {activeTable ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-gray-900">{activeTable.tableName}</h2>
                      <p className="text-sm text-gray-600">{tableData.length} registros</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full md:w-auto">
                      <div className="w-full sm:w-auto">
                        <ExportCSVButton
                          onExport={handleExportCSV}
                          baseFilename={activeTable.tableName || 'tabla'}
                          filenameSuffix={`pagina_${pagination.page}`}
                          onError={(message) => toast.error('Error al exportar', { description: message })}
                          onSuccess={() => toast.success('Exportado', { description: 'El archivo CSV se ha descargado correctamente.' })}
                          variant="outline"
                        />
                      </div>

                      {/* Botón de filtros eliminado por no usarse actualmente */}

                      {user?.role !== 'advisor' && (
                        <Button
                          onClick={() => {
                            setEditingRecord(null);
                            setShowAddModal(true);
                          }}
                          className="w-full sm:w-auto bg-sky-700 hover:bg-sky-800"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo registro
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar en la tabla..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Vista de datos */}
                <div className="space-y-4">
                  {/* Mobile cards */}
                  <div className="lg:hidden">
                    {isLoadingData ? (
                      <div className="flex justify-center items-center p-12">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tableData.map((row) => (
                          <div key={row._id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                            {/* Asesor Asignado Badge */}
                            {(row as any).assignedAdvisorName && (
                              <div className="mb-3 pb-3 border-b border-gray-200">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  👤 {(row as any).assignedAdvisorName}
                                </span>
                              </div>
                            )}
                            <div className="space-y-3">
                              {activeTable.fields.map((field) => {
                                const rawValue = row[field.name];
                                const isString = typeof rawValue === 'string';
                                const isNumber = typeof rawValue === 'number';
                                const isObject = rawValue && typeof rawValue === 'object';
                                const isPhoneColumn = isPhoneField(field.name);
                                // 🔑 NUEVO: Permitir click en teléfonos que sean string O number
                                const canClickPhone = isPhoneColumn && (isString || isNumber);

                                let display = '';
                                let fullText = '';
                                if (isString) {
                                  fullText = rawValue as string;
                                  display = fullText.length > 120 ? `${fullText.slice(0, 120)}…` : fullText;
                                } else if (isNumber) {
                                  // 🔑 NUEVO: Convertir números a string
                                  fullText = String(rawValue);
                                  display = fullText;
                                } else if (isObject) {
                                  try {
                                    fullText = JSON.stringify(rawValue);
                                    display = fullText.length > 120 ? `${fullText.slice(0, 120)}…` : fullText;
                                  } catch {
                                    fullText = String(rawValue);
                                    display = fullText;
                                  }
                                } else if (rawValue !== undefined && rawValue !== null) {
                                  fullText = String(rawValue);
                                  display = fullText.length > 120 ? `${fullText.slice(0, 120)}…` : fullText;
                                }

                                const isTruncated = fullText.length > 120;

                                return (
                                  <div key={field.name} className="text-sm text-gray-900">
                                    <p className="font-medium text-gray-600 uppercase tracking-wide text-xs mb-1">
                                      {field.label}
                                    </p>
                                    <div className="flex items-start gap-2">
                                      {canClickPhone ? (
                                        <button
                                          type="button"
                                          onClick={() => handlePhoneClick(fullText)}
                                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                                        >
                                          {display}
                                        </button>
                                      ) : (
                                        <span>{display || <span className="text-gray-400">Sin datos</span>}</span>
                                      )}
                                      {isTruncated && !canClickPhone && (
                                        <button
                                          type="button"
                                          onClick={() => setViewText({ label: field.label, value: fullText })}
                                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                                        >
                                          Ver más
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {user?.role !== 'advisor' && (
                              <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingRecord(row);
                                    setShowAddModal(true);
                                  }}
                                  className="flex items-center justify-center gap-2 rounded-md border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteRecord(row._id)}
                                  className="flex items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden lg:block">
                    {isLoadingData ? (
                      <div className="flex justify-center items-center p-12">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <div className="table-container max-h-[500px] overflow-y-auto">
                        <div className="overflow-x-auto">
                          <table className="w-full table-fixed">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                              <tr>
                                {activeTable.fields.map((field) => (
                                  <th
                                    key={field.name}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    {field.label}
                                  </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Asesor
                                </th>
                                {user?.role !== 'advisor' && (
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {tableData.map((row) => (
                                <tr key={row._id} className="hover:bg-gray-50">
                                  {activeTable.fields.map((field) => {
                                    const rawValue = row[field.name];
                                    const isString = typeof rawValue === 'string';
                                    const isNumber = typeof rawValue === 'number';
                                    const isObject = rawValue && typeof rawValue === 'object';
                                    const isPhoneColumn = isPhoneField(field.name);
                                    // 🔑 NUEVO: Permitir click en teléfonos que sean string O number
                                    const canClickPhone = isPhoneColumn && (isString || isNumber);

                                    let display = '';
                                    let fullText = '';
                                    if (isString) {
                                      fullText = rawValue as string;
                                      display = fullText.length > 100 ? `${fullText.slice(0, 100)}…` : fullText;
                                    } else if (isNumber) {
                                      // 🔑 NUEVO: Convertir números a string
                                      fullText = String(rawValue);
                                      display = fullText;
                                    } else if (isObject) {
                                      try {
                                        fullText = JSON.stringify(rawValue);
                                        display = fullText.length > 100 ? `${fullText.slice(0, 100)}…` : fullText;
                                      } catch {
                                        fullText = String(rawValue);
                                        display = fullText;
                                      }
                                    } else if (rawValue !== undefined && rawValue !== null) {
                                      fullText = String(rawValue);
                                      display = fullText.length > 100 ? `${fullText.slice(0, 100)}…` : fullText;
                                    }

                                    const isTruncated = fullText.length > 100;

                                    return (
                                      <td
                                        key={field.name}
                                        className="px-6 py-4 text-sm text-gray-900 align-top whitespace-normal break-words max-w-xs"
                                      >
                                        <div className="flex items-start gap-2">
                                          {canClickPhone ? (
                                            <button
                                              type="button"
                                              onClick={() => handlePhoneClick(fullText)}
                                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                                            >
                                              {display}
                                            </button>
                                          ) : (
                                            <span>{display}</span>
                                          )}
                                          {isTruncated && !canClickPhone && (
                                            <button
                                              type="button"
                                              onClick={() => setViewText({ label: field.label, value: fullText })}
                                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                                            >
                                              Ver más
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    );
                                  })}

                                  {/* Columna de Asesor Asignado */}
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {(row as any).assignedAdvisorName ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {(row as any).assignedAdvisorName}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-xs">Sin asignar</span>
                                    )}
                                  </td>

                                  {/* Columna de Acciones */}
                                  {user?.role !== 'advisor' && (
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
                                        <button
                                          onClick={() => handleDeleteRecord(row._id)}
                                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Paginación mejorada */}
                {tableData.length > 0 && (
                  <div className="px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{tableData.length}</span> de{' '}
                      <span className="font-medium">{pagination.total}</span> registros
                    </div>
                    <div className="flex items-center flex-wrap gap-1">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        title="Primera página"
                      >
                        &laquo;
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      >
                        &lsaquo;
                      </button>

                      {/* Mostrar números de página */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                        // Calcular qué números mostrar (centrados alrededor de la página actual)
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          // Si hay 5 o menos páginas, mostrar todas
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          // Si estamos en las primeras 3 páginas, mostrar 1-5
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          // Si estamos en las últimas 3 páginas, mostrar las últimas 5
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          // De lo contrario, mostrar 2 páginas antes y 2 después
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 border rounded-md text-sm ${pagination.page === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      >
                        &rsaquo;
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        title="Última página"
                      >
                        &raquo;
                      </button>
                    </div>
                  </div>
                )}

                {/* Estado vacío */}
                {!isLoadingData && tableData.length === 0 && (
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
      )}

      {/* Modal para Agregar/Editar Registro */}
      {/* Dialog reutilizando componentes UI */}
      <Dialog open={showAddModal && !!activeTable} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setEditingRecord(null);
        } else {
          setShowAddModal(true);
        }
      }}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Editar registro' : 'Nuevo registro'}</DialogTitle>
            <DialogDescription>
              {editingRecord ? 'Modifica los campos necesarios y guarda los cambios.' : 'Completa los campos para agregar un nuevo registro.'}
            </DialogDescription>
          </DialogHeader>

          {activeTable && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData: Record<string, any> = {};
                activeTable.fields.forEach(field => {
                  const inputElement = (e.currentTarget.elements.namedItem(field.name) as (HTMLInputElement | HTMLTextAreaElement) | null);
                  if (inputElement) {
                    let resultValue: string | number | boolean = (inputElement as HTMLInputElement).value;
                    if (field.type === 'number' && (inputElement as HTMLInputElement).value) {
                      resultValue = parseFloat((inputElement as HTMLInputElement).value);
                    } else if (field.type === 'boolean') {
                      resultValue = (inputElement as HTMLInputElement).checked;
                    }
                    formData[field.name] = resultValue;
                  }
                });

                if (editingRecord) {
                  handleUpdateRecord(editingRecord._id, formData);
                } else {
                  handleCreateRecord(formData);
                }
              }}
              className="space-y-4"
            >
              {activeTable.fields.map((field) => {
                let inputType = 'text';
                if (field.type === 'number') inputType = 'number';
                if (field.type === 'email') inputType = 'email';
                if (field.type === 'date') inputType = 'date';

                if (field.type === 'boolean') {
                  return (
                    <div key={field.name} className="flex items-center">
                      <input
                        type="checkbox"
                        id={field.name}
                        name={field.name}
                        defaultChecked={editingRecord ? editingRecord[field.name] : false}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Label htmlFor={field.name} className="ml-2">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                    </div>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field.name}>
                      <Label className="mb-1 block">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      <textarea
                        name={field.name}
                        defaultValue={editingRecord ? editingRecord[field.name] : ''}
                        required={field.required}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        rows={4}
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.name}>
                    <Label className="mb-1 block">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      type={inputType}
                      name={field.name}
                      defaultValue={editingRecord ? editingRecord[field.name] : ''}
                      required={field.required}
                    />
                  </div>
                );
              })}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  className='bg-red-700 hover:bg-red-800 hover:cursor-pointer hover:text-white text-white'
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sky-700 hover:bg-sky-800 hover:cursor-pointer">
                  {editingRecord ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Modal Ver más */}
      {viewText && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{viewText.label}</h3>
              <button
                type="button"
                onClick={() => setViewText(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words text-sm text-gray-800">{viewText.value}</pre>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewText(null)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

