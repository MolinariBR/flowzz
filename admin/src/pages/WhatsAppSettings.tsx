import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Eye, EyeOff, MessageSquare, Save, TestTube } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

const whatsappConfigSchema = z.object({
  businessAccountId: z.string().min(1, 'Business Account ID é obrigatório'),
  phoneNumberId: z.string().min(1, 'Phone Number ID é obrigatório'),
  accessToken: z.string().min(1, 'Access Token é obrigatório'),
  appSecret: z.string().min(1, 'App Secret é obrigatório'),
  webhookVerifyToken: z.string().min(1, 'Webhook Verify Token é obrigatório'),
})

type WhatsAppConfigForm = z.infer<typeof whatsappConfigSchema>

export const WhatsAppSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showTokens, setShowTokens] = useState(false)

  const businessAccountId = useId()
  const phoneNumberId = useId()
  const accessTokenId = useId()
  const appSecretId = useId()
  const webhookVerifyTokenId = useId()
  const [currentConfig, setCurrentConfig] = useState<WhatsAppConfigForm | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WhatsAppConfigForm>({
    resolver: zodResolver(whatsappConfigSchema),
  })

  const loadCurrentConfig = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/whatsapp/config')
      if (response.data) {
        setCurrentConfig(response.data)
        reset(response.data)
      }
    } catch {
      console.log('Nenhuma configuração existente encontrada')
    }
  }, [reset])

  // Carregar configuração atual
  useEffect(() => {
    loadCurrentConfig()
  }, [loadCurrentConfig])

  const onSubmit = async (data: WhatsAppConfigForm) => {
    setIsLoading(true)
    try {
      await axios.post('/api/admin/whatsapp/config', data)
      toast.success('Configuração WhatsApp salva com sucesso!')
      setCurrentConfig(data)
    } catch {
      toast.error('Erro ao salvar configuração')
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setIsTesting(true)
    try {
      const response = await axios.post('/api/admin/whatsapp/test-connection')
      if (response.data.success) {
        toast.success('Conexão com WhatsApp testada com sucesso!')
      } else {
        toast.error(`Falha na conexão: ${response.data.message}`)
      }
    } catch {
      toast.error('Erro ao testar conexão')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-green-600" />
            Configurações WhatsApp Business
          </h1>
          <p className="text-gray-600 mt-1">
            Configure as credenciais da sua conta WhatsApp Business API
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowTokens(!showTokens)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showTokens ? 'Ocultar' : 'Mostrar'} Tokens
          </button>
          {currentConfig && (
            <button
              type="button"
              onClick={testConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <TestTube className="h-4 w-4" />
              {isTesting ? 'Testando...' : 'Testar Conexão'}
            </button>
          )}
        </div>
      </div>

      {/* Status Card */}
      {currentConfig && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">WhatsApp Configurado</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Business Account ID: {currentConfig.businessAccountId}
          </p>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Credenciais da API</h2>
          <p className="text-sm text-gray-600 mt-1">
            Insira as credenciais obtidas do Facebook Developers Console
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Account ID */}
            <div>
              <label
                htmlFor={businessAccountId}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Account ID *
              </label>
              <input
                {...register('businessAccountId')}
                id={businessAccountId}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1234567890123456"
              />
              {errors.businessAccountId && (
                <p className="text-red-500 text-sm mt-1">{errors.businessAccountId.message}</p>
              )}
            </div>

            {/* Phone Number ID */}
            <div>
              <label
                htmlFor={phoneNumberId}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number ID *
              </label>
              <input
                {...register('phoneNumberId')}
                id={phoneNumberId}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="9876543210987654"
              />
              {errors.phoneNumberId && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNumberId.message}</p>
              )}
            </div>

            {/* Access Token */}
            <div className="md:col-span-2">
              <label
                htmlFor={accessTokenId}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Access Token *
              </label>
              <input
                {...register('accessToken')}
                id={accessTokenId}
                type={showTokens ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                placeholder="EAA..."
              />
              {errors.accessToken && (
                <p className="text-red-500 text-sm mt-1">{errors.accessToken.message}</p>
              )}
            </div>

            {/* App Secret */}
            <div>
              <label htmlFor={appSecretId} className="block text-sm font-medium text-gray-700 mb-2">
                App Secret *
              </label>
              <input
                {...register('appSecret')}
                id={appSecretId}
                type={showTokens ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                placeholder="seu_app_secret_aqui"
              />
              {errors.appSecret && (
                <p className="text-red-500 text-sm mt-1">{errors.appSecret.message}</p>
              )}
            </div>

            {/* Webhook Verify Token */}
            <div>
              <label
                htmlFor={webhookVerifyTokenId}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Webhook Verify Token *
              </label>
              <input
                {...register('webhookVerifyToken')}
                id={webhookVerifyTokenId}
                type={showTokens ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                placeholder="seu_verify_token_aqui"
              />
              {errors.webhookVerifyToken && (
                <p className="text-red-500 text-sm mt-1">{errors.webhookVerifyToken.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar Configuração'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Como obter as credenciais:</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>
            Acesse o{' '}
            <a
              href="https://developers.facebook.com"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook Developers Console
            </a>
          </li>
          <li>Crie ou selecione seu aplicativo WhatsApp Business</li>
          <li>Vá para "WhatsApp" → "API Setup" para obter Business Account ID e Phone Number ID</li>
          <li>Gere o Access Token em "Access Tokens"</li>
          <li>Configure o Webhook URL e obtenha o Verify Token</li>
        </ol>
      </div>
    </div>
  )
}
