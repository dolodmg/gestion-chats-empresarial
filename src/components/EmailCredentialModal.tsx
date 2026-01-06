import { useState } from 'react';
import { X } from 'lucide-react';
import { CreateEmailCredentialData } from '../types';
import * as emailCredentialService from '../services/emailCredentialService';

interface EmailCredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onMessage?: (type: 'success' | 'error', message: string) => void;
}

export default function EmailCredentialModal({ isOpen, onClose, onSuccess, onMessage }: EmailCredentialModalProps) {
    const [formData, setFormData] = useState<CreateEmailCredentialData>({
        name: '',
        host: '',
        port: 587,
        secure: false,
        user: '',
        password: '',
        fromName: '',
        fromEmail: '' // Will be auto-set from user
    });
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            // Auto-set fromEmail to user email
            const dataToSend = { ...formData, fromEmail: formData.user };
            await emailCredentialService.createCredential(dataToSend);
            if (onMessage) {
                onMessage('success', 'Credencial creada exitosamente');
            }
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error creating credential:', error);
            if (onMessage) {
                onMessage('error', 'Error creando credencial');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        try {
            setTesting(true);
            await emailCredentialService.testConnection(formData);
            if (onMessage) {
                onMessage('success', 'Conexión SMTP exitosa');
            }
        } catch (error: any) {
            console.error('Error testing connection:', error);
            if (onMessage) {
                onMessage('error', `Error de conexión: ${error.response?.data?.error || error.message}`);
            }
        } finally {
            setTesting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            host: '',
            port: 587,
            secure: false,
            user: '',
            password: '',
            fromName: '',
            fromEmail: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Nueva credencial SMTP</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la credencial
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: DEMO SMTP"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Host SMTP
                            </label>
                            <input
                                type="text"
                                value={formData.host}
                                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                placeholder="smtp.gmail.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puerto
                            </label>
                            <input
                                type="number"
                                value={formData.port}
                                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                                placeholder="587"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="secure"
                                checked={formData.secure}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    secure: e.target.checked,
                                    port: e.target.checked ? 465 : 587
                                })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="secure" className="ml-2 text-sm text-gray-700">
                                Usar SSL/TLS
                            </label>
                        </div>
                        
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Usuario (Email)
                        </label>
                        <input
                            type="email"
                            value={formData.user}
                            onChange={(e) => setFormData({
                                ...formData,
                                user: e.target.value,
                                fromEmail: e.target.value // Auto-fill fromEmail with user
                            })}
                            placeholder="tu-email@ejemplo.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este email se usará para autenticación y como remitente
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del remitente
                        </label>
                        <input
                            type="text"
                            value={formData.fromName}
                            onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                            placeholder="Ej: Equipo de Marketing"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Nombre que verán los destinatarios
                        </p>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={handleTest}
                        disabled={testing || !formData.host || !formData.user || !formData.password}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {testing ? 'Probando...' : 'Probar conexión'}
                    </button>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Guardando...' : 'Guardar credencial'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
