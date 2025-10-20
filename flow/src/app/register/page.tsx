// Página de Registro - Flow
// Padrão: Next.js 14 App Router, Tailwind CSS, Framer Motion, Lucide React

'use client'

import { motion } from 'framer-motion'
import { Check, Eye, EyeOff, Lock, Mail, User, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import toast from 'react-hot-toast'
import { register } from '@/lib/api/auth'

export default function RegisterPage() {
  const router = useRouter()
  const nomeId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()
  const termsId = useId()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validações
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres')
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      toast.error('Você precisa aceitar os termos de uso')
      setIsLoading(false)
      return
    }

    try {
      await register({
        nome: formData.nome,
        email: formData.email,
        password: formData.password,
      })

      toast.success('Cadastro realizado com sucesso! 🎉')

      // Redirecionar para dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 mb-4 shadow-lg"
          >
            <Zap className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            FLOWZZ
          </h1>
          <p className="text-slate-600 mt-2">Crie sua conta e comece seu trial grátis</p>
        </div>

        {/* Trial Benefits */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">7 dias grátis</h3>
              <p className="text-xs text-slate-600 mt-1">
                Acesso completo a todas as funcionalidades sem compromisso
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Nome */}
          <div>
            <label htmlFor={nomeId} className="block text-sm font-medium text-slate-700 mb-2">
              Nome completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id={nomeId}
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="Seu nome"
                minLength={3}
              />
            </div>
          </div>

          {/* Campo Email */}
          <div>
            <label htmlFor={emailId} className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id={emailId}
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label htmlFor={passwordId} className="block text-sm font-medium text-slate-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id={passwordId}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Mínimo de 8 caracteres</p>
          </div>

          {/* Campo Confirmar Senha */}
          <div>
            <label
              htmlFor={confirmPasswordId}
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Confirmar senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id={confirmPasswordId}
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Checkbox Termos */}
          <div className="flex items-start space-x-3">
            <input
              id={termsId}
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <label htmlFor={termsId} className="text-sm text-slate-600">
              Eu aceito os{' '}
              <a
                href="/termos"
                target="_blank"
                className="text-indigo-600 font-medium hover:underline"
                rel="noopener"
              >
                termos de uso
              </a>{' '}
              e{' '}
              <a
                href="/privacidade"
                target="_blank"
                className="text-indigo-600 font-medium hover:underline"
                rel="noopener"
              >
                política de privacidade
              </a>
            </label>
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Criando conta...' : 'Começar trial grátis'}
          </button>

          {/* Link Login */}
          <div className="text-center pt-4">
            <p className="text-sm text-slate-600">
              Já tem uma conta?{' '}
              <a
                href="/login"
                className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
              >
                Fazer login
              </a>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
