import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import advisorService, {
    Advisor,
    AdvisorConfig,
    AdvisorTableAssignment,
} from '../services/advisorService';
import { customTableService, CustomTable } from '../services/customTableService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Users, UserPlus, Loader2, UserCheck, UserX } from 'lucide-react';

export default function Asesores() {
    const { user } = useAuth();

    // Estados
    const [config, setConfig] = useState<AdvisorConfig | null>(null);
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [tables, setTables] = useState<CustomTable[]>([]);
    const [assignments, setAssignments] = useState<Record<string, AdvisorTableAssignment[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'advisors' | 'assignments'>('advisors');

    // Modales
    const [showAdvisorModal, setShowAdvisorModal] = useState(false);
    const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedTable, setSelectedTable] = useState<CustomTable | null>(null);

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [configData, advisorsData, tablesData] = await Promise.all([
                advisorService.getConfig(),
                advisorService.getAdvisors(),
                customTableService.getTables(user?.clientId || ''),
            ]);

            setConfig(configData);
            setAdvisors(advisorsData);
            setTables(tablesData);

            // Cargar asignaciones para cada tabla
            const assignmentsData: Record<string, AdvisorTableAssignment[]> = {};
            for (const table of tablesData) {
                const tableAssignments = await advisorService.getTableAssignments(table._id);
                assignmentsData[table._id] = tableAssignments;
            }
            setAssignments(assignmentsData);
        } catch (error: any) {
            toast.error('Error al cargar datos', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Toggle módulo
    const handleToggleModule = async (enabled: boolean) => {
        try {
            const updated = await advisorService.updateConfig(enabled);
            setConfig(updated);
            toast.success(
                enabled ? 'Módulo habilitado' : 'Módulo deshabilitado',
                { description: enabled ? 'Los asesores se asignarán automáticamente' : 'No se asignarán asesores automáticamente' }
            );
        } catch (error: any) {
            toast.error('Error al actualizar configuración', { description: error.message });
        }
    };

    // CRUD Asesores
    const handleCreateAdvisor = async (formData: { name: string; email?: string; phone?: string }) => {
        try {
            await advisorService.createAdvisor(formData);
            await loadData();
            setShowAdvisorModal(false);
            toast.success('Asesor creado correctamente');
        } catch (error: any) {
            toast.error('Error al crear asesor', { description: error.message });
        }
    };

    const handleUpdateAdvisor = async (
        id: string,
        data: { name?: string; email?: string; phone?: string; active?: boolean }
    ) => {
        try {
            await advisorService.updateAdvisor(id, data);
            await loadData();
            setEditingAdvisor(null);
            setShowAdvisorModal(false);
            toast.success('Asesor actualizado correctamente');
        } catch (error: any) {
            toast.error('Error al actualizar asesor', { description: error.message });
        }
    };

    const handleDeleteAdvisor = async (id: string, name: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar al asesor "${name}"?`)) return;

        try {
            await advisorService.deleteAdvisor(id);
            await loadData();
            toast.success('Asesor eliminado correctamente');
        } catch (error: any) {
            toast.error('Error al eliminar asesor', { description: error.message });
        }
    };

    const handleToggleAdvisorActive = async (advisor: Advisor) => {
        try {
            await advisorService.updateAdvisor(advisor._id, { active: !advisor.active });
            await loadData();
            toast.success(
                advisor.active ? 'Asesor desactivado' : 'Asesor activado',
                { description: advisor.active ? 'No recibirá nuevas asignaciones' : 'Volverá a recibir asignaciones' }
            );
        } catch (error: any) {
            toast.error('Error al cambiar estado', { description: error.message });
        }
    };

    // Asignaciones
    const handleAssignToTable = async (advisorId: string, tableId: string) => {
        try {
            await advisorService.assignToTable(advisorId, tableId);
            await loadData();
            toast.success('Asesor asignado a la tabla');
        } catch (error: any) {
            toast.error('Error al asignar', { description: error.message });
        }
    };

    const handleRemoveFromTable = async (assignmentId: string, advisorName: string) => {
        if (!window.confirm(`¿Quitar a "${advisorName}" de esta tabla?`)) return;

        try {
            await advisorService.removeFromTable(assignmentId);
            await loadData();
            toast.success('Asesor removido de la tabla');
        } catch (error: any) {
            toast.error('Error al remover', { description: error.message });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Asesores</h1>
                        <p className="text-gray-600">
                            Gestiona los asesores y su asignación automática a las tablas
                        </p>
                    </div>

                    {/* Toggle módulo */}
                    <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
                        <Label htmlFor="module-toggle" className="text-sm font-medium">
                            Módulo {config?.enabled ? 'habilitado' : 'deshabilitado'}
                        </Label>
                        <Switch
                            id="module-toggle"
                            checked={config?.enabled || false}
                            onCheckedChange={handleToggleModule}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('advisors')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'advisors'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Asesores ({advisors.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assignments'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <UserPlus className="w-4 h-4 inline mr-2" />
                            Asignaciones a Tablas
                        </button>
                    </nav>
                </div>
            </div>

            {/* Contenido de tabs */}
            {activeTab === 'advisors' && (
                <AdvisorsTab
                    advisors={advisors}
                    onAdd={() => {
                        setEditingAdvisor(null);
                        setShowAdvisorModal(true);
                    }}
                    onEdit={(advisor) => {
                        setEditingAdvisor(advisor);
                        setShowAdvisorModal(true);
                    }}
                    onDelete={handleDeleteAdvisor}
                    onToggleActive={handleToggleAdvisorActive}
                />
            )}

            {activeTab === 'assignments' && (
                <AssignmentsTab
                    tables={tables}
                    assignments={assignments}
                    onRemove={handleRemoveFromTable}
                    onSelectTable={(table) => {
                        setSelectedTable(table);
                        setShowAssignmentModal(true);
                    }}
                />
            )}

            {/* Modal Crear/Editar Asesor */}
            <AdvisorModal
                open={showAdvisorModal}
                advisor={editingAdvisor}
                onClose={() => {
                    setShowAdvisorModal(false);
                    setEditingAdvisor(null);
                }}
                onCreate={handleCreateAdvisor}
                onUpdate={handleUpdateAdvisor}
            />

            {/* Modal Asignar a Tabla */}
            <AssignmentModal
                open={showAssignmentModal}
                table={selectedTable}
                advisors={advisors}
                currentAssignments={selectedTable ? assignments[selectedTable._id] || [] : []}
                onClose={() => {
                    setShowAssignmentModal(false);
                    setSelectedTable(null);
                }}
                onAssign={handleAssignToTable}
            />
        </div>
    );
}

// Componente Tab de Asesores
function AdvisorsTab({
    advisors,
    onAdd,
    onEdit,
    onDelete,
    onToggleActive,
}: {
    advisors: Advisor[];
    onAdd: () => void;
    onEdit: (advisor: Advisor) => void;
    onDelete: (id: string, name: string) => void;
    onToggleActive: (advisor: Advisor) => void;
}) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Lista de Asesores</h2>
                    <Button onClick={onAdd} className="bg-sky-700 hover:bg-sky-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Asesor
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Teléfono
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {advisors.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No hay asesores creados. Haz clic en "Nuevo Asesor" para comenzar.
                                </td>
                            </tr>
                        ) : (
                            advisors.map((advisor) => (
                                <tr key={advisor._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{advisor.email || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{advisor.phone || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => onToggleActive(advisor)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${advisor.active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {advisor.active ? (
                                                <>
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                    Activo
                                                </>
                                            ) : (
                                                <>
                                                    <UserX className="w-3 h-3 mr-1" />
                                                    Inactivo
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => onEdit(advisor)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(advisor._id, advisor.name)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Componente Tab de Asignaciones
function AssignmentsTab({
    tables,
    assignments,
    onRemove,
    onSelectTable,
}: {
    tables: CustomTable[];
    assignments: Record<string, AdvisorTableAssignment[]>;
    onRemove: (assignmentId: string, advisorName: string) => void;
    onSelectTable: (table: CustomTable) => void;
}) {
    return (
        <div className="space-y-4">
            {tables.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">No hay tablas disponibles en "Mis Datos"</p>
                </div>
            ) : (
                tables.map((table) => {
                    const tableAssignments = assignments[table._id] || [];
                    return (
                        <div key={table._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{table.tableName}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {tableAssignments.length} asesor(es) asignado(s)
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => onSelectTable(table)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Asignar Asesor
                                    </Button>
                                </div>
                            </div>

                            {tableAssignments.length > 0 && (
                                <div className="p-6">
                                    <div className="space-y-2">
                                        {tableAssignments.map((assignment, index) => (
                                            <div
                                                key={assignment._id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {assignment.advisorId.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {assignment.advisorId.active ? 'Activo' : 'Inactivo'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        onRemove(assignment._id, assignment.advisorId.name)
                                                    }
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

// Modal Crear/Editar Asesor
function AdvisorModal({
    open,
    advisor,
    onClose,
    onCreate,
    onUpdate,
}: {
    open: boolean;
    advisor: Advisor | null;
    onClose: () => void;
    onCreate: (data: { name: string; email?: string; phone?: string }) => void;
    onUpdate: (id: string, data: { name?: string; email?: string; phone?: string }) => void;
}) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (advisor) {
            setFormData({
                name: advisor.name,
                email: advisor.email || '',
                phone: advisor.phone || '',
            });
        } else {
            setFormData({ name: '', email: '', phone: '' });
        }
    }, [advisor, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (advisor) {
            onUpdate(advisor._id, formData);
        } else {
            onCreate(formData);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{advisor ? 'Editar Asesor' : 'Nuevo Asesor'}</DialogTitle>
                    <DialogDescription>
                        {advisor
                            ? 'Modifica los datos del asesor'
                            : 'Completa los datos del nuevo asesor'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">
                            Nombre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Juan Pérez"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="juan@ejemplo.com"
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+54 11 1234-5678"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-sky-700 hover:bg-sky-800">
                            {advisor ? 'Guardar' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Modal Asignar a Tabla
function AssignmentModal({
    open,
    table,
    advisors,
    currentAssignments,
    onClose,
    onAssign,
}: {
    open: boolean;
    table: CustomTable | null;
    advisors: Advisor[];
    currentAssignments: AdvisorTableAssignment[];
    onClose: () => void;
    onAssign: (advisorId: string, tableId: string) => void;
}) {
    const [selectedAdvisorId, setSelectedAdvisorId] = useState('');

    const assignedAdvisorIds = currentAssignments.map((a) => a.advisorId._id);
    const availableAdvisors = advisors.filter(
        (a) => !assignedAdvisorIds.includes(a._id)
    );

    const handleAssign = () => {
        if (selectedAdvisorId && table) {
            onAssign(selectedAdvisorId, table._id);
            setSelectedAdvisorId('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Asignar Asesor a Tabla</DialogTitle>
                    <DialogDescription>
                        Tabla: <strong>{table?.tableName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="advisor">Selecciona un asesor</Label>
                        <select
                            id="advisor"
                            value={selectedAdvisorId}
                            onChange={(e) => setSelectedAdvisorId(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="">-- Seleccionar --</option>
                            {availableAdvisors.map((advisor) => (
                                <option key={advisor._id} value={advisor._id}>
                                    {advisor.name} {!advisor.active && '(Inactivo)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {availableAdvisors.length === 0 && (
                        <p className="text-sm text-gray-500">
                            Todos los asesores ya están asignados a esta tabla
                        </p>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedAdvisorId}
                            className="bg-sky-700 hover:bg-sky-800"
                        >
                            Asignar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
