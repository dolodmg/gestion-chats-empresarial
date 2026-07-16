import { useState } from 'react';
import { Clock3, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ManualControlOption, ManualControlPreferences, hasWorkdayEnded } from '@/utils/manualControl';
import { cn } from '@/lib/utils';

interface Props {
  preferences: ManualControlPreferences;
  onSelect: (option: ManualControlOption) => void | Promise<void>;
  disabled?: boolean;
  label?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function ManualControlDurationSelect(props: Props) {
  const {
    preferences,
    onSelect,
    disabled = false,
    label = 'Tomar Control',
    variant = 'primary',
    className
  } = props;
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availabilityCheckedAt, setAvailabilityCheckedAt] = useState(() => new Date());

  const handleChange = async (option: string) => {
    setValue(option);
    setSubmitting(true);
    try {
      await onSelect(option as ManualControlOption);
    } finally {
      setValue('');
      setSubmitting(false);
    }
  };

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      onOpenChange={(open) => {
        if (open) setAvailabilityCheckedAt(new Date());
      }}
      disabled={disabled || submitting}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          'h-10 w-full gap-2 rounded-lg px-4 font-medium shadow-none sm:w-auto',
          variant === 'primary'
            ? 'border-blue-600 bg-blue-600 text-white data-[placeholder]:text-white hover:bg-blue-700 focus:ring-blue-500 [&>svg]:text-white'
            : 'min-h-[44px] border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
          className
        )}
      >
        {submitting
          ? <Clock3 className='h-4 w-4 animate-pulse' />
          : <User className='h-4 w-4' />}
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className='min-w-[260px]'>
        <SelectItem value='30m'>30 minutos</SelectItem>
        <SelectItem value='2h'>2 horas</SelectItem>
        <SelectItem value='8h'>8 horas</SelectItem>
        <SelectItem
          value='workday'
          disabled={hasWorkdayEnded(preferences, availabilityCheckedAt)}
        >
          Hasta finalizar la jornada ({preferences.workdayEndTime})
        </SelectItem>
        <SelectItem value='manual'>Hasta liberarlo manualmente</SelectItem>
      </SelectContent>
    </Select>
  );
}
