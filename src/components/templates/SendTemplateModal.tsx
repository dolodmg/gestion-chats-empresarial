import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { templateService, WhatsAppTemplate } from '../../services/templateService';
import { toast } from 'sonner';
import { MessageSquareText, Loader2, AlertTriangle } from 'lucide-react';

interface SendTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
    chatName: string;
    onTemplateSent: (result: any) => void;
}

export function SendTemplateModal({
    isOpen,
    onClose,
    chatId,
    chatName,
    onTemplateSent
}: SendTemplateModalProps) {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [parameters, setParameters] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadApprovedTemplates();
        }
    }, [isOpen]);

    const loadApprovedTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await templateService.getTemplates({ status: 'APPROVED' });
            setTemplates(data);
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.msg || 'No se pudieron cargar las plantillas'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedTemplate = templates.find(t => t._id === selectedTemplateId);

    const handleSend = async () => {
        if (!selectedTemplateId) {
            toast.error('Error', { description: 'Selecciona una plantilla' });
            return;
        }

        try {
            setIsSending(true);
            const result = await templateService.sendTemplateToChat(selectedTemplateId, {
                chatId,
                parameters: parameters.filter(p => p.trim() !== '')
            });

            toast.success('Plantilla enviada', {
                description: 'El chat ha sido cambiado a modo manual automáticamente'
            });

            onTemplateSent(result);
            onClose();

            // Reset form
            setSelectedTemplateId(null);
            setParameters([]);
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.msg || 'No se pudo enviar la plantilla'
            });
        } finally {
            setIsSending(false);
        }
    };

    const getParameterCount = (template: WhatsAppTemplate): number => {
        const bodyComponent = template.components.find(c => c.type === 'BODY');
        if (!bodyComponent || !bodyComponent.text) return 0;

        const matches = bodyComponent.text.match(/\{\{(\d+)\}\}/g);
        return matches ? matches.length : 0;
    };

    useEffect(() => {
        if (selectedTemplate) {
            const paramCount = getParameterCount(selectedTemplate);
            setParameters(new Array(paramCount).fill(''));
        }
    }, [selectedTemplateId]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquareText className="w-5 h-5" />
                        Enviar Plantilla
                    </DialogTitle>
                    <DialogDescription>
                        Envía una plantilla de WhatsApp a {chatName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Warning */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-orange-900">
                            Al enviar esta plantilla, el chat cambiará automáticamente a <strong>modo manual</strong> para evitar que el bot responda.
                        </p>
                    </div>

                    {/* Template Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Plantilla
                        </label>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No hay plantillas aprobadas disponibles
                            </div>
                        ) : (
                            <select
                                value={selectedTemplateId || ''}
                                onChange={(e) => setSelectedTemplateId(e.target.value || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSending}
                            >
                                <option value="">Selecciona una plantilla...</option>
                                {templates.map((template) => (
                                    <option key={template._id} value={template._id}>
                                        {template.name} ({templateService.getCategoryText(template.category)})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Template Preview */}
                    {selectedTemplate && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-2">Vista previa:</p>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                {templateService.getTemplatePreview(selectedTemplate)}
                            </p>
                        </div>
                    )}

                    {/* Parameters */}
                    {selectedTemplate && getParameterCount(selectedTemplate) > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Parámetros
                            </label>
                            <div className="space-y-2">
                                {parameters.map((param, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        value={param}
                                        onChange={(e) => {
                                            const newParams = [...parameters];
                                            newParams[index] = e.target.value;
                                            setParameters(newParams);
                                        }}
                                        placeholder={`Parámetro {{${index + 1}}}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isSending}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!selectedTemplateId || isSending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            'Enviar Plantilla'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
