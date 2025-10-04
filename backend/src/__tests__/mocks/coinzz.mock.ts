import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Mock handlers para Coinzz API
 * Simula endpoints de sync de vendas e webhook de entrega
 */
export const coinzzHandlers = [
  // GET /sales - Sync de vendas
  http.get('https://api.coinzz.com.br/v1/sales', ({ request }) => {
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    
    return HttpResponse.json({
      success: true,
      data: {
        sales: [
          {
            id: 'coinzz-sale-001',
            product_name: 'Curso Marketing Digital',
            value: 497.00,
            currency: 'BRL',
            status: 'paid',
            payment_method: 'credit_card',
            date: '2024-10-15T10:30:00Z',
            customer: {
              id: 'coinzz-customer-001',
              name: 'João Silva',
              email: 'joao.silva@example.com',
              phone: '+5511999999999',
            },
            metadata: {
              utm_source: 'instagram',
              utm_campaign: 'lancamento-outubro',
            },
          },
          {
            id: 'coinzz-sale-002',
            product_name: 'Ebook Growth Hacking',
            value: 97.00,
            currency: 'BRL',
            status: 'paid',
            payment_method: 'pix',
            date: '2024-10-15T14:20:00Z',
            customer: {
              id: 'coinzz-customer-002',
              name: 'Maria Santos',
              email: 'maria.santos@example.com',
              phone: '+5511988888888',
            },
          },
        ],
        pagination: {
          page: 1,
          per_page: 20,
          total: 2,
        },
      },
    });
  }),

  // GET /customers - Buscar clientes
  http.get('https://api.coinzz.com.br/v1/customers', () => {
    return HttpResponse.json({
      success: true,
      data: {
        customers: [
          {
            id: 'coinzz-customer-001',
            name: 'João Silva',
            email: 'joao.silva@example.com',
            phone: '+5511999999999',
            total_spent: 1250.50,
            total_orders: 3,
            status: 'active',
            created_at: '2024-09-01T10:00:00Z',
          },
        ],
      },
    });
  }),

  // POST /webhook/delivery - Webhook de entrega
  http.post('https://api.coinzz.com.br/webhook/delivery', async ({ request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      success: true,
      message: 'Delivery notification received',
      data: {
        sale_id: (body as any).sale_id,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      },
    });
  }),

  // GET /products - Listar produtos
  http.get('https://api.coinzz.com.br/v1/products', () => {
    return HttpResponse.json({
      success: true,
      data: {
        products: [
          {
            id: 'coinzz-product-001',
            name: 'Curso Marketing Digital',
            price: 497.00,
            active: true,
          },
          {
            id: 'coinzz-product-002',
            name: 'Ebook Growth Hacking',
            price: 97.00,
            active: true,
          },
        ],
      },
    });
  }),

  // POST /auth/test - Testar conexão
  http.post('https://api.coinzz.com.br/v1/auth/test', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    return HttpResponse.json({
      success: true,
      message: 'Connection successful',
      data: {
        user: 'demo@flowzz.com.br',
        plan: 'pro',
      },
    });
  }),
];

/**
 * Handlers para simular erros da API Coinzz
 */
export const coinzzErrorHandlers = [
  // Simular rate limit (429)
  http.get('https://api.coinzz.com.br/v1/sales', () => {
    return new HttpResponse(null, {
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'Retry-After': '60',
      },
    });
  }),

  // Simular erro de autenticação (401)
  http.post('https://api.coinzz.com.br/v1/auth/test', () => {
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }),

  // Simular erro de servidor (500)
  http.get('https://api.coinzz.com.br/v1/customers', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }),
];

/**
 * Servidor MSW para testes
 */
export const coinzzServer = setupServer(...coinzzHandlers);
