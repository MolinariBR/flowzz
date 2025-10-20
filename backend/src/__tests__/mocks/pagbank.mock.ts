import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

/**
 * Mock handlers para PagBank API
 * Simula criação de assinaturas, webhooks de pagamento e gerenciamento
 */
export const pagbankHandlers = [
  // POST /subscriptions - Criar assinatura
  http.post('https://ws.pagseguro.uol.com.br/v3/subscriptions', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      })
    }

    return HttpResponse.json({
      code: 'SUB123456789ABC',
      date: new Date().toISOString(),
      tracker: 'tracker_mock_123',
      status: 'ACTIVE',
      reference: 'flowzz_user_demo',
      lastEventDate: new Date().toISOString(),
      charge: 'auto',
      plan: {
        code: 'PLAN_BASIC',
        name: 'Plano Básico Flowzz',
      },
      sender: {
        name: 'Demo User',
        email: 'demo@flowzz.com.br',
      },
    })
  }),

  // GET /subscriptions/:code - Buscar assinatura
  http.get('https://ws.pagseguro.uol.com.br/v3/subscriptions/:code', ({ params }) => {
    const { code } = params

    return HttpResponse.json({
      code,
      date: '2024-10-01T10:00:00-03:00',
      tracker: 'tracker_mock_123',
      status: 'ACTIVE',
      reference: 'flowzz_user_demo',
      lastEventDate: '2024-10-15T14:30:00-03:00',
      charge: 'auto',
      plan: {
        code: 'PLAN_BASIC',
        name: 'Plano Básico Flowzz',
      },
      sender: {
        name: 'Demo User',
        email: 'demo@flowzz.com.br',
        phone: {
          areaCode: '11',
          number: '999999999',
        },
      },
      amount: {
        value: '59.90',
        currency: 'BRL',
      },
      paymentMethod: {
        type: 'CREDITCARD',
        code: 101,
      },
    })
  }),

  // PUT /subscriptions/:code/cancel - Cancelar assinatura
  http.put('https://ws.pagseguro.uol.com.br/v3/subscriptions/:code/cancel', ({ params }) => {
    return HttpResponse.json({
      code: params.code,
      status: 'CANCELLED',
      date: new Date().toISOString(),
    })
  }),

  // PUT /subscriptions/:code/suspend - Suspender assinatura
  http.put('https://ws.pagseguro.uol.com.br/v3/subscriptions/:code/suspend', ({ params }) => {
    return HttpResponse.json({
      code: params.code,
      status: 'SUSPENDED',
      date: new Date().toISOString(),
    })
  }),

  // PUT /subscriptions/:code/activate - Reativar assinatura
  http.put('https://ws.pagseguro.uol.com.br/v3/subscriptions/:code/activate', ({ params }) => {
    return HttpResponse.json({
      code: params.code,
      status: 'ACTIVE',
      date: new Date().toISOString(),
    })
  }),

  // POST /subscriptions/:code/payment-orders - Criar cobrança manual
  http.post('https://ws.pagseguro.uol.com.br/v3/subscriptions/:code/payment-orders', () => {
    return HttpResponse.json({
      code: 'ORDER123456',
      status: 'INITIATED',
      amount: {
        value: '59.90',
        currency: 'BRL',
      },
      schedulingDate: new Date().toISOString(),
    })
  }),

  // GET /transactions/notifications/:notificationCode - Consultar notificação
  http.get(
    'https://ws.pagseguro.uol.com.br/v3/transactions/notifications/:notificationCode',
    () => {
      return HttpResponse.json({
        date: new Date().toISOString(),
        code: 'TRANS123456',
        reference: 'flowzz_user_demo',
        type: 11, // Subscription payment
        status: 3, // Pago
        lastEventDate: new Date().toISOString(),
        grossAmount: 59.9,
        netAmount: 56.91, // Após taxas
        extraAmount: 0.0,
        sender: {
          name: 'Demo User',
          email: 'demo@flowzz.com.br',
        },
        paymentMethod: {
          type: 1, // Cartão de crédito
          code: 101,
        },
      })
    }
  ),

  // POST - Webhook de notificação
  http.post('/webhook/pagbank', async ({ request }) => {
    const formData = await request.formData()
    const notificationCode = formData.get('notificationCode')
    const notificationType = formData.get('notificationType')

    return HttpResponse.json({
      success: true,
      message: 'Webhook received',
      data: {
        notificationCode,
        notificationType,
      },
    })
  }),
]

/**
 * Handlers para simular erros da PagBank API
 */
export const pagbankErrorHandlers = [
  // Simular autenticação inválida (401)
  http.post('https://ws.pagseguro.uol.com.br/v3/subscriptions', () => {
    return HttpResponse.json(
      {
        errors: [
          {
            code: 11013,
            message: 'Invalid authentication credentials',
          },
        ],
      },
      { status: 401 }
    )
  }),

  // Simular plano não encontrado (404)
  http.post('https://ws.pagseguro.uol.com.br/v3/subscriptions', () => {
    return HttpResponse.json(
      {
        errors: [
          {
            code: 11014,
            message: 'Plan not found',
          },
        ],
      },
      { status: 404 }
    )
  }),

  // Simular cartão recusado
  http.post('https://ws.pagseguro.uol.com.br/v3/subscriptions/:code/payment-orders', () => {
    return HttpResponse.json(
      {
        errors: [
          {
            code: 53045,
            message: 'Credit card declined',
            parameter: 'creditCard.token',
          },
        ],
      },
      { status: 400 }
    )
  }),

  // Simular assinatura já cancelada
  http.put('https://ws.pagseguro.uol.com.br/v3/subscriptions/:code/cancel', () => {
    return HttpResponse.json(
      {
        errors: [
          {
            code: 11015,
            message: 'Subscription already cancelled',
          },
        ],
      },
      { status: 400 }
    )
  }),
]

/**
 * Servidor MSW para testes
 */
export const pagbankServer = setupServer(...pagbankHandlers)

/**
 * Mock de payload de webhook - Pagamento Aprovado
 */
export const mockPagBankWebhookPaymentApproved = {
  notificationCode: 'NOTIF123456ABC',
  notificationType: 'transaction',
}

/**
 * Mock de payload de webhook - Pagamento Recusado
 */
export const mockPagBankWebhookPaymentDeclined = {
  notificationCode: 'NOTIF789XYZ',
  notificationType: 'transaction',
}

/**
 * Mock de payload de webhook - Assinatura Cancelada
 */
export const mockPagBankWebhookSubscriptionCancelled = {
  notificationCode: 'NOTIF_CANCEL_123',
  notificationType: 'subscription',
}
