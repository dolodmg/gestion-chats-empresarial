import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../services/authService';
import { userService } from '../services/userService';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import { Edit2, Trash2, ShieldCheck, UserX, Database, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeleteUserDialog from '@/components/users/DeleteUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setErrorUsers(null);
    try {
      const fetchedUsers = await userService.getUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al cargar usuarios';
      setErrorUsers(message);
      toast.error("Error al cargar usuarios", { description: message });
    } finally {
      setIsLoadingUsers(false);
    }
  }, []); 

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

const handleDeleteUser = async () => {
  if (!userToDelete || !userToDelete._id) {
    toast.error("Error", { description: "No se ha seleccionado ningún usuario para eliminar." });
    return;
  }

  setIsDeleting(true); 
  setErrorUsers(null);
  try {
    await userService.deleteUser(userToDelete._id); 
    toast.success("Usuario Eliminado", {
        description: `El usuario ${userToDelete.name} ha sido eliminado.`,
    });
    setUsers(prevUsers => prevUsers.filter(u => u._id !== userToDelete._id));
    setShowDeleteDialog(false); 
  } catch (err: any) {
    console.error("Error deleting user:", err);
    const message = err.response?.data?.message || 'Error al eliminar usuario';
    setErrorUsers(message);
    toast.error("Error al eliminar", { description: message });
  } finally {
    setIsDeleting(false); 
  }
};

  const handleViewTables = (user: User) => {
    if (user.clientId) {
      navigate(`/admin/user-tables/${user.clientId}/${user.name}`);
    } else {
       toast.info("Información", { description: "Este usuario no tiene un ID de cliente asociado." });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEdit(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const getRoleIcon = (role: 'admin' | 'client') => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-5 h-5 text-red-600" />;
      case 'client':
      default:
        return <UserX className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role: 'admin' | 'client') => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'client':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: 'admin' | 'client') => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'client':
        return 'Cliente';
      default:
        return role;
    }
  };


  return (
    <div className="p-4 md:p-6">
       <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Gestiona los usuarios del sistema</p>
      </div>

       {errorUsers && !isLoadingUsers && (
         <div className="mb-4 bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm flex justify-between items-center">
           <span>{errorUsers}</span>
           <Button variant="ghost" size="sm" onClick={fetchUsers}>Reintentar</Button>
         </div>
       )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Usuarios del sistema</h2>
            <CreateUserDialog onUserCreated={fetchUsers} />
          </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"> Usuario </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"> Rol </th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider"> Acciones </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingUsers ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500"> <Loader2 className="w-6 h-6 mx-auto animate-spin" /> </td></tr>
              ) : (
                 users.length === 0 && !errorUsers ? (
                   <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500"> No se encontraron usuarios. </td></tr>
                 ) : (
                  users.map((user) => {
                    if (!user._id) return null;
                    return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-3">
                            <span className="text-xs font-medium text-gray-600">
                              {user.name?.split(' ').map(n => n?.[0]).join('').substring(0, 2).toUpperCase() || '??'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                            <div className="text-gray-500">{user.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {getRoleText(user.role)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewTables(user)} title="Ver Tablas" disabled={!user.clientId || user.role === 'admin'} className="text-green-600 hover:text-green-700 hover:bg-green-50 disabled:text-gray-300 disabled:cursor-not-allowed" > <Database className="w-4 h-4" /> </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="Editar Usuario" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" > <Edit2 className="w-4 h-4" /> </Button>
                          <Button variant="ghost" size="icon"
                          onClick={() => handleOpenDeleteDialog(user)} 
                          title="Eliminar usuario"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                 )
              )}
            </tbody>
          </table>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0"><div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><UserX className="w-5 h-5 text-blue-600" /></div></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Total Usuarios</p><p className="text-2xl font-semibold text-gray-900">{users.length}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0"><div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-purple-600" /></div></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Administradores</p><p className="text-2xl font-semibold text-gray-900">{users.filter(u => u.role === 'admin').length}</p></div>
          </div>
        </div>
      </div>
      <DeleteUserDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog} 
        onConfirm={handleDeleteUser} 
        userName={userToDelete?.name || ''} 
        isDeleting={isDeleting} 
      />
      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={showEdit}
          onOpenChange={setShowEdit}
          onUserEdited={() => {
            setShowEdit(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
