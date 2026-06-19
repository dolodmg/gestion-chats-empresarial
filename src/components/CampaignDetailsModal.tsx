import { useMemo, useState } from 'react';
import { X, Mail, MousePointerClick, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Campaign, Recipient } from '../types';

interface CampaignDetailsModalProps {
    campaign: Campaign | null;
    isOpen: boolean;
    onClose: () => void;
}

function formatDate(value?: string) {
    if (!value) return '—';

    return new Date(value).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getRecipientStatusLabel(recipient: Recipient) {
    if (recipient.status === 'failed') return 'Fallido';
    if (recipient.status === 'sent') return 'Enviado';
    return 'Pendiente';
}

function getRecipientStatusClasses(recipient: Recipient) {
    if (recipient.status === 'failed') return 'bg-red-50 text-red-700 border-red-200';
    if (recipient.status === 'sent') return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
}

export default function CampaignDetailsModal({ campaign, isOpen, onClose }: CampaignDetailsModalProps) {
    const [previewMode, setPreviewMode] = useState<'rendered' | 'html'>('rendered');

    const totals = useMemo(() => {
        const recipients = campaign?.recipients || [];
        const delivered = recipients.filter(recipient => recipient.status === 'sent').length;
        const opened = recipients.filter(recipient => recipient.opened).length;
        const clicked = recipients.filter(recipient => recipient.clicked).length;
        const failed = recipients.filter(recipient => recipient.status === 'failed').length;

        return {
            delivered,
            opened,
            clicked,
            failed
        };
    }, [campaign]);

    if (!isOpen || !campaign) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Detalle de campaña</p>
                        <h2 className="truncate text-2xl font-semibold text-gray-900">{campaign.name}</h2>
                        <p className="mt-1 text-sm text-gray-500">{campaign.subject}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <Mail className="h-4 w-4 text-blue-600" />
                                Enviados
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.delivered}</p>
                            <p className="mt-1 text-xs text-gray-500">de {campaign.totalRecipients} destinatarios</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <Eye className="h-4 w-4 text-emerald-600" />
                                Abiertos
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.opened}</p>
                            <p className="mt-1 text-xs text-gray-500">Tasa {campaign.openRate ?? 0}%</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <MousePointerClick className="h-4 w-4 text-violet-600" />
                                Clicks
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.clicked}</p>
                            <p className="mt-1 text-xs text-gray-500">Tasa {campaign.clickRate ?? 0}%</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                Fallidos
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-gray-900">{totals.failed}</p>
                            <p className="mt-1 text-xs text-gray-500">Errores de envío</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-2xl border border-gray-200">
                            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Destinatarios</h3>
                                    <p className="text-xs text-gray-500">Estado individual de apertura, click y errores</p>
                                </div>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                    {campaign.recipients.length} registros
                                </span>
                            </div>

                            <div className="max-h-[420px] overflow-auto">
                                <table className="w-full min-w-[760px] divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Abierto</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Clicks</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Último evento</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500">Error</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {campaign.recipients.map((recipient) => {
                                            const lastEvent = recipient.clickedAt || recipient.openedAt || recipient.sentAt;

                                            return (
                                                <tr key={recipient._id || recipient.email}>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{recipient.email}</td>
                                                    <td className="px-4 py-3 text-gray-600">{recipient.name || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getRecipientStatusClasses(recipient)}`}>
                                                            {getRecipientStatusLabel(recipient)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            {recipient.opened ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="text-gray-400">—</span>}
                                                            <span>{recipient.opened ? `${recipient.openCount || 1} vez/veces` : 'No'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {recipient.clicked ? `${recipient.clickCount || 1} vez/veces` : 'No'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{formatDate(lastEvent)}</td>
                                                    <td className="px-4 py-3 text-xs text-red-600">{recipient.error || '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-200 bg-white p-5">
                                <h3 className="text-sm font-semibold text-gray-900">Resumen</h3>
                                <dl className="mt-4 space-y-3 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500">Estado</dt>
                                        <dd className="font-medium capitalize text-gray-900">{campaign.status}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500">Creada</dt>
                                        <dd className="text-right font-medium text-gray-900">{formatDate(campaign.createdAt)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500">Inicio de envío</dt>
                                        <dd className="text-right font-medium text-gray-900">{formatDate(campaign.sentAt)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500">Completada</dt>
                                        <dd className="text-right font-medium text-gray-900">{formatDate(campaign.completedAt)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500">Aperturas únicas</dt>
                                        <dd className="font-medium text-gray-900">{campaign.uniqueOpens ?? 0}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-gray-500">Clicks únicos</dt>
                                        <dd className="font-medium text-gray-900">{campaign.uniqueClicks ?? 0}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900">Contenido</h3>
                                    <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewMode('rendered')}
                                            className={`rounded-md px-3 py-1.5 ${previewMode === 'rendered' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                                        >
                                            Vista previa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewMode('html')}
                                            className={`rounded-md px-3 py-1.5 ${previewMode === 'html' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                                        >
                                            HTML
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
                                    {previewMode === 'rendered' ? (
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: campaign.htmlContent || '<p>Sin contenido HTML</p>' }}
                                        />
                                    ) : (
                                        <pre className="whitespace-pre-wrap break-words text-xs text-gray-700">
                                            {campaign.htmlContent}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
