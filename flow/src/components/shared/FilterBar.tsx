// src/components/shared/FilterBar.tsx
// Componente reutilizável para filtros e controles

import { motion } from "framer-motion";
import { Calendar, Download, Filter, Search, X } from "lucide-react";
import { useState } from "react";

interface FilterOption {
	id: string;
	name: string;
}

interface FilterBarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	selectedPeriod: string;
	onPeriodChange: (period: string) => void;
	selectedCategory?: string;
	onCategoryChange?: (category: string) => void;
	categories?: FilterOption[];
	periods: FilterOption[];
	onExport?: () => void;
	exportFormats?: string[];
	showExport?: boolean;
}

export const FilterBar = ({
	searchQuery,
	onSearchChange,
	selectedPeriod,
	onPeriodChange,
	selectedCategory,
	onCategoryChange,
	categories = [],
	periods,
	onExport,
	exportFormats = ["PDF", "Excel", "CSV"],
	showExport = true,
}: FilterBarProps) => {
	const [showFilters, setShowFilters] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm"
		>
			<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
				{/* Search */}
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<input
						type="text"
						placeholder="Buscar..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>

				{/* Filters */}
				<div className="flex flex-wrap gap-3 items-center">
					{/* Period Filter */}
					<div className="relative">
						<select
							value={selectedPeriod}
							onChange={(e) => onPeriodChange(e.target.value)}
							className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							{periods.map((period) => (
								<option key={period.id} value={period.id}>
									{period.name}
								</option>
							))}
						</select>
						<Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
					</div>

					{/* Category Filter */}
					{onCategoryChange && categories.length > 0 && (
						<div className="relative">
							<select
								value={selectedCategory}
								onChange={(e) => onCategoryChange(e.target.value)}
								className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
							<Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
						</div>
					)}

					{/* Export Button */}
					{showExport && onExport && (
						<div className="relative">
							<button
								onClick={onExport}
								className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
							>
								<Download className="h-4 w-4" />
								<span>Exportar</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
};