import { useRef, useState } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { WhatsAppCampaignRecipient } from '../types';
import { parseWhatsAppCSV } from '../services/whatsAppCampaignService';
import { toast } from 'sonner';

interface WhatsAppRecipientManagerProps {
    recipients: Array<Pick<WhatsAppCampaignRecipient, 'phoneNumber' | 'name'>>;
    onRecipientsChange: (recipients: Array<Pick<WhatsAppCampaignRecipient, 'phoneNumber' | 'name'>>) => void;
}

function normalizePhone(value: string) {
    return value.replace(/\D/g, '');
}

export default function WhatsAppRecipientManager({
    recipients,
    onRecipientsChange
}: WhatsAppRecipientManagerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleAddRecipient = () => {
        setError('');
        const normalizedPhone = normalizePhone(phoneNumber);

        if (!normalizedPhone) {
            setError('Ingresa un número de teléfono');
            return;
        }

        if (normalizedPhone.length < 8) {
            setError('El teléfono es demasiado corto');
            return;
        }

        if (recipients.some(recipient => recipient.phoneNumber === normalizedPhone)) {
            setError('Ese teléfono ya fue agregado');
            return;
        }

        onRecipientsChange([
            ...recipients,
            {
                phoneNumber: normalizedPhone,
                name: name.trim()
            }
        ]);

        setPhoneNumber('');
        setName('');
    };

    const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = async fileEvent => {
            try {
                const csvContent = String(fileEvent.target?.result || '');
                const response = await parseWhatsAppCSV(csvContent);
                const existing = new Set(recipients.map(recipient => recipient.phoneNumber));
                const parsedRecipients = (response.recipients || []) as Array<Pick<WhatsAppCampaignRecipient, 'phoneNumber' | 'name'>>;
                const newRecipients = parsedRecipients.filter(recipient => !existing.has(recipient.phoneNumber));

                onRecipientsChange([...recipients, ...newRecipients]);
                setError('');

                toast.success('CSV procesado', {
                    description: `${newRecipients.length} números agregados`
                });
            } catch (uploadError: any) {
                console.error('Error processing WhatsApp CSV:', uploadError);
                setError('No se pudo procesar el CSV');
            }
        };

        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveRecipient = (index: number) => {
        onRecipientsChange(recipients.filter((_, currentIndex) => currentIndex !== index));
    };

    return (
        <div className="space-y-4">
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCSVUpload}
                    className="hidden"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Subir CSV de teléfonos</p>
                <p className="text-xs text-gray-500 mt-1">Acepta `telefono` o una columna A con un número por fila</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    type="text"
                    value={phoneNumber}
                    onChange={event => setPhoneNumber(event.target.value)}
                    placeholder="5491122334455"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                    type="text"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    placeholder="Nombre opcional"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                    type="button"
                    onClick={handleAddRecipient}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                </button>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                </div>
            )}

            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {recipients.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-8">No hay números cargados</p>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {recipients.map((recipient, index) => (
                            <div key={`${recipient.phoneNumber}-${index}`} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{recipient.phoneNumber}</p>
                                    {recipient.name && (
                                        <p className="text-xs text-gray-500 truncate">{recipient.name}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRecipient(index)}
                                    className="ml-3 text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500">
                Total: <strong>{recipients.length}</strong> destinatarios
            </p>
        </div>
    );
}
