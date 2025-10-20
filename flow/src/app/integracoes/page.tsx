'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Database,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Unlink,
  X,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

interface Integration {
  id: string
  name: string
  description: string
  logo: string
  status: 'connected' | 'disconnected' | 'error' | 'warning'
  lastSync: string
  syncFrequency: string
  features: string[]
  health: number
  category: string
  monthlyData: string
  setupSteps: {
    id: number
    title: string
    description: string
  }[]
}

interface SetupModalProps {
  showSetupModal: boolean
  selectedIntegration: Integration | null
  setupStep: number
  setShowSetupModal: (show: boolean) => void
  nextStep: () => void
  prevStep: () => void
}

const SetupModal = ({
  showSetupModal,
  selectedIntegration,
  setupStep,
  setShowSetupModal,
  nextStep,
  prevStep,
}: SetupModalProps) => (
  <AnimatePresence>
    {showSetupModal && selectedIntegration && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowSetupModal(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedIntegration.logo}</div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Configurar {selectedIntegration.name}
                  </h3>
                  <p className="text-slate-600">{selectedIntegration.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {selectedIntegration.setupSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      setupStep >= step.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step.id}
                  </div>
                  {index < selectedIntegration.setupSteps.length - 1 && (
                    <div
                      className={`w-12 h-px mx-2 transition-colors ${
                        setupStep > step.id ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {selectedIntegration.setupSteps.map(
              (step) =>
                setupStep === step.id && (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h4>
                      <p className="text-slate-600">{step.description}</p>
                    </div>

                    {/* Step Content */}
                    {step.id === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor={`${selectedIntegration.id}-input`}
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            {selectedIntegration.id === 'coinzz'
                              ? 'Email'
                              : selectedIntegration.id === 'facebook'
                                ? 'Conta Facebook'
                                : selectedIntegration.id === 'whatsapp'
                                  ? 'Número WhatsApp'
                                  : selectedIntegration.id === 'banco'
                                    ? 'Selecionar Banco'
                                    : selectedIntegration.id === 'google'
                                      ? 'Conta Google'
                                      : 'API Key'}
                          </label>
                          {selectedIntegration.id === 'banco' ? (
                            <select
                              id={`${selectedIntegration.id}-input`}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              <option>Selecione seu banco</option>
                              <option>Banco do Brasil</option>
                              <option>Bradesco</option>
                              <option>Itaú</option>
                              <option>Santander</option>
                              <option>Caixa</option>
                            </select>
                          ) : (
                            <input
                              id={`${selectedIntegration.id}-input`}
                              type={selectedIntegration.id === 'hotmart' ? 'password' : 'text'}
                              placeholder={
                                selectedIntegration.id === 'coinzz'
                                  ? 'seu-email@coinzz.com'
                                  : selectedIntegration.id === 'facebook'
                                    ? 'Autorizar via Facebook'
                                    : selectedIntegration.id === 'whatsapp'
                                      ? '+55 11 99999-9999'
                                      : selectedIntegration.id === 'google'
                                        ? 'Autorizar via Google'
                                        : 'Sua chave de API'
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          )}
                        </div>
                        {selectedIntegration.id !== 'banco' && (
                          <div>
                            <label
                              htmlFor={`${selectedIntegration.id}-password`}
                              className="block text-sm font-medium text-slate-700 mb-2"
                            >
                              {selectedIntegration.id === 'hotmart' ? 'API Secret' : 'Senha'}
                            </label>
                            <input
                              id={`${selectedIntegration.id}-password`}
                              type="password"
                              placeholder="••••••••"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {step.id === 2 && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <h5 className="font-medium text-slate-900 mb-2">URL do Webhook</h5>
                          <code className="text-sm bg-white p-2 rounded border block">
                            https://flowzz.app/webhook/{selectedIntegration.id}
                          </code>
                          <p className="text-sm text-slate-600 mt-2">
                            Cole esta URL nas configurações de webhook da {selectedIntegration.name}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="text-sm">Notificar vendas</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="text-sm">Notificar comissões</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Notificar reembolsos</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {step.id === 3 && (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">
                              Conexão estabelecida!
                            </span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            A integração com {selectedIntegration.name} foi configurada com sucesso.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Status da conexão:</span>
                            <span className="text-green-600 font-medium">✓ Conectado</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Última sincronização:</span>
                            <span className="text-slate-600">Agora mesmo</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Dados recebidos:</span>
                            <span className="text-slate-600">15 registros</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
            )}
          </div>

          <div className="p-6 border-t border-slate-200 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={setupStep === 1}
              className="px-4 py-2 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 rounded-lg transition-colors"
            >
              Anterior
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              {setupStep < selectedIntegration.setupSteps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Finalizar
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default function Integracoes() {
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [setupStep, setSetupStep] = useState(1)
  const [filterCategory, setFilterCategory] = useState('todas')

  const integrations: Integration[] = [
    {
      id: 'coinzz',
      name: 'Coinzz',
      description: 'Plataforma de afiliados',
      logo: '🪙',
      status: 'connected',
      lastSync: '2 min atrás',
      syncFrequency: 'Tempo real',
      features: ['Vendas automáticas', 'Comissões', 'Relatórios'],
      health: 100,
      category: 'Afiliados',
      monthlyData: 'R$ 12.450',
      setupSteps: [
        {
          id: 1,
          title: 'Conectar conta',
          description: 'Entre com suas credenciais da Coinzz',
        },
        {
          id: 2,
          title: 'Configurar webhook',
          description: 'Configure URL de notificação automática',
        },
        {
          id: 3,
          title: 'Testar conexão',
          description: 'Validar sincronização de dados',
        },
      ],
    },
    {
      id: 'facebook',
      name: 'Facebook Ads',
      description: 'Gestão de anúncios',
      logo: '📘',
      status: 'connected',
      lastSync: '5 min atrás',
      syncFrequency: '15 min',
      features: ['Métricas de campanha', 'Gastos', 'Performance'],
      health: 95,
      category: 'Marketing',
      monthlyData: 'R$ 3.280 gastos',
      setupSteps: [
        {
          id: 1,
          title: 'Autorizar acesso',
          description: 'Permitir acesso às suas contas de anúncio',
        },
        {
          id: 2,
          title: 'Selecionar contas',
          description: 'Escolher contas de anúncio para sincronizar',
        },
        {
          id: 3,
          title: 'Configurar métricas',
          description: 'Definir métricas importantes',
        },
      ],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Automação de mensagens',
      logo: '💬',
      status: 'disconnected',
      lastSync: 'Nunca',
      syncFrequency: 'Manual',
      features: ['Cobrança automática', 'Notificações', 'Templates'],
      health: 0,
      category: 'Comunicação',
      monthlyData: '0 mensagens',
      setupSteps: [
        {
          id: 1,
          title: 'Conectar WhatsApp',
          description: 'Vincular sua conta WhatsApp Business',
        },
        {
          id: 2,
          title: 'Configurar templates',
          description: 'Criar templates de mensagem',
        },
        {
          id: 3,
          title: 'Testar envio',
          description: 'Validar envio de mensagens',
        },
      ],
    },
    {
      id: 'banco',
      name: 'Open Banking',
      description: 'Conexão bancária',
      logo: '🏦',
      status: 'error',
      lastSync: '2 horas atrás',
      syncFrequency: '1 hora',
      features: ['Saldo em tempo real', 'Extratos', 'Conciliação'],
      health: 25,
      category: 'Financeiro',
      monthlyData: 'Erro de conexão',
      setupSteps: [
        {
          id: 1,
          title: 'Autorizar banco',
          description: 'Conectar com seu banco via Open Banking',
        },
        {
          id: 2,
          title: 'Selecionar contas',
          description: 'Escolher contas para monitoramento',
        },
        {
          id: 3,
          title: 'Configurar alertas',
          description: 'Definir notificações de movimentação',
        },
      ],
    },
    {
      id: 'google',
      name: 'Google Analytics',
      description: 'Analytics do site',
      logo: '📊',
      status: 'disconnected',
      lastSync: 'Nunca',
      syncFrequency: '30 min',
      features: ['Tráfego do site', 'Conversões', 'Audiência'],
      health: 0,
      category: 'Analytics',
      monthlyData: '0 visitantes',
      setupSteps: [
        {
          id: 1,
          title: 'Conectar Google',
          description: 'Autorizar acesso ao Google Analytics',
        },
        {
          id: 2,
          title: 'Selecionar propriedade',
          description: 'Escolher site para monitorar',
        },
        {
          id: 3,
          title: 'Configurar metas',
          description: 'Definir eventos de conversão',
        },
      ],
    },
    {
      id: 'hotmart',
      name: 'Hotmart',
      description: 'Plataforma de produtos digitais',
      logo: '🔥',
      status: 'disconnected',
      lastSync: 'Nunca',
      syncFrequency: 'Tempo real',
      features: ['Vendas de produtos', 'Comissões', 'Afiliados'],
      health: 0,
      category: 'Afiliados',
      monthlyData: '0 vendas',
      setupSteps: [
        {
          id: 1,
          title: 'API Key',
          description: 'Inserir chave de API da Hotmart',
        },
        {
          id: 2,
          title: 'Configurar webhook',
          description: 'URL para notificações automáticas',
        },
        {
          id: 3,
          title: 'Testar integração',
          description: 'Validar recebimento de dados',
        },
      ],
    },
  ]

  const categories = ['todas', 'Afiliados', 'Marketing', 'Comunicação', 'Financeiro', 'Analytics']

  const filteredIntegrations =
    filterCategory === 'todas'
      ? integrations
      : integrations.filter((integration) => integration.category === filterCategory)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      default:
        return <XCircle className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 shadow-green-100'
      case 'error':
        return 'bg-red-50 border-red-200 shadow-red-100'
      case 'warning':
        return 'bg-amber-50 border-amber-200 shadow-amber-100'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'bg-green-500'
    if (health >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const handleSetup = (integration: Integration) => {
    setSelectedIntegration(integration)
    setSetupStep(1)
    setShowSetupModal(true)
  }

  const nextStep = () => {
    if (selectedIntegration && setupStep < selectedIntegration.setupSteps.length) {
      setSetupStep(setupStep + 1)
    }
  }

  const prevStep = () => {
    if (setupStep > 1) {
      setSetupStep(setupStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Connection Hub</h1>
          <p className="text-slate-600 mt-1">Centralize todas suas integrações em um só lugar</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            type="button"
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sincronizar Tudo</span>
          </button>
          <button
            type="button"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Integração</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar integrações..."
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilterCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category === 'todas' ? 'Todas' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Integrações</p>
              <p className="text-2xl font-bold text-slate-900">{integrations.length}</p>
            </div>
            <Database className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Conectadas</p>
              <p className="text-2xl font-bold text-green-600">
                {integrations.filter((i) => i.status === 'connected').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Com Problemas</p>
              <p className="text-2xl font-bold text-red-600">
                {integrations.filter((i) => i.status === 'error').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Saúde Média</p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(
                  integrations.reduce((acc, i) => acc + i.health, 0) / integrations.length
                )}
                %
              </p>
            </div>
            <Activity className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl p-6 shadow-card border-2 transition-all duration-300 hover:shadow-card-hover ${getStatusColor(integration.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{integration.logo}</div>
                <div>
                  <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                  <p className="text-sm text-slate-600">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(integration.status)}
                <button type="button" className="p-1 hover:bg-slate-100 rounded">
                  <Settings className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Health Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600">Saúde da Conexão</span>
                <span className="font-medium">{integration.health}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getHealthColor(integration.health)}`}
                  style={{ width: `${integration.health}%` }}
                />
              </div>
            </div>

            {/* Sync Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Última sincronização:</span>
                <span className="text-slate-900">{integration.lastSync}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Frequência:</span>
                <span className="text-slate-900">{integration.syncFrequency}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Dados do mês:</span>
                <span className="text-slate-900 font-medium">{integration.monthlyData}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Recursos:</p>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {integration.status === 'connected' ? (
                <>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Sincronizar</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Unlink className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetup(integration)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>Conectar</span>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <SetupModal
        showSetupModal={showSetupModal}
        selectedIntegration={selectedIntegration}
        setupStep={setupStep}
        setShowSetupModal={setShowSetupModal}
        nextStep={nextStep}
        prevStep={prevStep}
      />
    </div>
  )
}
