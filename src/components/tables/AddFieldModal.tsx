import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TableField {
  name: string;
  type: string;
  label: string;
  required: boolean;
}

interface AddFieldModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (fields: TableField[]) => Promise<void>;
  isSaving: boolean;
  tableId: string;
  tableName: string;
  existingFields: TableField[];
}

const FIELD_TYPES = [
  { value: 'string', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Verdadero/Falso' },
  { value: 'date', label: 'Fecha' },
];

export default function AddFieldModal({ 
  open, 
  onOpenChange, 
  onSave, 
  isSaving, 
  tableName,
  existingFields 
}: AddFieldModalProps) {
  const [newFields, setNewFields] = useState<TableField[]>([]);

  useEffect(() => {
    if (open) {
      setNewFields([]);
    }
  }, [open]);

  const addField = () => {
    setNewFields(prev => [
      ...prev,
      { name: '', type: 'string', label: '', required: false }
    ]);
  };

  const removeField = (index: number) => {
    setNewFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof TableField, value: any) => {
    setNewFields(prev => prev.map((field, i) => 
      i === index ? { ...field, [key]: value } : field
    ));
  };

  const handleSubmit = async () => {
    if (newFields.length === 0) {
      toast.error("Error de validación", { description: "Debe agregar al menos un campo nuevo." });
      return;
    }

    // Validar que todos los campos tengan nombre y label
    const invalidFields = newFields.some(f => !f.name.trim() || !f.label.trim());
    if (invalidFields) {
      toast.error("Error de validación", { description: "Todos los campos deben tener nombre y etiqueta." });
      return;
    }

    // Validar que no haya nombres duplicados entre campos nuevos
    const newFieldNames = newFields.map(f => f.name.trim().toLowerCase());
    const hasDuplicates = newFieldNames.length !== new Set(newFieldNames).size;
    if (hasDuplicates) {
      toast.error("Error de validación", { description: "No puede haber campos nuevos con el mismo nombre." });
      return;
    }

    // Validar que no existan ya en la tabla
    const existingFieldNames = existingFields.map(f => f.name.toLowerCase());
    const hasConflict = newFieldNames.some(name => existingFieldNames.includes(name));
    if (hasConflict) {
      toast.error("Error de validación", { description: "Uno o más campos ya existen en la tabla." });
      return;
    }

    await onSave(newFields);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar campos a "{tableName}"</DialogTitle>
          <DialogDescription>
            Define los nuevos campos que deseas agregar a esta tabla.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Información de campos existentes */}
          {existingFields.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-1">Campos existentes:</p>
                  <p className="text-xs text-blue-700">
                    {existingFields.map(f => f.name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón para agregar campo */}
          <div className="flex justify-between items-center mb-4">
            <Label className="text-base font-semibold">Nuevos campos</Label>
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

          {/* Lista de nuevos campos */}
          {newFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed rounded-lg">
              No hay campos nuevos. Haz clic en "Agregar campo" para comenzar.
            </div>
          ) : (
            <div className="space-y-3">
              {newFields.map((field, index) => (
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
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Requerido */}
                    <div className="col-span-2 flex items-center h-full pt-5">
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

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
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
            disabled={isSaving || newFields.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              'Agregar campos'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}