// Página de Login - Flow
// Padrão: Next.js 14 App Router, Tailwind CSS, Framer Motion, Lucide React

'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login({ email, password })
      toast.success('Login realizado com sucesso!')

      // Redirecionar para dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email ou senha incorretos'
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
          <p className="text-slate-600 mt-2">Faça login para continuar</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
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
          </div>

          {/* Link Esqueci Senha */}
          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Esqueceu sua senha?
            </a>
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500">Novo por aqui?</span>
            </div>
          </div>

          {/* Link Registro */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Não tem uma conta?{' '}
              <a
                href="/register"
                className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
              >
                Comece seu trial grátis
              </a>
            </p>
          </div>
        </form>

        {/* Info Trial */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            🎉 <strong className="text-indigo-600">7 dias grátis</strong> para testar todas as
            funcionalidades
          </p>
        </div>
      </motion.div>
    </div>
  )
}
