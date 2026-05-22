import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../services/authService';
import { userService } from '../services/userService';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import { BarChart3, Database, Edit2, Loader2, ShieldCheck, Trash2, UserX, Search, MessageSquare, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import FeatureFlagsDialog from '@/components/users/FeatureFlagsDialog';
import { chatService, Chat, Message } from '../services/chatService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [featureConfigUser, setFeatureConfigUser] = useState<User | null>(null);
  const [showFeatureConfig, setShowFeatureConfig] = useState(false);

  // Chat Search State
  const [searchPhone, setSearchPhone] = useState('');
  const [searchChatsResult, setSearchChatsResult] = useState<Chat[]>([]);
  const [isSearchingChats, setIsSearchingChats] = useState(false);

  // Global Chat View State
  const [isViewingChat, setIsViewingChat] = useState(false);
  const [viewingChatData, setViewingChatData] = useState<{ chatId: string, clientId: string, contactName: string } | null>(null);
  const [globalChatMessages, setGlobalChatMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setErrorUsers(null);
    try {
      const fetchedUsers = await userService.getUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data?.msg || 'Error al cargar usuarios';
      setErrorUsers(message);
      toast.error('Error al cargar usuarios', { description: message });
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setIsSearchingChats(true);
    try {
      const results = await chatService.adminSearchChatsByPhone(searchPhone.trim());
      setSearchChatsResult(results);
      if (results.length === 0) {
        toast.info('Sin resultados', { description: 'No se encontraron chats con ese número.' });
      }
    } catch (err: any) {
      toast.error('Error al buscar', { description: 'Ocurrió un error buscando los chats.' });
    } finally {
      setIsSearchingChats(false);
    }
  };

  const handleViewGlobalChat = async (chat: Chat) => {
    if (!chat.clientId) return toast.error('Error', { description: 'El chat no tiene un clientId asignado' });
    setViewingChatData({ 
      chatId: chat.chatId, 
      clientId: chat.clientId, 
      contactName: chat.contactName || chat.phoneNumber || 'Desconocido' 
    });
    setIsViewingChat(true);
    setIsLoadingMessages(true);
    setGlobalChatMessages([]);
    try {
      const response = await chatService.adminGetGlobalChatMessages(chat.clientId, chat.chatId);
      setGlobalChatMessages(response.messages || []);
    } catch (err) {
      toast.error('Error al cargar mensajes', { description: 'No se pudo obtener el historial del chat.' });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete._id) {
      toast.error('Error', { description: 'No se ha seleccionado ningun usuario para eliminar.' });
      return;
    }

    setIsDeleting(true);
    setErrorUsers(null);
    try {
      await userService.deleteUser(userToDelete._id);
      toast.success('Usuario Eliminado', {
        description: `El usuario ${userToDelete.name} ha sido eliminado.`
      });
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userToDelete._id));
      setShowDeleteDialog(false);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      const message =
        err.response?.data?.message || err.response?.data?.msg || 'Error al eliminar usuario';
      setErrorUsers(message);
      toast.error('Error al eliminar', { description: message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewTables = (user: User) => {
    if (user.clientId) {
      navigate(`/admin/user-tables/${user.clientId}/${user.name}`);
    } else {
      toast.info('Informacion', {
        description: 'Este usuario no tiene un ID de cliente asociado.'
      });
    }
  };

  const handleViewMetrics = (user: User) => {
    if (user.clientId) {
      navigate(`/admin/client-metrics/${user.clientId}/${encodeURIComponent(user.name || 'Cliente')}`);
    } else {
      toast.info('Informacion', {
        description: 'Este usuario no tiene un ID de cliente asociado.'
      });
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

  const handleOpenFeatureConfig = (user: User) => {
    setFeatureConfigUser(user);
    setShowFeatureConfig(true);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administracion</h1>
        <p className="text-gray-600">Gestiona los usuarios del sistema y entra a metricas por cliente.</p>
      </div>

      {errorUsers && !isLoadingUsers && (
        <div className="mb-4 bg-red-100 border border-red-300 text-red-800 p-3 rounded-lg text-sm flex justify-between items-center">
          <span>{errorUsers}</span>
          <Button variant="ghost" size="sm" onClick={fetchUsers}>
            Reintentar
          </Button>
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
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : users.length === 0 && !errorUsers ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  if (!user._id) return null;
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-3">
                            <span className="text-xs font-medium text-gray-600">
                              {user.name?.split(' ').map((n) => n?.[0]).join('').substring(0, 2).toUpperCase() || '??'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                            <div className="text-gray-500">{user.email || 'N/A'}</div>
                            {user.clientId && (
                              <div className="text-xs text-gray-400 mt-1">Client ID: {user.clientId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRoleIcon(user.role as 'admin' | 'client')}
                          <span
                            className={`ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColor(
                              user.role as 'admin' | 'client'
                            )}`}
                          >
                            {getRoleText(user.role as 'admin' | 'client')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewTables(user)}
                            title="Ver Tablas"
                            disabled={!user.clientId || user.role === 'admin'}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 disabled:text-gray-300 disabled:cursor-not-allowed"
                          >
                            <Database className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMetrics(user)}
                            title="Ver Metricas"
                            disabled={!user.clientId || user.role === 'admin'}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 disabled:text-gray-300 disabled:cursor-not-allowed"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            title="Editar Usuario"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenFeatureConfig(user)}
                            title="Configurar Funcionalidades"
                            disabled={user.role === 'admin'}
                            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 disabled:text-gray-300 disabled:cursor-not-allowed"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
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
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Búsqueda Global de Chats</h2>
              <p className="text-sm text-gray-500">Busca en todos los clientes por número de teléfono</p>
            </div>
          </div>
          
          <form onSubmit={handleSearchChats} className="flex gap-2 max-w-md">
            <Input
              placeholder="Número de teléfono..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearchingChats || !searchPhone.trim()}>
              {isSearchingChats ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Buscar
            </Button>
          </form>
        </div>

        {searchChatsResult.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Detalles del Chat</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Último Mensaje</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchChatsResult.map((chat, idx) => (
                  <tr key={`${chat.chatId}-${chat.clientId}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-3 text-blue-600">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{chat.contactName || chat.phoneNumber || 'Desconocido'}</div>
                          <div className="text-gray-500">{chat.phoneNumber}</div>
                          <div className="text-xs text-gray-400 mt-1">Chat ID: {chat.chatId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {chat.clientId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-sm truncate">
                      {chat.lastMessage || 'Sin mensaje reciente'}
                      <div className="text-xs text-gray-400 mt-1">
                        {chat.lastMessageTimestamp ? new Date(chat.lastMessageTimestamp).toLocaleString() : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewGlobalChat(chat)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Ver Historial
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
      <FeatureFlagsDialog
        user={featureConfigUser}
        open={showFeatureConfig}
        onOpenChange={(open) => {
          setShowFeatureConfig(open);
          if (!open) {
            setFeatureConfigUser(null);
          }
        }}
        onSaved={fetchUsers}
      />

      <Dialog open={isViewingChat} onOpenChange={setIsViewingChat}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Historial de Chat (Modo Admin)
            </DialogTitle>
            {viewingChatData && (
              <div className="text-sm flex flex-col mt-2">
                <span><strong className="text-gray-700">Contacto:</strong> {viewingChatData.contactName}</span>
                <span><strong className="text-gray-700">Client ID:</strong> {viewingChatData.clientId}</span>
                <span><strong className="text-gray-700">Chat ID:</strong> {viewingChatData.chatId}</span>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col bg-slate-100 rounded-md border mt-2">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : globalChatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No se encontraron mensajes en este chat.
                </div>
              ) : (
                globalChatMessages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                          isUser
                            ? 'bg-white border text-gray-800'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        <div className="text-[15px] leading-snug">
                          {msg.content || (msg.mediaUrl ? '📎 [Archivo Adjunto]' : '')}
                        </div>
                        <div
                          className={`text-[11px] mt-1 text-right ${
                            isUser ? 'text-gray-400' : 'text-green-100'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsViewingChat(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
