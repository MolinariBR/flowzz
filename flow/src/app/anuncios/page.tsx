"use client";

import { motion } from "framer-motion";
import {
	ChevronDown,
	ChevronRight,
	DollarSign,
	Download,
	Eye,
	Filter,
	MoreHorizontal,
	MousePointer,
	Pause,
	Play,
	RefreshCw,
	Settings,
	Target,
	TrendingDown,
	TrendingUp,
	Link,
	AlertCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useFacebookAds } from "@/lib/hooks/useFacebookAds";
import type { FacebookInsightsResponse } from "@/lib/types/facebook";

interface MetricCardProps {
	title: string;
	value: string;
	change: string;
	trend: "up" | "down" | "neutral";
	icon: React.ComponentType<{ className?: string }>;
}

const MetricCard = ({
	title,
	value,
	change,
	trend,
	icon: Icon,
}: MetricCardProps) => (
	<div className="bg-white border border-slate-200 rounded-lg p-4">
		<div className="flex items-center justify-between">
			<div>
				<p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
					{title}
				</p>
				<p className="text-lg font-bold text-slate-900 mt-1 font-mono">
					{value}
				</p>
			</div>
			<Icon className="h-5 w-5 text-slate-400" />
		</div>
		<div
			className={`flex items-center mt-2 text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-slate-600"}`}
		>
			{trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
			{trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
			<span className="font-medium">{change}</span>
			<span className="text-slate-500 ml-1">vs período anterior</span>
		</div>
	</div>
);

export default function Anuncios() {
	const [dateRange, setDateRange] = useState("7d");
	const [expandedCampaigns, setExpandedCampaigns] = useState<number[]>([1]);
	const [insightsData, setInsightsData] = useState<FacebookInsightsResponse | null>(null);
	const selectedCampaigns: number[] = [];

	const {
		isLoading,
		integrationStatus,
		connect,
		getInsights,
		syncData,
	} = useFacebookAds();

	// Carregar dados quando a integração estiver conectada
	const loadInsights = useCallback(async () => {
		if (!integrationStatus?.adAccounts?.[0]?.account_id) return;

		try {
			const data = await getInsights({
				adAccountId: integrationStatus.adAccounts[0].account_id,
				datePreset: dateRange === '1d' ? 'today' : dateRange === '7d' ? 'last_7d' : dateRange === '30d' ? 'last_30d' : 'last_90d',
				level: 'campaign',
			});
			if (data) {
				setInsightsData(data);
			}
		} catch (error) {
			console.error('Erro ao carregar insights:', error);
		}
	}, [getInsights, dateRange, integrationStatus?.adAccounts]);

	useEffect(() => {
		if (integrationStatus?.connected) {
			loadInsights();
		}
	}, [integrationStatus?.connected, loadInsights]);

	// Recarregar dados quando o dateRange mudar
	useEffect(() => {
		if (integrationStatus?.connected) {
			loadInsights();
		}
	}, [dateRange, integrationStatus?.connected, loadInsights]);

	// Usar campanhas reais quando conectadas, senão usar mock
	const campaigns = insightsData?.campaigns ? insightsData.campaigns.map((campaign, index) => {
		// Encontrar insights correspondentes para esta campanha
		const campaignInsights = insightsData.insights.filter(insight => insight.campaign_id === campaign.id);
		const totalSpend = campaignInsights.reduce((sum, insight) => sum + insight.spend, 0);
		const totalImpressions = campaignInsights.reduce((sum, insight) => sum + insight.impressions, 0);
		const totalClicks = campaignInsights.reduce((sum, insight) => sum + insight.clicks, 0);
		const avgCTR = campaignInsights.length > 0 ? campaignInsights.reduce((sum, insight) => sum + insight.ctr, 0) / campaignInsights.length : 0;
		const avgROAS = campaignInsights.length > 0 ? campaignInsights.reduce((sum, insight) => sum + (insight.roas || 0), 0) / campaignInsights.length : 0;

		return {
			id: parseInt(campaign.id),
			name: campaign.name,
			status: campaign.status === 'ACTIVE' ? 'ativo' : campaign.status === 'PAUSED' ? 'pausado' : 'rascunho',
			budget: campaign.daily_budget || campaign.lifetime_budget || 0,
			spent: totalSpend,
			impressions: totalImpressions,
			clicks: totalClicks,
			cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
			cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
			ctr: avgCTR,
			roas: avgROAS,
			sales: Math.round(avgROAS * totalSpend), // Estimativa baseada no ROAS
			adSets: [], // Por enquanto vazio, pode ser expandido depois
		};
	}) : [
		{
			id: 1,
			name: "Campanha Produto A - Conversão",
			status: "ativo",
			budget: 150,
			spent: 125.5,
			impressions: 16700,
			clicks: 490,
			cpm: 7.51,
			cpc: 0.26,
			ctr: 2.93,
			roas: 10.8,
			sales: 1350,
			adSets: [
				{
					id: 11,
					name: "AdSet Interesse - Fitness",
					status: "ativo",
					spent: 75.3,
					impressions: 9200,
					clicks: 280,
					ctr: 3.04,
					roas: 12.5,
					ads: [
						{
							id: 111,
							name: "Criativo Video 1",
							status: "ativo",
							spent: 45.2,
							roas: 15.2,
						},
						{
							id: 112,
							name: "Criativo Carrossel",
							status: "pausado",
							spent: 30.1,
							roas: 8.9,
						},
					],
				},
				{
					id: 12,
					name: "AdSet Lookalike 1%",
					status: "ativo",
					spent: 50.2,
					impressions: 7500,
					clicks: 210,
					ctr: 2.8,
					roas: 8.7,
					ads: [
						{
							id: 121,
							name: "Criativo Imagem A",
							status: "ativo",
							spent: 50.2,
							roas: 8.7,
						},
					],
				},
			],
		},
		{
			id: 2,
			name: "Campanha Retargeting - 30 dias",
			status: "ativo",
			budget: 80,
			spent: 65.8,
			impressions: 8900,
			clicks: 245,
			cpm: 7.39,
			cpc: 0.27,
			ctr: 2.75,
			roas: 8.5,
			sales: 559,
			adSets: [],
		},
		{
			id: 3,
			name: "Teste Criativo - Produto B",
			status: "pausado",
			budget: 50,
			spent: 12.3,
			impressions: 1200,
			clicks: 35,
			cpm: 10.25,
			cpc: 0.35,
			ctr: 2.92,
			roas: 3.2,
			sales: 39,
			adSets: [],
		},
	];

	const performanceData = [
		{ date: "07/10", gasto: 120, vendas: 890, impressoes: 12500, cliques: 340 },
		{ date: "08/10", gasto: 95, vendas: 1200, impressoes: 15800, cliques: 420 },
		{ date: "09/10", gasto: 110, vendas: 980, impressoes: 11200, cliques: 380 },
		{
			date: "10/10",
			gasto: 130,
			vendas: 1450,
			impressoes: 18900,
			cliques: 520,
		},
		{
			date: "11/10",
			gasto: 105,
			vendas: 1100,
			impressoes: 14300,
			cliques: 450,
		},
		{
			date: "12/10",
			gasto: 140,
			vendas: 1680,
			impressoes: 21200,
			cliques: 580,
		},
		{
			date: "13/10",
			gasto: 125,
			vendas: 1350,
			impressoes: 16700,
			cliques: 490,
		},
	];

	const toggleCampaign = (campaignId: number) => {
		setExpandedCampaigns((prev) =>
			prev.includes(campaignId)
				? prev.filter((id) => id !== campaignId)
				: [...prev, campaignId],
		);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "ativo":
				return "bg-green-100 text-green-800";
			case "pausado":
				return "bg-red-100 text-red-800";
			case "rascunho":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getRoasColor = (roas: number) => {
		if (roas >= 10) return "text-green-600";
		if (roas >= 5) return "text-amber-600";
		return "text-red-600";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">
						Facebook Ads Manager
					</h1>
					<p className="text-slate-600 mt-1">
						Gerencie suas campanhas como um profissional
					</p>
				</div>
				<div className="flex items-center space-x-3 mt-4 lg:mt-0">
					{!integrationStatus?.connected ? (
						<button
							type="button"
							onClick={connect}
							disabled={isLoading}
							className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Link className="h-4 w-4" />
							<span>{isLoading ? 'Conectando...' : 'Conectar Facebook Ads'}</span>
						</button>
					) : (
						<>
							<select
								value={dateRange}
								onChange={(e) => setDateRange(e.target.value)}
								className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="1d">Hoje</option>
								<option value="7d">Últimos 7 dias</option>
								<option value="30d">Últimos 30 dias</option>
								<option value="90d">Últimos 90 dias</option>
							</select>
							<button
								type="button"
								onClick={loadInsights}
								disabled={isLoading}
								className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
							>
								<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
								<span>Atualizar</span>
							</button>
							<button
								type="button"
								onClick={syncData}
								disabled={isLoading}
								className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
							>
								<Download className="h-4 w-4" />
								<span>{isLoading ? 'Sincronizando...' : 'Sincronizar'}</span>
							</button>
							<button
								type="button"
								className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
							>
								<Settings className="h-4 w-4" />
								<span>Criar Campanha</span>
							</button>
						</>
					)}
				</div>
			</div>

			{/* Status da Integração */}
			{integrationStatus && (
				<div className={`flex items-center space-x-2 p-4 rounded-lg ${integrationStatus.connected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
					{integrationStatus.connected ? (
						<>
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<span className="text-sm text-green-800">
								Conectado ao Facebook Ads • {integrationStatus.adAccounts?.length || 0} conta(s) de anúncio
								{integrationStatus.lastSync && ` • Última sincronização: ${new Date(integrationStatus.lastSync).toLocaleString('pt-BR')}`}
							</span>
						</>
					) : (
						<>
							<AlertCircle className="h-4 w-4 text-yellow-600" />
							<span className="text-sm text-yellow-800">
								Não conectado ao Facebook Ads. Clique em &quot;Conectar Facebook Ads&quot; para começar.
							</span>
						</>
					)}
				</div>
			)}

			{/* Metrics Bar - Facebook Style */}
			{integrationStatus?.connected && insightsData ? (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
					<MetricCard
						title="Gasto"
						value={`R$ ${insightsData.summary.totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
						change="+12,5%"
						trend="up"
						icon={DollarSign}
					/>
					<MetricCard
						title="Impressões"
						value={insightsData.summary.totalImpressions.toLocaleString('pt-BR')}
						change="+8,2%"
						trend="up"
						icon={Eye}
					/>
					<MetricCard
						title="Cliques"
						value={insightsData.summary.totalClicks.toLocaleString('pt-BR')}
						change="+15,7%"
						trend="up"
						icon={MousePointer}
					/>
					<MetricCard
						title="CPM"
						value={`R$ ${(insightsData.summary.totalSpend / insightsData.summary.totalImpressions * 1000).toFixed(2)}`}
						change="-5,3%"
						trend="down"
						icon={Target}
					/>
					<MetricCard
						title="CPC"
						value={`R$ ${insightsData.summary.averageCPC.toFixed(2)}`}
						change="-8,1%"
						trend="down"
						icon={Target}
					/>
					<MetricCard
						title="CTR"
						value={`${(insightsData.summary.averageCTR * 100).toFixed(2)}%`}
						change="+3,2%"
						trend="up"
						icon={TrendingUp}
					/>
					<MetricCard
						title="ROAS"
						value={`${insightsData.summary.averageROAS.toFixed(1)}x`}
						change="+18,5%"
						trend="up"
						icon={TrendingUp}
					/>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
					<MetricCard
						title="Gasto"
						value="R$ 825,60"
						change="+12,5%"
						trend="up"
						icon={DollarSign}
					/>
					<MetricCard
						title="Impressões"
						value="117.300"
						change="+8,2%"
						trend="up"
						icon={Eye}
					/>
					<MetricCard
						title="Cliques"
						value="3.355"
						change="+15,7%"
						trend="up"
						icon={MousePointer}
					/>
					<MetricCard
						title="CPM"
						value="R$ 7,04"
						change="-5,3%"
						trend="down"
						icon={Target}
					/>
					<MetricCard
						title="CPC"
						value="R$ 0,25"
						change="-8,1%"
						trend="down"
						icon={Target}
					/>
					<MetricCard
						title="CTR"
						value="2,86%"
						change="+3,2%"
						trend="up"
						icon={TrendingUp}
					/>
					<MetricCard
						title="ROAS"
						value="9,7x"
						change="+18,5%"
						trend="up"
						icon={TrendingUp}
					/>
				</div>
			)}

			{/* Performance Chart */}
			{integrationStatus?.connected && insightsData ? (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white border border-slate-200 rounded-lg p-6"
				>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold text-slate-900">
								Performance das Campanhas
							</h3>
							<p className="text-sm text-slate-600">
								Dados do Facebook Ads - {insightsData.adAccount.name}
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
								<span className="text-sm text-slate-600">Gasto</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								<span className="text-sm text-slate-600">Cliques</span>
							</div>
						</div>
					</div>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={insightsData.insights}>
								<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
								<XAxis dataKey="date_start" stroke="#64748b" fontSize={12} />
								<YAxis stroke="#64748b" fontSize={12} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#fff",
										border: "1px solid #e2e8f0",
										borderRadius: "8px",
										boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
									}}
									formatter={(value: any, name: string) => [
										name === 'spend' ? `R$ ${value.toFixed(2)}` : value.toLocaleString('pt-BR'),
										name === 'spend' ? 'Gasto' : 'Cliques'
									]}
								/>
								<Area
									type="monotone"
									dataKey="spend"
									stackId="1"
									stroke="#3b82f6"
									fill="#3b82f6"
									fillOpacity={0.6}
								/>
								<Area
									type="monotone"
									dataKey="clicks"
									stackId="2"
									stroke="#10b981"
									fill="#10b981"
									fillOpacity={0.6}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</motion.div>
			) : (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white border border-slate-200 rounded-lg p-6"
				>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold text-slate-900">
								Performance das Campanhas
							</h3>
							<p className="text-sm text-slate-600">
								Gasto vs Cliques - Últimos 7 dias
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
								<span className="text-sm text-slate-600">Gasto</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								<span className="text-sm text-slate-600">Cliques</span>
							</div>
						</div>
					</div>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={performanceData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
								<XAxis dataKey="date" stroke="#64748b" fontSize={12} />
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
									dataKey="gasto"
									stackId="1"
									stroke="#3b82f6"
									fill="#3b82f6"
									fillOpacity={0.6}
								/>
								<Area
									type="monotone"
									dataKey="cliques"
									stackId="2"
									stroke="#10b981"
									fill="#10b981"
									fillOpacity={0.6}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</motion.div>
			)}

			{/* Campaigns Table */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white border border-slate-200 rounded-lg overflow-hidden"
			>
				<div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<h3 className="text-lg font-semibold text-slate-900">Campanhas</h3>
						{selectedCampaigns.length > 0 && (
							<div className="flex items-center space-x-2">
								<span className="text-sm text-slate-600">
									{selectedCampaigns.length} selecionadas
								</span>
								<button
									type="button"
									className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
								>
									<Play className="h-3 w-3" />
									<span>Ativar</span>
								</button>
								<button
									type="button"
									className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
								>
									<Pause className="h-3 w-3" />
									<span>Pausar</span>
								</button>
							</div>
						)}
					</div>
					<div className="flex items-center space-x-2">
						<button
							type="button"
							className="flex items-center space-x-2 px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50"
						>
							<Filter className="h-4 w-4" />
							<span>Filtros</span>
						</button>
						<button
							type="button"
							className="flex items-center space-x-2 px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50"
						>
							<Download className="h-4 w-4" />
							<span>Exportar</span>
						</button>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-slate-50 border-b border-slate-200">
							<tr>
								<th className="px-6 py-3 text-left">
									<input
										type="checkbox"
										className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
									/>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Campanha / AdSet / Anúncio
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Gasto
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Impressões
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Cliques
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									CTR
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									ROAS
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
									Ações
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200">
							{campaigns.map((campaign) => (
								<>
									{/* Campaign Row */}
									<tr className="hover:bg-slate-50">
										<td className="px-6 py-4">
											<input
												type="checkbox"
												className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
											/>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center space-x-2">
												<button
													type="button"
													onClick={() => toggleCampaign(campaign.id)}
													className="p-1 hover:bg-slate-200 rounded"
												>
													{expandedCampaigns.includes(campaign.id) ? (
														<ChevronDown className="h-4 w-4" />
													) : (
														<ChevronRight className="h-4 w-4" />
													)}
												</button>
												<div>
													<p className="font-medium text-slate-900">
														{campaign.name}
													</p>
													<p className="text-sm text-slate-600">
														Orçamento: R$ {campaign.budget}/dia
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
											>
												{campaign.status}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-mono font-semibold">
												R$ {campaign.spent}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-mono">
												{campaign.impressions.toLocaleString()}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-mono">{campaign.clicks}</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-mono">{campaign.ctr}%</span>
										</td>
										<td className="px-6 py-4">
											<span
												className={`font-mono font-semibold ${getRoasColor(campaign.roas)}`}
											>
												{campaign.roas}x
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center space-x-2">
												<button
													type="button"
													className="p-1 text-green-600 hover:bg-green-50 rounded"
												>
													<Play className="h-4 w-4" />
												</button>
												<button
													type="button"
													className="p-1 text-red-600 hover:bg-red-50 rounded"
												>
													<Pause className="h-4 w-4" />
												</button>
												<button
													type="button"
													className="p-1 text-slate-600 hover:bg-slate-50 rounded"
												>
													<MoreHorizontal className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>

									{/* AdSets */}
									{expandedCampaigns.includes(campaign.id) &&
										campaign.adSets.map((adSet) => (
											<>
												<tr className="bg-slate-25 hover:bg-slate-50">
													<td className="px-6 py-3"></td>
													<td className="px-6 py-3">
														<div className="flex items-center space-x-2 ml-6">
															<div className="w-4 h-px bg-slate-300"></div>
															<div>
																<p className="font-medium text-slate-800 text-sm">
																	{adSet.name}
																</p>
																<p className="text-xs text-slate-500">AdSet</p>
															</div>
														</div>
													</td>
													<td className="px-6 py-3">
														<span
															className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(adSet.status)}`}
														>
															{adSet.status}
														</span>
													</td>
													<td className="px-6 py-3">
														<span className="font-mono text-sm">
															R$ {adSet.spent}
														</span>
													</td>
													<td className="px-6 py-3">
														<span className="font-mono text-sm">
															{adSet.impressions.toLocaleString()}
														</span>
													</td>
													<td className="px-6 py-3">
														<span className="font-mono text-sm">
															{adSet.clicks}
														</span>
													</td>
													<td className="px-6 py-3">
														<span className="font-mono text-sm">
															{adSet.ctr}%
														</span>
													</td>
													<td className="px-6 py-3">
														<span
															className={`font-mono text-sm font-semibold ${getRoasColor(adSet.roas)}`}
														>
															{adSet.roas}x
														</span>
													</td>
													<td className="px-6 py-3">
														<button
															type="button"
															className="p-1 text-slate-600 hover:bg-slate-50 rounded"
														>
															<MoreHorizontal className="h-3 w-3" />
														</button>
													</td>
												</tr>

												{/* Ads */}
												{adSet.ads.map((ad) => (
													<tr
														key={ad.id}
														className="bg-slate-25 hover:bg-slate-50"
													>
														<td className="px-6 py-2"></td>
														<td className="px-6 py-2">
															<div className="flex items-center space-x-2 ml-12">
																<div className="w-4 h-px bg-slate-300"></div>
																<div>
																	<p className="font-medium text-slate-700 text-sm">
																		{ad.name}
																	</p>
																	<p className="text-xs text-slate-400">
																		Anúncio
																	</p>
																</div>
															</div>
														</td>
														<td className="px-6 py-2">
															<span
																className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}
															>
																{ad.status}
															</span>
														</td>
														<td className="px-6 py-2">
															<span className="font-mono text-sm">
																R$ {ad.spent}
															</span>
														</td>
														<td className="px-6 py-2">-</td>
														<td className="px-6 py-2">-</td>
														<td className="px-6 py-2">-</td>
														<td className="px-6 py-2">
															<span
																className={`font-mono text-sm font-semibold ${getRoasColor(ad.roas)}`}
															>
																{ad.roas}x
															</span>
														</td>
														<td className="px-6 py-2">
															<button
																type="button"
																className="p-1 text-slate-600 hover:bg-slate-50 rounded"
															>
																<MoreHorizontal className="h-3 w-3" />
															</button>
														</td>
													</tr>
												))}
											</>
										))}
								</>
							))}
						</tbody>
					</table>
				</div>
			</motion.div>
		</div>
	);
}
