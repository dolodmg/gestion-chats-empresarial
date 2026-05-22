export interface ClientFeatureFlags {
  data: boolean;
  campaigns: boolean;
  templates: boolean;
  advisors: boolean;
  advisorMetrics: boolean;
  inscripciones: boolean;
  metaEventos: boolean;
  assistant: boolean;
  conversationSummary: boolean;
  sendTemplates: boolean;
}

export type ClientFeatureKey = keyof ClientFeatureFlags;

export const DEFAULT_FEATURE_FLAGS: ClientFeatureFlags = {
  data: true,
  campaigns: true,
  templates: true,
  advisors: true,
  advisorMetrics: true,
  inscripciones: true,
  metaEventos: true,
  assistant: true,
  conversationSummary: true,
  sendTemplates: true,
};

export function getMergedFeatureFlags(featureFlags?: Partial<ClientFeatureFlags> | null): ClientFeatureFlags {
  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...(featureFlags || {}),
  };
}

export function isFeatureEnabled(
  role: 'admin' | 'client' | 'advisor' | undefined,
  feature: ClientFeatureKey,
  featureFlags?: Partial<ClientFeatureFlags> | null
): boolean {
  if (role === 'admin') {
    return true;
  }

  const mergedFlags = getMergedFeatureFlags(featureFlags);
  return mergedFlags[feature];
}
