import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CreateEmailCredentialData, SendingDomain } from '../types';
import * as emailCredentialService from '../services/emailCredentialService';
import * as sendingDomainService from '../services/sendingDomainService';

interface EmailCredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onMessage?: (type: 'success' | 'error', message: string) => void;
}

const initialFormData: CreateEmailCredentialData = {
    name: '',
    host: '',
    port: 587,
    secure: false,
    user: '',
    password: '',
    fromName: '',
    fromEmail: '',
    sendingDomainId: ''
};

export default function EmailCredentialModal({ isOpen, onClose, onSuccess, onMessage }: EmailCredentialModalProps) {
    const [formData, setFormData] = useState<CreateEmailCredentialData>(initialFormData);
    const [sendingDomains, setSendingDomains] = useState<SendingDomain[]>([]);
    const [loadingDomains, setLoadingDomains] = useState(false);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSendingDomains();
        } else {
            setFormData(initialFormData);
        }
    }, [isOpen]);

    const loadSendingDomains = async () => {
        try {
            setLoadingDomains(true);
            const response = await sendingDomainService.getSendingDomains();
            const readyDomains = (response.sendingDomains || []).filter((domain: SendingDomain) => domain.isVerified);
            setSendingDomains(readyDomains);
        } catch (error) {
            console.error('Error loading sending domains:', error);
            onMessage?.('error', 'No se pudieron cargar los dominios autenticados.');
        } finally {
            setLoadingDomains(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            await emailCredentialService.createCredential(formData);
            onMessage?.('success', 'Credencial creada exitosamente');
            onSuccess();
            onClose();
            setFormData(initialFormData);
        } catch (error: any) {
            console.error('Error creating credential:', error);
            onMessage?.('error', error.response?.data?.error || 'Error creando credencial');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        try {
            setTesting(true);
            await emailCredentialService.testConnection(formData);
            onMessage?.('success', 'Conexión SMTP exitosa');
        } catch (error: any) {
            console.error('Error testing connection:', error);
            onMessage?.('error', `Error de conexión: ${error.response?.data?.error || error.message}`);
        } finally {
            setTesting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Nueva credencial SMTP</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Asociá el SMTP del cliente a un dominio autenticado ya verificado.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Dominio autenticado
                        </label>
                        <select
                            value={formData.sendingDomainId}
                            onChange={(e) => setFormData({ ...formData, sendingDomainId: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            required
                            disabled={loadingDomains}
                        >
                            <option value="">
                                {loadingDomains ? 'Cargando dominios...' : 'Seleccioná un dominio verificado'}
                            </option>
                            {sendingDomains.map((domain) => (
                                <option key={domain._id} value={domain._id}>
                                    {domain.domain}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            El remitente debe pertenecer al dominio seleccionado.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Nombre de la credencial
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: SMTP Marketing Hostinger"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Host SMTP
                            </label>
                            <input
                                type="text"
                                value={formData.host}
                                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                placeholder="smtp.hostinger.com"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Puerto
                            </label>
                            <input
                                type="number"
                                value={formData.port}
                                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value, 10) || 0 })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={formData.secure}
                            onChange={(e) => setFormData({
                                ...formData,
                                secure: e.target.checked,
                                port: e.target.checked ? 465 : 587
                            })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Usar SSL/TLS
                    </label>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Usuario SMTP
                        </label>
                        <input
                            type="email"
                            value={formData.user}
                            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                            placeholder="cuenta@dominio.com"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Nombre remitente
                            </label>
                            <input
                                type="text"
                                value={formData.fromName}
                                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                                placeholder="Equipo de Marketing"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email remitente
                            </label>
                            <input
                                type="email"
                                value={formData.fromEmail}
                                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                                placeholder="promo@dominio.com"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-6">
                    <button
                        type="button"
                        onClick={handleTest}
                        disabled={testing || !formData.host || !formData.user || !formData.password || !formData.fromEmail || !formData.sendingDomainId}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {testing ? 'Probando...' : 'Probar conexión'}
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar credencial'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
