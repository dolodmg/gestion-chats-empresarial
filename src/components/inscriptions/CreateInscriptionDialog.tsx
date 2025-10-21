import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import InscriptionForm from './InscriptionForm';
import { CreateInscriptionData, inscriptionService } from '../../services/inscriptionService';
import { toast } from "sonner";

interface CreateInscriptionDialogProps {
  onInscriptionCreated: () => void;
}

export default function CreateInscriptionDialog({ onInscriptionCreated }: CreateInscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSaveInscription = async (inscriptionData: CreateInscriptionData) => {
    setModalError(null);
    setIsSaving(true);
    try {
      const result = await inscriptionService.createInscription(inscriptionData);
      toast.success("Inscripción creada", {
        description: `La inscripción de ${inscriptionData.nombreCompleto} ha sido creada exitosamente.`,
      });
      setOpen(false);
      onInscriptionCreated();
    } catch (err: any) {
      console.error("Error creando inscripción:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error al crear la inscripción.';
      setModalError(errorMessage);
      toast.error("Error al crear inscripción", { description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setModalError(null);
      setIsSaving(false);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className='bg-sky-700 hover:cursor-pointer hover:bg-sky-800'>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Inscripción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Inscripción</DialogTitle>
          <DialogDescription>
            Completa los datos para registrar una nueva inscripción en el sistema.
          </DialogDescription>
        </DialogHeader>

        <InscriptionForm
          onSubmit={handleSaveInscription}
          isSaving={isSaving}
          onCancel={() => handleOpenChange(false)}
        />
        {modalError && !isSaving && (
          <p className="text-sm text-destructive mt-2 text-center">{modalError}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}