/**
 * Facebook Ads Service Interfaces
 * 
 * Referências:
 * - design.md: Facebook Ads Marketing API Integration
 * - dev-stories.md: Dev Story 3.2 - Facebook Ads Integration
 * - user-stories.md: Story 1.3 - Conectar Facebook Ads
 * - tasks.md: Task 6.1/6.2 - Facebook Ads OAuth + Insights
 * - plan.md: Jornada 1 FASE 3 - Wizard de Integração
 */

/**
 * Facebook Ad Account Interface
 * Representa uma conta de anúncios do Facebook
 */
export interface IFacebookAdAccount {
  id: string;
  account_id: string;
  name: string;
  currency: string;
  timezone_name: string;
  account_status: number;
}

/**
 * Facebook Ad Insights Interface
 * Métricas detalhadas de campanhas publicitárias
 * 
 * Referência: design.md - Facebook Marketing API v18+
 */
export interface IFacebookAdInsights {
  date_start: string;
  date_stop: string;
  spend: string; // Gasto total
  impressions: string; // Impressões
  clicks: string; // Cliques
  ctr: string; // Click-through rate
  cpc: string; // Cost per click
  cpm: string; // Cost per mille (1000 impressões)
  actions?: Array<{
    action_type: string;
    value: string;
  }>;
  conversions?: string;
  roas?: number; // Calculado: receita / gasto
}

/**
 * Facebook Campaign Interface
 * Dados de campanha publicitária
 */
export interface IFacebookCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time: string;
  updated_time: string;
}

/**
 * Facebook Integration Config
 * Armazenado em Integration.config (JSONB)
 * 
 * Referência: design.md - Integration Model Schema
 */
export interface IFacebookIntegrationConfig {
  accessToken: string; // Criptografado com AES-256
  refreshToken?: string;
  tokenExpiresAt: Date;
  adAccountId: string;
  adAccountName: string;
  permissions: string[];
  lastSyncAt?: Date;
}

/**
 * DTO: Connect Facebook OAuth
 * Requisição inicial de conexão
 * 
 * Referência: dev-stories.md - OAuth 2.0 flow
 */
export interface FacebookConnectDTO {
  redirectUri: string;
}

/**
 * DTO: OAuth Callback
 * Resposta do callback OAuth
 */
export interface FacebookOAuthCallbackDTO {
  code: string;
  state?: string;
}

/**
 * DTO: OAuth Token Response
 * Resposta do exchange code → token
 */
export interface FacebookOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // Segundos (geralmente 5184000 = 60 dias)
}

/**
 * DTO: Get Ad Accounts
 * Resposta da lista de contas de anúncios
 */
export interface FacebookAdAccountDTO {
  adAccounts: IFacebookAdAccount[];
}

/**
 * DTO: Get Insights Parameters
 * Parâmetros para buscar insights
 * 
 * Referência: dev-stories.md - getInsights method
 */
export interface FacebookInsightsParamsDTO {
  adAccountId: string;
  datePreset?: 'today' | 'yesterday' | 'last_7d' | 'last_14d' | 'last_30d' | 'last_90d' | 'this_month' | 'last_month';
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  timeIncrement?: number; // 1 = daily
}

/**
 * DTO: Insights Response
 * Resposta com insights agregados
 */
export interface FacebookInsightsDTO {
  adAccountId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpm: number;
    conversions: number;
  };
  roas?: number;
  campaigns?: IFacebookCampaign[];
  insights: IFacebookAdInsights[];
}

/**
 * DTO: Facebook Status
 * Status da integração Facebook
 */
export interface FacebookStatusDTO {
  connected: boolean;
  adAccountId?: string;
  adAccountName?: string;
  lastSyncAt?: Date;
  tokenExpiresAt?: Date;
  permissions?: string[];
  syncEnabled: boolean;
}

/**
 * DTO: Sync Result
 * Resultado da sincronização de insights
 */
export interface FacebookSyncResultDTO {
  success: boolean;
  adAccountId: string;
  insightsSynced: number;
  campaignsSynced: number;
  errors: string[];
  syncedAt: Date;
  roas?: number;
}

