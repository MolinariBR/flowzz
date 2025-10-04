/**
 * GoalService Implementation
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

import { GoalTargetType } from '@prisma/client';
import type { Goal, PeriodType } from '@prisma/client';
import type {
  IGoalService,
  CreateGoalDTO,
  UpdateGoalDTO,
  GoalWithProgress,
  GoalProgressNotification,
  GoalStatistics,
} from '../interfaces/GoalService.interface';
import { GoalProgressStatus } from '../interfaces/GoalService.interface';
import { logger } from '../shared/utils/logger';
import { prisma } from '../shared/config/database';

export class GoalService implements IGoalService {
  private readonly MAX_ACTIVE_GOALS = 5;
  private readonly NOTIFICATION_MILESTONE_80 = 80;
  private readonly NOTIFICATION_MILESTONE_100 = 100;

  /**
   * Cria nova meta para usuário
   *
   * Critérios de Aceitação (user-stories.md Story 4.2):
   * - Máximo 5 metas ativas simultâneas por usuário
   * - Validar se period_end > period_start
   * - Target_value deve ser positivo
   */
  async createGoal(userId: string, data: CreateGoalDTO): Promise<GoalWithProgress> {
    try {
      // Verificar se usuário pode criar mais metas
      const canCreate = await this.canCreateGoal(userId);
      if (!canCreate) {
        throw new Error(
          `Você já atingiu o limite de ${this.MAX_ACTIVE_GOALS} metas ativas`,
        );
      }

      // Validar datas
      if (data.period_end <= data.period_start) {
        throw new Error('Data de término deve ser posterior à data de início');
      }

      // Criar meta
      const goal = await prisma.goal.create({
        data: {
          user_id: userId,
          title: data.title,
          description: data.description || null,
          target_type: data.target_type,
          target_value: data.target_value,
          period_type: data.period_type,
          period_start: data.period_start,
          period_end: data.period_end,
          is_active: true,
          current_value: 0,
        },
      });

      logger.info(`Meta criada: goalId=${goal.id}, userId=${userId}`, {
        title: goal.title,
        target_type: goal.target_type,
        target_value: Number(goal.target_value),
      });

      // Calcular progresso inicial
      return this.calculateProgress(goal);
    } catch (error) {
      logger.error('Erro ao criar meta', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Lista metas do usuário com filtros
   */
  async getGoals(
    userId: string,
    filters?: {
      is_active?: boolean;
      period_type?: PeriodType;
      target_type?: GoalTargetType;
    },
  ): Promise<GoalWithProgress[]> {
    try {
      const goals = await prisma.goal.findMany({
        where: {
          user_id: userId,
          ...(filters?.is_active !== undefined && { is_active: filters.is_active }),
          ...(filters?.period_type && { period_type: filters.period_type }),
          ...(filters?.target_type && { target_type: filters.target_type }),
        },
        orderBy: [
          { is_active: 'desc' },
          { created_at: 'desc' },
        ],
      });

      // Calcular progresso para todas as metas
      const goalsWithProgress = await Promise.all(
        goals.map((goal) => this.calculateProgress(goal)),
      );

      logger.info(`Listadas ${goals.length} metas para userId=${userId}`, {
        filters,
        active_count: goalsWithProgress.filter((g) => g.is_active).length,
      });

      return goalsWithProgress;
    } catch (error) {
      logger.error('Erro ao listar metas', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Busca meta por ID com cálculo de progresso
   */
  async getGoalById(goalId: string, userId: string): Promise<GoalWithProgress> {
    try {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
      });

      if (!goal) {
        throw new Error('Meta não encontrada');
      }

      if (goal.user_id !== userId) {
        throw new Error('Você não tem permissão para acessar esta meta');
      }

      return this.calculateProgress(goal);
    } catch (error) {
      logger.error('Erro ao buscar meta', {
        goalId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Atualiza meta existente
   *
   * Não pode alterar:
   * - target_type (tipo de meta)
   * - period_start (data início)
   */
  async updateGoal(
    goalId: string,
    userId: string,
    data: UpdateGoalDTO,
  ): Promise<GoalWithProgress> {
    try {
      // Verificar se meta existe e pertence ao usuário
      const existingGoal = await this.getGoalById(goalId, userId);

      // Validar data se fornecida
      if (data.period_end && data.period_end <= existingGoal.period_start) {
        throw new Error('Data de término deve ser posterior à data de início');
      }

      // Atualizar meta
      const updatedGoal = await prisma.goal.update({
        where: { id: goalId },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description || null }),
          ...(data.target_value && { target_value: data.target_value }),
          ...(data.period_end && { period_end: data.period_end }),
          ...(data.is_active !== undefined && { is_active: data.is_active }),
        },
      });

      logger.info(`Meta atualizada: goalId=${goalId}`, {
        updated_fields: Object.keys(data),
      });

      return this.calculateProgress(updatedGoal);
    } catch (error) {
      logger.error('Erro ao atualizar meta', {
        goalId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Remove meta (soft delete - marca is_active = false)
   */
  async deleteGoal(goalId: string, userId: string): Promise<void> {
    try {
      // Verificar se meta existe e pertence ao usuário
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
      });

      if (!goal) {
        throw new Error('Meta não encontrada');
      }

      if (goal.user_id !== userId) {
        throw new Error('Você não tem permissão para deletar esta meta');
      }

      // Soft delete
      await prisma.goal.update({
        where: { id: goalId },
        data: { is_active: false },
      });

      logger.info(`Meta removida (soft delete): goalId=${goalId}`);
    } catch (error) {
      logger.error('Erro ao remover meta', {
        goalId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Calcula progresso atual da meta
   *
   * Busca current_value baseado em target_type:
   * - REVENUE: SUM(sales.total_price) WHERE status IN ('PAID', 'DELIVERED')
   * - PROFIT: SUM(sales.total_price - ads.spend)
   * - SALES_COUNT: COUNT(sales)
   * - EXPENSE: SUM(ads.spend)
   */
  async calculateProgress(goal: Goal): Promise<GoalWithProgress> {
    try {
      // Calcular valor atual baseado no tipo de meta
      let currentValue = 0;

      switch (goal.target_type) {
      case GoalTargetType.REVENUE:
        currentValue = await this.calculateRevenueValue(goal);
        break;
      case GoalTargetType.PROFIT:
        currentValue = await this.calculateProfitValue(goal);
        break;
      case GoalTargetType.ORDERS:
        currentValue = await this.calculateSalesCountValue(goal);
        break;
      case GoalTargetType.CUSTOM:
        // Para metas customizadas, usar current_value do banco
        currentValue = Number(goal.current_value);
        break;
      default:
        logger.warn(`Tipo de meta não suportado: ${goal.target_type}`);
      }

      // Atualizar current_value no banco
      await prisma.goal.update({
        where: { id: goal.id },
        data: { current_value: currentValue },
      });

      // Calcular métricas de progresso
      const targetValue = Number(goal.target_value);
      const progressPercentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

      const now = new Date();
      const totalDuration = goal.period_end.getTime() - goal.period_start.getTime();
      const elapsed = now.getTime() - goal.period_start.getTime();
      const daysElapsed = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)));
      const daysRemaining = Math.max(0, Math.ceil((goal.period_end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      const expectedProgress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
      const isOnTrack = progressPercentage >= expectedProgress || progressPercentage >= 100;

      // Determinar status do progresso
      let progressStatus: GoalProgressStatus;
      const isExpired = now > goal.period_end;

      if (progressPercentage >= 100) {
        progressStatus = GoalProgressStatus.COMPLETED;
      } else if (isExpired) {
        progressStatus = GoalProgressStatus.EXPIRED_INCOMPLETE;
      } else if (progressPercentage >= 80) {
        progressStatus = GoalProgressStatus.ALMOST_THERE;
      } else if (progressPercentage >= 10) {
        progressStatus = GoalProgressStatus.IN_PROGRESS;
      } else {
        progressStatus = GoalProgressStatus.NOT_STARTED;
      }

      // Calcular meta diária necessária
      const dailyTarget = daysRemaining > 0 ? (targetValue - currentValue) / daysRemaining : 0;

      // Calcular média diária atual
      const currentDailyAvg = daysElapsed > 0 ? currentValue / daysElapsed : 0;

      const goalWithProgress: GoalWithProgress = {
        ...goal,
        progress_percentage: Math.round(progressPercentage * 100) / 100,
        progress_status: progressStatus,
        days_remaining: daysRemaining,
        days_elapsed: daysElapsed,
        is_on_track: isOnTrack,
        expected_progress: Math.round(expectedProgress * 100) / 100,
        daily_target: Math.round(dailyTarget * 100) / 100,
        current_daily_avg: Math.round(currentDailyAvg * 100) / 100,
      };

      return goalWithProgress;
    } catch (error) {
      logger.error('Erro ao calcular progresso da meta', {
        goalId: goal.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Atualiza progresso de todas as metas ativas do usuário
   *
   * Deve ser chamado quando:
   * - Nova venda registrada
   * - Sync Coinzz completo
   * - Dashboard atualizado
   */
  async updateAllGoalsProgress(userId: string): Promise<GoalWithProgress[]> {
    try {
      const activeGoals = await prisma.goal.findMany({
        where: {
          user_id: userId,
          is_active: true,
        },
      });

      const updatedGoals: GoalWithProgress[] = [];

      for (const goal of activeGoals) {
        const goalWithProgress = await this.calculateProgress(goal);
        updatedGoals.push(goalWithProgress);

        // Verificar e enviar notificações
        await this.checkAndNotifyProgress(goalWithProgress);
      }

      logger.info(`Progresso atualizado para ${activeGoals.length} metas ativas do userId=${userId}`);

      return updatedGoals;
    } catch (error) {
      logger.error('Erro ao atualizar progresso de todas as metas', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Verifica e envia notificações de progresso
   *
   * Notifica quando atingir:
   * - 80% do progresso (primeira vez)
   * - 100% do progresso (meta completa)
   */
  async checkAndNotifyProgress(goal: GoalWithProgress): Promise<GoalProgressNotification | null> {
    try {
      const { progress_percentage, progress_status, user_id, id, title } = goal;

      // Verificar se deve notificar
      let shouldNotify = false;
      let milestone: 80 | 100 | null = null;

      if (progress_status === GoalProgressStatus.COMPLETED && progress_percentage >= this.NOTIFICATION_MILESTONE_100) {
        shouldNotify = true;
        milestone = 100;
      } else if (progress_status === GoalProgressStatus.ALMOST_THERE && progress_percentage >= this.NOTIFICATION_MILESTONE_80) {
        shouldNotify = true;
        milestone = 80;
      }

      if (!shouldNotify || !milestone) {
        return null;
      }

      // Buscar email do usuário
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: { email: true },
      });

      if (!user) {
        logger.warn(`Usuário não encontrado para notificação: userId=${user_id}`);
        return null;
      }

      const notification: GoalProgressNotification = {
        goal_id: id,
        goal_title: title,
        progress_percentage: progress_percentage,
        milestone: milestone,
        target_value: Number(goal.target_value),
        current_value: Number(goal.current_value),
        user_email: user.email,
        timestamp: new Date(),
      };

      // TODO: Integrar com sistema de notificações (email, push, in-app)
      // await notificationService.sendGoalProgress(notification);

      logger.info(`Notificação de progresso de meta: ${milestone}%`, {
        goalId: id,
        userId: user_id,
        milestone,
        progress: progress_percentage,
      });

      return notification;
    } catch (error) {
      logger.error('Erro ao verificar notificações de progresso', {
        goalId: goal.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Verifica metas expiradas e marca como incomplete
   *
   * Executado diariamente via cron job
   */
  async expireOldGoals(): Promise<number> {
    try {
      const now = new Date();

      // 1. Buscar metas candidatas a expirar
      const candidates = await prisma.goal.findMany({
        where: {
          is_active: true,
          period_end: {
            lt: now,
          },
        },
      });

      // 2. Filtrar em código (Prisma não suporta field-to-field comparison em updateMany)
      const toExpire = candidates.filter(
        (goal) => Number(goal.current_value) < Number(goal.target_value)
      );

      if (toExpire.length === 0) {
        logger.info('Nenhuma meta expirada para processar');
        return 0;
      }

      // 3. Atualizar em batch
      const result = await prisma.goal.updateMany({
        where: {
          id: {
            in: toExpire.map((g) => g.id),
          },
        },
        data: {
          is_active: false,
        },
      });

      logger.info(`${result.count} metas expiradas marcadas como incomplete`);

      return result.count;
    } catch (error) {
      logger.error('Erro ao expirar metas antigas', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Obtém estatísticas de metas do usuário
   */
  async getGoalStatistics(userId: string): Promise<GoalStatistics> {
    try {
      const allGoals = await prisma.goal.findMany({
        where: { user_id: userId },
      });

      const totalGoals = allGoals.length;
      const activeGoals = allGoals.filter((g) => g.is_active).length;

      const completedGoals = allGoals.filter(
        (g) => Number(g.current_value) >= Number(g.target_value),
      ).length;

      const now = new Date();
      const expiredGoals = allGoals.filter(
        (g) => g.period_end < now && Number(g.current_value) < Number(g.target_value),
      ).length;

      const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      // Calcular tempo médio de conclusão (apenas metas completas)
      const completedGoalsWithTime = allGoals.filter(
        (g) => Number(g.current_value) >= Number(g.target_value),
      );

      let avgCompletionTime = 0;
      if (completedGoalsWithTime.length > 0) {
        const totalDays = completedGoalsWithTime.reduce((sum, goal) => {
          const duration = goal.period_end.getTime() - goal.period_start.getTime();
          return sum + duration / (1000 * 60 * 60 * 24);
        }, 0);
        avgCompletionTime = totalDays / completedGoalsWithTime.length;
      }

      // Calcular maior sequência de metas atingidas
      // TODO: Implementar lógica de streak (metas consecutivas completas)
      const bestStreak = completedGoals; // Simplificado

      const statistics: GoalStatistics = {
        total_goals: totalGoals,
        active_goals: activeGoals,
        completed_goals: completedGoals,
        expired_goals: expiredGoals,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_completion_time: Math.round(avgCompletionTime * 100) / 100,
        best_streak: bestStreak,
      };

      logger.info(`Estatísticas de metas calculadas para userId=${userId}`, statistics);

      return statistics;
    } catch (error) {
      logger.error('Erro ao calcular estatísticas de metas', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Valida se usuário pode criar mais metas
   *
   * Limite: 5 metas ativas simultâneas
   */
  async canCreateGoal(userId: string): Promise<boolean> {
    try {
      const activeGoalsCount = await prisma.goal.count({
        where: {
          user_id: userId,
          is_active: true,
        },
      });

      return activeGoalsCount < this.MAX_ACTIVE_GOALS;
    } catch (error) {
      logger.error('Erro ao verificar limite de metas', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Calcula valor diário necessário para atingir meta
   */
  calculateDailyTarget(goal: GoalWithProgress): number {
    const remaining = Number(goal.target_value) - Number(goal.current_value);
    return goal.days_remaining > 0 ? remaining / goal.days_remaining : 0;
  }

  // ==================== MÉTODOS AUXILIARES PRIVADOS ====================

  /**
   * Calcula valor de receita (soma de vendas pagas)
   */
  private async calculateRevenueValue(goal: Goal): Promise<number> {
    const result = await prisma.sale.aggregate({
      where: {
        user_id: goal.user_id,
        created_at: {
          gte: goal.period_start,
          lte: goal.period_end,
        },
        status: {
          in: ['PAID', 'DELIVERED'],
        },
      },
      _sum: {
        total_price: true,
      },
    });

    return Number(result._sum.total_price || 0);
  }

  /**
   * Calcula valor de lucro (receita - despesas com ads)
   */
  private async calculateProfitValue(goal: Goal): Promise<number> {
    const revenue = await this.calculateRevenueValue(goal);
    const expenses = await this.calculateExpenseValue(goal);
    return Math.max(0, revenue - expenses);
  }

  /**
   * Calcula quantidade de vendas
   */
  private async calculateSalesCountValue(goal: Goal): Promise<number> {
    const count = await prisma.sale.count({
      where: {
        user_id: goal.user_id,
        created_at: {
          gte: goal.period_start,
          lte: goal.period_end,
        },
        status: {
          in: ['PAID', 'DELIVERED'],
        },
      },
    });

    return count;
  }

  /**
   * Calcula valor de despesas (gastos com ads)
   */
  private async calculateExpenseValue(goal: Goal): Promise<number> {
    const result = await prisma.ad.aggregate({
      where: {
        user_id: goal.user_id,
        date: {
          gte: goal.period_start,
          lte: goal.period_end,
        },
      },
      _sum: {
        spend: true,
      },
    });

    return Number(result._sum.spend || 0);
  }
}

// Export singleton instance
export const goalService = new GoalService();
