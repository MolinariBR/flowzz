/**
 * Script de Verificação - WhatsApp Webhook Routing
 *
 * Executar manualmente para verificar se o sistema identifica
 * corretamente usuários nos webhooks
 */

import { IntegrationRepository } from '../repositories/IntegrationRepository'
import { WhatsAppService } from '../services/WhatsAppService'

async function testWebhookRouting() {
  console.log('🧪 Testando WhatsApp Webhook Routing...\n')

  const integrationRepo = new IntegrationRepository()
  const whatsAppService = new WhatsAppService()

  // Test 1: Webhook com business_account_id válido
  console.log('Test 1: Webhook com business_account_id válido')
  const validWebhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123456789', // business_account_id
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '5511999999999',
                phone_number_id: '987654321',
              },
              contacts: [
                {
                  profile: { name: 'João Silva' },
                  wa_id: '5511999999999',
                },
              ],
              messages: [
                {
                  id: 'message_123',
                  from: '5511999999999',
                  timestamp: '1640995200',
                  type: 'text',
                  text: { body: 'Olá, tudo bem?' },
                },
              ],
            },
          },
        ],
      },
    ],
  }

  try {
    await whatsAppService.handleWebhook(validWebhook)
    console.log('✅ Webhook processado com sucesso\n')
  } catch (error: any) {
    console.log('❌ Erro ao processar webhook:', error.message, '\n')
  }

  // Test 2: Webhook com IDs desconhecidos
  console.log('Test 2: Webhook com IDs desconhecidos (deve logar warning)')
  const unknownWebhook = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'unknown_business_id',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '5511999999999',
                phone_number_id: 'unknown_phone_id',
              },
              messages: [
                {
                  id: 'message_456',
                  from: '5511999999999',
                  timestamp: '1640995200',
                  type: 'text',
                  text: { body: 'Mensagem de teste' },
                },
              ],
            },
          },
        ],
      },
    ],
  }

  try {
    await whatsAppService.handleWebhook(unknownWebhook)
    console.log('✅ Webhook com IDs desconhecidos processado (warning esperado)\n')
  } catch (error: any) {
    console.log('❌ Erro inesperado:', error.message, '\n')
  }

  // Test 3: Payload inválido
  console.log('Test 3: Payload inválido (deve rejeitar)')
  const invalidWebhook = {
    object: 'invalid_object',
  }

  try {
    await whatsAppService.handleWebhook(invalidWebhook)
    console.log('❌ Payload inválido foi aceito (erro esperado)\n')
  } catch (error: any) {
    console.log('✅ Payload inválido rejeitado corretamente:', error.message, '\n')
  }

  // Test 4: Verificar métodos do IntegrationRepository
  console.log('Test 4: Testando IntegrationRepository lookup methods')

  try {
    // Testar busca por business_account_id
    const integration1 = await integrationRepo.findByBusinessAccountId('123456789')
    console.log('🔍 Busca por business_account_id:', integration1 ? 'Encontrado' : 'Não encontrado')

    // Testar busca por phone_number_id
    const integration2 = await integrationRepo.findByPhoneNumberId('987654321')
    console.log('🔍 Busca por phone_number_id:', integration2 ? 'Encontrado' : 'Não encontrado')

    console.log('✅ Métodos de busca do IntegrationRepository funcionando\n')
  } catch (error: any) {
    console.log('❌ Erro nos métodos de busca:', error.message, '\n')
  }

  console.log('🎉 Testes de Webhook Routing concluídos!')
  console.log('\n📋 Próximos passos recomendados:')
  console.log('1. Configurar integração real com dados de teste')
  console.log('2. Testar com webhooks reais do WhatsApp')
  console.log('3. Verificar logs para confirmar identificação de usuário')
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testWebhookRouting().catch(console.error)
}

export { testWebhookRouting }