/**
 * DTO: Test Connection Response
 */
export interface FacebookTestConnectionResponseDTO {
  valid: boolean;
  adAccountId?: string;
  adAccountName?: string;
  permissions?: string[];
  expiresAt?: Date;
  error?: string;
}

/**
 * Facebook Ads Service Interface
 * 
 * Implementa integração completa com Facebook Marketing API
 * Referência: dev-stories.md - Dev Story 3.2
 */
export interface IFacebookAdsService {
  /**
   * Iniciar fluxo OAuth 2.0
   * Retorna URL para redirect do usuário
   * 
   * @param userId - ID do usuário Flowzz
   * @param redirectUri - URI de callback após autorização
   * @returns URL de autorização Facebook
   */
  getAuthorizationUrl(userId: string, redirectUri: string): Promise<string>;

  /**
   * Processar callback OAuth
   * Troca code por access_token e salva no DB
   * 
   * @param userId - ID do usuário Flowzz
   * @param code - Authorization code do Facebook
   * @param state - State parameter para validação CSRF
   * @returns Integration config completo
   */
  handleOAuthCallback(
    userId: string,
    code: string,
    state?: string
  ): Promise<IFacebookIntegrationConfig>;

  /**
   * Renovar access token expirado
   * Facebook tokens duram 60 dias
   * 
   * @param userId - ID do usuário
   * @returns Novo access token
   */
  refreshAccessToken(userId: string): Promise<string>;

  /**
   * Buscar contas de anúncios do usuário
   * 
   * @param userId - ID do usuário
   * @returns Lista de ad accounts
   */
  getAdAccounts(userId: string): Promise<IFacebookAdAccount[]>;

  /**
   * Buscar insights de uma conta de anúncios
   * Implementa rate limiting (200 req/hora)
   * Cache Redis (6 horas TTL)
   * 
   * Referência: tasks.md - Task 6.2.1
   * 
   * @param userId - ID do usuário
   * @param params - Parâmetros de busca
   * @returns Insights agregados
   */
  getAdAccountInsights(
    userId: string,
    params: FacebookInsightsParamsDTO
  ): Promise<FacebookInsightsDTO>;

  /**
   * Sincronizar insights e salvar no banco
   * Busca insights, calcula ROAS, salva no Ad model
   * 
   * Referência: tasks.md - Task 6.2.3
   * 
   * @param empresaId - ID da empresa (user)
   * @param forceFullSync - Forçar sync completo (ignora cache)
   * @returns Resultado da sincronização
   */
  syncInsights(
    empresaId: string,
    forceFullSync?: boolean
  ): Promise<FacebookSyncResultDTO>;

  /**
   * Calcular ROAS (Return on Ad Spend)
   * ROAS = (receita_vendas / gasto_anuncios)
   * 
   * Referência: tasks.md - Task 6.2.3, dev-stories.md
   * 
   * @param empresaId - ID da empresa
   * @param startDate - Data inicial
   * @param endDate - Data final
   * @returns ROAS percentual
   */
  calculateROAS(
    empresaId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number>;

  /**
   * Obter status da integração
   * 
   * @param userId - ID do usuário
   * @returns Status da integração
   */
  getStatus(userId: string): Promise<FacebookStatusDTO>;

  /**
   * Testar conexão com Facebook API
   * Valida token e permissões
   * 
   * @param userId - ID do usuário
   * @returns Resultado do teste
   */
  testConnection(userId: string): Promise<FacebookTestConnectionResponseDTO>;

  /**
   * Desconectar integração Facebook
   * Remove access token e desativa sync
   * 
   * @param userId - ID do usuário
   */
  disconnect(userId: string): Promise<void>;

  /**
   * Criptografar access token
   * AES-256-CBC com IV aleatório
   * 
   * Referência: design.md - Security Best Practices
   * 
   * @param token - Token em plaintext
   * @returns Token criptografado (formato: {iv}:{encrypted})
   */
  encryptToken(token: string): string;

  /**
   * Descriptografar access token
   * 
   * @param encryptedToken - Token criptografado
   * @returns Token em plaintext
   */
  decryptToken(encryptedToken: string): string;
}
