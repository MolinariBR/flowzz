// src/components/shared/MetricCard.tsx
// Componente reutilizável para exibir métricas com tendência

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
	title: string;
	value: string | number;
	change?: string;
	trend?: "up" | "down" | "neutral";
	icon: LucideIcon;
	color?: string;
	loading?: boolean;
}

export const MetricCard = ({
	title,
	value,
	change,
	trend = "neutral",
	icon: Icon,
	color = "blue",
	loading = false,
}: MetricCardProps) => {
	const colorClasses = {
		blue: "bg-blue-50 text-blue-600 border-blue-200",
		green: "bg-green-50 text-green-600 border-green-200",
		red: "bg-red-50 text-red-600 border-red-200",
		yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
		purple: "bg-purple-50 text-purple-600 border-purple-200",
		indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
	};

	const trendIcons = {
		up: "↗️",
		down: "↘️",
		neutral: "→",
	};

	if (loading) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
			>
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
					<div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
					<div className="h-3 bg-gray-200 rounded w-1/4"></div>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -2 }}
			className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
						<Icon className="h-5 w-5" />
					</div>
					<div>
						<p className="text-sm font-medium text-gray-600">{title}</p>
						<p className="text-2xl font-bold text-gray-900">{value}</p>
					</div>
				</div>
				{change && (
					<div className="text-right">
						<p className={`text-sm font-medium ${
							trend === "up" ? "text-green-600" :
							trend === "down" ? "text-red-600" : "text-gray-600"
						}`}>
							{trendIcons[trend]} {change}
						</p>
					</div>
				)}
			</div>
		</motion.div>
	);
};