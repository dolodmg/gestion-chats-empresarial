import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { EmailCredential } from '../types';
import * as emailCredentialService from '../services/emailCredentialService';
import EmailCredentialModal from './EmailCredentialModal';
import ConfirmDialog from './ConfirmDialog';

interface CredentialManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCredentialChange: () => void;
    onMessage?: (type: 'success' | 'error', message: string) => void;
}

export default function CredentialManagementModal({ isOpen, onClose, onCredentialChange, onMessage }: CredentialManagementModalProps) {
    const [credentials, setCredentials] = useState<EmailCredential[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; credentialId: string; credentialName: string }>({ isOpen: false, credentialId: '', credentialName: '' });

    useEffect(() => {
        if (isOpen) {
            loadCredentials();
        }
    }, [isOpen]);

    const loadCredentials = async () => {
        try {
            setLoading(true);
            const response = await emailCredentialService.getCredentials();
            setCredentials(response.credentials || []);
        } catch (error) {
            console.error('Error loading credentials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            credentialId: id,
            credentialName: name
        });
    };

    const confirmDelete = async () => {
        const { credentialId, credentialName } = confirmDialog;

        try {
            await emailCredentialService.deleteCredential(credentialId);
            if (onMessage) {
                onMessage('success', 'Credencial eliminada exitosamente');
            }
            loadCredentials();
            onCredentialChange();
        } catch (error) {
            console.error('Error deleting credential:', error);
            if (onMessage) {
                onMessage('error', 'Error eliminando credencial');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Administrar credenciales SMTP</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : credentials.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-2">No tienes credenciales configuradas</p>
                                <p className="text-sm text-gray-400">Crea tu primera credencial para comenzar</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {credentials.map((credential) => (
                                    <div
                                        key={credential._id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-gray-900">{credential.name}</h3>
                                            <div className="mt-1 space-y-1">
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-medium">Host:</span> {credential.host}:{credential.port}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-medium">Usuario:</span> {credential.user}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-medium">Remitente:</span> {credential.fromName} &lt;{credential.fromEmail}&gt;
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(credential._id, credential.name)}
                                            className="ml-4 p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                            title="Eliminar credencial"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Añadir credencial
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Credential Modal */}
            <EmailCredentialModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    loadCredentials();
                    onCredentialChange();
                }}
                onMessage={onMessage}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDelete}
                title="Eliminar credencial"
                message={`¿Estás seguro de eliminar la credencial "${confirmDialog.credentialName}"?`}
                variant="danger"
                confirmText="Eliminar"
            />
        </>
    );
}
