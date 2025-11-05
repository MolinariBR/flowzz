import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { useAuthStore } from '../lib/stores/auth-store'

// Schemas para validação
const profileSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  documento: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
})

const systemSchema = z.object({
  dark_mode: z.boolean(),
  language: z.string(),
  timezone: z.string(),
  date_format: z.string(),
  currency: z.string(),
})

const securitySchema = z
  .object({
    current_password: z.string().min(6, 'Senha atual é obrigatória'),
    new_password: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirm_password: z.string().min(6, 'Confirmação é obrigatória'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Nova senha e confirmação devem ser iguais',
    path: ['confirm_password'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type SystemForm = z.infer<typeof systemSchema>
type SecurityForm = z.infer<typeof securitySchema>

interface Session {
  id: string
  user_agent: string
  ip_address: string
  device_info: string
  created_at: string
  expires_at: string
}

export const ProfileSettings: React.FC = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'security'>('profile')
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  // Forms
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      documento: '',
      endereco: '',
      cidade: '',
      cep: '',
      avatar_url: '',
    },
  })

  const systemForm = useForm<SystemForm>({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      dark_mode: false,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      date_format: 'DD/MM/YYYY',
      currency: 'BRL',
    },
  })

  const securityForm = useForm<SecurityForm>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  // Load data on mount
  useEffect(() => {
    loadProfile()
    loadSystemSettings()
    loadSessions()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile')
      profileForm.reset(response.data.data)
    } catch (error) {
      toast.error('Erro ao carregar perfil')
    }
  }

  const loadSystemSettings = async () => {
    try {
      const response = await axios.get('/api/auth/system-settings')
      systemForm.reset(response.data.data)
    } catch (error) {
      toast.error('Erro ao carregar configurações do sistema')
    }
  }

  const loadSessions = async () => {
    try {
      const response = await axios.get('/api/auth/sessions')
      setSessions(response.data.data)
    } catch (error) {
      toast.error('Erro ao carregar sessões')
    }
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    setLoading(true)
    try {
      await axios.put('/api/auth/profile', data)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const onSystemSubmit = async (data: SystemForm) => {
    setLoading(true)
    try {
      await axios.put('/api/auth/system-settings', data)
      toast.success('Configurações do sistema atualizadas!')
    } catch (error) {
      toast.error('Erro ao atualizar configurações')
    } finally {
      setLoading(false)
    }
  }

  const onSecuritySubmit = async (data: SecurityForm) => {
    setLoading(true)
    try {
      await axios.put('/api/auth/security', data)
      toast.success('Senha alterada com sucesso!')
      securityForm.reset()
    } catch (error) {
      toast.error('Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Sistema
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'security' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Segurança
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Foto do Perfil</h2>
            <div className="flex items-center space-x-4">
              <img
                src={profileForm.watch('avatar_url') || '/default-avatar.png'}
                alt="Avatar"
                className="w-20 h-20 rounded-full"
              />
              <div>
                <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Fazer Upload
                </button>
                <button type="button" className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
                  Remover
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo</label>
                <input {...profileForm.register('nome')} className="w-full p-2 border rounded" />
                {profileForm.formState.errors.nome && (
                  <p className="text-red-500 text-sm">
                    {profileForm.formState.errors.nome.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...profileForm.register('email')}
                  type="email"
                  className="w-full p-2 border rounded"
                />
                {profileForm.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  {...profileForm.register('telefone')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CPF/CNPJ</label>
                <input
                  {...profileForm.register('documento')}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Endereço</label>
                <input
                  {...profileForm.register('endereco')}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cidade</label>
                <input {...profileForm.register('cidade')} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CEP</label>
                <input {...profileForm.register('cep')} className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Preferências do Sistema</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input {...systemForm.register('dark_mode')} type="checkbox" className="mr-2" />
                <label>Modo Escuro</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Idioma</label>
                <select {...systemForm.register('language')} className="w-full p-2 border rounded">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fuso Horário</label>
                <select {...systemForm.register('timezone')} className="w-full p-2 border rounded">
                  <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Formato de Data</label>
                <select
                  {...systemForm.register('date_format')}
                  className="w-full p-2 border rounded"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Moeda</label>
                <select {...systemForm.register('currency')} className="w-full p-2 border rounded">
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form
            onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Senha Atual</label>
                <input
                  {...securityForm.register('current_password')}
                  type="password"
                  className="w-full p-2 border rounded"
                />
                {securityForm.formState.errors.current_password && (
                  <p className="text-red-500 text-sm">
                    {securityForm.formState.errors.current_password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nova Senha</label>
                <input
                  {...securityForm.register('new_password')}
                  type="password"
                  className="w-full p-2 border rounded"
                />
                {securityForm.formState.errors.new_password && (
                  <p className="text-red-500 text-sm">
                    {securityForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
                <input
                  {...securityForm.register('confirm_password')}
                  type="password"
                  className="w-full p-2 border rounded"
                />
                {securityForm.formState.errors.confirm_password && (
                  <p className="text-red-500 text-sm">
                    {securityForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Sessões Ativas</h2>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <p className="text-sm">{session.user_agent}</p>
                    <p className="text-xs text-gray-500">
                      IP: {session.ip_address} | Criado:{' '}
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-green-500 text-sm">Ativa</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
