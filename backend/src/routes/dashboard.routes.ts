// Referência: tasks.md Task 3.3.3, user-stories.md Story 2.1, design.md §Routes
// Rotas REST para dashboard com autenticação e documentação OpenAPI

import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../shared/middlewares/authenticate';

export const dashboardRoutes = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardMetrics:
 *       type: object
 *       required:
 *         - vendas_hoje
 *         - gasto_anuncios
 *         - lucro_liquido
 *         - pagamentos_agendados
 *       properties:
 *         vendas_hoje:
 *           type: number
 *           minimum: 0
 *           description: Total de vendas do dia atual
 *           example: 1247.50
 *         gasto_anuncios:
 *           type: number
 *           minimum: 0
 *           description: Total gasto com anúncios no dia
 *           example: 340.50
 *         lucro_liquido:
 *           type: number
 *           description: Lucro líquido (vendas - gastos)
 *           example: 907.00
 *         pagamentos_agendados:
 *           type: number
 *           minimum: 0
 *           description: Total de pagamentos agendados
 *           example: 2450.00
 *     
 *     DashboardMetricsWithComparisons:
 *       allOf:
 *         - $ref: '#/components/schemas/DashboardMetrics'
 *         - type: object
 *           required:
 *             - comparisons
 *             - ultima_atualizacao
 *           properties:
 *             comparisons:
 *               type: object
 *               properties:
 *                 vendas_hoje:
 *                   type: number
 *                   description: Variação percentual vs dia anterior
 *                   example: 23.5
 *                 gasto_anuncios:
 *                   type: number
 *                   description: Variação percentual vs dia anterior
 *                   example: -12.0
 *                 lucro_liquido:
 *                   type: number
 *                   description: Variação percentual vs dia anterior
 *                   example: 45.2
 *                 pagamentos_agendados:
 *                   type: number
 *                   description: Variação percentual vs dia anterior
 *                   example: 8.1
 *             ultima_atualizacao:
 *               type: string
 *               format: date-time
 *               description: Timestamp da última atualização dos dados
 *     
 *     DashboardChartData:
 *       type: object
 *       required:
 *         - date
 *         - vendas
 *         - gastos
 *         - lucro
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Data do ponto no gráfico
 *         vendas:
 *           type: number
 *           minimum: 0
 *           description: Total de vendas no dia
 *         gastos:
 *           type: number
 *           minimum: 0
 *           description: Total de gastos no dia
 *         lucro:
 *           type: number
 *           description: Lucro do dia (vendas - gastos)
 *     
 *     DashboardActivity:
 *       type: object
 *       required:
 *         - id
 *         - type
 *         - title
 *         - description
 *         - timestamp
 *       properties:
 *         id:
 *           type: string
 *           description: ID único da atividade
 *         type:
 *           type: string
 *           enum: [sale, payment, client, ad]
 *           description: Tipo de atividade
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Título da atividade
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Descrição detalhada
 *         amount:
 *           type: number
 *           description: Valor monetário relacionado (opcional)
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Data e hora da atividade
 *         metadata:
 *           type: object
 *           description: Dados adicionais da atividade
 */

/**
 * @swagger
 * /dashboard/metrics:
 *   get:
 *     summary: Obtém métricas principais do dashboard
 *     description: |
 *       Retorna as métricas principais do dashboard do usuário autenticado.
 *       Se não especificar período, retorna dados do dia atual com comparações.
 *       Os dados são armazenados em cache por 5 minutos para melhor performance.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data inicial (ISO 8601)
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data final (ISO 8601)
 *         example: "2024-01-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Métricas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/DashboardMetrics'
 *                     - $ref: '#/components/schemas/DashboardMetricsWithComparisons'
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
dashboardRoutes.get('/metrics', authenticate, dashboardController.getMetrics);

/**
 * @swagger
 * /dashboard/chart:
 *   get:
 *     summary: Obtém dados para gráfico de vendas vs gastos
 *     description: |
 *       Retorna dados agregados por dia para construção de gráficos.
 *       Por padrão retorna os últimos 30 dias.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, custom]
 *           default: 30d
 *         description: Período predefinido
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data inicial (obrigatório se period=custom)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data final (obrigatório se period=custom)
 *     responses:
 *       200:
 *         description: Dados do gráfico obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DashboardChartData'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                         end:
 *                           type: string
 *                           format: date-time
 *                         days:
 *                           type: integer
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
dashboardRoutes.get('/chart', authenticate, dashboardController.getChartData);

/**
 * @swagger
 * /dashboard/activities:
 *   get:
 *     summary: Obtém atividades recentes do usuário
 *     description: |
 *       Retorna lista de atividades recentes do usuário para exibição no dashboard.
 *       Inclui vendas, pagamentos, novos clientes e atividades de anúncios.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número máximo de atividades
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sale, payment, client, ad, all]
 *           default: all
 *         description: Filtrar por tipo de atividade
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 90
 *           default: 7
 *         description: Atividades dos últimos N dias
 *     responses:
 *       200:
 *         description: Atividades obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DashboardActivity'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
dashboardRoutes.get('/activities', authenticate, dashboardController.getActivities);

/**
 * @swagger
 * /dashboard/cache:
 *   delete:
 *     summary: Invalida cache do dashboard
 *     description: |
 *       Força a invalidação do cache do dashboard para o usuário autenticado.
 *       Administradores podem invalidar o cache global com o parâmetro ?all=true.
 *     tags: [Dashboard, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Invalidar cache global (apenas admin)
 *     responses:
 *       200:
 *         description: Cache invalidado com sucesso
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
 *                   example: "Cache do usuário invalidado com sucesso"
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (cache global apenas para admin)
 *       500:
 *         description: Erro interno do servidor
 */
dashboardRoutes.delete('/cache', authenticate, dashboardController.invalidateCache);

/**
 * @swagger
 * /dashboard/cache/stats:
 *   get:
 *     summary: Obtém estatísticas do cache do dashboard
 *     description: |
 *       Retorna estatísticas de uso do cache do dashboard.
 *       Endpoint administrativo para monitoramento.
 *     tags: [Dashboard, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
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
 *                     totalKeys:
 *                       type: integer
 *                       description: Número total de chaves em cache
 *                     avgTTL:
 *                       type: integer
 *                       description: TTL médio das chaves (segundos)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (apenas admin)
 *       500:
 *         description: Erro interno do servidor
 */
dashboardRoutes.get('/cache/stats', authenticate, dashboardController.getCacheStats);