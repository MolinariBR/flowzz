// src/lib/types/shared.ts
// Tipos compartilhados para todo o frontend

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
	startDate: string;
	endDate: string;
}

export interface MetricData {
	label: string;
	value: number | string;
	change?: number;
	changeType?: 'increase' | 'decrease' | 'neutral';
	formattedValue?: string;
}

export interface ChartDataPoint {
	date: string;
	[key: string]: string | number;
}

export interface FilterOption {
	id: string;
	name: string;
	icon?: string;
	color?: string;
}

export interface ExportOptions {
	format: 'pdf' | 'excel' | 'csv';
	filename?: string;
	includeCharts?: boolean;
	dateRange?: DateRange;
}

// Tipos para componentes reutilizáveis
export interface MetricCardData {
	title: string;
	value: string | number;
	change?: string;
	trend?: 'up' | 'down' | 'neutral';
	iconName: string;
	color?: string;
}

export interface FilterBarData {
	searchQuery: string;
	selectedPeriod: string;
	selectedCategory?: string;
	categories?: FilterOption[];
	periods: FilterOption[];
}

export interface ChartConfig {
	title: string;
	type: 'line' | 'area' | 'bar' | 'pie';
	dataKeys: {
		x: string;
		y: string | string[];
	};
	colors?: string[];
	height?: number;
}