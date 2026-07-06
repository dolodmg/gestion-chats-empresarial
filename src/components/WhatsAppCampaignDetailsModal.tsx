import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WhatsAppCampaign } from '../types';

interface WhatsAppCampaignDetailsModalProps {
    campaign: WhatsAppCampaign | null;
    isOpen: boolean;
    onClose: () => void;
}

function formatDate(value?: string) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadge(status: WhatsAppCampaign['status'] | WhatsAppCampaign['recipients'][number]['status']) {
    const styles: Record<string, string> = {
        draft: 'bg-yellow-100 text-yellow-800',
        sending: 'bg-blue-100 text-blue-800',
        completed: 'bg-blue-100 text-blue-800',
        partial: 'bg-orange-100 text-orange-800',
        failed: 'bg-red-100 text-red-800',
        pending: 'bg-gray-100 text-gray-700',
        accepted: 'bg-sky-100 text-sky-800',
        sent: 'bg-blue-100 text-blue-800',
        delivered: 'bg-emerald-100 text-emerald-800',
        read: 'bg-blue-100 text-blue-800'
    };

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
}

export default function WhatsAppCampaignDetailsModal({
    campaign,
    isOpen,
    onClose
}: WhatsAppCampaignDetailsModalProps) {
    if (!campaign) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalle de campaña WhatsApp</DialogTitle>
                    <DialogDescription>
                        {campaign.name} · plantilla {campaign.templateName}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-gray-200 p-4 bg-white">
                        <p className="text-sm text-gray-500">Destinatarios</p>
                        <p className="text-3xl font-semibold text-gray-900">{campaign.totalRecipients}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 bg-white">
                        <p className="text-sm text-gray-500">Enviados</p>
                        <p className="text-3xl font-semibold text-blue-700">{campaign.sentCount}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 bg-white">
                        <p className="text-sm text-gray-500">Fallidos</p>
                        <p className="text-3xl font-semibold text-red-700">{campaign.failedCount}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Destinatarios</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white">
                                    <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                                        <th className="px-4 py-3">Teléfono</th>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3">Último evento</th>
                                        <th className="px-4 py-3">Error</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {campaign.recipients.map(recipient => (
                                        <tr key={recipient._id || recipient.phoneNumber} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{recipient.phoneNumber}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{recipient.name || '—'}</td>
                                            <td className="px-4 py-3">{getStatusBadge(recipient.status)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(recipient.lastStatusAt || recipient.sentAt)}</td>
                                            <td className="px-4 py-3 text-sm text-red-600">{recipient.error || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Resumen</h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex justify-between gap-3">
                                    <span>Estado</span>
                                    <span>{getStatusBadge(campaign.status)}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span>Plantilla</span>
                                    <span className="text-right">{campaign.templateName}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span>Idioma</span>
                                    <span>{campaign.templateLanguage}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span>Creada</span>
                                    <span>{formatDate(campaign.createdAt)}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span>Inicio</span>
                                    <span>{formatDate(campaign.startedAt)}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span>Finalización</span>
                                    <span>{formatDate(campaign.completedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Contenido</h3>
                            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-800 whitespace-pre-wrap">
                                {campaign.bodyPreview || 'Sin vista previa'}
                            </div>
                            {campaign.parameters.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-500">Parámetros usados</p>
                                    {campaign.parameters.map((parameter, index) => (
                                        <div key={index} className="text-sm text-gray-700">
                                            {`{{${index + 1}}}`}: {parameter || '—'}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
