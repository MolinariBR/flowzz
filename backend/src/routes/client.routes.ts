// Referência: design.md §Routes, dev-stories.md §Dev Story 2.1
// Atende user-stories.md Story 3.1 - Rotas REST para API de clientes
// Atende tasks.md Task 3.2.2 - Many-to-many Client-Tag associations

import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import { TagController } from '../controllers/TagController';
import { authenticate } from '../shared/middlewares/authenticate';
import { clientListingsRateLimiter } from '../shared/middlewares/rateLimiter';

const router = Router();
const clientController = new ClientController();
const tagController = new TagController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route GET /clients
 * @desc Get paginated list of clients with filters
 * @access Private
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=20] - Items per page (max 100)
 * @param {string} [search] - Search in name, email, phone
 * @param {string} [status] - Filter by status (ACTIVE, INACTIVE, BLOCKED)
 * @param {string[]} [tags] - Filter by tag IDs
 */
router.get('/', clientListingsRateLimiter, clientController.getClients);

/**
 * @route GET /clients/:id
 * @desc Get specific client by ID
 * @access Private
 * @param {string} id - Client UUID
 */
router.get('/:id', clientController.getClientById);

/**
 * @route POST /clients
 * @desc Create new client
 * @access Private
 * @body {CreateClientInput} Client data
 */
router.post('/', clientController.createClient);

/**
 * @route PUT /clients/:id
 * @desc Update existing client
 * @access Private
 * @param {string} id - Client UUID
 * @body {UpdateClientInput} Updated client data
 */
router.put('/:id', clientController.updateClient);

/**
 * @route DELETE /clients/:id
 * @desc Delete client (soft delete)
 * @access Private
 * @param {string} id - Client UUID
 */
router.delete('/:id', clientController.deleteClient);

/**
 * CLIENT-TAG ASSOCIATIONS (Many-to-Many)
 * Referência: tasks.md Task 3.2.2
 */

/**
 * @route POST /clients/:clientId/tags
 * @desc Add tag to client (many-to-many association)
 * @access Private
 * @param {string} clientId - Client UUID
 * @body {string} tagId - Tag UUID to associate
 */
router.post('/:clientId/tags', tagController.addToClient);

/**
 * @route DELETE /clients/:clientId/tags/:tagId
 * @desc Remove tag from client (many-to-many dissociation)
 * @access Private
 * @param {string} clientId - Client UUID
 * @param {string} tagId - Tag UUID to remove
 */
router.delete('/:clientId/tags/:tagId', tagController.removeFromClient);

export default router;