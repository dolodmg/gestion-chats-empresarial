import React, { useState } from 'react';
import { CreateUserData } from '../../services/userService';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Shadcn

interface UserFormProps {
  onSubmit: (userData: CreateUserData) => Promise<void>;
  isSaving: boolean;
  onCancel: () => void; 
}

// Valores iniciales para el formulario de creación
const initialFormData: CreateUserData = {
  name: '',
  email: '',
  password: '',
  role: 'client',
  clientId: '',
  workflowId: '',
  whatsappToken: '',
};

export default function UserForm({ onSubmit, isSaving, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: 'client' | 'admin') => {
    setFormData(prev => ({
        ...prev,
        role: value,
        clientId: value === 'admin' ? '' : prev.clientId
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); 

    if (!formData.password) {
      setFormError("La contraseña es obligatoria.");
      return;
    }
    if (formData.role === 'client' && !formData.clientId) {
      setFormError("El Client ID es obligatorio para el rol 'cliente'.");
      return;
    }

    const dataToSubmit: CreateUserData = {
      ...formData,
      clientId: formData.role === 'client' ? formData.clientId : '',
      workflowId: formData.workflowId || '',
      whatsappToken: formData.whatsappToken || '',
    };

    try {
        console.log(initialFormData)
        await onSubmit(dataToSubmit);
        setFormData(initialFormData); 
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

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="Nombre completo"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="usuario@ejemplo.com"
        />
      </div>

       {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isSaving}
          placeholder="••••••••"
        />
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <Label htmlFor="role">Rol <span className="text-red-500">*</span></Label>
         <Select
            name="role" 
            value={formData.role}
            onValueChange={handleRoleChange} 
            disabled={isSaving}
            required
        >
            <SelectTrigger id="role">
                <SelectValue placeholder="Seleccionar rol..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
        </Select>
      </div>

       {/* Client ID (condicional) */}
      {formData.role === 'client' && (
        <div className="space-y-1.5">
          <Label htmlFor="clientId">Client ID <span className="text-red-500">*</span></Label>
          <Input
            id="clientId"
            name="clientId"
            type="text"
            value={formData.clientId}
            onChange={handleChange}
            required 
            disabled={isSaving}
            placeholder="ID numérico del cliente"
          />
        </div>
      )}

      {/* Workflow ID (opcional) */}
       <div className="space-y-1.5">
        <Label htmlFor="workflowId">Workflow ID (Opcional)</Label>
        <Input
          id="workflowId"
          name="workflowId"
          type="text"
          value={formData.workflowId}
          onChange={handleChange}
          disabled={isSaving}
          placeholder="ID del flujo de trabajo"
        />
      </div>

       {/* WhatsApp Token (opcional) */}
        <div className="space-y-1.5">
        <Label htmlFor="whatsappToken">WhatsApp Token (Opcional)</Label>
        <Input
          id="whatsappToken"
          name="whatsappToken"
          type="password" 
          value={formData.whatsappToken}
          onChange={handleChange}
          disabled={isSaving}
          placeholder="Token de WhatsApp (si aplica)"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button className='bg-red-700 hover:cursor-pointer hover:bg-red-800 text-white font-normal' type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancelar
        </Button>
        <Button className='bg-sky-700 hover:cursor-pointer hover:bg-sky-800' type="submit" disabled={isSaving}>
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando...</>
          ) : (
             'Crear usuario'
          )}
        </Button>
      </div>
    </form>
  );
}