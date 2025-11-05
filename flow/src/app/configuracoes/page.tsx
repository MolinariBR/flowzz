'use client'

import {
  AlertTriangle,
  Bell,
  Camera,
  CreditCard,
  Database,
  Download,
  Eye,
  EyeOff,
  Save,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  Upload,
  User,
  Zap,
} from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import {
  changePassword,
  getProfile,
  getSessions,
  getSystemSettings,
  revokeSession,
  updateProfile,
  updateSystemSettings,
} from '../../lib/api/auth'

type Session = {
  id: string
  user_agent: string
  ip_address: string
  device_info: string
  created_at: string
  expires_at: string
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('perfil')
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    vendas: true,
    marketing: false,
    sistema: true,
  })

  // Generate unique IDs
  const nomeCompletoId = useId()
  const emailId = useId()
  const telefoneId = useId()
  const cpfCnpjId = useId()
  const enderecoId = useId()
  const cidadeId = useId()
  const cepId = useId()
  const idiomaId = useId()
  const fusoHorarioId = useId()
  const formatoDataId = useId()
  const moedaId = useId()
  const senhaAtualId = useId()
  const novaSenhaId = useId()
  const confirmarSenhaId = useId()

  // State for data
  const [profileData, setProfileData] = useState<{
    nome: string
    email: string
    telefone: string
    documento: string
    endereco: string
    cidade: string
    cep: string
    avatar_url: string
  }>({
    nome: '',
    email: '',
    telefone: '',
    documento: '',
    endereco: '',
    cidade: '',
    cep: '',
    avatar_url: '',
  })
  const [systemData, setSystemData] = useState<{
    dark_mode: boolean
    language: string
    timezone: string
    date_format: string
    currency: string
  }>({
    dark_mode: false,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    date_format: 'DD/MM/YYYY',
    currency: 'BRL',
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile()
        setProfileData((prev) => ({ ...prev, ...response.data }))
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      }
    }

    const loadSystemSettings = async () => {
      try {
        const response = await getSystemSettings()
        setSystemData((prev) => ({ ...prev, ...response.data }))
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }

    const loadSessions = async () => {
      try {
        const response = await getSessions()
        setSessions(response.data)
      } catch (error) {
        console.error('Erro ao carregar sessões:', error)
      }
    }

    loadProfile()
    loadSystemSettings()
    loadSessions()
  }, [])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(profileData)
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateSystemSettings(systemData)
      alert('Configurações atualizadas com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      alert('Erro ao atualizar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Nova senha e confirmação não coincidem')
      return
    }
    setLoading(true)
    try {
      await changePassword(passwordData)
      alert('Senha alterada com sucesso!')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      alert('Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja revogar esta sessão?')) return

    try {
      await revokeSession(sessionId)
      // Recarregar sessões após revogar
      const sessionsResponse = await getSessions()
      setSessions(sessionsResponse.data)
      alert('Sessão revogada com sucesso!')
    } catch (error) {
      console.error('Erro ao revogar sessão:', error)
      alert('Erro ao revogar sessão')
    }
  }

  const tabs = [
    { id: 'perfil', name: 'Perfil', icon: User },
    { id: 'sistema', name: 'Sistema', icon: Settings },
    { id: 'notificacoes', name: 'Notificações', icon: Bell },
    { id: 'seguranca', name: 'Segurança', icon: Shield },
    { id: 'faturamento', name: 'Faturamento', icon: CreditCard },
    { id: 'integracoes', name: 'Integrações', icon: Zap },
    { id: 'avancado', name: 'Avançado', icon: Database },
  ]

  const renderPerfilTab = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 bg-white border-2 border-slate-200 rounded-full p-2 hover:bg-slate-50 transition-colors"
          >
            <Camera className="h-4 w-4 text-slate-600" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Foto do Perfil</h3>
          <p className="text-slate-600 text-sm mb-3">
            Recomendamos uma imagem de pelo menos 400x400px
          </p>
          <div className="flex space-x-3">
            <button
              type="button"
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Fazer Upload</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Remover</span>
            </button>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor={nomeCompletoId} className="block text-sm font-medium text-slate-700 mb-2">
            Nome Completo
          </label>
          <input
            id={nomeCompletoId}
            type="text"
            value={profileData.nome}
            onChange={(e) => setProfileData({ ...profileData, nome: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor={emailId} className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            id={emailId}
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor={telefoneId} className="block text-sm font-medium text-slate-700 mb-2">
            Telefone
          </label>
          <input
            id={telefoneId}
            type="tel"
            value={profileData.telefone}
            onChange={(e) => setProfileData({ ...profileData, telefone: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor={cpfCnpjId} className="block text-sm font-medium text-slate-700 mb-2">
            CPF/CNPJ
          </label>
          <input
            id={cpfCnpjId}
            type="text"
            value={profileData.documento}
            onChange={(e) => setProfileData({ ...profileData, documento: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor={enderecoId} className="block text-sm font-medium text-slate-700 mb-2">
              Endereço
            </label>
            <input
              id={enderecoId}
              type="text"
              value={profileData.endereco}
              onChange={(e) => setProfileData({ ...profileData, endereco: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor={cidadeId} className="block text-sm font-medium text-slate-700 mb-2">
              Cidade
            </label>
            <input
              id={cidadeId}
              type="text"
              value={profileData.cidade}
              onChange={(e) => setProfileData({ ...profileData, cidade: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor={cepId} className="block text-sm font-medium text-slate-700 mb-2">
              CEP
            </label>
            <input
              id={cepId}
              type="text"
              value={profileData.cep}
              onChange={(e) => setProfileData({ ...profileData, cep: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>
    </form>
  )

  const renderSistemaTab = () => (
    <form onSubmit={handleSystemSubmit} className="space-y-6">
      {/* Appearance */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Aparência</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Modo Escuro</p>
              <p className="text-slate-600 text-sm">
                Ative o tema escuro para reduzir o cansaço visual
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSystemData({ ...systemData, dark_mode: !systemData.dark_mode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                systemData.dark_mode ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  systemData.dark_mode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Language & Region */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Idioma e Região</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor={idiomaId} className="block text-sm font-medium text-slate-700 mb-2">
              Idioma
            </label>
            <select
              id={idiomaId}
              value={systemData.language}
              onChange={(e) => setSystemData({ ...systemData, language: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
          <div>
            <label
              htmlFor={fusoHorarioId}
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Fuso Horário
            </label>
            <select
              id={fusoHorarioId}
              value={systemData.timezone}
              onChange={(e) => setSystemData({ ...systemData, timezone: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Format */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Formato de Dados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor={formatoDataId}
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Formato de Data
            </label>
            <select
              id={formatoDataId}
              value={systemData.date_format}
              onChange={(e) => setSystemData({ ...systemData, date_format: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label htmlFor={moedaId} className="block text-sm font-medium text-slate-700 mb-2">
              Moeda
            </label>
            <select
              id={moedaId}
              value={systemData.currency}
              onChange={(e) => setSystemData({ ...systemData, currency: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </form>
  )

  const renderNotificacoesTab = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Preferências de Notificação</h3>
        <div className="space-y-4">
          {Object.entries({
            email: 'Notificações por Email',
            push: 'Notificações Push',
            sms: 'Notificações por SMS',
            vendas: 'Alertas de Vendas',
            marketing: 'Novidades e Promoções',
            sistema: 'Atualizações do Sistema',
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{label}</p>
                <p className="text-slate-600 text-sm">
                  {key === 'email' && 'Receba notificações importantes por email'}
                  {key === 'push' && 'Notificações em tempo real no navegador'}
                  {key === 'sms' && 'Alertas urgentes por mensagem de texto'}
                  {key === 'vendas' && 'Seja notificado sobre novas vendas'}
                  {key === 'marketing' && 'Receba dicas e novidades do FLOWZZ'}
                  {key === 'sistema' && 'Informações sobre manutenções e atualizações'}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof prev],
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications]
                    ? 'bg-indigo-600'
                    : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[key as keyof typeof notifications]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSegurancaTab = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Alterar Senha</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor={senhaAtualId} className="block text-sm font-medium text-slate-700 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <input
                id={senhaAtualId}
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current_password: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-slate-400" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor={novaSenhaId} className="block text-sm font-medium text-slate-700 mb-2">
              Nova Senha
            </label>
            <input
              id={novaSenhaId}
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label
              htmlFor={confirmarSenhaId}
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Confirmar Nova Senha
            </label>
            <input
              id={confirmarSenhaId}
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm_password: e.target.value })
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>

      {/* Two Factor Authentication */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Autenticação em Duas Etapas</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">2FA não configurado</p>
              <p className="text-slate-600 text-sm">
                Adicione uma camada extra de segurança à sua conta
              </p>
            </div>
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Configurar 2FA
            </button>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Sessões Ativas</h3>
        <div className="space-y-3">
          {sessions.map((session: Session, index: number) => (
            <div
              key={session.id || index}
              className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {session.device_info || 'Dispositivo'}
                  </p>
                  <p className="text-slate-600 text-sm">
                    {session.ip_address || 'IP'} • {session.created_at || 'Criada'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-red-600 hover:text-red-700 font-medium text-sm"
                onClick={() => handleRevokeSession(session.id)}
              >
                Revogar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFaturamentoTab = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Plano Atual</h3>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Plano Pro</h4>
              <p className="text-slate-600">R$ 197/mês • Próxima cobrança em 15 dias</p>
            </div>
            <button
              type="button"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Alterar Plano
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Método de Pagamento</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">**** **** **** 1234</p>
                <p className="text-slate-600 text-sm">Expira em 12/2025</p>
              </div>
            </div>
            <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Alterar
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Histórico de Faturas</h3>
        <div className="space-y-3">
          {[
            { date: '01/12/2024', amount: 'R$ 197,00', status: 'Pago' },
            { date: '01/11/2024', amount: 'R$ 197,00', status: 'Pago' },
            { date: '01/10/2024', amount: 'R$ 197,00', status: 'Pago' },
          ].map((invoice) => (
            <div
              key={invoice.date}
              className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{invoice.date}</p>
                <p className="text-slate-600 text-sm">{invoice.amount}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {invoice.status}
                </span>
                <button type="button" className="text-indigo-600 hover:text-indigo-700">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderIntegracaoTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Integrações Conectadas</h3>
        <div className="space-y-4">
          {[
            {
              name: 'Facebook Ads',
              status: 'Conectado',
              lastSync: '2 min atrás',
            },
            {
              name: 'Google Ads',
              status: 'Conectado',
              lastSync: '5 min atrás',
            },
            { name: 'Hotmart', status: 'Desconectado', lastSync: 'Nunca' },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{integration.name}</p>
                <p className="text-slate-600 text-sm">
                  Última sincronização: {integration.lastSync}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    integration.status === 'Conectado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {integration.status}
                </span>
                <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  {integration.status === 'Conectado' ? 'Reconfigurar' : 'Conectar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAvancadoTab = () => (
    <div className="space-y-6">
      {/* Data Export */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Exportar Dados</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-slate-600 mb-4">
            Baixe uma cópia de todos os seus dados em formato JSON
          </p>
          <button
            type="button"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Dados</span>
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Zona de Perigo</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900">Excluir Conta</h4>
              <p className="text-red-700 text-sm mb-4">
                Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
              </p>
              <button
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return renderPerfilTab()
      case 'sistema':
        return renderSistemaTab()
      case 'notificacoes':
        return renderNotificacoesTab()
      case 'seguranca':
        return renderSegurancaTab()
      case 'faturamento':
        return renderFaturamentoTab()
      case 'integracoes':
        return renderIntegracaoTab()
      case 'avancado':
        return renderAvancadoTab()
      default:
        return renderPerfilTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600 mt-1">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
