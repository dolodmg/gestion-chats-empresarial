import React, { useState } from 'react';
import { CreateInscriptionData } from '../../services/inscriptionService';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InscriptionFormProps {
  onSubmit: (inscriptionData: CreateInscriptionData) => Promise<void>;
  isSaving: boolean;
  onCancel: () => void;
}

const PROVINCIAS = [
  'Buenos Aires',
  'CABA',
  'Córdoba',
  'Santa Fe',
  'Tucumán',
  'Entre Ríos',
  'Neuquén',
  'Río Negro',
  'Misiones',
  'Corrientes',
  'Formosa',
  'Chaco',
  'Catamarca',
  'La Rioja',
  'Santiago del Estero',
  'Salta',
  'Jujuy',
  'San Juan',
  'San Luis',
  'La Pampa',
  'Mendoza',
  'Chubut',
  'Santa Cruz',
  'Tierra del Fuego',
  'Otros',
];

const initialFormData: CreateInscriptionData = {
  dni: '',
  nombreCompleto: '',
  curso: '',
  correo: '',
  provincia: '',
  localidad: '',
  codigoPostal: '',
};

export default function InscriptionForm({
  onSubmit,
  isSaving,
  onCancel,
}: InscriptionFormProps) {
  const [formData, setFormData] = useState<CreateInscriptionData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedProvincia, setSelectedProvincia] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProvinciaChange = (value: string) => {
    setSelectedProvincia(value);
    setFormData(prev => ({ ...prev, provincia: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validaciones
    if (!formData.dni.trim()) {
      setFormError("El DNI es obligatorio.");
      return;
    }

    if (!formData.nombreCompleto.trim()) {
      setFormError("El nombre completo es obligatorio.");
      return;
    }

    if (!formData.correo.trim()) {
      setFormError("El correo es obligatorio.");
      return;
    }

    if (!formData.curso.trim()) {
      setFormError("El curso es obligatorio.");
      return;
    }

    if (!formData.provincia.trim()) {
      setFormError("La provincia es obligatoria.");
      return;
    }

    if (!formData.localidad.trim()) {
      setFormError("La localidad es obligatoria.");
      return;
    }

    if (!formData.codigoPostal.trim()) {
      setFormError("El código postal es obligatorio.");
      return;
    }

    try {
      await onSubmit(formData);
      setFormData(initialFormData);
      setSelectedProvincia(undefined);
    } catch (error: any) {
      setFormError(error.message || "Ocurrió un error al guardar.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg text-sm">
          {formError}
        </div>
      )}

      {/* DNI */}
      <div className="space-y-1.5">
        <Label htmlFor="dni">DNI / ID <span className="text-red-500">*</span></Label>
        <Input
          id="dni"
          name="dni"
          type="text"
          value={formData.dni}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="Número de documento"
        />
      </div>

      {/* Nombre Completo */}
      <div className="space-y-1.5">
        <Label htmlFor="nombreCompleto">Nombre Completo <span className="text-red-500">*</span></Label>
        <Input
          id="nombreCompleto"
          name="nombreCompleto"
          type="text"
          value={formData.nombreCompleto}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="Nombre y apellido"
        />
      </div>

      {/* Correo */}
      <div className="space-y-1.5">
        <Label htmlFor="correo">Correo Electrónico <span className="text-red-500">*</span></Label>
        <Input
          id="correo"
          name="correo"
          type="email"
          value={formData.correo}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="correo@ejemplo.com"
        />
      </div>

      {/* Curso - INPUT DE TEXTO */}
      <div className="space-y-1.5">
        <Label htmlFor="curso">Curso <span className="text-red-500">*</span></Label>
        <Input
          id="curso"
          name="curso"
          type="text"
          value={formData.curso}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="Nombre del curso (ej: Marketing Digital)"
        />
      </div>

      {/* Provincia - SELECT */}
      <div className="space-y-1.5">
        <Label htmlFor="provincia">Provincia <span className="text-red-500">*</span></Label>
        <Select
          value={selectedProvincia}
          onValueChange={handleProvinciaChange}
          disabled={isSaving}
        >
          <SelectTrigger id="provincia">
            <SelectValue placeholder="Seleccionar provincia..." />
          </SelectTrigger>
          <SelectContent>
            {PROVINCIAS.map((prov) => (
              <SelectItem key={prov} value={prov}>
                {prov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Localidad */}
      <div className="space-y-1.5">
        <Label htmlFor="localidad">Localidad <span className="text-red-500">*</span></Label>
        <Input
          id="localidad"
          name="localidad"
          type="text"
          value={formData.localidad}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="Ciudad o localidad"
        />
      </div>

      {/* Código Postal */}
      <div className="space-y-1.5">
        <Label htmlFor="codigoPostal">Código Postal <span className="text-red-500">*</span></Label>
        <Input
          id="codigoPostal"
          name="codigoPostal"
          type="text"
          value={formData.codigoPostal}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="CP"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          className="bg-red-700 hover:bg-red-800 text-white font-normal"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          className="bg-sky-700 hover:bg-sky-800"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Inscripción'
          )}
        </Button>
      </div>
    </form>
  );
}