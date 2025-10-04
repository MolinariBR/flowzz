/**
 * Centralizador de mocks MSW para APIs externas
 * Facilita importação e setup nos testes
 */

export {
  coinzzHandlers,
  coinzzErrorHandlers,
  coinzzServer,
} from './coinzz.mock';

export {
  facebookHandlers,
  facebookErrorHandlers,
  facebookServer,
} from './facebook.mock';

export {
  whatsappHandlers,
  whatsappErrorHandlers,
  whatsappServer,
  mockWhatsAppWebhookSent,
  mockWhatsAppWebhookDelivered,
  mockWhatsAppWebhookRead,
} from './whatsapp.mock';

export {
  pagbankHandlers,
  pagbankErrorHandlers,
  pagbankServer,
  mockPagBankWebhookPaymentApproved,
  mockPagBankWebhookPaymentDeclined,
  mockPagBankWebhookSubscriptionCancelled,
} from './pagbank.mock';

/**
 * Setup global de todos os servidores MSW
 * Use em vitest.setup.ts ou beforeAll global
 */
export function setupAllMockServers() {
  const { coinzzServer } = require('./coinzz.mock');
  const { facebookServer } = require('./facebook.mock');
  const { whatsappServer } = require('./whatsapp.mock');
  const { pagbankServer } = require('./pagbank.mock');

  return {
    coinzzServer,
    facebookServer,
    whatsappServer,
    pagbankServer,
  };
}

/**
 * Inicia todos os servidores MSW
 */
export function startAllMockServers() {
  const servers = setupAllMockServers();
  
  Object.values(servers).forEach((server: any) => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  return servers;
}

/**
 * Para todos os servidores MSW
 */
export function stopAllMockServers() {
  const servers = setupAllMockServers();
  
  Object.values(servers).forEach((server: any) => {
    server.close();
  });
}

/**
 * Reseta handlers de todos os servidores MSW
 */
export function resetAllMockServers() {
  const servers = setupAllMockServers();
  
  Object.values(servers).forEach((server: any) => {
    server.resetHandlers();
  });
}
