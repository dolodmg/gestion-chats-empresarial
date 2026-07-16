import { useEffect, useMemo, useState } from 'react';
import { User } from '@/services/authService';
import { UpdateUserData, userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ClientFeatureFlags, DEFAULT_FEATURE_FLAGS, getMergedFeatureFlags } from '@/utils/featureFlags';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FeatureFlagsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const FEATURE_FIELDS: Array<{
  key: keyof ClientFeatureFlags;
  label: string;
  description: string;
}> = [
  { key: 'data', label: 'Mis Datos', description: 'Muestra la sección de tablas y datos del cliente.' },
  { key: 'campaigns', label: 'Campañas Email', description: 'Habilita campañas de email y dominios autenticados.' },
  { key: 'whatsappCampaigns', label: 'Campañas WhatsApp', description: 'Habilita la pantalla de campañas masivas de WhatsApp.' },
  { key: 'templates', label: 'Plantillas', description: 'Habilita la pantalla de plantillas de WhatsApp.' },
  { key: 'sendTemplates', label: 'Envío de plantillas', description: 'Permite enviar plantillas desde el dashboard.' },
  { key: 'conversationSummary', label: 'Resumen de conversaciones', description: 'Permite abrir y generar resúmenes desde el dashboard.' },
  { key: 'advisors', label: 'Asesores', description: 'Habilita la administración de asesores.' },
  { key: 'advisorMetrics', label: 'Métricas de asesores', description: 'Habilita la pantalla de métricas de asesores.' },
  { key: 'assistant', label: 'Asistente IA', description: 'Habilita la pantalla del asistente.' },
  { key: 'metaEventos', label: 'Eventos de Meta', description: 'Habilita la pantalla de eventos de Meta.' },
  { key: 'inscripciones', label: 'Inscripciones', description: 'Habilita la pantalla de inscripciones para clientes compatibles.' },
];

export default function FeatureFlagsDialog({
  user,
  open,
  onOpenChange,
  onSaved,
}: FeatureFlagsDialogProps) {
  const [featureFlags, setFeatureFlags] = useState<ClientFeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [allowPasswordChange, setAllowPasswordChange] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userId = useMemo(() => user?._id || user?.id || '', [user]);

  useEffect(() => {
    if (user) {
      setFeatureFlags(getMergedFeatureFlags(user.featureFlags));
      setAllowPasswordChange(user.allowPasswordChange !== false);
    } else {
      setFeatureFlags(DEFAULT_FEATURE_FLAGS);
      setAllowPasswordChange(true);
    }
  }, [user]);

  const handleCheckedChange = (key: keyof ClientFeatureFlags, checked: boolean) => {
    setFeatureFlags((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('No se pudo identificar el usuario cliente');
      return;
    }

    try {
      setIsSaving(true);
      const payload: UpdateUserData = { featureFlags, allowPasswordChange };
      await userService.updateUser(userId, payload);
      toast.success('Funcionalidades actualizadas');
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast.error('Error al guardar funcionalidades', {
        description: error.response?.data?.msg || 'No se pudieron actualizar las funcionalidades',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Funcionalidades por cliente</DialogTitle>
          <DialogDescription>
            `Dashboard` y `Perfil` permanecen siempre habilitados. Configuración para {user?.name || 'cliente'}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-4 py-2">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4">
              <div className="space-y-1">
                <Label htmlFor="allow-password-change" className="text-sm font-medium text-gray-900">
                  Permitir cambiar contraseña
                </Label>
                <p className="text-sm text-gray-500">
                  Habilita que el usuario cambie su propia contraseña desde Perfil.
                </p>
              </div>
              <Switch
                id="allow-password-change"
                checked={allowPasswordChange}
                onCheckedChange={setAllowPasswordChange}
                disabled={isSaving}
              />
            </div>

            {FEATURE_FIELDS.map((field) => (
              <div key={field.key} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4">
                <div className="space-y-1">
                  <Label htmlFor={`feature-${field.key}`} className="text-sm font-medium text-gray-900">
                    {field.label}
                  </Label>
                  <p className="text-sm text-gray-500">{field.description}</p>
                </div>
                <Switch
                  id={`feature-${field.key}`}
                  checked={featureFlags[field.key]}
                  onCheckedChange={(checked) => handleCheckedChange(field.key, checked)}
                  disabled={isSaving}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-sky-700 hover:bg-sky-800">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
