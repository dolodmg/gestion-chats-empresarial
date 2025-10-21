import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './button';

interface ExportCSVButtonProps {
  onExport: () => Promise<Blob>;
  baseFilename: string;
  filenameSuffix?: string;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onError?: (error: string) => void;
  onSuccess?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function ExportCSVButton({
  onExport,
  baseFilename,
  filenameSuffix = '',
  buttonText = 'Exportar CSV',
  variant = 'outline',
  size = 'default',
  onError,
  onSuccess,
  className = '',
  disabled = false
}: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const blob = await onExport();

      const date = format(new Date(), 'yyyy-MM-dd');
      let filename = baseFilename;
      
      if (filenameSuffix) {
        filename += `_${filenameSuffix}`;
      }
      
      filename += `_${date}.csv`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (onSuccess) {
        onSuccess();
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error al exportar a CSV';
      
      if (onError) {
        onError(errorMessage);
      } else {
        console.error('Error exporting CSV:', err);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      variant={variant}
      size={size}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {buttonText}
        </>
      )}
    </Button>
  );
}