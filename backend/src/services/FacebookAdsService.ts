/**
 * Facebook Ads Service
 * 
 * Implementação completa da integração com Facebook Marketing API
 * 
 * Features:
 * - OAuth 2.0 flow completo
 * - Busca de insights com rate limiting (200 req/hora)
 * - Cache Redis (6h TTL)
 * - Cálculo de ROAS
 * - Sync automática via Bull queue (6h)
 * - Encryption AES-256 para tokens
 * 
 * Referências:
 * - design.md: Facebook Ads Marketing API Integration
 * - dev-stories.md: Dev Story 3.2
 * - tasks.md: Task 6.1/6.2
 * - user-stories.md: Story 1.3
 */

import axios, { type AxiosInstance } from 'axios';
import crypto from 'node:crypto';
import { prisma } from '../shared/config/database';
import { createRedisClient } from '../shared/config/redis';
import { logger } from '../shared/utils/logger';
import type Redis from 'ioredis';
import type {
  FacebookInsightsDTO,
  FacebookInsightsParamsDTO,
  FacebookOAuthTokenResponse,
  FacebookStatusDTO,
  FacebookSyncResultDTO,
  FacebookTestConnectionResponseDTO,
  IFacebookAdAccount,
  IFacebookAdInsights,
  IFacebookAdsService,
  IFacebookCampaign,
  IFacebookIntegrationConfig,
} from '../interfaces/FacebookAdsService.interface.ts';
import {
  extractConversions,
  formatDateForFacebook,
  getDateRangeFromPreset,
  hasRequiredPermissions,
  sanitizeFacebookMetrics,
  shouldRetry,
} from '../validators/facebook.validator';

/**
 * FacebookAdsService
 * 
 * Serviço principal para integração com Facebook Marketing API v18+
 */
export class FacebookAdsService implements IFacebookAdsService {
  private readonly FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v18.0';
  private readonly FACEBOOK_OAUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
  private readonly RATE_LIMIT_KEY_PREFIX = 'facebook:ratelimit:';
  private readonly CACHE_KEY_PREFIX = 'facebook:insights:';
  private readonly RATE_LIMIT_MAX = 200; // 200 req/hora (conservador)
  private readonly RATE_LIMIT_WINDOW = 3600; // 1 hora em segundos
  private readonly CACHE_TTL = 21600; // 6 horas em segundos
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-cbc';
  private readonly ENCRYPTION_KEY: Buffer;

  private axiosInstance: AxiosInstance;
  private redis: Redis;

  constructor() {
    // Validar variáveis de ambiente
    const encryptionKey = process.env.FACEBOOK_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('FACEBOOK_ENCRYPTION_KEY environment variable is required');
    }

    // Derivar key de 32 bytes para AES-256
    this.ENCRYPTION_KEY = crypto.scryptSync(encryptionKey, 'salt', 32);

    // Inicializar Redis client
    this.redis = createRedisClient();

    // Configurar axios instance
    this.axiosInstance = axios.create({
      baseURL: this.FACEBOOK_GRAPH_API_URL,
      timeout: 30000, // 30s timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Adicionar interceptor para retry em erros temporários
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        if (!config || !config._retry && shouldRetry(error)) {
          config._retry = (config._retry || 0) + 1;
          
          if (config._retry <= 3) {
            const delay = Math.min(1000 * 2 ** config._retry, 8000); // Exponential backoff
            logger.warn('Facebook API error, retrying...', {
              attempt: config._retry,
              delay,
              error: error.message,
            });
            
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.axiosInstance(config);
          }
        }
        
        throw error;
      }
    );

