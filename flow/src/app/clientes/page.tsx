"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	Download,
	Filter,
	MessageCircle,
	MoreHorizontal,
	Phone,
	Plus,
	Search,
	Tag,
	Upload,
	X,
} from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";

interface ClientTag {
	id: number;
	name: string;
	color: string;
	count: number;
}

interface Client {
	id: number;
	name: string;
	phone: string;
	email: string;
	value: number;
	status: string;
	deliveryDate: string;
	tags: number[];
	avatar: string;
	lastContact: string;
	orders: number;
}

const TagModal = ({
	showTagModal,
	setShowTagModal,
}: {
	showTagModal: boolean;
	setShowTagModal: (show: boolean) => void;
}) => {
	const tagNameId = useId();

	return (
		<AnimatePresence>
			{showTagModal && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
					onClick={() => setShowTagModal(false)}
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-slate-900">
								Gerenciar Etiquetas
							</h3>
							<button
								type="button"
								onClick={() => setShowTagModal(false)}
								className="p-1 hover:bg-slate-100 rounded-lg"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label
									htmlFor={tagNameId}
									className="block text-sm font-medium text-slate-700 mb-2"
								>
									Nome da Etiqueta
								</label>
								<input
									id={tagNameId}
									type="text"
									placeholder="Ex: Cliente VIP"
									className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								/>
							</div>

							<div>
								<p className="block text-sm font-medium text-slate-700 mb-2">
									Cor
								</p>
								<div className="flex space-x-2">
									{[
										"bg-red-500",
										"bg-blue-500",
										"bg-green-500",
										"bg-purple-500",
										"bg-amber-500",
										"bg-indigo-500",
									].map((color) => (
										<button
											key={color}
											type="button"
											className={`w-8 h-8 rounded-full ${color} hover:scale-110 transition-transform`}
										/>
									))}
								</div>
							</div>

							<div className="flex space-x-3 pt-4">
								<button
									type="button"
									onClick={() => setShowTagModal(false)}
									className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
								>
									Cancelar
								</button>
								<button
									type="button"
									className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
								>
									Criar Etiqueta
								</button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default function Clientes() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("todos");
	const [showFilters, setShowFilters] = useState(false);
	const [showTagModal, setShowTagModal] = useState(false);
	const [selectedClients, setSelectedClients] = useState<number[]>([]);

	const tags: ClientTag[] = [
		{ id: 1, name: "VIP", color: "bg-purple-500", count: 12 },
		{ id: 2, name: "Primeira Compra", color: "bg-green-500", count: 8 },
		{ id: 3, name: "Agendado 15/10", color: "bg-blue-500", count: 5 },
		{ id: 4, name: "Inadimplente", color: "bg-red-500", count: 3 },
		{ id: 5, name: "Recorrente", color: "bg-indigo-500", count: 15 },
	];

	const clients: Client[] = [
		{
			id: 1,
			name: "Maria Silva",
			phone: "(11) 99999-9999",
			email: "maria@email.com",
			value: 297,
			status: "entregue",
			deliveryDate: "2023-10-12",
			tags: [1, 2],
			avatar:
				"https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2",
			lastContact: "2 dias atrás",
			orders: 3,
		},
		{
			id: 2,
			name: "João Santos",
			phone: "(11) 88888-8888",
			email: "joao@email.com",
			value: 150,
			status: "pendente",
			deliveryDate: "2023-10-15",
			tags: [3],
			avatar:
				"https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2",
			lastContact: "1 dia atrás",
			orders: 1,
		},
		{
			id: 3,
			name: "Ana Costa",
			phone: "(11) 77777-7777",
			email: "ana@email.com",
			value: 450,
			status: "agendado",
			deliveryDate: "2023-10-18",
			tags: [1, 5],
			avatar:
				"https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2",
			lastContact: "5 horas atrás",
			orders: 7,
		},
		{
			id: 4,
			name: "Carlos Oliveira",
			phone: "(11) 66666-6666",
			email: "carlos@email.com",
			value: 200,
			status: "inadimplente",
			deliveryDate: "2023-10-08",
			tags: [4],
			avatar:
				"https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2",
			lastContact: "1 semana atrás",
			orders: 2,
		},
	];

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "entregue":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "pendente":
				return <Clock className="h-4 w-4 text-amber-600" />;
			case "agendado":
				return <Calendar className="h-4 w-4 text-blue-600" />;
			case "inadimplente":
				return <AlertCircle className="h-4 w-4 text-red-600" />;
			default:
				return <Clock className="h-4 w-4 text-gray-600" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "entregue":
				return "bg-green-100 text-green-800";
			case "pendente":
				return "bg-amber-100 text-amber-800";
			case "agendado":
				return "bg-blue-100 text-blue-800";
			case "inadimplente":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const handleSelectClient = (clientId: number) => {
		setSelectedClients((prev) =>
			prev.includes(clientId)
				? prev.filter((id) => id !== clientId)
				: [...prev, clientId],
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">
						Clientes
					</h1>
					<p className="text-slate-600 mt-1">
						Gerencie seus clientes com inteligência
					</p>
				</div>
				<div className="flex items-center space-x-3 mt-4 lg:mt-0">
					<button
						type="button"
						className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
					>
						<Download className="h-4 w-4" />
						<span>Exportar</span>
					</button>
					<button
						type="button"
						className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
					>
						<Upload className="h-4 w-4" />
						<span>Importar</span>
					</button>
					<button
						type="button"
						className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700"
					>
						<Plus className="h-4 w-4" />
						<span>Novo Cliente</span>
					</button>
				</div>
			</div>

			{/* Filters and Search */}
			<div className="bg-white rounded-xl p-6 shadow-card">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
					<div className="flex items-center space-x-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
							<input
								type="text"
								placeholder="Buscar clientes..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
							/>
						</div>
						<button
							type="button"
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
						>
							<Filter className="h-4 w-4" />
							<span>Filtros</span>
						</button>
					</div>

					<div className="flex items-center space-x-4">
						<button
							type="button"
							onClick={() => setShowTagModal(true)}
							className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
						>
							<Tag className="h-4 w-4" />
							<span>Gerenciar Etiquetas</span>
						</button>
						{selectedClients.length > 0 && (
							<div className="flex items-center space-x-2">
								<span className="text-sm text-slate-600">
									{selectedClients.length} selecionados
								</span>
								<button
									type="button"
									className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
								>
									Ações em lote
								</button>
							</div>
						)}
					</div>
				</div>

				{/* Tags Filter */}
				<div className="flex flex-wrap gap-2 mt-4">
					<button
						type="button"
						onClick={() => setSelectedFilter("todos")}
						className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
							selectedFilter === "todos"
								? "bg-slate-900 text-white"
								: "bg-slate-100 text-slate-700 hover:bg-slate-200"
						}`}
					>
						Todos ({clients.length})
					</button>
					{tags.map((tag) => (
						<button
							key={tag.id}
							type="button"
							onClick={() => setSelectedFilter(tag.name)}
							className={`px-3 py-1 rounded-full text-sm font-medium text-white transition-colors ${tag.color} hover:opacity-80`}
						>
							{tag.name} ({tag.count})
						</button>
					))}
				</div>
			</div>

			{/* Clients Table */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white rounded-xl shadow-card overflow-hidden"
			>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-slate-50 border-b border-slate-200">
							<tr>
								<th className="px-6 py-4 text-left">
									<input
										type="checkbox"
										className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
									/>
								</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
									Cliente
								</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
									Contato
								</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
									Valor Pedido
								</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
									Status
								</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
									Etiquetas
								</th>
								<th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
									Ações
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{clients.map((client) => (
								<motion.tr
									key={client.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="hover:bg-slate-50 transition-colors"
								>
									<td className="px-6 py-4">
										<input
											type="checkbox"
											checked={selectedClients.includes(client.id)}
											onChange={() => handleSelectClient(client.id)}
											className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
										/>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center space-x-3">
											<Image
												src={client.avatar}
												alt={client.name}
												width={40}
												height={40}
												className="h-10 w-10 rounded-full object-cover"
											/>
											<div>
												<p className="font-medium text-slate-900">
													{client.name}
												</p>
												<p className="text-sm text-slate-600">
													{client.orders} pedidos
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="space-y-1">
											<p className="text-sm text-slate-900">{client.phone}</p>
											<p className="text-sm text-slate-600">{client.email}</p>
										</div>
									</td>
									<td className="px-6 py-4">
										<p className="font-mono font-semibold text-slate-900">
											R$ {client.value}
										</p>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center space-x-2">
											{getStatusIcon(client.status)}
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}
											>
												{client.status}
											</span>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex flex-wrap gap-1">
											{client.tags.map((tagId) => {
												const tag = tags.find((t) => t.id === tagId);
												return tag ? (
													<span
														key={tagId}
														className={`px-2 py-1 rounded-full text-xs font-medium text-white ${tag.color}`}
													>
														{tag.name}
													</span>
												) : null;
											})}
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center space-x-2">
											<button
												type="button"
												className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
												title="WhatsApp"
											>
												<MessageCircle className="h-4 w-4" />
											</button>
											<button
												type="button"
												className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
												title="Ligar"
											>
												<Phone className="h-4 w-4" />
											</button>
											<button
												type="button"
												className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
												title="Agendar"
											>
												<Calendar className="h-4 w-4" />
											</button>
											<button
												type="button"
												className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
											>
												<MoreHorizontal className="h-4 w-4" />
											</button>
										</div>
									</td>
								</motion.tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
					<div className="text-sm text-slate-600">
						Mostrando 1 a 4 de 4 clientes
					</div>
					<div className="flex items-center space-x-2">
						<button
							type="button"
							className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
							disabled
						>
							Anterior
						</button>
						<button
							type="button"
							className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm"
						>
							1
						</button>
						<button
							type="button"
							className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
							disabled
						>
							Próximo
						</button>
					</div>
				</div>
			</motion.div>

			<TagModal showTagModal={showTagModal} setShowTagModal={setShowTagModal} />
		</div>
	);
}
