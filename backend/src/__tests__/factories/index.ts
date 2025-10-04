/**
 * Centralizador de factories para testes
 * Facilita importação de todas as factories
 */

export {
  createClient,
  createManyClients,
  createVIPClient,
  createInactiveClient,
  createNewClient,
} from './client.factory';

export {
  createSale,
  createManySales,
  createPaidSale,
  createPendingSale,
  createHighValueSale,
  createRecentSale,
} from './sale.factory';

export {
  createUser,
  createManyUsers,
  createTrialUser,
  createActiveUser,
  createAdminUser,
  createSuspendedUser,
  createCancelledUser,
  createTestUser,
  createTestAdmin,
} from './user.factory';
