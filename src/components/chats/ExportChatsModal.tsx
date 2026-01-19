import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { chatExportService } from '../../services/chatExportService';
import { toast } from 'sonner';
import { Download, Loader2, FileJson, FileSpreadsheet, Calendar } from 'lucide-react';

interface ExportChatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExportComplete: () => void;
}

export function ExportChatsModal({
    isOpen,
    onClose,
    onExportComplete
}: ExportChatsModalProps) {
    const [format, setFormat] = useState<'json' | 'csv'>('json');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            await chatExportService.exportAndDownload(startDate || undefined, endDate || undefined, format);

            const dateRangeText = startDate && endDate
                ? `del ${startDate} al ${endDate}`
                : startDate
                    ? `desde ${startDate}`
                    : endDate
                        ? `hasta ${endDate}`
                        : 'todos los chats';

            toast.success('Exportación completada', {
                description: `Chats ${dateRangeText} exportados exitosamente`
            });

            onExportComplete();
            onClose();

            // Reset form
            setStartDate('');
            setEndDate('');
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.msg || 'No se pudo exportar los chats'
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exportar Chats
                    </DialogTitle>
                    <DialogDescription>
                        Exporta chats por rango de fechas con todos sus datos
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                            La exportación incluirá: mensajes, etiquetas, asesor asignado, estado y timestamps.
                        </p>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Rango de fechas (opcional)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="startDate" className="text-xs text-gray-600">Desde</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={isExporting}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate" className="text-xs text-gray-600">Hasta</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isExporting}
                                    min={startDate}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Deja ambas fechas vacías para exportar todos los chats
                        </p>
                    </div>

                    {/* Format Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Formato de exportación
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFormat('json')}
                                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${format === 'json'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                disabled={isExporting}
                            >
                                <FileJson className={`w-8 h-8 ${format === 'json' ? 'text-blue-600' : 'text-gray-400'}`} />
                                <div className="text-center">
                                    <div className={`font-medium ${format === 'json' ? 'text-blue-900' : 'text-gray-700'}`}>
                                        JSON
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Datos completos
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFormat('csv')}
                                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${format === 'csv'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                disabled={isExporting}
                            >
                                <FileSpreadsheet className={`w-8 h-8 ${format === 'csv' ? 'text-blue-600' : 'text-gray-400'}`} />
                                <div className="text-center">
                                    <div className={`font-medium ${format === 'csv' ? 'text-blue-900' : 'text-gray-700'}`}>
                                        CSV
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Para Excel
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Format Info */}
                    {format === 'csv' && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <strong>Nota:</strong> El archivo CSV contendrá dos secciones: información de chats y mensajes.
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isExporting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Exportando...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
