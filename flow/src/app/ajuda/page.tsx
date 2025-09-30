"use client";

import {
	Book,
	ChevronDown,
	ChevronRight,
	Download,
	ExternalLink,
	FileText,
	HelpCircle,
	Mail,
	MessageCircle,
	Phone,
	Play,
	Search,
	Star,
} from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";

export default function Ajuda() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("geral");
	const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

	// Generate unique IDs
	const searchInputId = useId();

	const categories = [
		{ id: "geral", name: "Geral", icon: HelpCircle },
		{ id: "integracao", name: "Integrações", icon: FileText },
		{ id: "relatorios", name: "Relatórios", icon: Book },
		{ id: "faturamento", name: "Faturamento", icon: Star },
		{ id: "suporte", name: "Suporte", icon: MessageCircle },
	];

	const faqData = [
		{
			id: 1,
			category: "geral",
			question: "Como começar a usar o FLOWZZ?",
			answer:
				"Para começar, faça login na sua conta e conecte suas primeiras integrações. Recomendamos começar com Facebook Ads e sua conta bancária para ter uma visão completa das suas finanças.",
		},
		{
			id: 2,
			category: "geral",
			question: "Quais integrações estão disponíveis?",
			answer:
				"Oferecemos integrações com Facebook Ads, Google Ads, Hotmart, Monetizze, bancos brasileiros, WhatsApp Business, e muito mais. Veja a lista completa na seção de Integrações.",
		},
		{
			id: 3,
			category: "integracao",
			question: "Como conectar minha conta do Facebook Ads?",
			answer:
				"Vá em Integrações > Facebook Ads > Conectar. Você será redirecionado para autorizar o acesso. Certifique-se de ter permissões de administrador na conta de anúncios.",
		},
		{
			id: 4,
			category: "relatorios",
			question: "Como gerar relatórios personalizados?",
			answer:
				'Na seção Relatórios, clique em "Criar Relatório" e escolha as métricas, período e formato desejado. Você pode agendar relatórios automáticos também.',
		},
		{
			id: 5,
			category: "faturamento",
			question: "Como alterar meu plano?",
			answer:
				"Acesse Configurações > Faturamento > Alterar Plano. Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças entram em vigor no próximo ciclo de cobrança.",
		},
	];

	const tutorials = [
		{
			id: 1,
			title: "Primeiros Passos no FLOWZZ",
			description:
				"Aprenda a configurar sua conta e conectar suas primeiras integrações",
			duration: "5 min",
			type: "video",
			thumbnail:
				"https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400",
		},
		{
			id: 2,
			title: "Configurando Facebook Ads",
			description:
				"Passo a passo para conectar e configurar sua conta do Facebook Ads",
			duration: "8 min",
			type: "video",
			thumbnail:
				"https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg?auto=compress&cs=tinysrgb&w=400",
		},
		{
			id: 3,
			title: "Interpretando Relatórios",
			description: "Como ler e interpretar os relatórios financeiros do FLOWZZ",
			duration: "12 min",
			type: "video",
			thumbnail:
				"https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=400",
		},
		{
			id: 4,
			title: "Guia de Integrações",
			description: "Manual completo de todas as integrações disponíveis",
			duration: "15 min",
			type: "article",
			thumbnail:
				"https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=400",
		},
	];

	const filteredFaq = faqData.filter(
		(item) =>
			(activeCategory === "geral" || item.category === activeCategory) &&
			(item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.answer.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="text-center">
				<h1 className="text-3xl font-bold text-slate-900 mb-2">
					Central de Ajuda
				</h1>
				<p className="text-slate-600">
					Encontre respostas, tutoriais e suporte para o FLOWZZ
				</p>
			</div>

			{/* Search */}
			<div className="max-w-2xl mx-auto">
				<div className="relative">
					<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
					<input
						id={searchInputId}
						type="text"
						placeholder="Buscar na central de ajuda..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
					/>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
					<MessageCircle className="h-8 w-8 mb-4" />
					<h3 className="font-semibold mb-2">Chat ao Vivo</h3>
					<p className="text-blue-100 text-sm mb-4">
						Fale com nossa equipe de suporte
					</p>
					<button
						type="button"
						className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
					>
						Iniciar Chat
					</button>
				</div>

				<div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
					<Mail className="h-8 w-8 mb-4" />
					<h3 className="font-semibold mb-2">Email Suporte</h3>
					<p className="text-green-100 text-sm mb-4">
						Envie sua dúvida por email
					</p>
					<button
						type="button"
						className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
					>
						Enviar Email
					</button>
				</div>

				<div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
					<Phone className="h-8 w-8 mb-4" />
					<h3 className="font-semibold mb-2">Suporte Telefônico</h3>
					<p className="text-purple-100 text-sm mb-4">
						Ligue para (11) 4002-8922
					</p>
					<button
						type="button"
						className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
					>
						Ligar Agora
					</button>
				</div>
			</div>

			{/* Tutorials Section */}
			<div>
				<h2 className="text-2xl font-bold text-slate-900 mb-6">
					Tutoriais e Guias
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{tutorials.map((tutorial) => (
						<div
							key={tutorial.id}
							className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
						>
							<div className="relative">
								<Image
									src={tutorial.thumbnail}
									alt={tutorial.title}
									width={400}
									height={160}
									className="w-full h-40 object-cover"
								/>
								<div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
									{tutorial.type === "video" ? (
										<Play className="h-12 w-12 text-white" />
									) : (
										<FileText className="h-12 w-12 text-white" />
									)}
								</div>
								<div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
									{tutorial.duration}
								</div>
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-slate-900 mb-2">
									{tutorial.title}
								</h3>
								<p className="text-slate-600 text-sm">{tutorial.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* FAQ Section */}
			<div>
				<h2 className="text-2xl font-bold text-slate-900 mb-6">
					Perguntas Frequentes
				</h2>

				{/* Categories */}
				<div className="flex flex-wrap gap-2 mb-6">
					{categories.map((category) => (
						<button
							key={category.id}
							type="button"
							onClick={() => setActiveCategory(category.id)}
							className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								activeCategory === category.id
									? "bg-indigo-100 text-indigo-700 border border-indigo-200"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200"
							}`}
						>
							<category.icon className="h-4 w-4" />
							<span>{category.name}</span>
						</button>
					))}
				</div>

				{/* FAQ Items */}
				<div className="space-y-4">
					{filteredFaq.map((item) => (
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
									<ChevronDown className="h-5 w-5 text-slate-400" />
								) : (
									<ChevronRight className="h-5 w-5 text-slate-400" />
								)}
							</button>
							{expandedFaq === item.id && (
								<div className="px-6 pb-6">
									<p className="text-slate-600">{item.answer}</p>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Documentation Links */}
			<div className="bg-slate-100 rounded-xl p-6">
				<h2 className="text-xl font-bold text-slate-900 mb-4">
					Documentação Técnica
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
						<Book className="h-6 w-6 text-indigo-600" />
						<div>
							<p className="font-medium text-slate-900">API Documentation</p>
							<p className="text-slate-600 text-sm">
								Guia completo da API do FLOWZZ
							</p>
						</div>
						<ExternalLink className="h-4 w-4 text-slate-400" />
					</div>
					<div className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
						<Download className="h-6 w-6 text-green-600" />
						<div>
							<p className="font-medium text-slate-900">Manual do Usuário</p>
							<p className="text-slate-600 text-sm">
								Download do manual completo (PDF)
							</p>
						</div>
						<ExternalLink className="h-4 w-4 text-slate-400" />
					</div>
				</div>
			</div>
		</div>
	);
}
