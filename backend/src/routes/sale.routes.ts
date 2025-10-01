// Referência: design.md §Routes, user-stories.md Story 2.1, tasks.md Task 3.2
// Rotas REST para vendas com autenticação e documentação OpenAPI

import { Router } from 'express';
import { SaleController } from '../controllers/SaleController';
import { authenticate } from '../shared/middlewares/authenticate';

export const saleRoutes = Router();
const saleController = new SaleController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       required:
 *         - id
 *         - user_id
 *         - product_name
 *         - quantity
 *         - unit_price
 *         - total_price
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único da venda
 *         user_id:
 *           type: string
 *           format: uuid
 *           description: ID do usuário proprietário
 *         client_id:
 *           type: string
 *           format: uuid
 *           description: ID do cliente (opcional)
 *         external_id:
 *           type: string
 *           description: ID externo (Coinzz, etc.)
 *         product_name:
 *           type: string
 *           maxLength: 200
 *           description: Nome do produto
 *         product_sku:
 *           type: string
 *           pattern: ^[A-Z0-9-]{3,50}$
 *           description: SKU do produto
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantidade vendida
 *         unit_price:
 *           type: number
 *           minimum: 0
 *           description: Preço unitário
 *         total_price:
 *           type: number
 *           minimum: 0
 *           description: Preço total da venda
 *         commission:
 *           type: number
 *           minimum: 0
 *           description: Comissão do afiliado
 *         status:
 *           type: string
 *           enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELED, REFUNDED]
 *           description: Status da venda
 *         payment_method:
 *           type: string
 *           maxLength: 50
 *           description: Método de pagamento
 *         payment_due_date:
 *           type: string
 *           format: date-time
 *           description: Data de vencimento
 *         payment_date:
 *           type: string
 *           format: date-time
 *           description: Data do pagamento
 *         shipped_at:
 *           type: string
 *           format: date-time
 *           description: Data de envio
 *         delivered_at:
 *           type: string
 *           format: date-time
 *           description: Data de entrega
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data de atualização
 */

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Listar vendas do usuário
 *     description: Retorna lista paginada de vendas com filtros opcionais
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por cliente
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELED, REFUNDED]
 *         description: Filtrar por status
 *       - in: query
 *         name: product_name
 *         schema:
 *           type: string
 *         description: Filtrar por nome do produto (busca parcial)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data inicial do período
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data final do período
 *       - in: query
 *         name: min_amount
 *         schema:
 *           type: number
 *         description: Valor mínimo
 *       - in: query
 *         name: max_amount
 *         schema:
 *           type: number
 *         description: Valor máximo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página (paginação)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de vendas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sales:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sale'
 *                     total:
 *                       type: integer
 *                       description: Total de registros
 *                     page:
 *                       type: integer
 *                       description: Página atual
 *                     limit:
 *                       type: integer
 *                       description: Itens por página
 *                     total_pages:
 *                       type: integer
 *                       description: Total de páginas
 *       400:
 *         description: Parâmetros de filtro inválidos
 *       401:
 *         description: Token de acesso inválido
 */
saleRoutes.get('/', authenticate, saleController.getAllSales);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Buscar venda por ID
 *     description: Retorna detalhes de uma venda específica
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da venda
 *     responses:
 *       200:
 *         description: Venda encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Venda não encontrada
 *       401:
 *         description: Token de acesso inválido
 */
saleRoutes.get('/:id', authenticate, saleController.getSaleById);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Criar nova venda
 *     description: Cria uma nova venda para o usuário autenticado
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_name
 *               - quantity
 *               - unit_price
 *               - total_price
 *             properties:
 *               client_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente (opcional)
 *               external_id:
 *                 type: string
 *                 description: ID externo (Coinzz, etc.)
 *               product_name:
 *                 type: string
 *                 maxLength: 200
 *                 description: Nome do produto
 *               product_sku:
 *                 type: string
 *                 pattern: ^[A-Z0-9-]{3,50}$
 *                 description: SKU do produto
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantidade vendida
 *               unit_price:
 *                 type: number
 *                 minimum: 0
 *                 description: Preço unitário
 *               total_price:
 *                 type: number
 *                 minimum: 0
 *                 description: Preço total (deve ser quantity × unit_price)
 *               commission:
 *                 type: number
 *                 minimum: 0
 *                 description: Comissão do afiliado
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELED, REFUNDED]
 *                 default: PENDING
 *               payment_method:
 *                 type: string
 *                 maxLength: 50
 *               payment_due_date:
 *                 type: string
 *                 format: date-time
 *               payment_date:
 *                 type: string
 *                 format: date-time
 *               shipped_at:
 *                 type: string
 *                 format: date-time
 *               delivered_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *                 message:
 *                   type: string
 *                   example: Venda criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de acesso inválido
 */
saleRoutes.post('/', authenticate, saleController.createSale);

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Atualizar venda
 *     description: Atualiza dados de uma venda existente
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da venda
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: string
 *                 format: uuid
 *               product_name:
 *                 type: string
 *                 maxLength: 200
 *               product_sku:
 *                 type: string
 *                 pattern: ^[A-Z0-9-]{3,50}$
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               unit_price:
 *                 type: number
 *                 minimum: 0
 *               total_price:
 *                 type: number
 *                 minimum: 0
 *               commission:
 *                 type: number
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELED, REFUNDED]
 *               payment_method:
 *                 type: string
 *                 maxLength: 50
 *               payment_due_date:
 *                 type: string
 *                 format: date-time
 *               payment_date:
 *                 type: string
 *                 format: date-time
 *               shipped_at:
 *                 type: string
 *                 format: date-time
 *               delivered_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Venda não encontrada
 *       401:
 *         description: Token de acesso inválido
 */
saleRoutes.put('/:id', authenticate, saleController.updateSale);

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Deletar venda
 *     description: Remove uma venda do sistema
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da venda
 *     responses:
 *       200:
 *         description: Venda deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Venda deletada com sucesso
 *       404:
 *         description: Venda não encontrada
 *       401:
 *         description: Token de acesso inválido
 */
saleRoutes.delete('/:id', authenticate, saleController.deleteSale);

/**
 * @swagger
 * /api/sales/analytics/summary:
 *   get:
 *     summary: Resumo de vendas por período
 *     description: Retorna métricas agregadas de vendas para Dashboard
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data inicial do período
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data final do período
 *     responses:
 *       200:
 *         description: Resumo de vendas retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_sales:
 *                       type: number
 *                       description: Valor total de vendas
 *                     total_commission:
 *                       type: number
 *                       description: Comissão total
 *                     count:
 *                       type: integer
 *                       description: Número de vendas
 *       400:
 *         description: Parâmetros de data inválidos
 *       401:
 *         description: Token de acesso inválido
 */
saleRoutes.get('/analytics/summary', authenticate, saleController.getSalesSummary);