import { CampaignStats as CampaignStatsType } from '../types';
import { Mail, Send, Users } from 'lucide-react';

interface CampaignStatsProps {
    stats: CampaignStatsType;
}

export default function CampaignStats({ stats }: CampaignStatsProps) {
    const statCards = [
        {
            label: 'Total campañas',
            value: stats.totalCampaigns,
            icon: Mail,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Emails enviados',
            value: stats.totalSent,
            icon: Send,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            label: 'Total destinatarios',
            value: stats.totalRecipients,
            icon: Users,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
