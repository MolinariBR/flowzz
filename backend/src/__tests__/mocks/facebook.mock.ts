import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Mock handlers para Facebook Marketing API
 * Simula OAuth flow e insights de anúncios
 */
export const facebookHandlers = [
  // GET /oauth/access_token - OAuth callback
  http.get('https://graph.facebook.com/v18.0/oauth/access_token', ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Bad Request',
      });
    }

    return HttpResponse.json({
      access_token: 'mock_facebook_access_token_123456',
      token_type: 'bearer',
      expires_in: 5183999, // ~60 dias
    });
  }),

  // GET /me/adaccounts - Listar ad accounts
  http.get('https://graph.facebook.com/v18.0/me/adaccounts', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'act_123456789',
          account_id: '123456789',
          name: 'Flowzz Marketing Account',
          account_status: 1,
          currency: 'BRL',
        },
      ],
      paging: {
        cursors: {
          before: 'before_cursor',
          after: 'after_cursor',
        },
      },
    });
  }),

  // GET /:ad_account_id/insights - Buscar insights
  http.get('https://graph.facebook.com/v18.0/act_:accountId/insights', ({ params }) => {
    return HttpResponse.json({
      data: [
        {
          date_start: '2024-10-01',
          date_stop: '2024-10-15',
          spend: '3500.50',
          impressions: '125000',
          clicks: '4250',
          ctr: '3.4',
          cpc: '0.82',
          cpm: '28.00',
          reach: '98500',
          frequency: '1.27',
          actions: [
            {
              action_type: 'purchase',
              value: '42',
            },
            {
              action_type: 'lead',
              value: '156',
            },
          ],
          action_values: [
            {
              action_type: 'purchase',
              value: '12450.00',
            },
          ],
        },
      ],
      paging: {
        cursors: {
          before: 'before',
          after: 'after',
        },
      },
    });
  }),

  // GET /:ad_account_id/campaigns - Listar campanhas
  http.get('https://graph.facebook.com/v18.0/act_:accountId/campaigns', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'campaign_001',
          name: 'Lançamento Outubro',
          status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          daily_budget: '50000', // R$ 500,00 em centavos
          lifetime_budget: null,
          created_time: '2024-10-01T10:00:00+0000',
        },
        {
          id: 'campaign_002',
          name: 'Black Friday Prep',
          status: 'PAUSED',
          objective: 'OUTCOME_LEADS',
          daily_budget: '30000',
          created_time: '2024-09-15T14:30:00+0000',
        },
      ],
    });
  }),

  // GET /me - Verificar token válido
  http.get('https://graph.facebook.com/v18.0/me', ({ request }) => {
    const url = new URL(request.url);
    const accessToken = url.searchParams.get('access_token');

    if (!accessToken) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    return HttpResponse.json({
      id: '123456789',
      name: 'Demo User Flowzz',
      email: 'demo@flowzz.com.br',
    });
  }),

  // POST /debug_token - Validar token
  http.get('https://graph.facebook.com/v18.0/debug_token', () => {
    return HttpResponse.json({
      data: {
        app_id: 'mock_app_id',
        type: 'USER',
        application: 'Flowzz Platform',
        data_access_expires_at: Math.floor(Date.now() / 1000) + 5184000,
        expires_at: Math.floor(Date.now() / 1000) + 5184000,
        is_valid: true,
        scopes: ['ads_read', 'ads_management'],
        user_id: '123456789',
      },
    });
  }),
];

/**
 * Handlers para simular erros da Facebook API
 */
export const facebookErrorHandlers = [
  // Simular rate limit (429)
  http.get('https://graph.facebook.com/v18.0/act_:accountId/insights', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Application request limit reached',
          type: 'OAuthException',
          code: 4,
          fbtrace_id: 'mock_trace_id',
        },
      },
      { status: 429 }
    );
  }),

  // Simular token inválido (401)
  http.get('https://graph.facebook.com/v18.0/me', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Invalid OAuth 2.0 Access Token',
          type: 'OAuthException',
          code: 190,
          fbtrace_id: 'mock_trace_id',
        },
      },
      { status: 401 }
    );
  }),

  // Simular permissões insuficientes (403)
  http.get('https://graph.facebook.com/v18.0/act_:accountId/campaigns', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Insufficient permissions',
          type: 'OAuthException',
          code: 10,
          fbtrace_id: 'mock_trace_id',
        },
      },
      { status: 403 }
    );
  }),
];

/**
 * Servidor MSW para testes
 */
export const facebookServer = setupServer(...facebookHandlers);
