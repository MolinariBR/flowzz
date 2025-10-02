/**
 * Tag Routes
 * 
 * Referências:
 * - openapi.yaml: Tag endpoints specification
 * - design.md: REST API patterns and middleware
 * - tasks.md: Task 3.2 - Tags API
 */

import { Router } from 'express';
import { TagController } from '../controllers/TagController';
import { authenticate } from '../shared/middlewares/authenticate';

const router = Router();
const tagController = new TagController();

/**
 * Todas as rotas requerem autenticação JWT
 * Aplica middleware para todas as rotas
 * Referência: design.md Authentication Flow
 */
router.use(authenticate);

/**
 * GET /api/v1/tags
 * Listar todas as tags do usuário
 * Referência: openapi.yaml GET /tags
 */
router.get(
  '/',
  (req, res) => tagController.getAll(req, res)
);

/**
 * POST /api/v1/tags
 * Criar nova tag
 * Validações: nome, cor (hex format)
 * Referência: openapi.yaml POST /tags
 */
router.post(
  '/',
  (req, res) => tagController.create(req, res)
);

/**
 * GET /api/v1/tags/:id
 * Obter tag por ID
 * Referência: openapi.yaml GET /tags/{id}
 */
router.get(
  '/:id',
  (req, res) => tagController.getById(req, res)
);

/**
 * PUT /api/v1/tags/:id
 * Atualizar tag
 * Validações: nome (único), cor (hex format)
 * Referência: openapi.yaml PUT /tags/{id}
 */
router.put(
  '/:id',
  (req, res) => tagController.update(req, res)
);

/**
 * DELETE /api/v1/tags/:id
 * Excluir tag
 * Validação: não pode excluir tag com clientes associados
 * Referência: openapi.yaml DELETE /tags/{id}
 */
router.delete(
  '/:id',
  (req, res) => tagController.delete(req, res)
);

/**
 * GET /api/v1/tags/:id/clients
 * Listar clientes associados a uma tag
 * Retorna array de clientes que possuem esta tag
 */
router.get(
  '/:id/clients',
  (req, res) => tagController.getClients(req, res)
);

/**
 * POST /api/v1/clients/:clientId/tags
 * Adicionar tag a um cliente
 * Many-to-many association
 * Referência: tasks.md Task 3.2.2
 * 
 * Nota: Esta rota será registrada em client.routes.ts
 * Incluída aqui para referência
 */

/**
 * DELETE /api/v1/clients/:clientId/tags/:tagId
 * Remover tag de um cliente
 * Remove associação many-to-many
 * Referência: tasks.md Task 3.2.2
 * 
 * Nota: Esta rota será registrada em client.routes.ts
 * Incluída aqui para referência
 */

export default router;