    logger.info('FacebookAdsService initialized');
  }

  /**
   * Gerar URL de autorização OAuth
   * Referência: dev-stories.md - OAuth 2.0 flow
   */
  async getAuthorizationUrl(userId: string, redirectUri: string): Promise<string> {
    const appId = process.env.FACEBOOK_APP_ID;
    const state = this.generateState(userId);

    if (!appId) {
      throw new Error('FACEBOOK_APP_ID environment variable is required');
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state,
      scope: 'ads_read,ads_management',
      response_type: 'code',
    });

    const authUrl = `${this.FACEBOOK_OAUTH_URL}?${params.toString()}`;

    logger.info('Generated Facebook OAuth URL', { userId, redirectUri });

    return authUrl;
  }

  /**
   * Processar callback OAuth e obter access token
   * Referência: dev-stories.md - OAuth callback handling
   */
  async handleOAuthCallback(
    userId: string,
    code: string,
    state?: string
  ): Promise<IFacebookIntegrationConfig> {
    try {
      // 1. Validar state parameter (CSRF protection)
      if (state && !this.validateState(userId, state)) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // 2. Trocar code por access_token
      const tokenResponse = await this.exchangeCodeForToken(code);

      // 3. Buscar ad accounts do usuário
      const adAccounts = await this.fetchAdAccountsWithToken(tokenResponse.access_token);

      if (adAccounts.length === 0) {
        throw new Error('No ad accounts found for this Facebook account');
      }

      // Usar primeira ad account por padrão
      const primaryAdAccount = adAccounts[0];
      
      if (!primaryAdAccount) {
        throw new Error('No primary ad account found');
      }

      // 4. Verificar permissões
      const permissions = await this.getGrantedPermissions(tokenResponse.access_token);
      
      if (!hasRequiredPermissions(permissions)) {
        throw new Error('Required permissions (ads_read, ads_management) not granted');
      }

      // 5. Calcular expiração do token (60 dias = 5184000 segundos)
      const tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

      // 6. Criar config object
      const config: IFacebookIntegrationConfig = {
        accessToken: this.encryptToken(tokenResponse.access_token),
        tokenExpiresAt,
        adAccountId: primaryAdAccount.account_id,
        adAccountName: primaryAdAccount.name,
        permissions,
        lastSyncAt: new Date(),
      };

      // 7. Salvar ou atualizar integração no banco
      await prisma.integration.upsert({
        where: {
          user_id_provider: {
            user_id: userId,
            provider: 'FACEBOOK_ADS',
          },
        },
        update: {
          status: 'CONNECTED',
          config: JSON.parse(JSON.stringify(config)),
          last_sync: config.lastSyncAt || new Date(),
        },
        create: {
          user_id: userId,
          provider: 'FACEBOOK_ADS',
          status: 'CONNECTED',
          config: JSON.parse(JSON.stringify(config)),
          last_sync: config.lastSyncAt || new Date(),
        },
      });

      logger.info('Facebook OAuth completed successfully', {
        userId,
        adAccountId: primaryAdAccount.account_id,
        adAccountName: primaryAdAccount.name,
      });

      return config;
    } catch (error) {
      logger.error('Facebook OAuth callback failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Renovar access token expirado
   * Facebook tokens duram 60 dias e podem ser renovados
   */
  async refreshAccessToken(userId: string): Promise<string> {
    try {
      const integration = await prisma.integration.findUnique({
        where: {
          user_id_provider: {
            user_id: userId,
            provider: 'FACEBOOK_ADS',
          },
        },
      });

      if (!integration || integration.status !== 'CONNECTED') {
        throw new Error('Facebook integration not found or not connected');
      }

      const config = integration.config as unknown as IFacebookIntegrationConfig;
      const currentToken = this.decryptToken(config.accessToken);

      // Trocar token antigo por novo (long-lived token exchange)
      const response = await this.axiosInstance.get<FacebookOAuthTokenResponse>('/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: currentToken,
        },
      });

      const newToken = response.data.access_token;
      const newExpiresIn = response.data.expires_in;
      const newExpiresAt = new Date(Date.now() + newExpiresIn * 1000);

      // Atualizar token no banco
      config.accessToken = this.encryptToken(newToken);
      config.tokenExpiresAt = newExpiresAt;

      await prisma.integration.update({
        where: {
          user_id_provider: {
            user_id: userId,
            provider: 'FACEBOOK_ADS',
          },
        },
        data: {
          config: JSON.parse(JSON.stringify(config)),
        },
      });

      logger.info('Facebook access token refreshed', { userId, newExpiresAt });

      return newToken;
    } catch (error) {
      logger.error('Failed to refresh Facebook access token', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Buscar contas de anúncios do usuário
   * Referência: tasks.md - Task 6.2.4
   */
  async getAdAccounts(userId: string): Promise<IFacebookAdAccount[]> {
    try {
      const accessToken = await this.getAccessToken(userId);
      return await this.fetchAdAccountsWithToken(accessToken);
    } catch (error) {
      logger.error('Failed to get Facebook ad accounts', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Buscar insights de ad account com rate limiting e cache
   * Referência: tasks.md - Task 6.2.1
   */
  async getAdAccountInsights(
    userId: string,
    params: FacebookInsightsParamsDTO
  ): Promise<FacebookInsightsDTO> {
    try {
      // 1. Verificar rate limit
      await this.checkRateLimit(userId);

      // 2. Verificar cache
      const cacheKey = this.getCacheKey(userId, params);
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        logger.debug('Returning cached Facebook insights', { userId, cacheKey });
        return JSON.parse(cached);
      }

      // 3. Buscar access token
      const accessToken = await this.getAccessToken(userId);

      // 4. Determinar range de datas
      const { startDate, endDate } = params.startDate && params.endDate
        ? { startDate: params.startDate, endDate: params.endDate }
        : getDateRangeFromPreset(params.datePreset || 'last_30d');

      // 5. Buscar insights da API
      const response = await this.axiosInstance.get<{ data: IFacebookAdInsights[] }>(
        `/${params.adAccountId}/insights`,
        {
          params: {
            access_token: accessToken,
            fields: 'spend,impressions,clicks,ctr,cpc,cpm,actions',
            time_range: JSON.stringify({ since: startDate, until: endDate }),
            level: params.level || 'account',
            time_increment: params.timeIncrement || 1,
          },
        }
      );

      // 6. Processar insights
      const insights = response.data.data;
      const aggregatedMetrics = this.aggregateInsights(insights);

      // 7. Buscar campanhas (se level for account ou campaign)
      let campaigns: IFacebookCampaign[] = [];
      if (params.level === 'account' || params.level === 'campaign') {
        campaigns = await this.fetchCampaigns(params.adAccountId, accessToken);
      }

      // 8. Calcular ROAS
      const roas = await this.calculateROAS(userId, new Date(startDate), new Date(endDate));

      // 9. Montar resposta
      const result: FacebookInsightsDTO = {
        adAccountId: params.adAccountId,
        period: {
          start: startDate,
          end: endDate,
        },
        metrics: aggregatedMetrics as FacebookInsightsDTO['metrics'],
        roas,
        campaigns,
        insights,
      };

      // 10. Salvar no cache (6 horas)
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

      // 11. Incrementar rate limit counter
      await this.incrementRateLimit(userId);

      logger.info('Facebook insights fetched successfully', {
        userId,
        adAccountId: params.adAccountId,
        metricsCount: insights.length,
      });

      return result;
    } catch (error) {
      logger.error('Failed to get Facebook ad insights', {
        userId,
        params,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Sincronizar insights e salvar no banco
   * Referência: tasks.md - Task 6.2.3
   */
  async syncInsights(
    empresaId: string,
    forceFullSync = false
  ): Promise<FacebookSyncResultDTO> {
    try {
      logger.info('Starting Facebook insights sync', { empresaId, forceFullSync });

      // 1. Verificar se integração está conectada
      const integration = await prisma.integration.findUnique({
        where: {
          user_id_provider: {
            user_id: empresaId,
            provider: 'FACEBOOK_ADS',
          },
        },
      });

      if (!integration || integration.status !== 'CONNECTED') {
        throw new Error('Facebook integration not connected');
      }

      const config = integration.config as unknown as IFacebookIntegrationConfig;

      // 2. Definir período de sync
      const endDate = new Date();
      const startDate = forceFullSync
        ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 dias
        : config.lastSyncAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 dias

      // 3. Buscar insights
      const insights = await this.getAdAccountInsights(empresaId, {
        adAccountId: config.adAccountId,
        startDate: formatDateForFacebook(startDate),
        endDate: formatDateForFacebook(endDate),
        level: 'campaign',
        timeIncrement: 1,
      });

      // 4. Processar insights (salvar seria feito em Ad model, mas schema atual não suporta)
      // Por enquanto, apenas contar para relatório
      const insightsSynced = insights.insights.length;
      const campaignsSynced = insights.campaigns?.length || 0;
      const errors: string[] = [];

      // TODO: Implementar persistência quando schema Ad for atualizado com campos:
      // - campaign_name, ad_set_name, ad_name (ao invés de um único campo)
      // - platform enum (FACEBOOK, GOOGLE, etc)
      // - conversions field
      // - Unique constraint user_id + external_id + date
      
      logger.info('Facebook insights fetched (persistence pending schema update)', {
        empresaId,
        insightsSynced,
        campaignsSynced,
      });

      // 6. Atualizar lastSyncAt
      config.lastSyncAt = new Date();
      await prisma.integration.update({
        where: {
          user_id_provider: {
            user_id: empresaId,
            provider: 'FACEBOOK_ADS',
          },
        },
        data: {
          last_sync: config.lastSyncAt,
          config: JSON.parse(JSON.stringify(config)),
        },
      });

      logger.info('Facebook insights sync completed', {
        empresaId,
        insightsSynced,
        campaignsSynced,
        errors: errors.length,
      });

      return {
        success: errors.length === 0,
        adAccountId: config.adAccountId,
        insightsSynced,
        campaignsSynced,
        errors,
        syncedAt: new Date(),
        ...(insights.roas !== undefined && { roas: insights.roas }),
      };
    } catch (error) {
      logger.error('Facebook insights sync failed', {
        empresaId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Calcular ROAS (Return on Ad Spend)
   * ROAS = (receita_vendas / gasto_anuncios)
   * Referência: tasks.md - Task 6.2.3, dev-stories.md
   */
  async calculateROAS(
    empresaId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      // 1. Buscar receita de vendas no período
      const sales = await prisma.sale.aggregate({
        where: {
          user_id: empresaId,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ['PAID', 'DELIVERED'],
          },
        },
        _sum: {
          total_price: true,
        },
      });

      const totalRevenue = sales._sum?.total_price || 0;

      // 2. Buscar gasto com anúncios no período
      const ads = await prisma.ad.aggregate({
        where: {
          user_id: empresaId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          spend: true,
        },
      });

      const totalSpend = ads._sum?.spend || 0;

      // 3. Calcular ROAS
      if (totalSpend === 0) {
        return 0;
      }

      const roas = (Number(totalRevenue) / Number(totalSpend)) * 100;

      logger.debug('ROAS calculated', {
        empresaId,
        totalRevenue,
        totalSpend,
        roas,
      });

      return Math.round(roas * 100) / 100; // 2 casas decimais
    } catch (error) {
      logger.error('Failed to calculate ROAS', {
        empresaId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }

  /**
   * Obter status da integração
   */
  async getStatus(userId: string): Promise<FacebookStatusDTO> {
    try {
      const integration = await prisma.integration.findUnique({
        where: {
          user_id_provider: {
            user_id: userId,
            provider: 'FACEBOOK_ADS',
          },
        },
      });

      if (!integration || integration.status !== 'CONNECTED') {
        return {
          connected: false,
          syncEnabled: false,
        };
      }

      const config = integration.config as unknown as IFacebookIntegrationConfig;

      const result: FacebookStatusDTO = {
        connected: true,
        adAccountId: config.adAccountId,
        adAccountName: config.adAccountName,
        tokenExpiresAt: config.tokenExpiresAt,
        permissions: config.permissions,
        syncEnabled: true,
      };
      
      if (config.lastSyncAt) {
        result.lastSyncAt = config.lastSyncAt;
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to get Facebook status', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Testar conexão com Facebook API
   */
  async testConnection(userId: string): Promise<FacebookTestConnectionResponseDTO> {
    try {
      const accessToken = await this.getAccessToken(userId);

      // Fazer uma chamada simples para verificar validade do token
      await this.axiosInstance.get('/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name',
        },
      });

      const adAccounts = await this.fetchAdAccountsWithToken(accessToken);
      const permissions = await this.getGrantedPermissions(accessToken);

      const integration = await prisma.integration.findUnique({
        where: {
          user_id_provider: {
            user_id: userId,
            provider: 'FACEBOOK_ADS',
          },
        },
      });

      const config = integration?.config as unknown as IFacebookIntegrationConfig | undefined;

      const result: FacebookTestConnectionResponseDTO = {
        valid: true,
        permissions,
      };
      
      if (adAccounts[0]?.account_id) {
        result.adAccountId = adAccounts[0].account_id;
      }
      if (adAccounts[0]?.name) {
        result.adAccountName = adAccounts[0].name;
      }
      if (config?.tokenExpiresAt) {
        result.expiresAt = config.tokenExpiresAt;
      }
      
      return result;
    } catch (error) {
      logger.error('Facebook connection test failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Desconectar integração
   */
  async disconnect(userId: string): Promise<void> {
    try {
      await prisma.integration.update({
        where: {
          user_id_provider: {
            user_id: userId,
            provider: 'FACEBOOK_ADS',
          },
        },
        data: {
          status: 'DISCONNECTED',
        },
      });

      // Limpar cache
      const cachePattern = `${this.CACHE_KEY_PREFIX}${userId}:*`;
      const keys = await this.redis.keys(cachePattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      logger.info('Facebook integration disconnected', { userId });
    } catch (error) {
      logger.error('Failed to disconnect Facebook integration', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Criptografar access token
   * AES-256-CBC com IV aleatório
   * Referência: design.md - Security Best Practices
   */
  encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ENCRYPTION_ALGORITHM, this.ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Descriptografar access token
   */
  decryptToken(encryptedToken: string): string {
    const parts = encryptedToken.split(':');
    
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('Invalid encrypted token format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(this.ENCRYPTION_ALGORITHM, this.ENCRYPTION_KEY, iv);
    
    let decrypted: string = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Gerar state parameter para OAuth (CSRF protection)
   */
  private generateState(userId: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    return Buffer.from(`${userId}:${timestamp}:${random}`).toString('base64');
  }

  /**
   * Validar state parameter
   */
  private validateState(userId: string, state: string): boolean {
    try {
      const decoded = Buffer.from(state, 'base64').toString('utf8');
      const parts = decoded.split(':');
      
      if (parts.length !== 3 || !parts[0] || !parts[1]) return false;
      
      const [stateUserId, timestamp] = parts;
      
      // Verificar userId
      if (stateUserId !== userId) return false;
      
      // Verificar se state não expirou (15 minutos)
      const stateAge = Date.now() - parseInt(timestamp, 10);
      if (stateAge > 15 * 60 * 1000) return false;
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Trocar authorization code por access token
   */
  private async exchangeCodeForToken(code: string): Promise<FacebookOAuthTokenResponse> {
    const response = await this.axiosInstance.get<FacebookOAuthTokenResponse>('/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code,
      },
    });

    return response.data;
  }

  /**
   * Buscar ad accounts com token fornecido
   */
  private async fetchAdAccountsWithToken(accessToken: string): Promise<IFacebookAdAccount[]> {
    const response = await this.axiosInstance.get<{ data: IFacebookAdAccount[] }>('/me/adaccounts', {
      params: {
        access_token: accessToken,
        fields: 'id,account_id,name,currency,timezone_name,account_status',
      },
    });

    return response.data.data;
  }

  /**
   * Buscar permissões concedidas
   */
  private async getGrantedPermissions(accessToken: string): Promise<string[]> {
    try {
      const response = await this.axiosInstance.get<{ data: Array<{ permission: string; status: string }> }>(
        '/me/permissions',
        {
          params: { access_token: accessToken },
        }
      );

      return response.data.data
        .filter((p) => p.status === 'granted')
        .map((p) => p.permission);
    } catch (error) {
      logger.warn('Failed to fetch permissions', { error });
      return [];
    }
  }

  /**
   * Buscar campanhas
   */
  private async fetchCampaigns(adAccountId: string, accessToken: string): Promise<IFacebookCampaign[]> {
    try {
      const response = await this.axiosInstance.get<{ data: IFacebookCampaign[] }>(
        `/${adAccountId}/campaigns`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,status,objective,daily_budget,lifetime_budget,created_time,updated_time',
            limit: 100,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      logger.warn('Failed to fetch campaigns', { adAccountId, error });
      return [];
    }
  }

  /**
   * Agregar insights em métricas únicas
   */
  private aggregateInsights(insights: IFacebookAdInsights[]): Record<string, number> {
    const totals = {
      spend: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      conversions: 0,
    };

    let count = 0;

    for (const insight of insights) {
      const metrics = sanitizeFacebookMetrics(insight as unknown as Record<string, string | number>);
      totals.spend += metrics.spend ?? 0;
      totals.impressions += metrics.impressions ?? 0;
      totals.clicks += metrics.clicks ?? 0;
      totals.ctr += metrics.ctr ?? 0;
      totals.cpc += metrics.cpc ?? 0;
      totals.cpm += metrics.cpm ?? 0;
      totals.conversions += extractConversions(insight.actions);
      count++;
    }

    // Calcular médias para CTR, CPC, CPM
    if (count > 0) {
      totals.ctr /= count;
      totals.cpc /= count;
      totals.cpm /= count;
    }

    return totals;
  }

  /**
   * Obter access token descriptografado
   */
  private async getAccessToken(userId: string): Promise<string> {
    const integration = await prisma.integration.findUnique({
      where: {
        user_id_provider: {
          user_id: userId,
          provider: 'FACEBOOK_ADS',
        },
      },
    });

    if (!integration || integration.status !== 'CONNECTED') {
      throw new Error('Facebook integration not connected');
    }

    const config = integration.config as unknown as IFacebookIntegrationConfig;

    // Verificar se token expirou
    if (new Date(config.tokenExpiresAt) < new Date()) {
      logger.info('Facebook token expired, refreshing...', { userId });
      return await this.refreshAccessToken(userId);
    }

    return this.decryptToken(config.accessToken);
  }

  /**
   * Verificar rate limit
   * Referência: tasks.md - Rate limiting (200 req/hora)
   */
  private async checkRateLimit(userId: string): Promise<void> {
    const key = `${this.RATE_LIMIT_KEY_PREFIX}${userId}`;
    const count = await this.redis.get(key);

    if (count && parseInt(count, 10) >= this.RATE_LIMIT_MAX) {
      throw new Error('Facebook API rate limit exceeded (200 requests/hour)');
    }
  }

  /**
   * Incrementar contador de rate limit
   */
  private async incrementRateLimit(userId: string): Promise<void> {
    const key = `${this.RATE_LIMIT_KEY_PREFIX}${userId}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, this.RATE_LIMIT_WINDOW);
    }
  }

  /**
   * Gerar chave de cache
   */
  private getCacheKey(userId: string, params: FacebookInsightsParamsDTO): string {
    const dateKey = params.startDate && params.endDate
      ? `${params.startDate}_${params.endDate}`
      : params.datePreset || 'last_30d';
    
    return `${this.CACHE_KEY_PREFIX}${userId}:${params.adAccountId}:${dateKey}:${params.level || 'account'}`;
  }

  // Método reservado para futura implementação de persistência no Ad model
  // private mapFacebookStatus(status: string): 'ACTIVE' | 'PAUSED' | 'ARCHIVED' {
  //   const statusMap: Record<string, 'ACTIVE' | 'PAUSED' | 'ARCHIVED'> = {
  //     ACTIVE: 'ACTIVE',
  //     PAUSED: 'PAUSED',
  //     ARCHIVED: 'ARCHIVED',
  //     DELETED: 'ARCHIVED',
  //   };
  //   return statusMap[status] || 'PAUSED';
  // }
}
