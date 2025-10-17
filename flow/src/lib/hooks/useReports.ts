// src/lib/hooks/useReports.ts
// Hook para buscar dados de relatórios do backend

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface ReportData {
	id: string;
	title: string;
	description: string;
	category: string;
	period: string;
	metrics: {
		revenue: number;
		sales: number;
		conversion: number;
		avgTicket: number;
	};
	chartData: Array<{
		date: string;
		revenue: number;
		sales: number;
		conversion: number;
	}>;
	generatedAt: string;
}

export interface ReportsFilters {
	period: string;
	category?: string;
	startDate?: string;
	endDate?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const API_PREFIX = '/api/v1/reports';

export const useReports = () => {
	const [reports, setReports] = useState<ReportData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Buscar relatórios
	const fetchReports = useCallback(async (filters: ReportsFilters = { period: '30d' }) => {
		try {
			setIsLoading(true);
			setError(null);

			const params = new URLSearchParams();
			params.append('period', filters.period);
			if (filters.category) params.append('category', filters.category);
			if (filters.startDate) params.append('startDate', filters.startDate);
			if (filters.endDate) params.append('endDate', filters.endDate);

			const response = await fetch(`${API_BASE_URL}${API_PREFIX}?${params}`);
			if (!response.ok) {
				throw new Error('Falha ao buscar relatórios');
			}

			const data = await response.json();
			setReports(data.reports || []);
			return data.reports || [];
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
			setError(errorMessage);
			toast.error(`Erro ao buscar relatórios: ${errorMessage}`);
			return [];
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Buscar relatório específico
	const fetchReport = useCallback(async (reportId: string) => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${reportId}`);
			if (!response.ok) {
				throw new Error('Falha ao buscar relatório');
			}

			const data = await response.json();
			return data.report;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
			setError(errorMessage);
			toast.error(`Erro ao buscar relatório: ${errorMessage}`);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Exportar relatório
	const exportReport = useCallback(async (reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
		try {
			setIsLoading(true);

			const response = await fetch(`${API_BASE_URL}${API_PREFIX}/${reportId}/export?format=${format}`);
			if (!response.ok) {
				throw new Error('Falha ao exportar relatório');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `relatorio-${reportId}.${format}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast.success('Relatório exportado com sucesso!');
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
			toast.error(`Erro ao exportar relatório: ${errorMessage}`);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return {
		reports,
		isLoading,
		error,
		fetchReports,
		fetchReport,
		exportReport,
	};
};