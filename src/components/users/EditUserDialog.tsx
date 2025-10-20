import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserForm from './UserForm';
import { UpdateUserData, userService } from '@/services/userService';
import { User } from '@/services/authService';
import { toast } from "sonner";

interface EditUserDialogProps {
  user: User; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;  
  onUserEdited: () => void;
}

type UserWithAnyId = User & { _id?: string; id?: string };

export default function EditUserDialog({ user, open, onOpenChange, onUserEdited }: EditUserDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSaveUser = async (userData: UpdateUserData) => {
    setModalError(null);
    setIsSaving(true);

    try {
      const { _id, id } = user as UserWithAnyId;
      const userId = _id ?? id;

      if (!userId) throw new Error('No se encontró el ID del usuario.');

      const updatedUser = await userService.updateUser(userId, userData);
      toast.success("Usuario actualizado", {
        description: `El usuario ${updatedUser.name} ha sido actualizado correctamente.`,
      });

      onOpenChange(false);
      onUserEdited();
    } catch (err: any) {
      console.error("Error actualizando usuario:", err);
      const errorMessage =
        err.response?.data?.msg || err.response?.data?.message || "Error al actualizar el usuario. Intenta de nuevo.";
      setModalError(errorMessage);
      toast.error("Error al actualizar", { description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Modificá los datos del usuario seleccionado y guardá los cambios.
          </DialogDescription>
        </DialogHeader>

        <UserForm
          initialData={user as Partial<any>}
          onSubmit={handleSaveUser}
          isSaving={isSaving}
          onCancel={() => onOpenChange(false)}
          mode="edit"
        />

        {modalError && !isSaving && (
          <p className="text-sm text-destructive mt-2 text-center">{modalError}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
