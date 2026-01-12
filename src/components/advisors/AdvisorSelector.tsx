import { useState, useEffect } from 'react';
import { advisorService, type Advisor } from '../../services/advisorService';
import { Loader2 } from 'lucide-react';

interface AdvisorSelectorProps {
    selectedAdvisorId: string | null;
    onSelect: (advisorId: string | null) => void;
    disabled?: boolean;
}

export function AdvisorSelector({ selectedAdvisorId, onSelect, disabled = false }: AdvisorSelectorProps) {
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                setLoading(true);
                const data = await advisorService.getAdvisors();
                setAdvisors(data.filter(a => a.active));
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al cargar asesores');
            } finally {
                setLoading(false);
            }
        };

        fetchAdvisors();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-red-600 py-2">
                {error}
            </div>
        );
    }

    return (
        <select
            value={selectedAdvisorId || ''}
            onChange={(e) => onSelect(e.target.value || null)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <option value="">Sin asignar</option>
            {advisors.map((advisor) => (
                <option key={advisor._id} value={advisor._id}>
                    {advisor.name} {advisor.email && `(${advisor.email})`}
                </option>
            ))}
        </select>
    );
}
