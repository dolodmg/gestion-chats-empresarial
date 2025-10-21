import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Filter, Trash2, Mail, Calendar, Loader2, X } from 'lucide-react';
import { inscriptionService, type Inscription } from '../services/inscriptionService';
import { toast } from 'sonner';
import ExportCSVButton from '@/components/ui/export-csv-button';
import CreateInscriptionDialog from '@/components/inscriptions/CreateInscriptionDialog';

const PROVINCIAS = [
  { value: 'todas', label: 'Todas las provincias' },
  { value: 'buenos aires', label: 'Buenos Aires' },
  { value: 'caba', label: 'CABA' },
  { value: 'cordoba', label: 'Córdoba' },
  { value: 'santa fe', label: 'Santa Fe' },
  { value: 'tucuman', label: 'Tucumán' },
  { value: 'entre rios', label: 'Entre Ríos' },
  { value: 'neuquen', label: 'Neuquén' },
  { value: 'rio negro', label: 'Río Negro' },
  { value: 'misiones', label: 'Misiones' },
  { value: 'corrientes', label: 'Corrientes' },
  { value: 'formosa', label: 'Formosa' },
  { value: 'chaco', label: 'Chaco' },
  { value: 'catamarca', label: 'Catamarca' },
  { value: 'la rioja', label: 'La Rioja' },
  { value: 'santiago del estero', label: 'Santiago del Estero' },
  { value: 'salta', label: 'Salta' },
  { value: 'jujuy', label: 'Jujuy' },
  { value: 'san juan', label: 'San Juan' },
  { value: 'san luis', label: 'San Luis' },
  { value: 'la pampa', label: 'La Pampa' },
  { value: 'mendoza', label: 'Mendoza' },
  { value: 'chubut', label: 'Chubut' },
  { value: 'santa cruz', label: 'Santa Cruz' },
  { value: 'tierra del fuego', label: 'Tierra del Fuego' },
  { value: 'otros', label: 'Otros países/estados' },
];

export default function Inscripciones() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Array<{ name: string; normalizedName: string; count: number }>>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [provinciaFilter, setProvinciaFilter] = useState('todas');
  const [cursoFilter, setCursoFilter] = useState('todos');
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const hasActiveFilters = searchTerm.trim() !== '' || provinciaFilter !== 'todas' || cursoFilter !== 'todos';

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await inscriptionService.getCourses();
        if (res.success && res.courses) {
          setCourses(res.courses);
        }
      } catch (err) {
        console.error('Error cargando cursos:', err);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    fetchInscriptions();
  }, [pagination.page, pagination.limit, searchTerm, provinciaFilter, cursoFilter]);

  const fetchInscriptions = async () => {
    setIsLoadingData(true);
    try {
      const filters: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchTerm.trim()) filters.dni = searchTerm.trim();
      if (provinciaFilter && provinciaFilter !== 'todas') filters.provincia = provinciaFilter;
      if (cursoFilter && cursoFilter !== 'todos') filters.curso = cursoFilter;

      const result = await inscriptionService.getInscriptions(filters);
      
      setInscriptions(result.inscriptions);
      setPagination(result.pagination);
      
      const tableContainer = document.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.scrollTop = 0;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar las inscripciones');
      console.error('Error loading inscriptions:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDeleteInscription = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta inscripción?')) {
      return;
    }
    
    try {
      await inscriptionService.deleteInscription(id);
      toast.success("Inscripción eliminada", {
        description: "La inscripción ha sido eliminada exitosamente.",
      });
      fetchInscriptions();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Error al eliminar la inscripción';
      setError(errorMessage);
      toast.error("Error al eliminar", { description: errorMessage });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination({ ...pagination, page: newPage });
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination({ ...pagination, page: 1, limit: newLimit });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setProvinciaFilter('todas');
    setCursoFilter('todos');
    setPagination({ ...pagination, page: 1 });
  };

  const handleExportWithFilters = async (): Promise<Blob> => {
    const filters: any = {};
    
    if (searchTerm.trim()) filters.dni = searchTerm.trim();
    if (provinciaFilter && provinciaFilter !== 'todas') filters.provincia = provinciaFilter;
    if (cursoFilter && cursoFilter !== 'todos') filters.curso = cursoFilter;

    return await inscriptionService.exportToCSV(filters);
  };

  const getFilenameSuffix = () => {
    const parts: string[] = [];
    
    if (provinciaFilter && provinciaFilter !== 'todas') {
      parts.push(provinciaFilter.replace(/\s+/g, '_'));
    }
    if (cursoFilter && cursoFilter !== 'todos') {
      parts.push(cursoFilter.replace(/\s+/g, '_'));
    }
    if (searchTerm.trim()) {
      parts.push(`dni_${searchTerm.trim()}`);
    }
    
    return parts.length > 0 ? parts.join('_') : '';
  };

  return (
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscripciones</h1>
        <p className="text-gray-600">Gestiona las inscripciones de clientes</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center justify-between flex-shrink-0">
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Página</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.page} / {pagination.totalPages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">En esta página</p>
              <p className="text-2xl font-bold text-gray-900">{inscriptions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lista de Inscripciones</h2>
              <p className="text-sm text-gray-600">{inscriptions.length} registros</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <ExportCSVButton
                onExport={handleExportWithFilters}
                baseFilename="inscripciones"
                filenameSuffix={getFilenameSuffix()}
                onError={(error) => toast.error("Error al exportar", { description: error })}
                onSuccess={() => toast.success("Exportado", { description: "El archivo CSV se ha descargado correctamente." })}
                disabled={isLoadingData}
              />
              
              <CreateInscriptionDialog onInscriptionCreated={fetchInscriptions} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por DNI</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <select
                value={provinciaFilter}
                onChange={(e) => {
                  setProvinciaFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PROVINCIAS.map((prov) => (
                  <option key={prov.value} value={prov.value}>
                    {prov.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                value={cursoFilter}
                onChange={(e) => {
                  setCursoFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos los cursos</option>
                {courses.map((course) => (
                  <option key={course.normalizedName} value={course.normalizedName}>
                    {course.name} ({course.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mostrar</label>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoadingData ? (
            <div className="flex justify-center items-center flex-1">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="table-container flex-1 overflow-y-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">DNI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">Nombre Completo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Correo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Provincia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Localidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inscriptions.map((insc) => (
                    <tr key={insc._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 align-top whitespace-normal break-words">{insc.dni}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top whitespace-normal break-words">{insc.nombreCompleto}</td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center text-sm text-gray-900 whitespace-normal break-words">
                          <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span>{insc.correo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize align-top whitespace-normal break-words">{insc.provincia}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 align-top whitespace-normal break-words">{insc.localidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 align-top whitespace-normal break-words">{insc.curso}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 align-top">
                        {insc.createdAt ? format(new Date(insc.createdAt), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                        <button
                          onClick={() => handleDeleteInscription(insc._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoadingData && inscriptions.length === 0 && (
            <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron inscripciones</h3>
              <p className="text-gray-600">Intenta cambiar los términos de búsqueda o filtros</p>
            </div>
          )}
        </div>

        {inscriptions.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 flex-shrink-0">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{inscriptions.length}</span> de{' '}
              <span className="font-medium">{pagination.total}</span> registros
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Primera página"
              >
                &laquo;
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                &lsaquo;
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      pagination.page === pageNum 
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
                className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                &rsaquo;
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page === pagination.totalPages}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                title="Última página"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}