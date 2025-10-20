/**
 * Centralizador de factories para testes
 * Facilita importação de todas as factories
 */

export {
  createClient,
  createInactiveClient,
  createManyClients,
  createNewClient,
  createVIPClient,
} from './client.factory'

export {
  createHighValueSale,
  createManySales,
  createPaidSale,
  createPendingSale,
  createRecentSale,
  createSale,
} from './sale.factory'

export {
  createActiveUser,
  createAdminUser,
  createCancelledUser,
  createManyUsers,
  createSuspendedUser,
  createTestAdmin,
  createTestUser,
  createTrialUser,
  createUser,
} from './user.factory'
