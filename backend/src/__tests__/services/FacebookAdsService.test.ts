/**
 * FacebookAdsService Unit Tests
 * 
 * Testes completos para integração com Facebook Marketing API.
 * 
 * Coverage target: >80%
 * 
 * Test suites:
 * - OAuth 2.0 flow
 * - Insights fetching com cache e rate limiting
 * - ROAS calculation
 * - Encryption/Decryption
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FacebookAdsService } from '../../services/FacebookAdsService';
import { prisma } from '../../shared/config/database';
import type Redis from 'ioredis';

// Mock modules
vi.mock('../../shared/config/database', () => ({
  prisma: {
    integration: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    sale: {
      aggregate: vi.fn(),
    },
    ad: {
      aggregate: vi.fn(),
    },
  },
}));

vi.mock('../../shared/config/redis', () => ({
  createRedisClient: vi.fn(() => ({
    get: vi.fn(),
    setex: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    keys: vi.fn(),
    del: vi.fn(),
  })),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
}));

describe('FacebookAdsService', () => {
  let facebookAdsService: FacebookAdsService;
  let mockRedis: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create service instance
    facebookAdsService = new FacebookAdsService();
    
    // Get Redis mock instance
    mockRedis = (facebookAdsService as any).redis;
    
    // Setup default environment variables
    process.env.FACEBOOK_APP_ID = 'test_app_id';
    process.env.FACEBOOK_APP_SECRET = 'test_app_secret';
    process.env.FACEBOOK_ENCRYPTION_KEY = '12345678901234567890123456789012'; // 32 chars
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('OAuth 2.0 Flow', () => {
    describe('getAuthorizationUrl', () => {
      it('deve gerar URL de autorização válida', async () => {
        const userId = 'user_123';
        const redirectUri = 'https://example.com/callback';

        const url = await facebookAdsService.getAuthorizationUrl(userId, redirectUri);

        expect(url).toContain('https://www.facebook.com/v18.0/dialog/oauth');
        expect(url).toContain('client_id=test_app_id');
        expect(url).toContain('redirect_uri=');
        expect(url).toContain('scope=ads_read%2Cads_management');
        expect(url).toContain('state=');
      });

      it('deve incluir state parameter para CSRF protection', async () => {
        const userId = 'user_123';
        const redirectUri = 'https://example.com/callback';

        const url = await facebookAdsService.getAuthorizationUrl(userId, redirectUri);
        const stateMatch = url.match(/state=([^&]+)/);

        expect(stateMatch).toBeTruthy();
        expect(stateMatch![1]).toBeTruthy();
      });
    });

    describe('handleOAuthCallback', () => {
      it('deve trocar code por access token e salvar no banco', async () => {
        const userId = 'user_123';
        const code = 'test_code';
        const state = Buffer.from(`${userId}:${Date.now()}:randomstring`).toString('base64');

        // Mock axios response
        const mockAxios = (facebookAdsService as any).axiosInstance;
        mockAxios.get.mockResolvedValueOnce({
          data: {
            access_token: 'test_access_token',
            token_type: 'bearer',
            expires_in: 5184000, // 60 dias
          },
        });

        // Mock ad accounts response
        mockAxios.get.mockResolvedValueOnce({
          data: {
            data: [
              {
                account_id: 'act_123',
                name: 'Test Ad Account',
                account_status: 1,
              },
            ],
          },
        });

        // Mock permissions response
        mockAxios.get.mockResolvedValueOnce({
          data: {
            data: [
              { permission: 'ads_read', status: 'granted' },
              { permission: 'ads_management', status: 'granted' },
            ],
          },
        });

        // Mock prisma upsert
        const mockConfig = {
          accessToken: 'encrypted_token',
          tokenExpiresAt: expect.any(Date),
          adAccountId: 'act_123',
          adAccountName: 'Test Ad Account',
          permissions: ['ads_read', 'ads_management'],
        };

        (prisma.integration.upsert as any).mockResolvedValue({
          id: 'integration_123',
          user_id: userId,
          provider: 'FACEBOOK_ADS',
          status: 'CONNECTED',
          config: mockConfig,
        });

        const result = await facebookAdsService.handleOAuthCallback(userId, code, state);

        expect(result).toBeDefined();
        expect(result.adAccountId).toBe('act_123');
        expect(result.permissions).toContain('ads_read');
        expect(prisma.integration.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              user_id_provider: {
                user_id: userId,
                provider: 'FACEBOOK_ADS',
              },
            },
          })
        );
      });

      it('deve rejeitar state inválido', async () => {
        const userId = 'user_123';
        const code = 'test_code';
        const invalidState = 'invalid_state';

        await expect(
          facebookAdsService.handleOAuthCallback(userId, code, invalidState)
        ).rejects.toThrow('Invalid state parameter');
      });

      it('deve rejeitar state expirado (>15 minutos)', async () => {
        const userId = 'user_123';
        const code = 'test_code';
        const oldTimestamp = Date.now() - 20 * 60 * 1000; // 20 minutos atrás
        const expiredState = Buffer.from(`${userId}:${oldTimestamp}:randomstring`).toString('base64');

        await expect(
          facebookAdsService.handleOAuthCallback(userId, code, expiredState)
        ).rejects.toThrow('Invalid state parameter');
      });
    });

    describe('refreshAccessToken', () => {
      it('deve renovar token expirado', async () => {
        const userId = 'user_123';
        const oldToken = 'old_token';
        const newToken = 'new_token';

        // Mock integration existente
        (prisma.integration.findUnique as any).mockResolvedValue({
          id: 'integration_123',
          user_id: userId,
          provider: 'FACEBOOK_ADS',
          status: 'CONNECTED',
          config: {
            accessToken: facebookAdsService.encryptToken(oldToken),
            tokenExpiresAt: new Date(Date.now() - 1000), // Expirado
          },
        });

        // Mock axios token exchange
        const mockAxios = (facebookAdsService as any).axiosInstance;
        mockAxios.get.mockResolvedValueOnce({
          data: {
            access_token: newToken,
            expires_in: 5184000,
          },
        });

        // Mock prisma update
        (prisma.integration.update as any).mockResolvedValue({
          id: 'integration_123',
          config: {
            accessToken: facebookAdsService.encryptToken(newToken),
          },
        });

        const result = await facebookAdsService.refreshAccessToken(userId);

        expect(result).toBe(newToken);
        expect(prisma.integration.update).toHaveBeenCalled();
      });
    });
  });

  describe('Insights & Sync', () => {
    describe('getAdAccountInsights', () => {
      it('deve buscar insights com cache hit', async () => {
        const userId = 'user_123';
        const params = {
          adAccountId: 'act_123',
          datePreset: 'last_30d' as const,
        };

        // Mock cache hit
        const cachedData = {
          adAccountId: 'act_123',
          period: { start: '2025-09-02', end: '2025-10-02' },
          metrics: {
            spend: 1000,
            impressions: 10000,
            clicks: 500,
            ctr: 5,
            cpc: 2,
            cpm: 100,
            conversions: 50,
          },
          roas: 300,
          campaigns: [],
          insights: [],
        };

        mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

        const result = await facebookAdsService.getAdAccountInsights(userId, params);

        expect(result).toEqual(cachedData);
        expect(mockRedis.get).toHaveBeenCalled();
      });

      it('deve buscar insights da API quando cache miss', async () => {
        const userId = 'user_123';
        const params = {
          adAccountId: 'act_123',
          datePreset: 'last_7d' as const,
        };

        // Mock cache miss
        mockRedis.get.mockResolvedValue(null);

        // Mock rate limit check
        mockRedis.get.mockResolvedValueOnce(null); // Rate limit counter

        // Mock integration
        (prisma.integration.findUnique as any).mockResolvedValue({
          user_id: userId,
          provider: 'FACEBOOK_ADS',
          status: 'CONNECTED',
          config: {
            accessToken: facebookAdsService.encryptToken('test_token'),
            adAccountId: 'act_123',
          },
        });

        // Mock Facebook API responses
        const mockAxios = (facebookAdsService as any).axiosInstance;
        
        // Campaigns
        mockAxios.get.mockResolvedValueOnce({
          data: {
            data: [
              { id: 'campaign_1', name: 'Campaign 1', status: 'ACTIVE' },
            ],
          },
        });

        // Insights
        mockAxios.get.mockResolvedValueOnce({
          data: {
            data: [
              {
                spend: '500',
                impressions: '5000',
                clicks: '250',
                ctr: '5',
                cpc: '2',
                cpm: '100',
                actions: [{ action_type: 'offsite_conversion', value: '25' }],
              },
            ],
          },
        });

        // Mock ROAS calculation
        (prisma.sale.aggregate as any).mockResolvedValue({
          _sum: { total_price: 1500 },
        });

        (prisma.ad.aggregate as any).mockResolvedValue({
          _sum: { spend: 500 },
        });

        const result = await facebookAdsService.getAdAccountInsights(userId, params);

        expect(result).toBeDefined();
        expect(result.metrics.spend).toBe(500);
        expect(result.roas).toBeDefined();
        expect(mockRedis.setex).toHaveBeenCalled(); // Cache save
      });

      it('deve respeitar rate limit (200 req/hora)', async () => {
        const userId = 'user_123';
        const params = {
          adAccountId: 'act_123',
          datePreset: 'today' as const,
        };

        // Mock cache miss
        mockRedis.get.mockResolvedValueOnce(null);

        // Mock rate limit exceeded
        mockRedis.get.mockResolvedValueOnce('200'); // Rate limit counter = 200

        await expect(
          facebookAdsService.getAdAccountInsights(userId, params)
        ).rejects.toThrow('rate limit');
      });
    });

    describe('calculateROAS', () => {
      it('deve calcular ROAS corretamente', async () => {
        const userId = 'user_123';
        const startDate = '2025-09-01';
        const endDate = '2025-10-01';

        // Mock sales aggregate
        (prisma.sale.aggregate as any).mockResolvedValue({
          _sum: { total_price: 3000 },
        });

        // Mock ads aggregate
        (prisma.ad.aggregate as any).mockResolvedValue({
          _sum: { spend: 1000 },
        });

        const roas = await facebookAdsService.calculateROAS(userId, startDate, endDate);

        expect(roas).toBe(300); // (3000 / 1000) * 100 = 300%
      });

      it('deve retornar undefined quando não há dados', async () => {
        const userId = 'user_123';
        const startDate = '2025-09-01';
        const endDate = '2025-10-01';

        // Mock sem vendas
        (prisma.sale.aggregate as any).mockResolvedValue({
          _sum: { total_price: null },
        });

        (prisma.ad.aggregate as any).mockResolvedValue({
          _sum: { spend: null },
        });

        const roas = await facebookAdsService.calculateROAS(userId, startDate, endDate);

        expect(roas).toBeUndefined();
      });

      it('deve retornar undefined quando spend = 0', async () => {
        const userId = 'user_123';
        const startDate = '2025-09-01';
        const endDate = '2025-10-01';

        (prisma.sale.aggregate as any).mockResolvedValue({
          _sum: { total_price: 1000 },
        });

        (prisma.ad.aggregate as any).mockResolvedValue({
          _sum: { spend: 0 },
        });

        const roas = await facebookAdsService.calculateROAS(userId, startDate, endDate);

        expect(roas).toBeUndefined();
      });
    });

    describe('syncInsights', () => {
      it('deve sincronizar insights com sucesso', async () => {
        const userId = 'user_123';

        // Mock integration
        (prisma.integration.findUnique as any).mockResolvedValue({
          user_id: userId,
          provider: 'FACEBOOK_ADS',
          status: 'CONNECTED',
          config: {
            accessToken: facebookAdsService.encryptToken('test_token'),
            adAccountId: 'act_123',
            adAccountName: 'Test Account',
          },
        });

        // Mock getAdAccountInsights
        const mockInsights = {
          adAccountId: 'act_123',
          period: { start: '2025-09-25', end: '2025-10-02' },
          metrics: {
            spend: 1000,
            impressions: 10000,
            clicks: 500,
            ctr: 5,
            cpc: 2,
            cpm: 100,
            conversions: 50,
          },
          roas: 250,
          campaigns: [{ id: 'c1', name: 'Campaign 1' }],
          insights: [],
        };

        vi.spyOn(facebookAdsService, 'getAdAccountInsights').mockResolvedValue(mockInsights);

        // Mock prisma update
        (prisma.integration.update as any).mockResolvedValue({});

        const result = await facebookAdsService.syncInsights(userId, true);

        expect(result.success).toBe(true);
        expect(result.insightsSynced).toBeGreaterThanOrEqual(0);
        expect(result.roas).toBe(250);
      });
    });
  });

  describe('Encryption & Security', () => {
    describe('encryptToken / decryptToken', () => {
      it('deve criptografar e descriptografar token corretamente', () => {
        const originalToken = 'my_secret_facebook_token_12345';

        const encrypted = facebookAdsService.encryptToken(originalToken);
        const decrypted = facebookAdsService.decryptToken(encrypted);

        expect(encrypted).not.toBe(originalToken);
        expect(encrypted).toContain(':'); // Format: iv:encrypted
        expect(decrypted).toBe(originalToken);
      });

      it('deve gerar IV diferente a cada criptografia', () => {
        const token = 'test_token';

        const encrypted1 = facebookAdsService.encryptToken(token);
        const encrypted2 = facebookAdsService.encryptToken(token);

        expect(encrypted1).not.toBe(encrypted2);
        
        const decrypted1 = facebookAdsService.decryptToken(encrypted1);
        const decrypted2 = facebookAdsService.decryptToken(encrypted2);

        expect(decrypted1).toBe(token);
        expect(decrypted2).toBe(token);
      });

      it('deve lançar erro ao descriptografar token inválido', () => {
        expect(() => {
          facebookAdsService.decryptToken('invalid_token_format');
        }).toThrow();
      });
    });

    describe('State validation', () => {
      it('deve validar state válido', () => {
        const userId = 'user_123';
        const state = (facebookAdsService as any).generateState(userId);
        
        const isValid = (facebookAdsService as any).validateState(userId, state);

        expect(isValid).toBe(true);
      });

      it('deve rejeitar state com userId diferente', () => {
        const userId1 = 'user_123';
        const userId2 = 'user_456';
        
        const state = (facebookAdsService as any).generateState(userId1);
        const isValid = (facebookAdsService as any).validateState(userId2, state);

        expect(isValid).toBe(false);
      });

      it('deve rejeitar state mal formatado', () => {
        const userId = 'user_123';
        const invalidState = 'invalid_base64_string';

        const isValid = (facebookAdsService as any).validateState(userId, invalidState);

        expect(isValid).toBe(false);
      });
    });
  });

  describe('Management Methods', () => {
    describe('getStatus', () => {
      it('deve retornar status connected quando integração ativa', async () => {
        const userId = 'user_123';

        (prisma.integration.findUnique as any).mockResolvedValue({
          user_id: userId,
          provider: 'FACEBOOK_ADS',
          status: 'CONNECTED',
          config: {
            adAccountId: 'act_123',
            adAccountName: 'Test Account',
            tokenExpiresAt: new Date(Date.now() + 1000000),
            permissions: ['ads_read', 'ads_management'],
            lastSyncAt: new Date(),
          },
        });

        const status = await facebookAdsService.getStatus(userId);

        expect(status.connected).toBe(true);
        expect(status.adAccountId).toBe('act_123');
        expect(status.lastSyncAt).toBeDefined();
      });

      it('deve retornar status disconnected quando não há integração', async () => {
        const userId = 'user_123';

        (prisma.integration.findUnique as any).mockResolvedValue(null);

        const status = await facebookAdsService.getStatus(userId);

        expect(status.connected).toBe(false);
        expect(status.syncEnabled).toBe(false);
      });
    });

    describe('getAdAccounts', () => {
      it('deve listar ad accounts do usuário', async () => {
        const userId = 'user_123';

        (prisma.integration.findUnique as any).mockResolvedValue({
          user_id: userId,
          provider: 'FACEBOOK_ADS',
          status: 'CONNECTED',
          config: {
            accessToken: facebookAdsService.encryptToken('test_token'),
          },
        });

        const mockAxios = (facebookAdsService as any).axiosInstance;
        mockAxios.get.mockResolvedValue({
          data: {
            data: [
              { account_id: 'act_123', name: 'Account 1', account_status: 1 },
              { account_id: 'act_456', name: 'Account 2', account_status: 1 },
            ],
          },
        });

        const accounts = await facebookAdsService.getAdAccounts(userId);

        expect(accounts).toHaveLength(2);
        expect(accounts[0].account_id).toBe('act_123');
      });
    });

    describe('testConnection', () => {
      it('deve validar conexão com sucesso', async () => {
        const userId = 'user_123';

        (prisma.integration.findUnique as any).mockResolvedValue({
          user_id: userId,
          provider: 'FACEBOOK_ADS',
          status: 'CONNECTED',
          config: {
            accessToken: facebookAdsService.encryptToken('test_token'),
            adAccountId: 'act_123',
            adAccountName: 'Test Account',
            tokenExpiresAt: new Date(Date.now() + 1000000),
          },
        });

        const mockAxios = (facebookAdsService as any).axiosInstance;
        
        // Mock /me endpoint
        mockAxios.get.mockResolvedValueOnce({
          data: { id: 'fb_user_id', name: 'Test User' },
        });

        // Mock ad accounts
        mockAxios.get.mockResolvedValueOnce({
          data: {
            data: [{ account_id: 'act_123', name: 'Test Account' }],
          },
        });

        // Mock permissions
        mockAxios.get.mockResolvedValueOnce({
          data: {
            data: [
              { permission: 'ads_read', status: 'granted' },
            ],
          },
        });

        const result = await facebookAdsService.testConnection(userId);

        expect(result.valid).toBe(true);
        expect(result.permissions).toContain('ads_read');
      });

      it('deve retornar erro quando conexão falha', async () => {
        const userId = 'user_123';

        (prisma.integration.findUnique as any).mockResolvedValue(null);

        const result = await facebookAdsService.testConnection(userId);

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('disconnect', () => {
      it('deve desconectar integração e limpar cache', async () => {
        const userId = 'user_123';

        (prisma.integration.update as any).mockResolvedValue({});
        mockRedis.keys.mockResolvedValue(['key1', 'key2']);
        mockRedis.del.mockResolvedValue(2);

        await facebookAdsService.disconnect(userId);

        expect(prisma.integration.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              user_id_provider: {
                user_id: userId,
                provider: 'FACEBOOK_ADS',
              },
            },
            data: {
              status: 'DISCONNECTED',
            },
          })
        );

        expect(mockRedis.keys).toHaveBeenCalled();
        expect(mockRedis.del).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('deve tratar erro de rede ao buscar insights', async () => {
      const userId = 'user_123';
      const params = {
        adAccountId: 'act_123',
        datePreset: 'today' as const,
      };

      mockRedis.get.mockResolvedValue(null);

      (prisma.integration.findUnique as any).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        facebookAdsService.getAdAccountInsights(userId, params)
      ).rejects.toThrow('Network error');
    });

    it('deve tratar erro de integração não encontrada', async () => {
      const userId = 'user_123';

      (prisma.integration.findUnique as any).mockResolvedValue(null);

      await expect(
        facebookAdsService.getAdAccounts(userId)
      ).rejects.toThrow('not connected');
    });

    it('deve tratar erro de token inválido', async () => {
      const userId = 'user_123';

      (prisma.integration.findUnique as any).mockResolvedValue({
        user_id: userId,
        provider: 'FACEBOOK_ADS',
        status: 'CONNECTED',
        config: {
          accessToken: 'invalid_encrypted_token',
        },
      });

      await expect(
        facebookAdsService.getAdAccounts(userId)
      ).rejects.toThrow();
    });
  });
});
