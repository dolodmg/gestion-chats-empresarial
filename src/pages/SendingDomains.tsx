import { ReactNode, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clipboard, Globe, Loader2, RefreshCcw, Shield, Trash2 } from 'lucide-react';
import { CreateSendingDomainData, SendingDomain } from '../types';
import * as sendingDomainService from '../services/sendingDomainService';

const initialForm: CreateSendingDomainData = {
    domain: '',
    dkimSelector: 'default',
    trackingPrefix: 'track',
    bouncePrefix: 'bounce',
    dmarcRua: ''
};

type MessageState = {
    type: 'success' | 'error' | 'info';
    text: string;
} | null;

const statusStyles = {
    configured: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200'
} as const;

const statusLabels = {
    configured: 'Configurado',
    pending: 'Pendiente',
    error: 'Error'
} as const;

export default function SendingDomains() {
    const [sendingDomains, setSendingDomains] = useState<SendingDomain[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateSendingDomainData>(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [message, setMessage] = useState<MessageState>(null);

    useEffect(() => {
        loadDomains();
    }, []);

    const selectedDomain = useMemo(
        () => sendingDomains.find(domain => domain._id === selectedId) || sendingDomains[0] || null,
        [selectedId, sendingDomains]
    );

    const totals = useMemo(() => {
        return sendingDomains.reduce((acc, domain) => {
            acc.total += 1;
            if (domain.isVerified) acc.verified += 1;
            if (domain.isReadyForSending) acc.ready += 1;
            return acc;
        }, { total: 0, verified: 0, ready: 0 });
    }, [sendingDomains]);

    const showMessage = (type: MessageState['type'], text: string) => {
        setMessage(type ? { type, text } : null);
        window.setTimeout(() => setMessage(null), 5000);
    };

    const loadDomains = async () => {
        try {
            setLoading(true);
            const response = await sendingDomainService.getSendingDomains();
            const domains = response.sendingDomains || [];
            setSendingDomains(domains);
            if (!selectedId && domains[0]) {
                setSelectedId(domains[0]._id);
            }
        } catch (error) {
            console.error('Error loading sending domains:', error);
            showMessage('error', 'No se pudieron cargar los dominios autenticados.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDomain = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setSaving(true);
            const response = await sendingDomainService.createSendingDomain(formData);
            const createdDomain = response.sendingDomain;
            setSendingDomains(current => [createdDomain, ...current]);
            setSelectedId(createdDomain._id);
            setFormData(initialForm);
            showMessage('success', 'Dominio autenticado creado. Copiá los registros DNS y luego comprobalo.');
        } catch (error: any) {
            console.error('Error creating sending domain:', error);
            showMessage('error', error.response?.data?.error || 'No se pudo crear el dominio.');
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyDomain = async (id: string) => {
        try {
            setVerifyingId(id);
            const response = await sendingDomainService.verifySendingDomain(id);
            const updated = response.sendingDomain as SendingDomain;
            setSendingDomains(current => current.map(domain => domain._id === id ? updated : domain));
            showMessage('success', 'Verificación DNS finalizada.');
        } catch (error: any) {
            console.error('Error verifying sending domain:', error);
            showMessage('error', error.response?.data?.error || 'No se pudo verificar el dominio.');
        } finally {
            setVerifyingId(null);
        }
    };

    const handleDeleteDomain = async (id: string) => {
        const confirmed = window.confirm('¿Eliminar este dominio autenticado?');
        if (!confirmed) return;

        try {
            setDeletingId(id);
            await sendingDomainService.deleteSendingDomain(id);
            const nextDomains = sendingDomains.filter(domain => domain._id !== id);
            setSendingDomains(nextDomains);
            setSelectedId(nextDomains[0]?._id || null);
            showMessage('success', 'Dominio eliminado correctamente.');
        } catch (error: any) {
            console.error('Error deleting sending domain:', error);
            showMessage('error', error.response?.data?.error || 'No se pudo eliminar el dominio.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleCopy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            showMessage('success', 'Valor copiado al portapapeles.');
        } catch (error) {
            console.error('Error copying value:', error);
            showMessage('error', 'No se pudo copiar el valor.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dominios autenticados</h1>
                    <p className="mt-2 max-w-3xl text-sm text-gray-600">
                        Registrá el dominio del cliente, publicá SPF, DKIM, DMARC, tracking y bounce domain, y comprobá la configuración antes de asociarlo a un SMTP.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <SummaryCard label="Dominios" value={totals.total} icon={<Globe className="h-4 w-4" />} />
                    <SummaryCard label="Verificados" value={totals.verified} icon={<Shield className="h-4 w-4" />} />
                    <SummaryCard label="Listos para envío" value={totals.ready} icon={<CheckCircle2 className="h-4 w-4" />} />
                </div>
            </div>

            {message && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${
                    message.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : message.type === 'error'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-blue-200 bg-blue-50 text-blue-700'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Nuevo dominio</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            El cliente carga estos registros en su DNS. Después podrá asociar un SMTP propio al dominio.
                        </p>

                        <form onSubmit={handleCreateDomain} className="mt-5 space-y-4">
                            <Field label="Dominio">
                                <input
                                    value={formData.domain}
                                    onChange={(event) => setFormData(current => ({ ...current, domain: event.target.value }))}
                                    placeholder="mktday.ar"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    required
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Selector DKIM">
                                    <input
                                        value={formData.dkimSelector}
                                        onChange={(event) => setFormData(current => ({ ...current, dkimSelector: event.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                </Field>
                                <Field label="Prefijo tracking">
                                    <input
                                        value={formData.trackingPrefix}
                                        onChange={(event) => setFormData(current => ({ ...current, trackingPrefix: event.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Prefijo bounce">
                                    <input
                                        value={formData.bouncePrefix}
                                        onChange={(event) => setFormData(current => ({ ...current, bouncePrefix: event.target.value }))}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                </Field>
                                <Field label="RUA DMARC">
                                    <input
                                        value={formData.dmarcRua}
                                        onChange={(event) => setFormData(current => ({ ...current, dmarcRua: event.target.value }))}
                                        placeholder="reportes@midominio.com"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                </Field>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Crear dominio autenticado
                            </button>
                        </form>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Dominios cargados</h2>
                        <div className="mt-4 space-y-3">
                            {sendingDomains.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                                    Todavía no hay dominios cargados.
                                </p>
                            ) : sendingDomains.map(domain => (
                                <button
                                    key={domain._id}
                                    type="button"
                                    onClick={() => setSelectedId(domain._id)}
                                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                                        selectedDomain?._id === domain._id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-semibold text-gray-900">{domain.domain}</div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                Tracking: {domain.trackingSubdomain}
                                            </div>
                                        </div>
                                        <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyles[domain.isReadyForSending ? 'configured' : domain.isVerified ? 'pending' : 'error']}`}>
                                            {domain.isReadyForSending ? 'Listo' : domain.isVerified ? 'Parcial' : 'Sin verificar'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    {!selectedDomain ? (
                        <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
                            Seleccioná un dominio para ver sus registros DNS.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-semibold text-gray-900">{selectedDomain.domain}</h2>
                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[selectedDomain.isReadyForSending ? 'configured' : 'pending']}`}>
                                            {selectedDomain.isReadyForSending ? 'Listo para envío' : 'Pendiente de verificación'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Publicá estos registros en el DNS del cliente y después usá “Comprobar” para validar ownership, DKIM, DMARC, tracking y bounce.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleVerifyDomain(selectedDomain._id)}
                                        disabled={verifyingId === selectedDomain._id}
                                        className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {verifyingId === selectedDomain._id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                                        Comprobar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteDomain(selectedDomain._id)}
                                        disabled={deletingId === selectedDomain._id}
                                        className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {Object.entries(selectedDomain.verificationStatus).map(([key, status]) => (
                                    <div key={key} className="rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-800">{labelForStatusKey(key)}</span>
                                            <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyles[status.status]}`}>
                                                {statusLabels[status.status]}
                                            </span>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-500">
                                            {status.host || 'Sin host'}
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700">
                                            {status.status === 'configured'
                                                ? 'La configuración publicada coincide con la esperada.'
                                                : status.errorMessage || 'Todavía no se pudo validar este registro.'}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-gray-200">
                                <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                                    <h3 className="text-base font-semibold text-gray-900">Registros DNS</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Tipo</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Host</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Valor</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {selectedDomain.dnsRecords.map(record => {
                                                const status = selectedDomain.verificationStatus[record.key];
                                                return (
                                                    <tr key={record.key}>
                                                        <td className="px-4 py-4">
                                                            <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyles[status.status]}`}>
                                                                {statusLabels[status.status]}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-sm font-medium text-gray-700">{record.type}</td>
                                                        <td className="px-4 py-4 text-sm text-gray-700">{record.host}</td>
                                                        <td className="px-4 py-4 text-sm text-gray-700">
                                                            <div className="max-w-xl whitespace-pre-wrap break-all font-mono text-xs leading-6 text-gray-700">
                                                                {record.value}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(record.value)}
                                                                className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                                            >
                                                                <Clipboard className="mr-1 h-3.5 w-3.5" />
                                                                Copiar valor
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
                <div className="text-gray-400">{icon}</div>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">{value}</div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
            {children}
        </label>
    );
}

function labelForStatusKey(key: string) {
    switch (key) {
        case 'ownership':
            return 'Verificación';
        case 'spf':
            return 'SPF';
        case 'dkim':
            return 'DKIM';
        case 'dmarc':
            return 'DMARC';
        case 'tracking':
            return 'Tracking';
        case 'bounce':
            return 'Bounce';
        default:
            return key;
    }
}
