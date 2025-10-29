import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';
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

const FIELD_TYPES = ['string', 'number', 'boolean', 'date'];

export default function CreateTableModal({ open, onOpenChange, onSave, isSaving }: CreateTableModalProps) {
  const [formData, setFormData] = useState<TableFormData>({
    tableName: '',
    collectionName: '',
    description: '',
    fields: []
  });

  const [isCheckingCollection, setIsCheckingCollection] = useState(false);
  const [isCollectionAvailable, setIsCollectionAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        tableName: '',
        collectionName: '',
        description: '',
        fields: []
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
    }, 300); 

    return () => clearTimeout(timeout);
  }, [formData.collectionName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        { name: '', type: 'string', label: '', required: false }
      ]
    }));
  };

  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index: number, key: keyof typeof formData.fields[0], value: any) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => 
        i === index ? { ...field, [key]: value } : field
      )
    }));
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

    const invalidFields = formData.fields.some(f => !f.name.trim() || !f.label.trim());
    if (invalidFields) {
      toast.error("Error de validación", { description: "Todos los campos deben tener nombre y etiqueta." });
      return;
    }

    const fieldNames = formData.fields.map(f => f.name.trim().toLowerCase());
    const hasDuplicates = fieldNames.length !== new Set(fieldNames).size;
    if (hasDuplicates) {
      toast.error("Error de validación", { description: "No puede haber campos con el mismo nombre." });
      return;
    }

    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nueva tabla</DialogTitle>
          <DialogDescription>
            Definí el nombre, la colección en MongoDB y agregá los campos necesarios.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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

          {/* Sección de campos */}
          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <Label className="text-base font-semibold">Campos de la tabla</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
                disabled={isSaving}
                className="text-sky-700 border-sky-700 hover:bg-sky-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar campo
              </Button>
            </div>

            {formData.fields.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed rounded-lg">
                No hay campos agregados. Haz clic en "Agregar campo" para comenzar.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.fields.map((field, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-12 gap-2 items-start">
                      {/* Nombre del campo */}
                      <div className="col-span-3">
                        <Label className="text-xs mb-1 block">Nombre</Label>
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(index, 'name', e.target.value)}
                          placeholder="ej: precio"
                          className="h-8 text-sm"
                          disabled={isSaving}
                        />
                      </div>

                      {/* Etiqueta */}
                      <div className="col-span-3">
                        <Label className="text-xs mb-1 block">Etiqueta</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, 'label', e.target.value)}
                          placeholder="ej: Precio"
                          className="h-8 text-sm"
                          disabled={isSaving}
                        />
                      </div>

                      {/* Tipo */}
                      <div className="col-span-3">
                        <Label className="text-xs mb-1 block">Tipo</Label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, 'type', e.target.value)}
                          className="h-8 w-full rounded-md border border-input bg-white px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          disabled={isSaving}
                        >
                          {FIELD_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                        </select>
                      </div>

                      {/* Requerido */}
                      <div className="col-span-2 flex items-end h-full">
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                            disabled={isSaving}
                          />
                          <span className="text-xs">Requerido</span>
                        </label>
                      </div>

                      {/* Eliminar */}
                      <div className="col-span-1 flex items-end justify-end h-full">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(index)}
                          disabled={isSaving}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-2 mt-2 pt-4 border-t">
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
            onClick={handleSubmit}
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