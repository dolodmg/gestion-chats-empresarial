export type ManualControlOption = '30m' | '2h' | '8h' | 'workday' | 'manual';

export interface ManualControlPreferences {
  durationSelectionEnabled: boolean;
  workdayEndTime: string;
  timeZone: string;
}

export const DEFAULT_MANUAL_CONTROL_PREFERENCES: ManualControlPreferences = {
  durationSelectionEnabled: false,
  workdayEndTime: '18:00',
  timeZone: 'America/Argentina/Buenos_Aires'
};

export function getManualControlPreferences(
  preferences?: Partial<ManualControlPreferences>
): ManualControlPreferences {
  return {
    ...DEFAULT_MANUAL_CONTROL_PREFERENCES,
    ...preferences
  };
}

export function hasWorkdayEnded(
  preferences: ManualControlPreferences,
  now = new Date()
): boolean {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: preferences.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(now);

  const hour = Number(parts.find(part => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find(part => part.type === 'minute')?.value || 0);
  const [endHour, endMinute] = preferences.workdayEndTime.split(':').map(Number);

  return hour * 60 + minute >= endHour * 60 + endMinute;
}
