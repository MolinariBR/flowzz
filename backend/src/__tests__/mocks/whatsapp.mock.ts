import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Mock handlers para WhatsApp Business Cloud API
 * Simula envio de templates e webhooks de status
 */
export const whatsappHandlers = [
  // POST /:phone_number_id/messages - Enviar template
  http.post('https://graph.facebook.com/v18.0/:phoneNumberId/messages', async ({ request, params }) => {
    const body = await request.json() as any;
    const { phoneNumberId } = params;

    // Validar estrutura da mensagem
    if (!body.messaging_product || body.messaging_product !== 'whatsapp') {
      return HttpResponse.json(
        {
          error: {
            message: 'Invalid messaging_product',
            type: 'WhatsAppBusinessException',
            code: 100,
          },
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      messaging_product: 'whatsapp',
      contacts: [
        {
          input: body.to,
          wa_id: body.to.replace('+', ''),
        },
      ],
      messages: [
        {
          id: `wamid.${Date.now()}_mock_message_id`,
          message_status: 'accepted',
        },
      ],
    });
  }),

  // GET /:phone_number_id - Buscar informações do número
  http.get('https://graph.facebook.com/v18.0/:phoneNumberId', () => {
    return HttpResponse.json({
      verified_name: 'Flowzz Platform',
      code_verification_status: 'VERIFIED',
      display_phone_number: '+55 11 99999-9999',
      quality_rating: 'GREEN',
      id: '123456789',
    });
  }),

  // POST - Webhook de status de mensagem
  http.post('/webhook/whatsapp', async ({ request }) => {
    const body = await request.json() as any;

    // Simular confirmação de webhook
    return HttpResponse.json({
      success: true,
      message: 'Webhook received',
    });
  }),

  // GET - Verificação de webhook
  http.get('/webhook/whatsapp', ({ request }) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === 'flowzz_whatsapp_webhook_token') {
      return new HttpResponse(challenge, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    return new HttpResponse(null, { status: 403 });
  }),

  // GET /message_templates - Listar templates aprovados
  http.get('https://graph.facebook.com/v18.0/:wabaId/message_templates', () => {
    return HttpResponse.json({
      data: [
        {
          name: 'delivery_notification',
          language: 'pt_BR',
          status: 'APPROVED',
          category: 'UTILITY',
          id: 'template_001',
          components: [
            {
              type: 'BODY',
              text: '🎉 {{1}}, seu cliente {{2}} recebeu o produto! Valor: R$ {{3}}',
            },
          ],
        },
        {
          name: 'payment_reminder',
          language: 'pt_BR',
          status: 'APPROVED',
          category: 'UTILITY',
          id: 'template_002',
          components: [
            {
              type: 'BODY',
              text: 'Olá {{1}}! Lembrete: pagamento de R$ {{2}} vence em {{3}}.',
            },
          ],
        },
        {
          name: 'payment_overdue',
          language: 'pt_BR',
          status: 'APPROVED',
          category: 'UTILITY',
          id: 'template_003',
          components: [
            {
              type: 'BODY',
              text: '{{1}}, o pagamento de R$ {{2}} está atrasado. Cliente: {{3}}',
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
];

/**
 * Handlers para simular erros da WhatsApp API
 */
export const whatsappErrorHandlers = [
  // Simular número inválido
  http.post('https://graph.facebook.com/v18.0/:phoneNumberId/messages', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Invalid phone number',
          type: 'WhatsAppBusinessException',
          code: 131026,
          error_data: {
            details: 'Phone number not registered on WhatsApp',
          },
        },
      },
      { status: 400 }
    );
  }),

  // Simular template não aprovado
  http.post('https://graph.facebook.com/v18.0/:phoneNumberId/messages', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Template not found or not approved',
          type: 'WhatsAppBusinessException',
          code: 132000,
        },
      },
      { status: 400 }
    );
  }),

  // Simular rate limit (429)
  http.post('https://graph.facebook.com/v18.0/:phoneNumberId/messages', () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Message sending rate limit reached',
          type: 'WhatsAppBusinessException',
          code: 130429,
        },
      },
      { status: 429 }
    );
  }),
];

/**
 * Servidor MSW para testes
 */
export const whatsappServer = setupServer(...whatsappHandlers);

/**
 * Mock de payload de webhook - Mensagem Enviada
 */
export const mockWhatsAppWebhookSent = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '+5511999999999',
              phone_number_id: '123456789',
            },
            statuses: [
              {
                id: 'wamid.123_mock',
                status: 'sent',
                timestamp: '1697385600',
                recipient_id: '5511988888888',
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

/**
 * Mock de payload de webhook - Mensagem Entregue
 */
export const mockWhatsAppWebhookDelivered = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '+5511999999999',
              phone_number_id: '123456789',
            },
            statuses: [
              {
                id: 'wamid.123_mock',
                status: 'delivered',
                timestamp: '1697385660',
                recipient_id: '5511988888888',
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

/**
 * Mock de payload de webhook - Mensagem Lida
 */
export const mockWhatsAppWebhookRead = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '+5511999999999',
              phone_number_id: '123456789',
            },
            statuses: [
              {
                id: 'wamid.123_mock',
                status: 'read',
                timestamp: '1697385720',
                recipient_id: '5511988888888',
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};
