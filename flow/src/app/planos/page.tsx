"use client";

import { motion } from "framer-motion";
import {
	Check,
	ChevronDown,
	ChevronUp,
	Crown,
	Star,
	X,
	Zap,
} from "lucide-react";
import { useState } from "react";

export default function Planos() {
	const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
		"monthly",
	);
	const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

	const plans = [
		{
			id: "starter",
			name: "Starter",
			description: "Perfeito para afiliados iniciantes",
			icon: Zap,
			color: "blue",
			price: {
				monthly: 97,
				yearly: 970,
			},
			features: [
				"Até 2 integrações",
				"Dashboard básico",
				"Relatórios mensais",
				"Suporte por email",
				"Até 1.000 transações/mês",
				"Histórico de 3 meses",
			],
			limitations: [
				"Sem relatórios personalizados",
				"Sem API access",
				"Sem suporte prioritário",
			],
			popular: false,
		},
		{
			id: "pro",
			name: "Pro",
			description: "Para afiliados em crescimento",
			icon: Crown,
			color: "indigo",
			price: {
				monthly: 197,
				yearly: 1970,
			},
			features: [
				"Até 10 integrações",
				"Dashboard avançado",
				"Relatórios ilimitados",
				"Suporte prioritário",
				"Até 10.000 transações/mês",
				"Histórico de 12 meses",
				"Relatórios personalizados",
				"Automações básicas",
				"Alertas em tempo real",
			],
			limitations: ["Sem API access", "Sem white label"],
			popular: true,
		},
		{
			id: "enterprise",
			name: "Enterprise",
			description: "Para grandes operações",
			icon: Star,
			color: "purple",
			price: {
				monthly: 497,
				yearly: 4970,
			},
			features: [
				"Integrações ilimitadas",
				"Dashboard personalizado",
				"Relatórios avançados",
				"Suporte 24/7",
				"Transações ilimitadas",
				"Histórico ilimitado",
				"API completa",
				"White label",
				"Automações avançadas",
				"Gerente de conta dedicado",
				"Treinamento personalizado",
			],
			limitations: [],
			popular: false,
		},
	];

	const faqData = [
		{
			id: 1,
			question: "Posso mudar de plano a qualquer momento?",
			answer:
				"Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor no próximo ciclo de cobrança.",
		},
		{
			id: 2,
			question: "Existe período de teste gratuito?",
			answer:
				"Oferecemos 14 dias de teste gratuito para todos os planos. Não é necessário cartão de crédito para começar.",
		},
		{
			id: 3,
			question: "O que acontece se eu exceder o limite de transações?",
			answer:
				"Você receberá uma notificação quando atingir 80% do limite. Se exceder, oferecemos upgrade automático ou cobrança por transação adicional.",
		},
		{
			id: 4,
			question: "Quais métodos de pagamento são aceitos?",
			answer:
				"Aceitamos cartão de crédito, PIX, boleto bancário e transferência bancária. Para planos anuais, oferecemos desconto adicional.",
		},
		{
			id: 5,
			question: "Posso cancelar minha assinatura?",
			answer:
				"Sim, você pode cancelar a qualquer momento. Não há taxas de cancelamento e você continuará tendo acesso até o final do período pago.",
		},
	];

	const getColorClasses = (color: string) => {
		const colors = {
			blue: "from-blue-500 to-blue-600",
			indigo: "from-indigo-500 to-purple-600",
			purple: "from-purple-500 to-pink-600",
		};
		return colors[color as keyof typeof colors];
	};

	const getCurrentPrice = (plan: (typeof plans)[0]) => {
		return billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;
	};

	const getYearlySavings = (plan: (typeof plans)[0]) => {
		const monthlyTotal = plan.price.monthly * 12;
		const yearlyPrice = plan.price.yearly;
		return monthlyTotal - yearlyPrice;
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center">
				<h1 className="text-4xl font-bold text-slate-900 mb-4">
					Escolha seu Plano
				</h1>
				<p className="text-xl text-slate-600 mb-8">
					Comece grátis e escale conforme seu negócio cresce
				</p>

				{/* Billing Toggle */}
				<div className="inline-flex items-center bg-slate-100 rounded-xl p-1">
					<button
						type="button"
						onClick={() => setBillingCycle("monthly")}
						className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
							billingCycle === "monthly"
								? "bg-white text-slate-900 shadow-sm"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						Mensal
					</button>
					<button
						type="button"
						onClick={() => setBillingCycle("yearly")}
						className={`px-6 py-2 rounded-lg text-sm font-medium transition-all relative ${
							billingCycle === "yearly"
								? "bg-white text-slate-900 shadow-sm"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						Anual
						<span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
							-20%
						</span>
					</button>
				</div>
			</div>

			{/* Plans Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{plans.map((plan) => {
					const IconComponent = plan.icon;
					const currentPrice = getCurrentPrice(plan);
					const yearlySavings = getYearlySavings(plan);

					return (
						<motion.div
							key={plan.id}
							className={`relative bg-white rounded-2xl border-2 p-8 ${
								plan.popular
									? "border-indigo-500 shadow-xl shadow-indigo-500/20"
									: "border-slate-200 hover:border-slate-300"
							} transition-all duration-200`}
							whileHover={{ y: -4 }}
						>
							{plan.popular && (
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
										Mais Popular
									</span>
								</div>
							)}

							<div className="text-center mb-8">
								<div
									className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${getColorClasses(plan.color)} mb-4`}
								>
									<IconComponent className="h-8 w-8 text-white" />
								</div>
								<h3 className="text-2xl font-bold text-slate-900 mb-2">
									{plan.name}
								</h3>
								<p className="text-slate-600">{plan.description}</p>
							</div>

							<div className="text-center mb-8">
								<div className="flex items-baseline justify-center mb-2">
									<span className="text-4xl font-bold text-slate-900">R$</span>
									<span className="text-5xl font-bold text-slate-900">
										{currentPrice}
									</span>
									<span className="text-slate-600 ml-2">
										/{billingCycle === "monthly" ? "mês" : "ano"}
									</span>
								</div>
								{billingCycle === "yearly" && yearlySavings > 0 && (
									<p className="text-green-600 text-sm font-medium">
										Economize R${yearlySavings} por ano
									</p>
								)}
							</div>

							<div className="space-y-4 mb-8">
								{plan.features.map((feature, index) => (
									<div
										key={`${plan.id}-feature-${index}`}
										className="flex items-center space-x-3"
									>
										<Check className="h-5 w-5 text-green-500 flex-shrink-0" />
										<span className="text-slate-700">{feature}</span>
									</div>
								))}
								{plan.limitations.map((limitation, index) => (
									<div
										key={`${plan.id}-limitation-${index}`}
										className="flex items-center space-x-3 opacity-50"
									>
										<X className="h-5 w-5 text-slate-400 flex-shrink-0" />
										<span className="text-slate-500">{limitation}</span>
									</div>
								))}
							</div>

							<button
								type="button"
								className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
									plan.popular
										? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg"
										: "bg-slate-900 text-white hover:bg-slate-800"
								}`}
							>
								{plan.id === "starter" ? "Começar Grátis" : "Escolher Plano"}
							</button>
						</motion.div>
					);
				})}
			</div>

			{/* Features Comparison */}
			<div className="bg-white rounded-xl p-8 border border-slate-200">
				<h2 className="text-2xl font-bold text-slate-900 mb-6">
					Comparação Detalhada
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-slate-200">
								<th className="text-left py-4 px-4 font-semibold text-slate-900">
									Funcionalidade
								</th>
								<th className="text-center py-4 px-4 font-semibold text-slate-900">
									Starter
								</th>
								<th className="text-center py-4 px-4 font-semibold text-slate-900">
									Pro
								</th>
								<th className="text-center py-4 px-4 font-semibold text-slate-900">
									Enterprise
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							<tr>
								<td className="py-4 px-4 text-slate-700">Integrações</td>
								<td className="py-4 px-4 text-center">2</td>
								<td className="py-4 px-4 text-center">10</td>
								<td className="py-4 px-4 text-center">Ilimitadas</td>
							</tr>
							<tr>
								<td className="py-4 px-4 text-slate-700">Transações/mês</td>
								<td className="py-4 px-4 text-center">1.000</td>
								<td className="py-4 px-4 text-center">10.000</td>
								<td className="py-4 px-4 text-center">Ilimitadas</td>
							</tr>
							<tr>
								<td className="py-4 px-4 text-slate-700">Histórico</td>
								<td className="py-4 px-4 text-center">3 meses</td>
								<td className="py-4 px-4 text-center">12 meses</td>
								<td className="py-4 px-4 text-center">Ilimitado</td>
							</tr>
							<tr>
								<td className="py-4 px-4 text-slate-700">API Access</td>
								<td className="py-4 px-4 text-center">
									<X className="h-5 w-5 text-red-500 mx-auto" />
								</td>
								<td className="py-4 px-4 text-center">
									<X className="h-5 w-5 text-red-500 mx-auto" />
								</td>
								<td className="py-4 px-4 text-center">
									<Check className="h-5 w-5 text-green-500 mx-auto" />
								</td>
							</tr>
							<tr>
								<td className="py-4 px-4 text-slate-700">Suporte</td>
								<td className="py-4 px-4 text-center">Email</td>
								<td className="py-4 px-4 text-center">Prioritário</td>
								<td className="py-4 px-4 text-center">24/7</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* FAQ */}
			<div>
				<h2 className="text-2xl font-bold text-slate-900 mb-6">
					Perguntas Frequentes
				</h2>
				<div className="space-y-4">
					{faqData.map((item) => (
						<div
							key={item.id}
							className="bg-white rounded-xl border border-slate-200"
						>
							<button
								type="button"
								onClick={() =>
									setExpandedFaq(expandedFaq === item.id ? null : item.id)
								}
								className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
							>
								<h3 className="font-semibold text-slate-900">
									{item.question}
								</h3>
								{expandedFaq === item.id ? (
									<ChevronUp className="h-5 w-5 text-slate-400" />
								) : (
									<ChevronDown className="h-5 w-5 text-slate-400" />
								)}
							</button>
							{expandedFaq === item.id && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="px-6 pb-6"
								>
									<p className="text-slate-600">{item.answer}</p>
								</motion.div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
				<h2 className="text-2xl font-bold mb-4">Ainda tem dúvidas?</h2>
				<p className="text-indigo-100 mb-6">
					Nossa equipe está pronta para ajudar você a escolher o melhor plano
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						type="button"
						className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
					>
						Falar com Vendas
					</button>
					<button
						type="button"
						className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
					>
						Agendar Demo
					</button>
				</div>
			</div>
		</div>
	);
}
