"use client";

import { motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	Calendar,
	Clock,
	DollarSign,
	Download,
	Eye,
	FileText,
	PieChart,
	RefreshCw,
	Search,
	Settings,
	Share2,
	Star,
	Target,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { useState } from "react";

export default function Relatorios() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("todos");
	const [selectedPeriod, setSelectedPeriod] = useState("30d");

	const categories = [
		{ id: "todos", name: "Todos", icon: FileText },
		{ id: "vendas", name: "Vendas", icon: TrendingUp },
		{ id: "financeiro", name: "Financeiro", icon: DollarSign },
		{ id: "marketing", name: "Marketing", icon: Target },
		{ id: "clientes", name: "Clientes", icon: Users },
		{ id: "performance", name: "Performance", icon: Activity },
	];

	const periods = [
		{ id: "7d", name: "Últimos 7 dias" },
		{ id: "30d", name: "Últimos 30 dias" },
		{ id: "90d", name: "Últimos 3 meses" },
		{ id: "1y", name: "Último ano" },
		{ id: "custom", name: "Período personalizado" },
	];

	const reports = [
		{
			id: 1,
			title: "Relatório de Vendas Mensal",
			description:
				"Análise completa das vendas do mês com comparativo do período anterior",
			category: "vendas",
			icon: TrendingUp,
			color: "green",
			lastGenerated: "2 horas atrás",
			size: "2.4 MB",
			format: "PDF",
			favorite: true,
			metrics: [
				"Receita Total",
				"Número de Vendas",
				"Ticket Médio",
				"Taxa de Conversão",
			],
		},
		{
			id: 2,
			title: "Demonstrativo Financeiro",
			description:
				"Balanço financeiro com receitas, despesas e margem de lucro",
			category: "financeiro",
			icon: DollarSign,
			color: "blue",
			lastGenerated: "1 dia atrás",
			size: "1.8 MB",
			format: "PDF",
			favorite: false,
			metrics: [
				"Receita Bruta",
				"Despesas",
				"Lucro Líquido",
				"Margem de Lucro",
			],
		},
		{
			id: 3,
			title: "Performance de Campanhas",
			description: "Análise detalhada do desempenho das campanhas de marketing",
			category: "marketing",
			icon: Target,
			color: "purple",
			lastGenerated: "3 horas atrás",
			size: "3.1 MB",
			format: "PDF",
			favorite: true,
			metrics: ["ROAS", "CPA", "CTR", "Impressões"],
		},
		{
			id: 4,
			title: "Análise de Clientes",
			description: "Segmentação e comportamento dos clientes por período",
			category: "clientes",
			icon: Users,
			color: "indigo",
			lastGenerated: "5 horas atrás",
			size: "1.5 MB",
			format: "Excel",
			favorite: false,
			metrics: ["Novos Clientes", "Clientes Recorrentes", "LTV", "Churn Rate"],
		},
		{
			id: 5,
			title: "Dashboard Executivo",
			description: "Visão geral dos principais KPIs para tomada de decisão",
			category: "performance",
			icon: BarChart3,
			color: "orange",
			lastGenerated: "30 min atrás",
			size: "4.2 MB",
			format: "PDF",
			favorite: true,
			metrics: ["ROI", "Growth Rate", "Market Share", "Eficiência Operacional"],
		},
		{
			id: 6,
			title: "Relatório de Impostos",
			description: "Cálculos tributários e obrigações fiscais do período",
			category: "financeiro",
			icon: FileText,
			color: "red",
			lastGenerated: "1 semana atrás",
			size: "2.7 MB",
			format: "PDF",
			favorite: false,
			metrics: ["ISS", "IRPF", "CSLL", "Base de Cálculo"],
		},
		{
			id: 7,
			title: "Análise de Funil de Vendas",
			description: "Acompanhamento do funil desde leads até conversão",
			category: "vendas",
			icon: Activity,
			color: "teal",
			lastGenerated: "4 horas atrás",
			size: "1.9 MB",
			format: "Excel",
			favorite: true,
			metrics: [
				"Leads Gerados",
				"Taxa de Qualificação",
				"Taxa de Fechamento",
				"Tempo de Ciclo",
			],
		},
		{
			id: 8,
			title: "ROI por Canal de Marketing",
			description: "Retorno sobre investimento detalhado por canal",
			category: "marketing",
			icon: PieChart,
			color: "pink",
			lastGenerated: "6 horas atrás",
			size: "2.2 MB",
			format: "PDF",
			favorite: false,
			metrics: ["Facebook Ads", "Google Ads", "Email Marketing", "Orgânico"],
		},
	];

	const getColorClasses = (color: string) => {
		const colors = {
			green: "bg-green-50 text-green-600 border-green-200",
			blue: "bg-blue-50 text-blue-600 border-blue-200",
			purple: "bg-purple-50 text-purple-600 border-purple-200",
			indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
			orange: "bg-orange-50 text-orange-600 border-orange-200",
			red: "bg-red-50 text-red-600 border-red-200",
			teal: "bg-teal-50 text-teal-600 border-teal-200",
			pink: "bg-pink-50 text-pink-600 border-pink-200",
		};
		return colors[color as keyof typeof colors] || colors.blue;
	};

	const filteredReports = reports.filter((report) => {
		const matchesSearch =
			report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			report.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			selectedCategory === "todos" || report.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
					<p className="text-slate-600 mt-1">
						Acesse e gere relatórios detalhados do seu negócio
					</p>
				</div>
				<div className="flex items-center space-x-3">
					<button
						type="button"
						className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
					>
						<RefreshCw className="h-4 w-4" />
						<span>Atualizar Todos</span>
					</button>
					<button
						type="button"
						className="flex items-center space-x-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
					>
						<Settings className="h-4 w-4" />
						<span>Configurar</span>
					</button>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
				<div className="flex flex-col lg:flex-row lg:items-center gap-4">
					{/* Search */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
						<input
							type="text"
							placeholder="Buscar relatórios..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
						/>
					</div>

					{/* Category Filter */}
					<div className="flex flex-wrap gap-2">
						{categories.map((category) => (
							<button
								key={category.id}
								type="button"
								onClick={() => setSelectedCategory(category.id)}
								className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									selectedCategory === category.id
										? "bg-indigo-100 text-indigo-700 border border-indigo-200"
										: "bg-slate-100 text-slate-600 hover:bg-slate-200"
								}`}
							>
								<category.icon className="h-4 w-4" />
								<span>{category.name}</span>
							</button>
						))}
					</div>

					{/* Period Filter */}
					<select
						value={selectedPeriod}
						onChange={(e) => setSelectedPeriod(e.target.value)}
						className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					>
						{periods.map((period) => (
							<option key={period.id} value={period.id}>
								{period.name}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Reports Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{filteredReports.map((report) => {
					const IconComponent = report.icon;
					const colorClasses = getColorClasses(report.color);

					return (
						<motion.div
							key={report.id}
							className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
							whileHover={{ y: -2 }}
						>
							<div className="flex items-start justify-between mb-4">
								<div className={`p-3 rounded-lg ${colorClasses}`}>
									<IconComponent className="h-6 w-6" />
								</div>
								<div className="flex items-center space-x-2">
									{report.favorite && (
										<Star className="h-4 w-4 text-yellow-500 fill-current" />
									)}
									<button
										type="button"
										className="text-slate-400 hover:text-slate-600"
									>
										<Share2 className="h-4 w-4" />
									</button>
								</div>
							</div>

							<h3 className="font-semibold text-slate-900 mb-2">
								{report.title}
							</h3>
							<p className="text-slate-600 text-sm mb-4 line-clamp-2">
								{report.description}
							</p>

							{/* Metrics */}
							<div className="mb-4">
								<p className="text-xs font-medium text-slate-500 mb-2">
									MÉTRICAS INCLUÍDAS:
								</p>
								<div className="flex flex-wrap gap-1">
									{report.metrics.slice(0, 3).map((metric) => (
										<span
											key={metric}
											className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded"
										>
											{metric}
										</span>
									))}
									{report.metrics.length > 3 && (
										<span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
											+{report.metrics.length - 3}
										</span>
									)}
								</div>
							</div>

							{/* Meta Info */}
							<div className="flex items-center justify-between text-xs text-slate-500 mb-4">
								<div className="flex items-center space-x-4">
									<div className="flex items-center space-x-1">
										<Clock className="h-3 w-3" />
										<span>{report.lastGenerated}</span>
									</div>
									<div className="flex items-center space-x-1">
										<FileText className="h-3 w-3" />
										<span>
											{report.size} • {report.format}
										</span>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center space-x-2">
								<button
									type="button"
									className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
								>
									<Download className="h-4 w-4" />
									<span>Baixar</span>
								</button>
								<button
									type="button"
									className="flex items-center justify-center space-x-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
								>
									<Eye className="h-4 w-4" />
									<span>Visualizar</span>
								</button>
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Quick Actions */}
			<div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
					<div className="mb-4 lg:mb-0">
						<h2 className="text-xl font-semibold mb-2">
							Precisa de um relatório personalizado?
						</h2>
						<p className="text-indigo-100">
							Configure relatórios automáticos ou solicite análises específicas
							para seu negócio
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<button
							type="button"
							className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
						>
							<Zap className="h-4 w-4" />
							<span>Criar Relatório</span>
						</button>
						<button
							type="button"
							className="flex items-center space-x-2 border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
						>
							<Calendar className="h-4 w-4" />
							<span>Agendar Automático</span>
						</button>
					</div>
				</div>
			</div>

			{/* Empty State */}
			{filteredReports.length === 0 && (
				<div className="text-center py-12">
					<FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-slate-900 mb-2">
						Nenhum relatório encontrado
					</h3>
					<p className="text-slate-600 mb-4">
						Tente ajustar os filtros ou criar um novo relatório personalizado
					</p>
					<button
						type="button"
						className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
					>
						<Zap className="h-4 w-4" />
						<span>Criar Primeiro Relatório</span>
					</button>
				</div>
			)}
		</div>
	);
}
