/**
 * Facebook Ads Validation Schemas
 *
 * Zod schemas para validação de inputs da integração Facebook Ads
 *
 * Referências:
 * - design.md: Validation with Zod
 * - dev-stories.md: Dev Story 3.2 - Facebook Integration
 * - user-stories.md: Story 1.3 - Conectar Facebook Ads
 */

import { z } from 'zod';

/**
 * Schema: Facebook OAuth Callback
 * Validação do callback OAuth após autorização
 */
export const facebookOAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export type FacebookOAuthCallbackInput = z.infer<typeof facebookOAuthCallbackSchema>;

/**
 * Schema: Facebook Connect Request
 * Validação da requisição inicial de conexão
 */
export const facebookConnectSchema = z.object({
  redirectUri: z.string().url('Redirect URI must be a valid URL'),
});

export type FacebookConnectInput = z.infer<typeof facebookConnectSchema>;

/**
 * Schema: Get Insights Parameters
 * Validação dos parâmetros para buscar insights
 *
 * Referência: dev-stories.md - getInsights method
 */
export const facebookInsightsParamsSchema = z.object({
  adAccountId: z.string().regex(/^act_\d+$/, 'Ad Account ID must start with "act_"'),
  datePreset: z
    .enum(['today', 'yesterday', 'last_7d', 'last_14d', 'last_30d', 'last_90d', 'this_month', 'last_month'])
    .optional()
    .default('last_30d'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  level: z.enum(['account', 'campaign', 'adset', 'ad']).optional().default('account'),
  timeIncrement: z.number().int().min(1).max(90).optional().default(1),
}).refine(
  (data) => {
    // Se startDate fornecido, endDate também deve ser fornecido
    if (data.startDate && !data.endDate) {
      return false;
    }
    if (data.endDate && !data.startDate) {
      return false;
    }

    // Não pode usar datePreset junto com startDate/endDate
    if (data.datePreset && data.startDate) {
      return false;
    }

    return true;
  },
  {
    message: 'Use either datePreset OR (startDate + endDate), not both',
  },
).refine(
  (data) => {
    // Validar que startDate < endDate
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
  },
);

export type FacebookInsightsParamsInput = z.infer<typeof facebookInsightsParamsSchema>;

/**
 * Schema: Sync Facebook Request
 * Validação da requisição de sincronização manual
 */
export const syncFacebookSchema = z.object({
  forceFullSync: z.boolean().optional().default(false),
  adAccountId: z.string().regex(/^act_\d+$/).optional(),
});

export type SyncFacebookInput = z.infer<typeof syncFacebookSchema>;

/**
 * Schema: Ad Account Selection
 * Validação da seleção de conta de anúncios
 */
export const selectAdAccountSchema = z.object({
  adAccountId: z.string().regex(/^act_\d+$/, 'Invalid Ad Account ID format'),
  adAccountName: z.string().min(1, 'Ad Account name is required'),
});

export type SelectAdAccountInput = z.infer<typeof selectAdAccountSchema>;

/**
 * Helper: Validar Facebook Access Token Format
 * Facebook tokens geralmente têm formato: EAAxxxxxxxxxxxx
 */
export function isValidFacebookToken(token: string): boolean {
  // Token deve começar com EAA (App Token) ou EAABw (Page/User Token)
  return /^EAA[A-Za-z0-9_-]+$/.test(token);
}

/**
 * Helper: Validar Facebook Ad Account ID
 * Formato: act_1234567890
 */
export function isValidAdAccountId(adAccountId: string): boolean {
  return /^act_\d+$/.test(adAccountId);
}

/**
 * Helper: Formatar Ad Account ID
 * Remove prefixo 'act_' se presente
 */
export function formatAdAccountId(adAccountId: string): string {
  return adAccountId.replace(/^act_/, '');
}

/**
 * Helper: Adicionar prefixo 'act_' ao Ad Account ID
 */
export function addActPrefix(adAccountId: string): string {
  if (adAccountId.startsWith('act_')) {
    return adAccountId;
  }
  return `act_${adAccountId}`;
}

/**
 * Helper: Validar Date Preset
 */
export function isValidDatePreset(preset: string): boolean {
  const validPresets = [
    'today',
    'yesterday',
    'last_7d',
    'last_14d',
    'last_30d',
    'last_90d',
    'this_month',
    'last_month',
    'lifetime',
  ];
  return validPresets.includes(preset);
}

/**
 * Helper: Converter Date para formato YYYY-MM-DD
 */
export function formatDateForFacebook(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper: Calcular range de datas baseado em date preset
 */
export function getDateRangeFromPreset(preset: string): { startDate: string; endDate: string } {
  const now = new Date();
  const today = formatDateForFacebook(now);

  let startDate: string;
  const endDate = today;

  switch (preset) {
  case 'today':
    startDate = today;
    break;
  case 'yesterday': {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    startDate = formatDateForFacebook(yesterday);
    break;
  }
  case 'last_7d': {
    const last7d = new Date(now);
    last7d.setDate(last7d.getDate() - 7);
    startDate = formatDateForFacebook(last7d);
    break;
  }
  case 'last_14d': {
    const last14d = new Date(now);
    last14d.setDate(last14d.getDate() - 14);
    startDate = formatDateForFacebook(last14d);
    break;
  }
  case 'last_30d': {
    const last30d = new Date(now);
    last30d.setDate(last30d.getDate() - 30);
    startDate = formatDateForFacebook(last30d);
    break;
  }
  case 'last_90d': {
    const last90d = new Date(now);
    last90d.setDate(last90d.getDate() - 90);
    startDate = formatDateForFacebook(last90d);
    break;
  }
  case 'this_month': {
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate = formatDateForFacebook(firstDayOfMonth);
    break;
  }
  case 'last_month': {
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    startDate = formatDateForFacebook(firstDayOfLastMonth);
    // Para last_month, endDate é o último dia do mês passado
    return { startDate, endDate: formatDateForFacebook(lastDayOfLastMonth) };
  }
  default: {
    // Default: last 30 days
    const defaultStart = new Date(now);
    defaultStart.setDate(defaultStart.getDate() - 30);
    startDate = formatDateForFacebook(defaultStart);
    break;
  }
  }

  return { startDate, endDate };
}

/**
 * Helper: Validar e sanitizar métricas do Facebook
 * Converte strings para números e valida ranges
 */
export function sanitizeFacebookMetrics(metrics: Record<string, string | number>): Record<string, number> {
  const toNumber = (value: string | number | undefined, defaultValue = 0): number => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      return parseFloat(value) || defaultValue;
    }
    return defaultValue;
  };

  return {
    spend: toNumber(metrics.spend),
    impressions: Math.floor(toNumber(metrics.impressions)),
    clicks: Math.floor(toNumber(metrics.clicks)),
    ctr: toNumber(metrics.ctr),
    cpc: toNumber(metrics.cpc),
    cpm: toNumber(metrics.cpm),
    conversions: Math.floor(toNumber(metrics.conversions)),
  };
}

