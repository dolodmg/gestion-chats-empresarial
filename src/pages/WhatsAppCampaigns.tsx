import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, MessageSquareText, Plus, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import WhatsAppCampaignModal from '../components/WhatsAppCampaignModal';
import WhatsAppCampaignDetailsModal from '../components/WhatsAppCampaignDetailsModal';
import {
    createWhatsAppCampaign,
    addWhatsAppRecipients,
    deleteWhatsAppCampaign,
    getWhatsAppCampaignById,
    getWhatsAppCampaigns,
    getWhatsAppCampaignStats,
    sendWhatsAppCampaign,
    updateWhatsAppCampaign
} from '../services/whatsAppCampaignService';
import { CreateWhatsAppCampaignData, WhatsAppCampaign, WhatsAppCampaignStats } from '../types';

const emptyStats: WhatsAppCampaignStats = {
    totalCampaigns: 0,
    totalRecipients: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0
};

function getStatusBadge(status: WhatsAppCampaign['status']) {
    const labels = {
        draft: 'Borrador',
        sending: 'Enviando',
        completed: 'Completada',
        partial: 'Parcial',
        failed: 'Fallida'
    };

    const styles = {
        draft: 'bg-yellow-100 text-yellow-800',
        sending: 'bg-blue-100 text-blue-800',
        completed: 'bg-blue-100 text-blue-800',
        partial: 'bg-orange-100 text-orange-800',
        failed: 'bg-red-100 text-red-800'
    };

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

export default function WhatsAppCampaigns() {
    const location = useLocation();
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
    const [stats, setStats] = useState<WhatsAppCampaignStats>(emptyStats);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<WhatsAppCampaign | null>(null);
    const [prefilledTemplateId, setPrefilledTemplateId] = useState('');
    const [prefilledCampaignName, setPrefilledCampaignName] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState<WhatsAppCampaign | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void | Promise<void>;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const redirectToDashboardAfterCampaignSend = () => {
        navigate('/dashboard');
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [campaignResponse, statsResponse] = await Promise.all([
                getWhatsAppCampaigns({ limit: 50 }),
                getWhatsAppCampaignStats()
            ]);

            setCampaigns(campaignResponse.campaigns || []);
            setStats(statsResponse.stats || emptyStats);
        } catch (error) {
            console.error('Error loading WhatsApp campaigns:', error);
            toast.error('No se pudieron cargar las campañas de WhatsApp');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const state = location.state as {
            openCreate?: boolean;
            templateId?: string;
            templateName?: string;
        } | null;

        if (!state?.openCreate) {
            return;
        }

        setEditingCampaign(null);
        setPrefilledTemplateId(state.templateId || '');
        setPrefilledCampaignName(state.templateName ? `Campaña ${state.templateName}` : '');
        setIsModalOpen(true);
        navigate(location.pathname, { replace: true });
    }, [location.pathname, location.state, navigate]);

    const handleCreateCampaign = async (
        data: CreateWhatsAppCampaignData,
        recipients: Array<{ phoneNumber: string; name: string }>
    ) => {
        try {
            const response = await createWhatsAppCampaign({
                ...data,
                recipients
            });

            const campaignId = response.campaign._id;
            if (!response.campaign.totalRecipients && recipients.length > 0) {
                await addWhatsAppRecipients(campaignId, recipients);
            }

            toast.success('Campaña de WhatsApp creada');
            setIsModalOpen(false);
            setEditingCampaign(null);
            setPrefilledTemplateId('');
            setPrefilledCampaignName('');
            await loadData();
        } catch (error: any) {
            console.error('Error creating WhatsApp campaign:', error);
            toast.error(error.response?.data?.error || 'No se pudo crear la campaña');
        }
    };

    const handleUpdateCampaign = async (
        data: CreateWhatsAppCampaignData,
        recipients: Array<{ phoneNumber: string; name: string }>
    ) => {
        if (!editingCampaign) {
            return;
        }

        try {
            await updateWhatsAppCampaign(editingCampaign._id, data);
            await addWhatsAppRecipients(editingCampaign._id, recipients);
            toast.success('Campaña actualizada');
            setIsModalOpen(false);
            setEditingCampaign(null);
            setPrefilledTemplateId('');
            setPrefilledCampaignName('');
            await loadData();
        } catch (error: any) {
            console.error('Error updating WhatsApp campaign:', error);
            toast.error(error.response?.data?.error || 'No se pudo actualizar la campaña');
        }
    };

    const handleViewCampaign = async (campaign: WhatsAppCampaign) => {
        try {
            const response = await getWhatsAppCampaignById(campaign._id);
            setSelectedCampaign(response.campaign);
            setIsDetailsOpen(true);
        } catch (error) {
            console.error('Error loading WhatsApp campaign details:', error);
            toast.error('No se pudo cargar el detalle de la campaña');
        }
    };

    const handleEditCampaign = async (campaign: WhatsAppCampaign) => {
        try {
            const response = await getWhatsAppCampaignById(campaign._id);
            setEditingCampaign(response.campaign);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error loading campaign for edit:', error);
            toast.error('No se pudo cargar la campaña');
        }
    };

    const handleSendCampaign = (campaignId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Enviar campaña WhatsApp',
            message: 'Se enviará la plantilla a todos los destinatarios cargados.',
            onConfirm: async () => {
                try {
                    await sendWhatsAppCampaign(campaignId);
                    toast.success('Campaña en proceso de envío');
                    setConfirmDialog(current => ({ ...current, isOpen: false }));
                    redirectToDashboardAfterCampaignSend();
                } catch (error: any) {
                    console.error('Error sending WhatsApp campaign:', error);
                    toast.error(error.response?.data?.error || 'No se pudo enviar la campaña');
                }
            }
        });
    };

    const handleDeleteCampaign = (campaignId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Eliminar campaña',
            message: 'Esta acción eliminará la campaña y sus métricas.',
            onConfirm: async () => {
                try {
                    await deleteWhatsAppCampaign(campaignId);
                    toast.success('Campaña eliminada');
                    setConfirmDialog(current => ({ ...current, isOpen: false }));
                    await loadData();
                } catch (error: any) {
                    console.error('Error deleting WhatsApp campaign:', error);
                    toast.error(error.response?.data?.error || 'No se pudo eliminar la campaña');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Campañas de WhatsApp</h1>
                    <p className="text-gray-600">
                        Crea campañas desde plantillas aprobadas, importa teléfonos por CSV y envíalas masivamente.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setEditingCampaign(null);
                        setPrefilledTemplateId('');
                        setPrefilledCampaignName('');
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Campaña
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Campañas</p>
                    <p className="text-3xl font-semibold text-gray-900">{stats.totalCampaigns}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Destinatarios</p>
                    <p className="text-3xl font-semibold text-gray-900">{stats.totalRecipients}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Enviados</p>
                    <p className="text-3xl font-semibold text-blue-700">{stats.totalSent}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Fallidos</p>
                    <p className="text-3xl font-semibold text-red-700">{stats.totalFailed}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Mis campañas</h2>
                </div>

                {campaigns.length === 0 ? (
                    <div className="text-center py-14">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquareText className="w-7 h-7 text-blue-600" />
                        </div>
                        <p className="text-gray-700 font-medium">No hay campañas de WhatsApp creadas</p>
                        <p className="text-sm text-gray-500 mt-1">Crea una campaña y cárgale un CSV de teléfonos.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plantilla</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatarios</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviados</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fallidos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {campaigns.map(campaign => (
                                    <tr key={campaign._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleViewCampaign(campaign)}
                                                className="text-sm font-medium text-gray-900 hover:text-blue-700"
                                            >
                                                {campaign.name}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{campaign.templateName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{campaign.totalRecipients}</td>
                                        <td className="px-6 py-4">{getStatusBadge(campaign.status)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{campaign.sentCount}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{campaign.failedCount}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {new Date(campaign.createdAt).toLocaleDateString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewCampaign(campaign)}
                                                    className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-50"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {campaign.status === 'draft' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditCampaign(campaign)}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                        >
                                                            <MessageSquareText className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSendCampaign(campaign._id)}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCampaign(campaign._id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <WhatsAppCampaignModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCampaign(null);
                    setPrefilledTemplateId('');
                    setPrefilledCampaignName('');
                }}
                onSubmit={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
                campaign={editingCampaign}
                initialTemplateId={prefilledTemplateId}
                initialCampaignName={prefilledCampaignName}
            />

            <WhatsAppCampaignDetailsModal
                campaign={selectedCampaign}
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedCampaign(null);
                    loadData();
                }}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(current => ({ ...current, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
        </div>
    );
}
