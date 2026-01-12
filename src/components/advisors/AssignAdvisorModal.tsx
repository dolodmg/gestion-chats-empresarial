import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdvisorSelector } from './AdvisorSelector';
import { chatService } from '../../services/chatService';
import { toast } from 'sonner';
import { UserCheck, Loader2 } from 'lucide-react';

interface AssignAdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: string;
    currentAdvisorId?: string | null;
    currentAdvisorName?: string | null;
    onAssignmentComplete: (advisorId: string | null, advisorName: string | null) => void;
}

export function AssignAdvisorModal({
    isOpen,
    onClose,
    chatId,
    currentAdvisorId,
    currentAdvisorName,
    onAssignmentComplete
}: AssignAdvisorModalProps) {
    const [selectedAdvisorId, setSelectedAdvisorId] = useState<string | null>(currentAdvisorId || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const updatedChat = await chatService.assignChatToAdvisor(chatId, selectedAdvisorId);

            toast.success(
                selectedAdvisorId ? 'Chat asignado' : 'Chat desasignado',
                {
                    description: selectedAdvisorId
                        ? `Chat asignado a ${updatedChat.assignedAdvisorName}`
                        : 'El chat ya no tiene asesor asignado'
                }
            );

            onAssignmentComplete(updatedChat.assignedAdvisorId || null, updatedChat.assignedAdvisorName || null);
            onClose();
        } catch (error: any) {
            toast.error('Error', {
                description: error.response?.data?.msg || 'No se pudo asignar el chat'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5" />
                        Asignar Asesor
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona un asesor para asignar este chat. El chat aparecerá en el dashboard del asesor seleccionado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {currentAdvisorName && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">
                                <span className="font-medium">Asignación actual:</span> {currentAdvisorName}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asesor
                        </label>
                        <AdvisorSelector
                            selectedAdvisorId={selectedAdvisorId}
                            onSelect={setSelectedAdvisorId}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Asignando...
                            </>
                        ) : (
                            'Asignar'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
