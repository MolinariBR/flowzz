// src/lib/hooks/useProjections.ts
// Hook para buscar dados de projeções do backend

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface ProjectionData {
	id: string;
	title: string;
	type: 'revenue' | 'expenses' | 'goals' | 'cashflow';
	period: string;
	currentValue: number;
	projectedValue: number;
	growthRate: number;
	confidence: number;
	scenarios: {
		pessimistic: number;
		realistic: number;
		optimistic: number;
	};
	chartData: Array<{
		date: string;
		actual: number;
		projected: number;
		pessimistic: number;
		optimistic: number;
	}>;
	alerts: Array<{
		type: 'warning' | 'danger' | 'success';
		message: string;
		threshold: number;
	}>;
}

export interface GoalData {
	id: string;
	title: string;
	targetValue: number;
	currentValue: number;
	deadline: string;
	category: string;
	progress: number;
	status: 'on_track' | 'at_risk' | 'behind' | 'completed';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1/projections';

export const useProjections = () => {
	const [projections, setProjections] = useState<ProjectionData[]>([]);
	const [goals, setGoals] = useState<GoalData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Buscar projeções
	const fetchProjections = useCallback(async (period: string = '12m') => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(`${API_BASE_URL}${API_PREFIX}?period=${period}`);
			if (!response.ok) {
				throw new Error('Falha ao buscar projeções');
			}

			const data = await response.json();
			setProjections(data.projections || []);
			return data.projections || [];
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
			setError(errorMessage);
			toast.error(`Erro ao buscar projeções: ${errorMessage}`);
			return [];
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Buscar metas
	const fetchGoals = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals`);
			if (!response.ok) {
				throw new Error('Falha ao buscar metas');
			}

			const data = await response.json();
			setGoals(data.goals || []);
			return data.goals || [];
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
			setError(errorMessage);
			toast.error(`Erro ao buscar metas: ${errorMessage}`);
			return [];
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Criar meta
	const createGoal = useCallback(async (goalData: Omit<GoalData, 'id' | 'progress' | 'status'>) => {
		try {
			setIsLoading(true);

			const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(goalData),
			});

			if (!response.ok) {
				throw new Error('Falha ao criar meta');
			}

			const data = await response.json();
			toast.success('Meta criada com sucesso!');
			await fetchGoals(); // Recarregar metas
			return data.goal;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
			toast.error(`Erro ao criar meta: ${errorMessage}`);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, [fetchGoals]);

	// Atualizar meta
	const updateGoal = useCallback(async (goalId: string, updates: Partial<GoalData>) => {
		try {
			setIsLoading(true);

			const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals/${goalId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error('Falha ao atualizar meta');
			}

			const data = await response.json();
			toast.success('Meta atualizada com sucesso!');
			await fetchGoals(); // Recarregar metas
			return data.goal;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
			toast.error(`Erro ao atualizar meta: ${errorMessage}`);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, [fetchGoals]);

	// Deletar meta
	const deleteGoal = useCallback(async (goalId: string) => {
		try {
			setIsLoading(true);

			const response = await fetch(`${API_BASE_URL}${API_PREFIX}/goals/${goalId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Falha ao deletar meta');
			}

			toast.success('Meta deletada com sucesso!');
			await fetchGoals(); // Recarregar metas
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
			toast.error(`Erro ao deletar meta: ${errorMessage}`);
		} finally {
			setIsLoading(false);
		}
	}, [fetchGoals]);

	return {
		projections,
		goals,
		isLoading,
		error,
		fetchProjections,
		fetchGoals,
		createGoal,
		updateGoal,
		deleteGoal,
	};
};