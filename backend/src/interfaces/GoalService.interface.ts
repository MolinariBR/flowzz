/**
 * GoalService Interface
 * 
 * Sistema de metas financeiras personalizadas com cálculo automático de progresso
 * e notificações em marcos importantes (80%, 100%)
 * 
 * Referências:
 * - plan.md: Persona João - "Acompanhar progresso e se manter motivado"
 * - design.md: §Goals System - CRUD, Progress tracking, Notifications
 * - dev-stories.md: Dev Story 4.2 - Sistema de Metas
 * - user-stories.md: Story 4.2 - Criar Metas Mensais Personalizadas
 * - user-journeys.md: Jornada 5 Fase 5 - Metas
 * - tasks.md: Task 9.2 - GoalService
 */

import type { Goal, GoalTargetType, PeriodType } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Status de progresso da meta
 */
export enum GoalProgressStatus {
  NOT_STARTED = 'not_started',       // 0-10%
  IN_PROGRESS = 'in_progress',       // 10-79%
  ALMOST_THERE = 'almost_there',     // 80-99%
  COMPLETED = 'completed',           // 100%+
  EXPIRED_INCOMPLETE = 'expired_incomplete', // Vencida sem atingir
}

/**
 * DTO para criação de meta
 */
export interface CreateGoalDTO {
  title: string;                     // Ex: "Faturar R$ 15.000 em Outubro"
  description?: string;              // Descrição opcional
  target_type: GoalTargetType;       // REVENUE, PROFIT, SALES_COUNT, etc.
  target_value: number | Decimal;    // Valor alvo
  period_type: PeriodType;           // DAILY, WEEKLY, MONTHLY, CUSTOM
  period_start: Date;                // Início do período
  period_end: Date;                  // Fim do período
}

/**
 * DTO para atualização de meta
 */
export interface UpdateGoalDTO {
  title?: string;
  description?: string;
  target_value?: number | Decimal;
  period_end?: Date;
  is_active?: boolean;
}

/**
 * Meta enriquecida com dados de progresso
 */
export interface GoalWithProgress extends Goal {
  progress_percentage: number;       // Progresso 0-100%
  progress_status: GoalProgressStatus; // Status do progresso
  days_remaining: number;            // Dias restantes
  days_elapsed: number;              // Dias decorridos
  is_on_track: boolean;              // Se está no ritmo esperado
  expected_progress: number;         // Progresso esperado baseado no tempo
  daily_target: number;              // Meta diária necessária
  current_daily_avg: number;         // Média diária atual
}

/**
 * Notificação de progresso de meta
 */
export interface GoalProgressNotification {
  goal_id: string;
  goal_title: string;
  progress_percentage: number;
  milestone: 80 | 100;               // Marco atingido (80% ou 100%)
  target_value: number;
  current_value: number;
  user_email: string;
  timestamp: Date;
}

/**
 * Estatísticas gerais de metas do usuário
 */
export interface GoalStatistics {
  total_goals: number;               // Total de metas criadas
  active_goals: number;              // Metas ativas
  completed_goals: number;           // Metas completas
  expired_goals: number;             // Metas expiradas sem completar
  completion_rate: number;           // Taxa de conclusão (0-100%)
  avg_completion_time: number;       // Tempo médio de conclusão (dias)
  best_streak: number;               // Maior sequência de metas atingidas
}

/**
 * Interface do GoalService
 */
export interface IGoalService {
  /**
   * Cria nova meta para usuário
   * 
   * Critérios de Aceitação (user-stories.md Story 4.2):
   * - Máximo 5 metas ativas simultâneas por usuário
   * - Validar se period_end > period_start
   * - Target_value deve ser positivo
   * 
   * @param userId - ID do usuário
   * @param data - Dados da meta
   * @returns Meta criada com progresso calculado
   * @throws Error se já tiver 5 metas ativas
   */
  createGoal(userId: string, data: CreateGoalDTO): Promise<GoalWithProgress>;

  /**
   * Lista metas do usuário com filtros
   * 
   * @param userId - ID do usuário
   * @param filters - Filtros opcionais
   * @returns Array de metas com progresso
   */
  getGoals(
    userId: string,
    filters?: {
      is_active?: boolean;
      period_type?: PeriodType;
      target_type?: GoalTargetType;
    }
  ): Promise<GoalWithProgress[]>;

  /**
   * Busca meta por ID com cálculo de progresso
   * 
   * @param goalId - ID da meta
   * @param userId - ID do usuário (para validação)
   * @returns Meta com progresso atualizado
   * @throws Error se meta não encontrada ou não pertence ao usuário
   */
  getGoalById(goalId: string, userId: string): Promise<GoalWithProgress>;

  /**
   * Atualiza meta existente
   * 
   * Não pode alterar:
   * - target_type (tipo de meta)
   * - period_start (data início)
   * 
   * @param goalId - ID da meta
   * @param userId - ID do usuário
   * @param data - Dados a atualizar
   * @returns Meta atualizada
   */
  updateGoal(
    goalId: string,
    userId: string,
    data: UpdateGoalDTO
  ): Promise<GoalWithProgress>;

  /**
   * Remove meta (soft delete - marca is_active = false)
   * 
   * @param goalId - ID da meta
   * @param userId - ID do usuário
   */
  deleteGoal(goalId: string, userId: string): Promise<void>;

  /**
   * Calcula progresso atual da meta
   * 
   * Busca current_value baseado em target_type:
   * - REVENUE: SUM(sales.valor) WHERE status = 'PAID'
   * - PROFIT: SUM(sales.valor - ads.spent)
   * - SALES_COUNT: COUNT(sales)
   * 
   * @param goal - Meta a calcular
   * @returns Meta enriquecida com dados de progresso
   */
  calculateProgress(goal: Goal): Promise<GoalWithProgress>;

  /**
   * Atualiza progresso de todas as metas ativas do usuário
   * 
   * Deve ser chamado quando:
   * - Nova venda registrada
   * - Sync Coinzz completo
   * - Dashboard atualizado
   * 
   * Envia notificações se atingir marcos (80%, 100%)
   * 
   * @param userId - ID do usuário
   * @returns Array de metas atualizadas
   */
  updateAllGoalsProgress(userId: string): Promise<GoalWithProgress[]>;

  /**
   * Verifica e envia notificações de progresso
   * 
   * Notifica quando atingir:
   * - 80% do progresso (primeira vez)
   * - 100% do progresso (meta completa)
   * 
   * @param goal - Meta a verificar
   * @returns Notificação enviada (ou null se não aplicável)
   */
  checkAndNotifyProgress(goal: GoalWithProgress): Promise<GoalProgressNotification | null>;

  /**
   * Verifica metas expiradas e marca como incomplete
   * 
   * Executado diariamente via cron job
   * 
   * @returns Quantidade de metas expiradas
   */
  expireOldGoals(): Promise<number>;

  /**
   * Obtém estatísticas de metas do usuário
   * 
   * @param userId - ID do usuário
   * @returns Estatísticas gerais
   */
  getGoalStatistics(userId: string): Promise<GoalStatistics>;

  /**
   * Valida se usuário pode criar mais metas
   * 
   * Limite: 5 metas ativas simultâneas
   * 
   * @param userId - ID do usuário
   * @returns true se pode criar, false se atingiu limite
   */
  canCreateGoal(userId: string): Promise<boolean>;

  /**
   * Calcula valor diário necessário para atingir meta
   * 
   * @param goal - Meta a calcular
   * @returns Valor diário necessário
   */
  calculateDailyTarget(goal: GoalWithProgress): number;
}
