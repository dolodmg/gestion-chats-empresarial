import { useState, useRef } from 'react';
import { Recipient } from '../types';
import { parseCSV } from '../services/campaignService';
import { Upload, Plus, X } from 'lucide-react';

interface RecipientManagerProps {
    recipients: Recipient[];
    onRecipientsChange: (recipients: Recipient[]) => void;
}

export default function RecipientManager({ recipients, onRecipientsChange }: RecipientManagerProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleAddRecipient = () => {
        setError('');

        if (!email.trim()) {
            setError('Por favor ingresa un email');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email inválido');
            return;
        }

        if (recipients.some(r => r.email.toLowerCase() === email.toLowerCase())) {
            setError('Este email ya fue agregado');
            return;
        }

        const newRecipient: Recipient = {
            email: email.toLowerCase().trim(),
            name: name.trim(),
            status: 'pending'
        };

        onRecipientsChange([...recipients, newRecipient]);
        setEmail('');
        setName('');
    };

    const handleRemoveRecipient = (index: number) => {
        const newRecipients = recipients.filter((_, i) => i !== index);
        onRecipientsChange(newRecipients);
    };

    const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvContent = e.target?.result as string;

            try {
                const response = await parseCSV(csvContent);

                let added = 0;
                response.recipients.forEach((recipient: Recipient) => {
                    if (!recipients.some(r => r.email === recipient.email)) {
                        recipients.push(recipient);
                        added++;
                    }
                });

                onRecipientsChange([...recipients]);
                setError('');
                alert(`${added} destinatarios agregados del CSV (${response.recipients.length - added} duplicados omitidos)`);
            } catch (err) {
                setError('Error procesando CSV');
                console.error(err);
            }
        };

        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Destinatarios</h3>

            {/* CSV Upload */}
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
                <p className="text-sm font-medium text-gray-700">Subir archivo CSV</p>
                <p className="text-xs text-gray-500 mt-1">Un email por línea</p>
            </div>

            {/* Manual Input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                    placeholder="email@ejemplo.com"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                    placeholder="Nombre (opcional)"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                    onClick={handleAddRecipient}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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

            {/* Recipients List */}
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {recipients.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-8">No hay destinatarios agregados</p>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {recipients.map((recipient, index) => (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{recipient.email}</p>
                                    {recipient.name && (
                                        <p className="text-xs text-gray-500 truncate">{recipient.name}</p>
                                    )}
                                </div>
                                <button
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