/**
 * Helper: Extrair conversões de actions array
 * Facebook retorna actions como array de objetos
 */
export function extractConversions(actions?: Array<{ action_type: string; value: string }>): number {
  if (!actions || !Array.isArray(actions)) {
    return 0;
  }

  const conversionTypes = [
    'offsite_conversion.fb_pixel_purchase',
    'omni_purchase',
    'purchase',
    'offsite_conversion.fb_pixel_complete_registration',
    'complete_registration',
  ];

  let totalConversions = 0;

  for (const action of actions) {
    if (conversionTypes.includes(action.action_type)) {
      totalConversions += parseInt(action.value || '0', 10);
    }
  }

  return totalConversions;
}

/**
 * Helper: Validar permissões OAuth necessárias
 * Referência: tasks.md - Permissões requeridas
 */
export function hasRequiredPermissions(grantedPermissions: string[]): boolean {
  const requiredPermissions = ['ads_read', 'ads_management'];

  return requiredPermissions.every((permission) =>
    grantedPermissions.includes(permission),
  );
}

/**
 * Helper: Calcular taxa de erro (para retry logic)
 */
export function shouldRetry(error: Error & { code?: string; response?: { status?: number } }): boolean {
  // Retry em erros temporários
  const retryableErrors = [
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'ENOTFOUND',
  ];

  const retryableStatusCodes = [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ];

  if (error.code && retryableErrors.includes(error.code)) {
    return true;
  }

  if (error.response?.status && retryableStatusCodes.includes(error.response.status)) {
    return true;
  }

  return false;
}
