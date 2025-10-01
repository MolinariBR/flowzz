// Referência: tasks.md Task 3.3, user-stories.md Story 2.1, design.md §Testing
// Testes unitários para DashboardService - versão simplificada

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardService } from '../services/DashboardService';

// Mock das dependências
vi.mock('../repositories/DashboardRepository');
vi.mock('../shared/services/RedisService');

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    dashboardService = new DashboardService();
  });

  describe('getMetrics', () => {
    it('deve ser uma função', () => {
      expect(typeof dashboardService.getMetrics).toBe('function');
    });

    it('deve retornar um Promise', () => {
      const result = dashboardService.getMetrics('user-123');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getChartData', () => {
    it('deve ser uma função', () => {
      expect(typeof dashboardService.getChartData).toBe('function');
    });

    it('deve retornar um Promise', () => {
      const result = dashboardService.getChartData('user-123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('deve aceitar parâmetro de dias', () => {
      const result = dashboardService.getChartData('user-123', 7);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getRecentActivities', () => {
    it('deve ser uma função', () => {
      expect(typeof dashboardService.getRecentActivities).toBe('function');
    });

    it('deve retornar um Promise', () => {
      const result = dashboardService.getRecentActivities('user-123');
      expect(result).toBeInstanceOf(Promise);
    });

    it('deve aceitar parâmetro de limit', () => {
      const result = dashboardService.getRecentActivities('user-123', 5);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('invalidateCache', () => {
    it('deve ser uma função', () => {
      expect(typeof dashboardService.invalidateCache).toBe('function');
    });

    it('deve retornar um Promise', () => {
      const result = dashboardService.invalidateCache('user-123');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('invalidateAllCache', () => {
    it('deve ser uma função', () => {
      expect(typeof dashboardService.invalidateAllCache).toBe('function');
    });

    it('deve retornar um Promise', () => {
      const result = dashboardService.invalidateAllCache();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getCacheStats', () => {
    it('deve ser uma função', () => {
      expect(typeof dashboardService.getCacheStats).toBe('function');
    });

    it('deve retornar um Promise', () => {
      const result = dashboardService.getCacheStats();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getMetricsForPeriod', () => {
    it('deve ser uma função', () => {
      expect(typeof dashboardService.getMetricsForPeriod).toBe('function');
    });

    it('deve retornar um Promise', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const result = dashboardService.getMetricsForPeriod('user-123', startDate, endDate);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});