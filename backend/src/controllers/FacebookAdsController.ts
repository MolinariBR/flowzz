/**
 * FacebookAdsController
 * 
 * Controller para gerenciar integração com Facebook Marketing API.
 * Permite conectar contas de anúncios, sincronizar métricas e calcular ROAS.
 * 
 * Referências:
 * - design.md: Facebook Ads Marketing API Integration
 * - dev-stories.md: Dev Story 3.2
 * - tasks.md: Task 6.1/6.2
 * - user-stories.md: Story 1.3
 */

import type { Request, Response } from 'express';
import { FacebookAdsService } from '../services/FacebookAdsService';
import { logger } from '../shared/utils/logger';
import {
  facebookOAuthCallbackSchema,
  facebookInsightsParamsSchema,
} from '../validators/facebook.validator';
import type { FacebookInsightsParamsDTO } from '../interfaces/FacebookAdsService.interface';

export class FacebookAdsController {
  private facebookAdsService: FacebookAdsService;

  constructor() {
    this.facebookAdsService = new FacebookAdsService();
  }

  /**
   * Iniciar processo de OAuth
   * GET /api/v1/integrations/facebook/connect
   * 
   * @returns Authorization URL para redirecionar o usuário
   */
  async connect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        });
        return;
      }

      // Redirect URI from environment or default
      const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.API_URL}/api/v1/integrations/facebook/callback`;
      
      const authUrl = await this.facebookAdsService.getAuthorizationUrl(userId, redirectUri);

      logger.info('Facebook OAuth authorization URL generated', { userId });

      res.json({
        success: true,
        data: {
          authorizationUrl: authUrl,
        },
      });
    } catch (error) {
      logger.error('Failed to generate Facebook authorization URL', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect Facebook',
      });
    }
  }

  /**
   * Callback OAuth do Facebook
   * GET /api/v1/integrations/facebook/callback?code=XXX&state=YYY
   * 
   * @returns Resultado da conexão (ad accounts, permissions)
   */
  async callback(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        });
        return;
      }

      // Validar query params com Zod
      const validationResult = facebookOAuthCallbackSchema.safeParse(req.query);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid callback parameters',
          details: validationResult.error.issues,
        });
        return;
      }

      const { code, state } = validationResult.data;
      const result = await this.facebookAdsService.handleOAuthCallback(userId, code, state);

      logger.info('Facebook OAuth callback processed successfully', {
        userId,
        adAccountId: result.adAccountId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Facebook OAuth callback failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete Facebook connection',
      });
    }
  }

  /**
   * Obter status da integração
   * GET /api/v1/integrations/facebook/status
   * 
   * @returns Status da conexão (connected, lastSyncAt, tokenExpiresAt, etc.)
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        });
        return;
      }

      const status = await this.facebookAdsService.getStatus(userId);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Failed to get Facebook integration status', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status',
      });
    }
  }

  /**
   * Buscar insights de ad account
   * POST /api/v1/integrations/facebook/insights
   * 
   * Body: FacebookInsightsParamsDTO
   * @returns Insights com métricas agregadas e ROAS
   */
  async getInsights(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        });
        return;
      }

      // Validar body com Zod
      const validationResult = facebookInsightsParamsSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid insights parameters',
          details: validationResult.error.issues,
        });
        return;
      }

      const insights = await this.facebookAdsService.getAdAccountInsights(userId, validationResult.data as FacebookInsightsParamsDTO);

      logger.info('Facebook insights fetched successfully', {
        userId,
        adAccountId: validationResult.data.adAccountId,
        insightsCount: insights.insights.length,
      });

      res.json({
        success: true,
        data: insights,
      });
    } catch (error) {
      logger.error('Failed to fetch Facebook insights', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Check for rate limit error
      if (error instanceof Error && error.message.includes('rate limit')) {
        res.status(429).json({
          success: false,
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch insights',
      });
    }
  }

  /**
   * Sincronizar insights manualmente
   * POST /api/v1/integrations/facebook/sync
   * 
   * Body (opcional): { adAccountId?, startDate?, endDate? }
   * @returns Resultado da sincronização (insightsSynced, campaignsSynced, errors)
   */
  async syncManual(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        });
        return;
      }

      // Parâmetro opcional: forceFullSync
      const forceFullSync = req.body?.forceFullSync === true; // Default false

      const result = await this.facebookAdsService.syncInsights(userId, forceFullSync);

      logger.info('Facebook insights synced manually', {
        userId,
        insightsSynced: result.insightsSynced,
        campaignsSynced: result.campaignsSynced,
        success: result.success,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Failed to sync Facebook insights', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync insights',
      });
    }
  }

  /**
   * Listar ad accounts
   * GET /api/v1/integrations/facebook/ad-accounts
   * 
   * @returns Lista de ad accounts do usuário
   */
  async getAdAccounts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        });
        return;
      }

      const adAccounts = await this.facebookAdsService.getAdAccounts(userId);

      res.json({
        success: true,
        data: {
          adAccounts,
        },
      });
    } catch (error) {
      logger.error('Failed to get Facebook ad accounts', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get ad accounts',
      });
    }
  }

  /**
   * Testar conexão
   * GET /api/v1/integrations/facebook/test
   * 
   * @returns Resultado do teste (valid, adAccountId, permissions, expiresAt)
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        });
        return;
      }

      const testResult = await this.facebookAdsService.testConnection(userId);

      res.json({
        success: true,
        data: testResult,
      });
    } catch (error) {
      logger.error('Failed to test Facebook connection', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test connection',
      });
    }
  }

  /**
   * Desconectar integração
   * POST /api/v1/integrations/facebook/disconnect
   * 
   * @returns Confirmação de desconexão
   */
  async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User not authenticated',
        });
        return;
      }

      await this.facebookAdsService.disconnect(userId);

      logger.info('Facebook integration disconnected', { userId });

      res.json({
        success: true,
        message: 'Facebook integration disconnected successfully',
      });
    } catch (error) {
      logger.error('Failed to disconnect Facebook integration', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disconnect',
      });
    }
  }
}
