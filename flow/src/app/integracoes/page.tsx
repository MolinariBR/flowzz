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
import { useCallback, useEffect, useState } from 'react'
import {
  connectIntegration,
  getIntegrationHealth,
  getUserIntegrations,
} from '../../lib/api/integrations'
import { useAuth } from '../../lib/contexts/AuthContext'

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
  connecting?: boolean
  connectionError?: string | null
  inputValue: string
  setInputValue: (value: string) => void
  passwordValue: string
  setPasswordValue: (value: string) => void
}

// Lista hardcoded de integrações disponíveis
const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'coinzz',
    name: 'Coinzz',
    description: 'Integração com Coinzz para sincronização de vendas e comissões',
    logo: '🪙',
    status: 'disconnected',
    lastSync: 'Nunca',
    syncFrequency: 'Inativo',
    features: ['Sincronização automática', 'Dados em tempo real', 'Relatórios de vendas'],
    health: 0,
    category: 'Afiliados',
    monthlyData: 'Inativo',
    setupSteps: [
      {
        id: 1,
        title: 'Conectar conta',
        description: 'Entre com suas credenciais do Coinzz',
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
    description: 'Integração com Facebook Ads para análise de campanhas',
    logo: '📘',
    status: 'disconnected',
    lastSync: 'Nunca',
    syncFrequency: 'Inativo',
    features: ['Relatórios de campanhas', 'Dados de conversão', 'Análise de performance'],
    health: 0,
    category: 'Marketing',
    monthlyData: 'Inativo',
    setupSteps: [
      {
        id: 1,
        title: 'Conectar conta',
        description: 'Entre com suas credenciais do Facebook Ads',
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
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Integração com WhatsApp Business para comunicação automatizada',
    logo: '💬',
    status: 'disconnected',
    lastSync: 'Nunca',
    syncFrequency: 'Inativo',
    features: ['Mensagens automatizadas', 'Relatórios de conversas', 'Integração com chatbots'],
    health: 0,
    category: 'Comunicação',
    monthlyData: 'Inativo',
    setupSteps: [
      {
        id: 1,
        title: 'Conectar conta',
        description: 'Entre com suas credenciais do WhatsApp Business',
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
    id: 'banco',
    name: 'PagBank',
    description: 'Integração com PagBank para sincronização de transações bancárias',
    logo: '💳',
    status: 'disconnected',
    lastSync: 'Nunca',
    syncFrequency: 'Inativo',
    features: ['Sincronização de transações', 'Relatórios financeiros', 'Conciliação bancária'],
    health: 0,
    category: 'Financeiro',
    monthlyData: 'Inativo',
    setupSteps: [
      {
        id: 1,
        title: 'Conectar conta',
        description: 'Entre com suas credenciais do PagBank',
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
]

const SetupModal = ({
  showSetupModal,
  selectedIntegration,
  setupStep,
  setShowSetupModal,
  nextStep,
  prevStep,
  connecting = false,
  connectionError = null,
  inputValue,
  setInputValue,
  passwordValue,
  setPasswordValue,
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
                              ? 'API Key da Coinzz'
                              : selectedIntegration.id === 'facebook'
                                ? 'Access Token'
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
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
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
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              placeholder={
                                selectedIntegration.id === 'coinzz'
                                  ? 'Cole sua API Key da Coinzz'
                                  : selectedIntegration.id === 'facebook'
                                    ? 'Seu access token do Facebook'
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
                        {selectedIntegration.id !== 'banco' &&
                          selectedIntegration.id !== 'facebook' &&
                          selectedIntegration.id !== 'coinzz' && (
                            <div>
                              <label
                                htmlFor={`${selectedIntegration.id}-password`}
                                className="block text-sm font-medium text-slate-700 mb-2"
                              >
                                {selectedIntegration.id === 'hotmart'
                                  ? 'API Secret'
                                  : 'Senha/API Secret'}
                              </label>
                              <input
                                id={`${selectedIntegration.id}-password`}
                                type="password"
                                value={passwordValue}
                                onChange={(e) => setPasswordValue(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                          )}
                        {connectionError && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-800">{connectionError}</span>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={nextStep}
                          disabled={connecting}
                          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {connecting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Conectando...
                            </>
                          ) : (
                            'Próximo'
                          )}
                        </button>
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
  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS)
  const [_loading, setLoading] = useState(true)
  const [_error, setError] = useState<string | null>(null)

  const [connecting, setConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Estados para os valores dos inputs do modal
  const [inputValue, setInputValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  // Verificar autenticação
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    console.log('Integracoes auth check:', { isAuthenticated, authLoading })
    if (!authLoading && !isAuthenticated) {
      console.log('Redirecting to login from integracoes...')
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  // Função para carregar integrações
  const loadIntegrations = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUserIntegrations()

      // Criar mapa de integrações conectadas por provider
      const connectedIntegrationsMap = new Map()
      data.forEach((integration) => {
        const providerKey = integration.provider.toLowerCase()
        connectedIntegrationsMap.set(providerKey, integration)
      })

      // Mesclar integrações disponíveis com dados conectados
      const mergedIntegrations: Integration[] = AVAILABLE_INTEGRATIONS.map(
        (availableIntegration) => {
          const connectedIntegration = connectedIntegrationsMap.get(availableIntegration.id)

          if (connectedIntegration) {
            // Integração está conectada, usar dados da API
            return {
              ...availableIntegration,
              status:
                connectedIntegration.status === 'CONNECTED'
                  ? 'connected'
                  : connectedIntegration.status === 'ERROR'
                    ? 'error'
                    : connectedIntegration.status === 'PENDING'
                      ? 'warning'
                      : 'disconnected',
              lastSync: connectedIntegration.lastSync
                ? new Date(connectedIntegration.lastSync).toLocaleString('pt-BR')
                : 'Nunca',
              syncFrequency: connectedIntegration.config.syncEnabled ? 'Ativo' : 'Inativo',
              health: getIntegrationHealth(connectedIntegration.status),
              monthlyData: connectedIntegration.status === 'CONNECTED' ? 'Ativo' : 'Inativo',
            }
          } else {
            // Integração não está conectada, usar dados padrão
            return availableIntegration
          }
        }
      )

      setIntegrations(mergedIntegrations)
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar integrações:', err)
      setError('Erro ao carregar integrações')
      // Em caso de erro, mostrar integrações disponíveis com status desconectado
      setIntegrations(AVAILABLE_INTEGRATIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar integrações do backend apenas quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadIntegrations()
    }
  }, [isAuthenticated, loadIntegrations])

  // Função auxiliar para mapear provider para categoria
  const _getCategoryFromProvider = (provider: string): string => {
    const categories: Record<string, string> = {
      COINZZ: 'Afiliados',
      FACEBOOK_ADS: 'Marketing',
      WHATSAPP: 'Comunicação',
      PAGBANK: 'Financeiro',
    }
    return categories[provider] || 'Outros'
  }

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
    setConnectionError(null) // Limpar erro anterior
    setInputValue('') // Limpar valores dos inputs
    setPasswordValue('')
  }

  const nextStep = async () => {
    if (!selectedIntegration || setupStep >= selectedIntegration.setupSteps.length) return

    if (setupStep === 1) {
      // Coletar dados dos inputs e conectar integração
      try {
        setConnecting(true)
        setConnectionError(null)

        // Coletar valores dos inputs baseado no provider
        const config: Record<string, unknown> = {}

        if (selectedIntegration.id === 'coinzz') {
          if (inputValue) config.apiKey = inputValue
        } else if (selectedIntegration.id === 'facebook') {
          if (inputValue) config.accessToken = inputValue
        } else if (selectedIntegration.id === 'whatsapp') {
          if (inputValue) config.phoneNumber = inputValue
        } else if (selectedIntegration.id === 'banco') {
          if (inputValue && inputValue !== 'Selecione seu banco') config.bankName = inputValue
        } else {
          // Para outros providers, usar campos genéricos
          if (inputValue) config.apiKey = inputValue
          if (passwordValue) config.apiSecret = passwordValue
        }

        // Validar se os campos obrigatórios foram preenchidos
        if (selectedIntegration.id === 'coinzz' && !config.apiKey) {
          setConnectionError('API Key da Coinzz é obrigatória')
          return
        }

        // Mapear ID do frontend para provider do backend
        const providerMap: Record<string, string> = {
          coinzz: 'COINZZ',
          facebook: 'FACEBOOK_ADS',
          whatsapp: 'WHATSAPP',
          banco: 'PAGBANK',
          google: 'GOOGLE_ANALYTICS',
          hotmart: 'HOTMART',
        }

        const provider = providerMap[selectedIntegration.id] || selectedIntegration.id.toUpperCase()

        // Chamar API para conectar
        await connectIntegration(provider, config)

        // Recarregar integrações após conexão bem-sucedida
        await loadIntegrations()

        // Avançar para próximo passo se conexão bem-sucedida
        setSetupStep(setupStep + 1)
      } catch (error: any) {
        console.error('Erro ao conectar integração:', error)

        // Definir mensagem de erro específica baseada no tipo de erro
        if (error.message?.includes('INVALID_CREDENTIALS')) {
          setConnectionError('Credenciais inválidas. Verifique seus dados e tente novamente.')
        } else if (error.message?.includes('INTEGRATION_EXISTS')) {
          setConnectionError('Esta integração já está conectada para sua conta.')
        } else if (error.message?.includes('INVALID_PROVIDER')) {
          setConnectionError('Tipo de integração não suportado.')
        } else {
          setConnectionError('Erro ao conectar integração. Tente novamente mais tarde.')
        }
      } finally {
        setConnecting(false)
      }
    } else {
      // Para outros passos, apenas avançar
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
                <button
                  type="button"
                  className="p-1 hover:bg-slate-100 rounded"
                  onClick={() => {
                    setSelectedIntegration(integration)
                    setShowSetupModal(true)
                    setSetupStep(1)
                  }}
                >
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
        connecting={connecting}
        connectionError={connectionError}
        inputValue={inputValue}
        setInputValue={setInputValue}
        passwordValue={passwordValue}
        setPasswordValue={setPasswordValue}
      />
    </div>
  )
}
