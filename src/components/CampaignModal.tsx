import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateCampaignData, Recipient, EmailCredential } from '../types';
import RecipientManager from './RecipientManager';
import EmailCredentialModal from './EmailCredentialModal';
import * as emailCredentialService from '../services/emailCredentialService';

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateCampaignData, recipients: Recipient[]) => void;
    onValidationError?: (message: string) => void;
    initialData?: CreateCampaignData & { recipients?: Recipient[] };
    title?: string;
}

export default function CampaignModal({
    isOpen,
    onClose,
    onSave,
    onValidationError,
    initialData,
    title = 'Nueva Campaña'
}: CampaignModalProps) {
    const [contentType, setContentType] = useState<'html' | 'text'>('text');
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [emailCredentialId, setEmailCredentialId] = useState('');
    const [trackOpens, setTrackOpens] = useState(true);
    const [trackClicks, setTrackClicks] = useState(true);
    const [callToActionUrl, setCallToActionUrl] = useState('');
    const [callToActionLabel, setCallToActionLabel] = useState('');
    const [credentials, setCredentials] = useState<EmailCredential[]>([]);
    const [loadingCredentials, setLoadingCredentials] = useState(false);
    const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCredentials();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSubject(initialData.subject);
            setHtmlContent(initialData.htmlContent);
            setRecipients(initialData.recipients || []);
            setEmailCredentialId(initialData.emailCredentialId || '');
            setTrackOpens(initialData.trackOpens !== false);
            setTrackClicks(initialData.trackClicks !== false);
            setCallToActionUrl(initialData.callToActionUrl || '');
            setCallToActionLabel(initialData.callToActionLabel || '');
        } else {
            setName('');
            setSubject('');
            setHtmlContent('');
            setRecipients([]);
            setEmailCredentialId('');
            setTrackOpens(true);
            setTrackClicks(true);
            setCallToActionUrl('');
            setCallToActionLabel('');
        }
    }, [initialData, isOpen]);

    const loadCredentials = async () => {
        try {
            setLoadingCredentials(true);
            const response = await emailCredentialService.getCredentials();
            setCredentials(response.credentials || []);
        } catch (error) {
            console.error('Error loading credentials:', error);
        } finally {
            setLoadingCredentials(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !subject.trim() || !htmlContent.trim() || !emailCredentialId) {
            if (onValidationError) {
                onValidationError('Por favor completa todos los campos requeridos, incluyendo la credencial de email');
            }
            return;
        }

        onSave(
            {
                name: name.trim(),
                subject: subject.trim(),
                htmlContent: contentType === 'html' ? htmlContent.trim() : `<p>${htmlContent.trim().replace(/\n/g, '<br>')}</p>`,
                textContent: htmlContent.trim(),
                emailCredentialId: emailCredentialId,
                trackOpens,
                trackClicks,
                callToActionUrl: callToActionUrl.trim(),
                callToActionLabel: callToActionLabel.trim(),
            },
            recipients
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Campaign Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Campaña *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Promoción Verano 2026"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asunto del Email *
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ej: ¡Ofertas especiales solo por hoy!"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Email Credential Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Credencial de Email *
                        </label>
                        <select
                            value={emailCredentialId}
                            onChange={(e) => {
                                if (e.target.value === '__add_new__') {
                                    setIsCredentialModalOpen(true);
                                } else {
                                    setEmailCredentialId(e.target.value);
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={loadingCredentials}
                        >
                            <option value="">
                                {loadingCredentials ? 'Cargando credenciales...' : 'Selecciona una credencial'}
                            </option>
                            {credentials.map((cred) => (
                                <option key={cred._id} value={cred._id}>
                                    {cred.name} ({cred.fromEmail})
                                </option>
                            ))}
                            <option value="__add_new__" className="font-semibold text-blue-600">
                                + Añadir credencial
                            </option>
                        </select>
                        {credentials.length === 0 && !loadingCredentials && (
                            <p className="text-xs text-amber-600 mt-1">
                                No tienes credenciales configuradas. Crea una primero.
                            </p>
                        )}
                    </div>

                    {/* Content Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tipo de Contenido *
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="text"
                                    checked={contentType === 'text'}
                                    onChange={(e) => setContentType(e.target.value as 'html' | 'text')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Texto Simple</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="html"
                                    checked={contentType === 'html'}
                                    onChange={(e) => setContentType(e.target.value as 'html' | 'text')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">HTML</span>
                            </label>
                        </div>
                    </div>

                    {/* Content Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {contentType === 'html' ? 'Contenido HTML *' : 'Contenido del Email *'}
                            </label>
                            {contentType === 'html' && (
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
                                </button>
                            )}
                        </div>
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            placeholder={
                                contentType === 'html'
                                    ? "Escribe aquí el contenido HTML de tu email...\n\nTip: Usa {{nombre}} para personalizar"
                                    : "Escribe aquí el contenido de tu email...\n\nTip: Usa {{nombre}} para personalizar con el nombre del destinatario"
                            }
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${contentType === 'html' ? 'font-mono' : ''}`}
                            rows={8}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Usa <code className="bg-gray-100 px-1 rounded text-xs">{'{{nombre}}'}</code> para personalizar con el nombre del destinatario
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Para ubicar el CTA donde vos quieras podés usar <code className="bg-gray-100 px-1 rounded text-xs">{'{{cta_url}}'}</code>, <code className="bg-gray-100 px-1 rounded text-xs">{'{{cta_label}}'}</code> o <code className="bg-gray-100 px-1 rounded text-xs">{'{{cta_button}}'}</code>.
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">Tracking automático</h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Podés hacer que el sistema agregue el pixel de apertura y un link/CTA medible sin tocar el HTML manualmente.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={trackOpens}
                                    onChange={(e) => setTrackOpens(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Agregar pixel de apertura
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={trackClicks}
                                    onChange={(e) => setTrackClicks(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Trackear clicks
                            </label>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Link / página web
                                </label>
                                <input
                                    type="url"
                                    value={callToActionUrl}
                                    onChange={(e) => setCallToActionUrl(e.target.value)}
                                    placeholder="https://tuweb.com/oferta"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Si lo cargás, el sistema agrega un botón/link al correo y lo redirige por tu tracker.
                                </p>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Texto del link
                                </label>
                                <input
                                    type="text"
                                    value={callToActionLabel}
                                    onChange={(e) => setCallToActionLabel(e.target.value)}
                                    placeholder="Quiero más información"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Si lo dejás vacío, se usa <span className="font-medium">Ver más</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {showPreview && contentType === 'html' && (
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa</h4>
                            <div
                                className="bg-gray-50 p-4 rounded border border-gray-200 max-h-80 overflow-y-auto text-sm"
                                dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-gray-400">La vista previa aparecerá aquí...</p>' }}
                            />
                        </div>
                    )}

                    {/* Recipients */}
                    <RecipientManager
                        recipients={recipients}
                        onRecipientsChange={setRecipients}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Guardar Campaña
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>

            {/* Email Credential Modal */}
            <EmailCredentialModal
                isOpen={isCredentialModalOpen}
                onClose={() => setIsCredentialModalOpen(false)}
                onSuccess={() => {
                    loadCredentials();
                }}
            />
        </div>
    );
}
