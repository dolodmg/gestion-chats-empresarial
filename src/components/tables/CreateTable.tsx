import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api'; 

export interface TableFormData {
  tableName: string;
  description?: string;
  collectionName: string;
  fields: { name: string; type: string; label: string; required: boolean }[];
}

interface CreateTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TableFormData) => Promise<void>;
  isSaving: boolean;
}

export default function CreateTableModal({ open, onOpenChange, onSave, isSaving }: CreateTableModalProps) {
  const [formData, setFormData] = useState<TableFormData>({
    tableName: '',
    collectionName: '',
    description: '',
    fields: [
      { name: 'nombre', type: 'string', label: 'Nombre', required: true }
    ]
  });

  const [isCheckingCollection, setIsCheckingCollection] = useState(false);
  const [isCollectionAvailable, setIsCollectionAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        tableName: '',
        collectionName: '',
        description: '',
        fields: [{ name: 'nombre', type: 'string', label: 'Nombre', required: true }]
      });
      setIsCollectionAvailable(null);
    }
  }, [open]);

  useEffect(() => {
    if (!formData.collectionName.trim()) {
      setIsCollectionAvailable(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsCheckingCollection(true);
        const response = await api.get(`/custom-tables/check-name`, {
          params: { collectionName: formData.collectionName.trim() },
        });

        setIsCollectionAvailable(response.data.available === true);
      } catch (err: any) {
        console.error("Error al verificar nombre de colección:", err);
        setIsCollectionAvailable(null);
      } finally {
        setIsCheckingCollection(false);
      }
    }, 600); 

    return () => clearTimeout(timeout);
  }, [formData.collectionName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tableName.trim()) {
      toast.error("Error de validación", { description: "El nombre de la tabla es obligatorio." });
      return;
    }

    if (!formData.collectionName.trim()) {
      toast.error("Error de validación", { description: "El nombre de la colección es obligatorio." });
      return;
    }

    if (isCollectionAvailable === false) {
      toast.error("Nombre en uso", { description: "Ya existe una colección con ese nombre." });
      return;
    }

    if (!formData.fields || formData.fields.length === 0) {
      toast.error("Error de validación", { description: "Debe agregar al menos un campo." });
      return;
    }

    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Crear nueva tabla</DialogTitle>
          <DialogDescription>
            Definí el nombre, la colección en MongoDB y al menos un campo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="table-form" className="grid gap-4 py-4">
          {/* Nombre de la tabla */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tableName" className="text-right">
              Nombre
            </Label>
            <Input
              id="tableName"
              name="tableName"
              value={formData.tableName}
              onChange={handleChange}
              className="col-span-3"
              required
              disabled={isSaving}
              placeholder="Ej: Ventas, Productos, Clientes"
            />
          </div>

          {/* Nombre de la colección con verificación */}
          <div className="grid grid-cols-4 items-center gap-4 relative">
            <Label htmlFor="collectionName" className="text-right">
              Colección
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="collectionName"
                name="collectionName"
                value={formData.collectionName}
                onChange={handleChange}
                required
                disabled={isSaving}
                placeholder="Ej: ventas_ferreteria_2024"
              />
              {/* Íconos visuales */}
              {isCheckingCollection && (
                <Loader2 className="absolute right-2 top-2 h-4 w-4 text-gray-400 animate-spin" />
              )}
              {isCollectionAvailable === true && !isCheckingCollection && (
                <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-green-600" />
              )}
              {isCollectionAvailable === false && !isCheckingCollection && (
                <XCircle className="absolute right-2 top-2 h-4 w-4 text-red-500" />
              )}
            </div>
          </div>

          {/* Descripción (opcional) */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Descripción <span className="text-gray-400 text-xs">(opcional)</span>
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="col-span-3 h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving}
              placeholder="Descripción breve de la tabla..."
            />
          </div>
        </form>

        {/* Botones */}
        <div className="flex justify-end space-x-2 mt-2">
          <Button
            className="bg-zinc-400 text-white hover:text-white hover:bg-zinc-500 border-none"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            className="bg-sky-700 hover:bg-sky-800"
            type="submit"
            form="table-form"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
              </>
            ) : (
              'Crear tabla'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
