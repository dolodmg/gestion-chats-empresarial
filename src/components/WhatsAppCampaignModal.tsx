import { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageSquareText } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { templateService, WhatsAppTemplate } from '../services/templateService';
import { CreateWhatsAppCampaignData, WhatsAppCampaign } from '../types';
import WhatsAppRecipientManager from './WhatsAppRecipientManager';

interface WhatsAppCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (
        data: CreateWhatsAppCampaignData,
        recipients: Array<{ phoneNumber: string; name: string }>
    ) => Promise<void>;
    campaign?: WhatsAppCampaign | null;
    initialTemplateId?: string;
    initialCampaignName?: string;
}

function getBodyText(template?: WhatsAppTemplate | null) {
    return template?.components.find(component => component.type === 'BODY')?.text || '';
}

function getParameterCount(template?: WhatsAppTemplate | null) {
    const matches = getBodyText(template).match(/\{\{(\d+)\}\}/g);
    return matches ? matches.length : 0;
}

export default function WhatsAppCampaignModal({
    isOpen,
    onClose,
    onSubmit,
    campaign,
    initialTemplateId = '',
    initialCampaignName = ''
}: WhatsAppCampaignModalProps) {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [parameters, setParameters] = useState<string[]>([]);
    const [recipients, setRecipients] = useState<Array<{ phoneNumber: string; name: string }>>([]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const loadTemplates = async () => {
            try {
                setLoadingTemplates(true);
                const data = await templateService.getTemplates({ status: 'APPROVED' });
                setTemplates(data);
            } catch (error: any) {
                toast.error('Error', {
                    description: error.response?.data?.msg || 'No se pudieron cargar las plantillas'
                });
            } finally {
                setLoadingTemplates(false);
            }
        };

        loadTemplates();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setName(campaign?.name || initialCampaignName || '');
        setTemplateId(
            typeof campaign?.template === 'string'
                ? campaign.template
                : campaign?.template?._id || initialTemplateId || ''
        );
        setParameters(campaign?.parameters || []);
        setRecipients(
            (campaign?.recipients || []).map(recipient => ({
                phoneNumber: recipient.phoneNumber,
                name: recipient.name
            }))
        );
    }, [campaign, initialCampaignName, initialTemplateId, isOpen]);

    const selectedTemplate = useMemo(
        () => templates.find(template => template._id === templateId) || null,
        [templateId, templates]
    );

    useEffect(() => {
        if (!selectedTemplate) {
            return;
        }

        const parameterCount = getParameterCount(selectedTemplate);
        setParameters(currentParameters => {
            if (currentParameters.length === parameterCount) {
                return currentParameters;
            }

            return Array.from({ length: parameterCount }, (_, index) => currentParameters[index] || '');
        });
    }, [selectedTemplate]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Falta el nombre de la campaña');
            return;
        }

        if (!templateId) {
            toast.error('Selecciona una plantilla');
            return;
        }

        if (!recipients.length) {
            toast.error('Agrega al menos un destinatario');
            return;
        }

        try {
            setSaving(true);
            await onSubmit({
                name: name.trim(),
                templateId,
                parameters
            }, recipients);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquareText className="w-5 h-5 text-blue-600" />
                        {campaign ? 'Editar campaña de WhatsApp' : 'Nueva campaña de WhatsApp'}
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona una plantilla aprobada de WhatsApp y carga destinatarios desde CSV o manualmente.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 py-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de campaña
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={event => setName(event.target.value)}
                                placeholder="Promo junio"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Plantilla aprobada
                            </label>
                            {loadingTemplates ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                </div>
                            ) : (
                                <select
                                    value={templateId}
                                    onChange={event => setTemplateId(event.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Selecciona una plantilla</option>
                                    {templates.map(template => (
                                        <option key={template._id} value={template._id}>
                                            {template.name} ({template.language})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {selectedTemplate && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{selectedTemplate.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {selectedTemplate.category} · {selectedTemplate.language}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                        {selectedTemplate.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Vista previa</p>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{getBodyText(selectedTemplate)}</p>
                                </div>
                            </div>
                        )}

                        {selectedTemplate && parameters.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700">Parámetros del body</p>
                                {parameters.map((parameter, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={parameter}
                                        onChange={event => {
                                            const nextParameters = [...parameters];
                                            nextParameters[index] = event.target.value;
                                            setParameters(nextParameters);
                                        }}
                                        placeholder={`Valor para {{${index + 1}}}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <WhatsAppRecipientManager
                            recipients={recipients}
                            onRecipientsChange={setRecipients}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Guardar campaña'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
