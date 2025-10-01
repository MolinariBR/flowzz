// Referência: design.md §Admin Authentication, user-stories.md Story 7.1
'use client'

import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, Input } from '@heroui/react'
import { EyeFilledIcon, EyeSlashFilledIcon } from '@heroui/shared-icons'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { LoginCredentials } from '@/types/admin'

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [isVisible, setIsVisible] = useState(false)
  
  const { login, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await login(credentials)
      onSuccess?.()
    } catch {
      // Erro já tratado pelo store
    }
  }

  const handleInputChange = (field: keyof LoginCredentials) => (value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    if (error) clearError()
  }

  const toggleVisibility = () => setIsVisible(!isVisible)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="flex flex-col gap-2 px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">FlowZZ Admin</h1>
            <p className="text-sm text-gray-600 mt-2">
              Acesse o painel administrativo
            </p>
          </div>
        </CardHeader>
        
        <CardBody className="px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="admin@flowzz.com.br"
              value={credentials.email}
              onValueChange={handleInputChange('email')}
              isRequired
              isInvalid={!!error}
              className="w-full"
              classNames={{
                input: "text-gray-900 bg-white",
                inputWrapper: "bg-white border border-gray-300 hover:border-blue-500",
                label: "text-gray-700"
              }}
            />
            
            <Input
              label="Senha"
              placeholder="Sua senha"
              value={credentials.password}
              onValueChange={handleInputChange('password')}
              isRequired
              isInvalid={!!error}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-gray-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-gray-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              className="w-full"
              classNames={{
                input: "text-gray-900 bg-white",
                inputWrapper: "bg-white border border-gray-300 hover:border-blue-500",
                label: "text-gray-700"
              }}
            />
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              isLoading={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              <strong>Credenciais de teste:</strong><br />
              Email: admin@flowzz.com.br<br />
              Senha: admin123456
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}