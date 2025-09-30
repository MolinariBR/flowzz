"use client";

import { motion } from "framer-motion";
import {
	AlertTriangle,
	Award,
	Briefcase,
	CheckCircle,
	Clock,
	CreditCard,
	DollarSign,
	Download,
	Eye,
	EyeOff,
	PiggyBank,
	Settings,
	Shield,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";
import { useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface CircularProgressProps {
	percentage: number;
	size?: number;
	strokeWidth?: number;
	color?: string;
}

const CircularProgress = ({
	percentage,
	size = 120,
	strokeWidth = 8,
	color = "text-indigo-600",
}: CircularProgressProps) => {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

	return (
		<div className="relative" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="transform -rotate-90">
				<title>Indicador de progresso circular</title>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-slate-200"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={strokeDasharray}
					className={color}
					style={{ transition: "stroke-dasharray 0.5s ease-in-out" }}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-2xl font-bold text-slate-900">{percentage}%</span>
			</div>
		</div>
	);
};

export default function Projecoes() {
	const [selectedScenario, setSelectedScenario] = useState("realista");
	const [showCardDetails, setShowCardDetails] = useState(true);
	const [timeFrame, setTimeFrame] = useState("3m");

	const cashFlowData = [
		{
			month: "Nov",
			pessimista: 2800,
			realista: 4200,
			otimista: 6500,
			gastos: 2100,
		},
		{
			month: "Dez",
			pessimista: 3200,
			realista: 4800,
			otimista: 7200,
			gastos: 2300,
		},
		{
			month: "Jan",
			pessimista: 3600,
			realista: 5400,
			otimista: 8100,
			gastos: 2500,
		},
		{
			month: "Fev",
			pessimista: 4000,
			realista: 6000,
			otimista: 9000,
			gastos: 2700,
		},
		{
			month: "Mar",
			pessimista: 4400,
			realista: 6600,
			otimista: 9900,
			gastos: 2900,
		},
		{
			month: "Abr",
			pessimista: 4800,
			realista: 7200,
			otimista: 10800,
			gastos: 3100,
		},
	];

	const creditCards = [
		{
			id: 1,
			name: "Nubank Roxinho",
			limit: 15000,
			used: 10500,
			available: 4500,
			dueDate: "2023-11-15",
			daysUntilDue: 12,
			minimumPayment: 315,
			color: "from-purple-500 to-purple-700",
		},
		{
			id: 2,
			name: "Inter Gold",
			limit: 8000,
			used: 2400,
			available: 5600,
			dueDate: "2023-11-20",
			daysUntilDue: 17,
			minimumPayment: 72,
			color: "from-orange-500 to-orange-700",
		},
	];

	const goals = [
		{
			id: 1,
			title: "Meta Mensal Vendas",
			target: 15000,
			current: 12450,
			percentage: 83,
			color: "text-green-600",
			bgColor: "bg-green-500",
			icon: TrendingUp,
			deadline: "30/11/2023",
		},
		{
			id: 2,
			title: "Reduzir Gastos Anúncios",
			target: 2000,
			current: 2340,
			percentage: 85,
			color: "text-amber-600",
			bgColor: "bg-amber-500",
			icon: Target,
			deadline: "30/11/2023",
		},
		{
			id: 3,
			title: "Reserva Emergência",
			target: 50000,
			current: 18500,
			percentage: 37,
			color: "text-blue-600",
			bgColor: "bg-blue-500",
			icon: DollarSign,
			deadline: "31/12/2023",
		},
	];

	const achievements = [
		{ id: 1, title: "Primeira Meta Atingida", icon: "🎯", unlocked: true },
		{ id: 2, title: "ROI Acima de 300%", icon: "🚀", unlocked: true },
		{ id: 3, title: "Mês sem Prejuízo", icon: "💚", unlocked: true },
		{ id: 4, title: "R$ 10k em Vendas", icon: "💰", unlocked: false },
		{ id: 5, title: "Cartão Zerado", icon: "💳", unlocked: false },
		{ id: 6, title: "Meta Anual", icon: "🏆", unlocked: false },
	];

	const getCardUsageColor = (percentage: number) => {
		if (percentage >= 80) return "bg-red-500";
		if (percentage >= 60) return "bg-amber-500";
		return "bg-green-500";
	};

	const getGoalStatus = (percentage: number) => {
		if (percentage >= 100)
			return { color: "text-green-600", icon: CheckCircle };
		if (percentage >= 75) return { color: "text-amber-600", icon: Clock };
		return { color: "text-red-600", icon: AlertTriangle };
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">
						Financial Crystal Ball
					</h1>
					<p className="text-slate-600 mt-1">
						Visualize seu futuro financeiro com clareza
					</p>
				</div>
				<div className="flex items-center space-x-3 mt-4 lg:mt-0">
					<select
						value={timeFrame}
						onChange={(e) => setTimeFrame(e.target.value)}
						className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					>
						<option value="3m">Próximos 3 meses</option>
						<option value="6m">Próximos 6 meses</option>
						<option value="12m">Próximo ano</option>
					</select>
					<button
						type="button"
						className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
					>
						<Download className="h-4 w-4" />
						<span>Exportar</span>
					</button>
					<button
						type="button"
						className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
					>
						<Settings className="h-4 w-4" />
						<span>Configurar Metas</span>
					</button>
				</div>
			</div>

			{/* Credit Cards Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{creditCards.map((card) => {
					const usagePercentage = (card.used / card.limit) * 100;
					return (
						<motion.div
							key={card.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="relative overflow-hidden"
						>
							<div
								className={`bg-gradient-to-r ${card.color} rounded-xl p-6 text-white shadow-lg`}
							>
								<div className="flex items-center justify-between mb-4">
									<div>
										<h3 className="text-lg font-semibold">{card.name}</h3>
										<p className="text-sm opacity-90">Cartão de Crédito</p>
									</div>
									<div className="flex items-center space-x-2">
										<CreditCard className="h-6 w-6" />
										<button
											type="button"
											onClick={() => setShowCardDetails(!showCardDetails)}
											className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
										>
											{showCardDetails ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								{showCardDetails && (
									<div className="space-y-3">
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span>Usado</span>
												<span>R$ {card.used.toLocaleString()}</span>
											</div>
											<div className="w-full bg-white bg-opacity-20 rounded-full h-2">
												<div
													className={`h-2 rounded-full transition-all duration-300 ${getCardUsageColor(usagePercentage)}`}
													style={{ width: `${usagePercentage}%` }}
												/>
											</div>
											<div className="flex justify-between text-sm mt-1">
												<span>
													Disponível: R$ {card.available.toLocaleString()}
												</span>
												<span>{usagePercentage.toFixed(0)}% usado</span>
											</div>
										</div>

										<div className="flex items-center justify-between pt-2 border-t border-white border-opacity-20">
											<div>
												<p className="text-sm opacity-90">Vencimento</p>
												<p className="font-semibold">{card.dueDate}</p>
											</div>
											<div className="text-right">
												<p className="text-sm opacity-90">Faltam</p>
												<p className="font-semibold">
													{card.daysUntilDue} dias
												</p>
											</div>
										</div>

										<div className="bg-white bg-opacity-10 rounded-lg p-3">
											<div className="flex items-center justify-between">
												<span className="text-sm">Pagamento mínimo:</span>
												<span className="font-semibold">
													R$ {card.minimumPayment}
												</span>
											</div>
										</div>
									</div>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Goals Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-xl p-6 shadow-card"
			>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-lg font-semibold text-slate-900">
							Metas e Objetivos
						</h3>
						<p className="text-sm text-slate-600">
							Acompanhe seu progresso em tempo real
						</p>
					</div>
					<button
						type="button"
						className="flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
					>
						<Target className="h-4 w-4" />
						<span>Nova Meta</span>
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{goals.map((goal) => {
						const status = getGoalStatus(goal.percentage);
						const StatusIcon = status.icon;
						return (
							<div key={goal.id} className="text-center">
								<div className="flex justify-center mb-4">
									<CircularProgress
										percentage={goal.percentage}
										color={goal.color}
									/>
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-center space-x-2">
										<goal.icon className={`h-5 w-5 ${goal.color}`} />
										<h4 className="font-semibold text-slate-900">
											{goal.title}
										</h4>
									</div>
									<div className="space-y-1">
										<p className="text-sm text-slate-600">
											R$ {goal.current.toLocaleString()} / R${" "}
											{goal.target.toLocaleString()}
										</p>
										<div className="flex items-center justify-center space-x-1">
											<StatusIcon className={`h-4 w-4 ${status.color}`} />
											<span className="text-sm text-slate-600">
												até {goal.deadline}
											</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</motion.div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Cash Flow Forecast */}
				<div className="lg:col-span-2">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white rounded-xl p-6 shadow-card"
					>
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold text-slate-900">
									Projeção de Cash Flow
								</h3>
								<p className="text-sm text-slate-600">
									Análise de cenários para os próximos meses
								</p>
							</div>
							<div className="flex space-x-2">
								{["pessimista", "realista", "otimista"].map((scenario) => (
									<button
										key={scenario}
										type="button"
										onClick={() => setSelectedScenario(scenario)}
										className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
											selectedScenario === scenario
												? "bg-indigo-600 text-white"
												: "bg-slate-100 text-slate-700 hover:bg-slate-200"
										}`}
									>
										{scenario.charAt(0).toUpperCase() + scenario.slice(1)}
									</button>
								))}
							</div>
						</div>

						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={cashFlowData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
									<XAxis dataKey="month" stroke="#64748b" fontSize={12} />
									<YAxis stroke="#64748b" fontSize={12} />
									<Tooltip
										contentStyle={{
											backgroundColor: "#fff",
											border: "1px solid #e2e8f0",
											borderRadius: "8px",
											boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
										}}
									/>
									<Area
										type="monotone"
										dataKey="gastos"
										stackId="1"
										stroke="#ef4444"
										fill="#ef4444"
										fillOpacity={0.6}
									/>
									<Area
										type="monotone"
										dataKey={selectedScenario}
										stackId="2"
										stroke={
											selectedScenario === "pessimista"
												? "#f59e0b"
												: selectedScenario === "realista"
													? "#10b981"
													: "#3b82f6"
										}
										fill={
											selectedScenario === "pessimista"
												? "#f59e0b"
												: selectedScenario === "realista"
													? "#10b981"
													: "#3b82f6"
										}
										fillOpacity={0.6}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>

						<div className="flex items-center justify-center space-x-6 mt-4">
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-red-500 rounded-full"></div>
								<span className="text-sm text-slate-600">Gastos</span>
							</div>
							<div className="flex items-center space-x-2">
								<div
									className={`w-3 h-3 rounded-full ${
										selectedScenario === "pessimista"
											? "bg-amber-500"
											: selectedScenario === "realista"
												? "bg-green-500"
												: "bg-blue-500"
									}`}
								></div>
								<span className="text-sm text-slate-600">
									Receita ({selectedScenario})
								</span>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Achievements & Gamification */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-xl p-6 shadow-card"
				>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold text-slate-900">
								Conquistas
							</h3>
							<p className="text-sm text-slate-600">Seus marcos financeiros</p>
						</div>
						<Award className="h-6 w-6 text-amber-500" />
					</div>

					<div className="space-y-4">
						{achievements.map((achievement) => (
							<div
								key={achievement.id}
								className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
									achievement.unlocked
										? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
										: "bg-slate-50 border border-slate-200"
								}`}
							>
								<div
									className={`text-2xl ${achievement.unlocked ? "" : "grayscale opacity-50"}`}
								>
									{achievement.icon}
								</div>
								<div className="flex-1">
									<p
										className={`font-medium ${
											achievement.unlocked ? "text-amber-800" : "text-slate-600"
										}`}
									>
										{achievement.title}
									</p>
									{achievement.unlocked && (
										<p className="text-xs text-amber-600">Conquistado!</p>
									)}
								</div>
								{achievement.unlocked && (
									<CheckCircle className="h-5 w-5 text-amber-600" />
								)}
							</div>
						))}
					</div>

					<div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
						<div className="flex items-center space-x-2 mb-2">
							<Zap className="h-5 w-5 text-indigo-600" />
							<span className="font-medium text-indigo-900">Próxima Meta</span>
						</div>
						<p className="text-sm text-indigo-800">
							Faltam apenas R$ 2.550 para desbloquear "R$ 15k em Vendas"!
						</p>
						<div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
							<div
								className="bg-indigo-600 h-2 rounded-full"
								style={{ width: "83%" }}
							></div>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Financial Health Score */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-xl p-6 shadow-card"
			>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-lg font-semibold text-slate-900">
							Score de Saúde Financeira
						</h3>
						<p className="text-sm text-slate-600">
							Análise completa da sua situação financeira
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="text-center">
						<div className="flex justify-center mb-4">
							<CircularProgress
								percentage={78}
								size={100}
								color="text-green-600"
							/>
						</div>
						<h4 className="font-semibold text-slate-900">Score Geral</h4>
						<p className="text-sm text-slate-600">Muito Bom</p>
					</div>

					<div className="space-y-4">
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span>Fluxo de Caixa</span>
								<span className="text-green-600 font-medium">85%</span>
							</div>
							<div className="w-full bg-slate-200 rounded-full h-2">
								<div
									className="bg-green-500 h-2 rounded-full"
									style={{ width: "85%" }}
								></div>
							</div>
						</div>
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span>Controle de Gastos</span>
								<span className="text-amber-600 font-medium">72%</span>
							</div>
							<div className="w-full bg-slate-200 rounded-full h-2">
								<div
									className="bg-amber-500 h-2 rounded-full"
									style={{ width: "72%" }}
								></div>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span>ROI Anúncios</span>
								<span className="text-green-600 font-medium">92%</span>
							</div>
							<div className="w-full bg-slate-200 rounded-full h-2">
								<div
									className="bg-green-500 h-2 rounded-full"
									style={{ width: "92%" }}
								></div>
							</div>
						</div>
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span>Reserva Emergência</span>
								<span className="text-red-600 font-medium">37%</span>
							</div>
							<div className="w-full bg-slate-200 rounded-full h-2">
								<div
									className="bg-red-500 h-2 rounded-full"
									style={{ width: "37%" }}
								></div>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center space-x-2 text-green-600">
							<Shield className="h-4 w-4" />
							<span className="text-sm font-medium">Baixo Risco</span>
						</div>
						<div className="flex items-center space-x-2 text-blue-600">
							<Briefcase className="h-4 w-4" />
							<span className="text-sm font-medium">Diversificado</span>
						</div>
						<div className="flex items-center space-x-2 text-amber-600">
							<PiggyBank className="h-4 w-4" />
							<span className="text-sm font-medium">Precisa Poupar</span>
						</div>
					</div>
				</div>

				<div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
					<h4 className="font-semibold text-blue-900 mb-2">
						Recomendações Personalizadas
					</h4>
					<ul className="space-y-1 text-sm text-blue-800">
						<li>• Aumente sua reserva de emergência para 6 meses de gastos</li>
						<li>• Mantenha o ROI dos anúncios acima de 250%</li>
						<li>• Considere diversificar suas fontes de renda</li>
					</ul>
				</div>
			</motion.div>
		</div>
	);
}
