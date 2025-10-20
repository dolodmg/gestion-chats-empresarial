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
import UserForm from './UserForm';
import { CreateUserData, UpdateUserData, userService } from '../../services/userService';
import { toast } from "sonner";

interface CreateUserDialogProps {
    onUserCreated: () => void;
}

export default function CreateUserDialog({ onUserCreated }: CreateUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const handleSaveUser = async (userData: CreateUserData | UpdateUserData) => {
  const data = userData as CreateUserData; 
  setModalError(null);
  setIsSaving(true);
  try {
    const newUser = await userService.createUser(data);
    toast.success("Usuario creado", {
      description: `El usuario ${newUser.name} ha sido creado exitosamente.`,
    });
    setOpen(false);
    onUserCreated();
  } catch (err: any) {
    console.error("Error creando usuario:", err);
    const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Error al crear el usuario.';
    setModalError(errorMessage);
    toast.error("Error al crear usuario", { description: errorMessage });
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
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                 <Button className='bg-sky-700 hover:cursor-pointer hover:bg-sky-800'>
                    <Plus className="w-4 h-4" />
                    Nuevo usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Crear usuario</DialogTitle>
                    <DialogDescription>
                        Completa los datos para registrar un nuevo usuario en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <UserForm
                    onSubmit={handleSaveUser}
                    isSaving={isSaving}
                    onCancel={() => handleOpenChange(false)}
                    mode='create'
                 />
                 {modalError && !isSaving && (
                    <p className="text-sm text-destructive mt-2 text-center">{modalError}</p>
                 )}
            </DialogContent>
        </Dialog>
    );
}