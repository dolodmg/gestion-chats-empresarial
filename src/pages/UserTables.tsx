import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customTableService, CustomTable, CreateTableData, TableField } from '../services/customTableService';
import CreateTableModal, { TableFormData } from '@/components/tables/CreateTable';
import DeleteTableDialog from '@/components/tables/DeleteTableDialog';
import AddFieldModal from '@/components/tables/AddFieldModal';
import { Database, ChevronLeft, Loader2, Plus, Trash2, Type, Hash, Calendar, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const FIELD_TYPE_ICONS: Record<string, any> = {
  string: Type,
  number: Hash,
  date: Calendar,
  boolean: ToggleLeft,
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  string: 'Texto',
  number: 'Número',
  boolean: 'Verdadero/Falso',
  date: 'Fecha'
};

export default function UserTables() {
  const { clientId, userName } = useParams<{ clientId: string; userName: string }>();
  const navigate = useNavigate();
  
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<CustomTable | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<CustomTable | null>(null);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  
  useEffect(() => {
    if (!clientId) return;
    fetchTables();
  }, [clientId]);

  const fetchTables = async () => {
    if (!clientId) return;
    setIsLoading(true);
    setError(null);
    try {
      const userTables = await customTableService.getTables(clientId);
      setTables(userTables);
      
      if (!activeTable || !userTables.some(t => t._id === activeTable._id)) {
        setActiveTable(userTables.length > 0 ? userTables[0] : null);
      } else {
        const updated = userTables.find(t => t._id === activeTable._id);
        if (updated) setActiveTable(updated);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las tablas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async (formData: TableFormData) => {
    if (!clientId) {
      toast.error("Error", { description: "Falta el ID del cliente para crear la tabla." });
      return;
    }
    if (!formData.fields || formData.fields.length === 0) {
      toast.error("Error", { description: "Debe agregar al menos un campo a la tabla." });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave: CreateTableData = {
        tableName: formData.tableName,
        collectionName: formData.collectionName, 
        description: formData.description,
        clientId: clientId,
        fields: formData.fields
      };
      const newTable = await customTableService.createTable(dataToSave);
      toast.success("Tabla Creada", { description: `La tabla "${newTable.tableName}" ha sido creada.` });
      setIsCreateModalOpen(false);
      await fetchTables();
    } catch (err: any) {
      toast.error("Error al crear la tabla", {
        description: err.response?.data?.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDeleteDialog = (table: CustomTable) => {
    setTableToDelete(table);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return;
    
    setIsDeleting(true);
    try {
        await customTableService.deleteTable(tableToDelete._id);
        toast.success("Tabla eliminada", { description: `La tabla "${tableToDelete.tableName}" fue eliminada.`});
        setIsDeleteDialogOpen(false);
        setTableToDelete(null);
        if (activeTable?._id === tableToDelete._id) {
          setActiveTable(null);
        }
        await fetchTables(); 
    } catch (err: any) {
         toast.error("Error al eliminar", { description: err.response?.data?.message || "Ocurrió un error." });
    } finally {
        setIsDeleting(false);
    }
  };

  const handleAddField = async (newFields: TableField[]) => {
    if (!activeTable) return;
    
    setIsSaving(true);
    try {
      // Combinar campos existentes con los nuevos
      const updatedFields = [...activeTable.fields, ...newFields];
      
      // Llamar al servicio para actualizar la tabla
      await customTableService.updateTableData(activeTable._id, {
        fields: updatedFields
      });
      
      toast.success("Campos agregados", { 
        description: `Se ${newFields.length === 1 ? 'agregó 1 campo nuevo' : `agregaron ${newFields.length} campos nuevos`} correctamente.` 
      });
      
      setIsAddFieldModalOpen(false);
      await fetchTables();
    } catch (err: any) {
      toast.error("Error al agregar campos", {
        description: err.response?.data?.error || err.response?.data?.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldIcon = (type: string) => {
    const Icon = FIELD_TYPE_ICONS[type] || Type;
    return Icon;
  };

  return (
    <>
      <div className="p-6">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center text-sm text-blue-600 hover:underline mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a Admin
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Tablas de {userName || 'Usuario'}
              </h1>
              <p className="text-gray-600">Tablas personalizadas asociadas a este cliente.</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-sky-700 hover:bg-sky-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar tabla
            </Button>
          </div>
        </div>

        {isLoading && ( <div className="flex justify-center items-center p-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div> )}

        {error && ( <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div> )}

        {!isLoading && !error && tables.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tablas</h3>
            <p className="text-gray-600">Este usuario no tiene tablas. ¡Crea una!</p>
          </div>
        )}

        {!isLoading && !error && tables.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar de tablas */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">Tablas disponibles</h3>
                <nav className="space-y-2">
                  {tables.map((table) => (
                    <div key={table._id} className="group flex items-center justify-between rounded-lg hover:bg-gray-100">
                      <button
                        onClick={() => setActiveTable(table)}
                        className={`w-full text-left px-3 py-2 transition-colors rounded-l-lg ${
                          activeTable?._id === table._id ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span className="truncate pr-2">{table.tableName}</span>
                      </button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`text-red-500 hover:text-red-700 h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${activeTable?._id === table._id ? 'opacity-100' : ''}`}
                        onClick={() => handleOpenDeleteDialog(table)}
                        title="Eliminar tabla"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:w-3/4">
              {activeTable ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Header de la tabla */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">{activeTable.tableName}</h2>
                        <p className="text-sm text-gray-600">{activeTable.description || 'Sin descripción'}</p>
                      </div>
                      <Button
                        onClick={() => setIsAddFieldModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="text-sky-700 border-sky-700 hover:bg-sky-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar campo
                      </Button>             
                    </div>
                  </div>

                  {/* Campos de la tabla */}
                  <div className="p-6">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      Campos de la tabla ({activeTable.fields.length})
                    </h3>
                    
                    {activeTable.fields.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeTable.fields.map(field => {
                          const Icon = getFieldIcon(field.type);
                          return (
                            <div 
                              key={field.name} 
                              className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div className="mt-1 p-2 bg-sky-50 rounded-lg">
                                    <Icon className="w-4 h-4 text-sky-700" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-gray-900 truncate">{field.label}</h4>
                                      {field.required && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                          Requerido
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      <code className="bg-gray-100 px-1.5 py-0.5 rounded">{field.name}</code>
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {FIELD_TYPE_LABELS[field.type] || field.type}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : ( 
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className='text-sm text-gray-500 mb-3'>Esta tabla aún no tiene campos definidos.</p>
                        <Button
                          onClick={() => setIsAddFieldModalOpen(true)}
                          size="sm"
                          className="bg-sky-700 hover:bg-sky-800"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar primer campo
                        </Button>
                      </div> 
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una tabla</h3>
                  <p className="text-gray-600">Elige una tabla de la lista para ver sus detalles.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateTableModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreateTable}
        isSaving={isSaving}
      />
      
      <DeleteTableDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        tableName={tableToDelete?.tableName || ''}
        isDeleting={isDeleting}
      />

      <AddFieldModal
        open={isAddFieldModalOpen}
        onOpenChange={setIsAddFieldModalOpen}
        onSave={handleAddField}
        isSaving={isSaving}
        tableId={activeTable?._id || ''}
        tableName={activeTable?.tableName || ''}
        existingFields={activeTable?.fields || []}
      />
    </>
  );
}