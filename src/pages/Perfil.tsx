import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Bell, Globe } from 'lucide-react';
import { authService } from '../services/authService';

export default function Perfil() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'security' | 'info' | 'notifications' | 'preferences'>('security');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tabs = [
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'info', label: 'Información Personal', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'preferences', label: 'Preferencias', icon: Globe }
  ] as const;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setSuccess(res.msg || 'Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.msg || err.message || 'Error al cambiar la contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu seguridad y configuración</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
          <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
          <p className="text-blue-100">{user?.email}</p>
        </div>

        {/* Tabs - Responsive Grid */}
        <div className="border-b border-gray-200">
          <nav className="grid grid-cols-2 md:flex md:space-x-8 px-4 md:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-center">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Cambiar contraseña</h3>
              {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{error}</div>}
              {success && <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded">{success}</div>}
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repetir nueva contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {submitting ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Información Personal</h3>
              <p className="text-gray-600">Próximamente. Nuevas funcionalidades en desarrollo.</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notificaciones</h3>
              <p className="text-gray-600">Próximamente. Nuevas funcionalidades en desarrollo.</p>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preferencias</h3>
              <p className="text-gray-600">Próximamente. Nuevas funcionalidades en desarrollo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
