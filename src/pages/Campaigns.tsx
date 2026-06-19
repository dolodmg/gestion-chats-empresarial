import { useState, useEffect } from 'react';
import { Plus, Send, Edit2, Trash2, Eye, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Campaign, CampaignStats as CampaignStatsType, CreateCampaignData, Recipient } from '../types';
import * as campaignService from '../services/campaignService';
import CampaignStats from '../components/CampaignStats';
import CampaignModal from '../components/CampaignModal';
import CredentialManagementModal from '../components/CredentialManagementModal';
import CampaignDetailsModal from '../components/CampaignDetailsModal';
import AlertDialog from '../components/AlertDialog';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<CampaignStatsType>({
        totalCampaigns: 0,
        totalSent: 0,
        totalFailed: 0,
        totalRecipients: 0
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [isCredentialManagementOpen, setIsCredentialManagementOpen] = useState(false);
    const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({ isOpen: false, title: '', message: '', type: 'info' });
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [campaignsData, statsData] = await Promise.all([
                campaignService.getCampaigns({ limit: 50 }),
                campaignService.getStats()
            ]);

            setCampaigns(campaignsData.campaigns || []);
            setStats(statsData.stats || {
                totalCampaigns: 0,
                totalSent: 0,
                totalFailed: 0,
                totalRecipients: 0
            });
        } catch (error) {
            console.error('Error loading data:', error);
            showAlert('error', 'Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const handleCreateCampaign = async (data: CreateCampaignData, recipients: Recipient[]) => {
        try {
            const response = await campaignService.createCampaign(data);
            const campaignId = response.campaign._id;

            if (recipients.length > 0) {
                await campaignService.addRecipients(campaignId, recipients);
            }

            showAlert('success', 'Campaña creada exitosamente');
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error creating campaign:', error);
            showAlert('error', 'Error creando campaña');
        }
    };

    const handleUpdateCampaign = async (data: CreateCampaignData) => {
        if (!editingCampaign) return;

        try {
            await campaignService.updateCampaign(editingCampaign._id, data);
            showAlert('success', 'Campaña actualizada exitosamente');
            setIsModalOpen(false);
            setEditingCampaign(null);
            loadData();
        } catch (error) {
            console.error('Error updating campaign:', error);
            showAlert('error', 'Error actualizando campaña');
        }
    };

    const handleSendCampaign = async (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Enviar campaña',
            message: '¿Estás seguro de enviar esta campaña? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await campaignService.sendCampaign(id);
                    showAlert('success', 'Campaña en proceso de envío');
                    setTimeout(loadData, 2000);
                } catch (error) {
                    console.error('Error sending campaign:', error);
                    showAlert('error', 'Error enviando campaña');
                }
            }
        });
    };

    const handleDeleteCampaign = async (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Eliminar campaña',
            message: '¿Estás seguro de eliminar esta campaña?',
            onConfirm: async () => {
                try {
                    await campaignService.deleteCampaign(id);
                    showAlert('success', 'Campaña eliminada exitosamente');
                    loadData();
                } catch (error) {
                    console.error('Error deleting campaign:', error);
                    showAlert('error', 'Error eliminando campaña');
                }
            }
        });
    };

    const handleEditCampaign = async (campaign: Campaign) => {
        try {
            const response = await campaignService.getCampaignById(campaign._id);
            setEditingCampaign(response.campaign);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error loading campaign:', error);
            showAlert('error', 'Error cargando campaña');
        }
    };

    const handleViewCampaign = async (campaign: Campaign) => {
        try {
            const response = await campaignService.getCampaignById(campaign._id);
            setSelectedCampaign(response.campaign);
            setIsDetailsOpen(true);
        } catch (error) {
            console.error('Error loading campaign details:', error);
            showAlert('error', 'Error cargando el detalle de la campaÃ±a');
        }
    };

    const getStatusBadge = (status: Campaign['status']) => {
        const styles = {
            draft: 'bg-yellow-100 text-yellow-800',
            sending: 'bg-blue-100 text-blue-800',
            sent: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            partial: 'bg-orange-100 text-orange-800'
        };

        const labels = {
            draft: 'Borrador',
            sending: 'Enviando',
            sent: 'Enviado',
            failed: 'Fallido',
            partial: 'Parcial'
        };

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
                {labels[status]}
            </span>
        );
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
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Campañas de Email</h1>
                        <p className="text-gray-600">Gestiona y envía campañas de publicidad masivas</p>
                    </div>
                     <div className="flex gap-3">
                        <Link
                            to="/sending-domains"
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Dominios autenticados
                        </Link>
                        <button
                            onClick={() => setIsCredentialManagementOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Administrar credenciales
                        </button>
                        <button
                            onClick={() => {
                                setEditingCampaign(null);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Campaña
                        </button>
                    </div>
                </div>
            </div>

            {/* Alert */}
            {alert && (
                <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                    alert.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                        'bg-blue-50 border border-blue-200 text-blue-800'
                    }`}>
                    {alert.message}
                </div>
            )}

            {/* Stats */}
            <CampaignStats stats={stats} />

            {/* Campaigns Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Mis Campañas</h2>
                </div>

                {campaigns.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-2">No tienes campañas creadas</p>
                        <p className="text-sm text-gray-400">Crea tu primera campaña para comenzar</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Asunto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Destinatarios
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Enviados
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {campaigns.map((campaign) => (
                                    <tr key={campaign._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleViewCampaign(campaign)}
                                                className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                            >
                                                {campaign.name}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700 max-w-xs truncate">{campaign.subject}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {campaign.totalRecipients}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(campaign.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {campaign.sentCount} / {campaign.totalRecipients}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(campaign.createdAt).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {campaign.status === 'draft' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewCampaign(campaign)}
                                                            className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-50"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditCampaign(campaign)}
                                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleSendCampaign(campaign._id)}
                                                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {(campaign.status === 'sent' || campaign.status === 'partial' || campaign.status === 'failed' || campaign.status === 'sending') && (
                                                    <button
                                                        onClick={() => handleViewCampaign(campaign)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
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

            {/* Modal */}
            <CampaignModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingCampaign(null);
                }}
                onSave={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
                onValidationError={(message) => {
                    setAlertDialog({
                        isOpen: true,
                        title: 'Validación',
                        message: message,
                        type: 'error'
                    });
                }}
                initialData={editingCampaign ? {
                    name: editingCampaign.name,
                    subject: editingCampaign.subject,
                    htmlContent: editingCampaign.htmlContent,
                    textContent: editingCampaign.textContent,
                    trackOpens: editingCampaign.trackOpens,
                    trackClicks: editingCampaign.trackClicks,
                    callToActionUrl: editingCampaign.callToActionUrl,
                    callToActionLabel: editingCampaign.callToActionLabel,
                    emailCredentialId: typeof editingCampaign.emailCredential === 'string'
                        ? editingCampaign.emailCredential
                        : editingCampaign.emailCredential._id,
                    recipients: editingCampaign.recipients
                } : undefined}
                title={editingCampaign ? 'Editar campaña' : 'Nueva campaña'}
            />

            <CampaignDetailsModal
                campaign={selectedCampaign}
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedCampaign(null);
                }}
            />

            {/* Credential Management Modal */}
            <CredentialManagementModal
                isOpen={isCredentialManagementOpen}
                onClose={() => setIsCredentialManagementOpen(false)}
                onCredentialChange={() => {
                    // Reload data if needed
                }}
                onMessage={(type, message) => {
                    setAlertDialog({
                        isOpen: true,
                        title: type === 'success' ? 'Éxito' : 'Error',
                        message: message,
                        type: type
                    });
                }}
            />

            {/* Alert Dialog */}
            <AlertDialog
                isOpen={alertDialog.isOpen}
                onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
                title={alertDialog.title}
                message={alertDialog.message}
                type={alertDialog.type}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant="danger"
            />
        </div>
    );
}
