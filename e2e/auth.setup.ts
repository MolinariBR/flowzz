import { expect, test as setup } from '@playwright/test'
import path from 'path'

/**
 * Setup global de autenticação
 * Cria session files para demo@flowzz.com.br e admin@flowzz.com.br
 *
 * Executado ANTES de todos os testes E2E
 * Sessões são reutilizadas em todos os projetos
 */

const DEMO_USER_FILE = path.join(__dirname, '.auth/demo-user.json')
const ADMIN_USER_FILE = path.join(__dirname, '.auth/admin-user.json')

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'

/**
 * Setup para usuário demo (flow frontend)
 */
setup('authenticate demo user', async ({ request }) => {
  // Login via API
  const response = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
    data: {
      email: 'demo@flowzz.com.br',
      password: 'Demo@123',
    },
  })

  expect(response.ok()).toBeTruthy()

  const responseData = await response.json()
  // ✅ Formato correto: { data: { user, tokens }, message }
  expect(responseData).toHaveProperty('data')
  expect(responseData.data).toHaveProperty('tokens')
  expect(responseData.data).toHaveProperty('user')

  const { tokens, user } = responseData.data

  // Salvar tokens em storage state
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:3000', // Flow app port (CORREÇÃO: era 3001)
        localStorage: [
          {
            name: 'accessToken',
            value: tokens.accessToken,
          },
          {
            name: 'refreshToken',
            value: tokens.refreshToken,
          },
          {
            name: 'user',
            value: JSON.stringify(user),
          },
        ],
      },
    ],
  }

  // Escrever arquivo de sessão
  const fs = await import('fs/promises')
  await fs.mkdir(path.dirname(DEMO_USER_FILE), { recursive: true })
  await fs.writeFile(DEMO_USER_FILE, JSON.stringify(storageState, null, 2))

  console.log('✅ Demo user authenticated and session saved')
})

/**
 * Setup para usuário admin (admin panel)
 */
setup('authenticate admin user', async ({ request }) => {
  // Login via API
  const response = await request.post(`${BACKEND_URL}/api/v1/auth/login`, {
    data: {
      email: 'admin@flowzz.com.br',
      password: 'Admin@123',
    },
  })

  expect(response.ok()).toBeTruthy()

  const responseData = await response.json()
  // ✅ Formato correto: { data: { user, tokens }, message }
  expect(responseData).toHaveProperty('data')
  expect(responseData.data).toHaveProperty('tokens')
  expect(responseData.data).toHaveProperty('user')

  const { tokens, user } = responseData.data

  // Salvar tokens em storage state
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:4174',
        localStorage: [
          {
            name: 'access_token',
            value: tokens.accessToken,
          },
          {
            name: 'refresh_token',
            value: tokens.refreshToken,
          },
          {
            name: 'user',
            value: JSON.stringify(user),
          },
          {
            name: 'admin-auth-storage',
            value: JSON.stringify({
              state: {
                user: {
                  id: user.id,
                  name: user.nome,
                  email: user.email,
                  role: user.role,
                  avatar: user.avatar_url || undefined,
                },
                token: tokens.accessToken,
                role: user.role,
                isAuthenticated: true,
                hydrated: true, // FIX: Adicionar hydrated = true
              },
              version: 0,
            }),
          },
        ],
      },
    ],
  }

  // Escrever arquivo de sessão
  const fs = await import('fs/promises')
  await fs.mkdir(path.dirname(ADMIN_USER_FILE), { recursive: true })
  await fs.writeFile(ADMIN_USER_FILE, JSON.stringify(storageState, null, 2))

  console.log('✅ Admin user authenticated and session saved')
})

/**
 * Setup para criar clientes de teste
 * Executado após autenticação
 * Cria alguns clientes de teste para que os testes E2E tenham dados
 */
setup('criar clientes de teste', async ({ request }) => {
  try {
    // Obter token do arquivo de autenticação
    const fs = await import('node:fs/promises')
    const path_module = await import('node:path')
    const authFile = path_module.join(__dirname, '.auth/demo-user.json')

    const authData = await fs.readFile(authFile, 'utf-8')
    const { origins } = JSON.parse(authData)
    const localStorage = origins[0]?.localStorage

    const accessTokenObj = localStorage?.find(
      (item: { name: string; value: string }) => item.name === 'accessToken'
    )
    const token = accessTokenObj?.value

    if (!token) {
      console.warn('⚠️ Token não encontrado, pulando criação de clientes de teste')
      return
    }

    // Criar alguns clientes de teste
    const testClients = [
      {
        name: 'Cliente Teste 1',
        email: 'cliente1@teste.com',
        phone: '(11) 99999-9999',
        cpf: '123.456.789-00',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        cep: '01310-100',
        status: 'ACTIVE',
      },
      {
        name: 'Cliente Teste 2',
        email: 'cliente2@teste.com',
        phone: '(11) 98888-8888',
        cpf: '987.654.321-00',
        address: 'Avenida Teste, 456',
        city: 'São Paulo',
        state: 'SP',
        cep: '01310-200',
        status: 'ACTIVE',
      },
      {
        name: 'Cliente Teste 3',
        email: 'cliente3@teste.com',
        phone: '(11) 97777-7777',
        cpf: '456.789.123-00',
        address: 'Avenida Paulista, 789',
        city: 'São Paulo',
        state: 'SP',
        cep: '01311-100',
        status: 'INACTIVE',
      },
    ]

    console.log('📝 Criando clientes de teste...')

    for (const client of testClients) {
      try {
        const response = await request.post(`${BACKEND_URL}/api/v1/clients`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          data: client,
        })

        if (response.ok()) {
          const data = await response.json()
          console.log(`✅ Cliente criado: ${client.name} (${data.data?.id})`)
        } else {
          const error = await response.json()
          console.warn(`⚠️ Erro ao criar cliente ${client.name}:`, error)
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao criar cliente ${client.name}:`, error)
      }
    }

    console.log('✅ Setup de clientes de teste concluído')
  } catch (error) {
    console.warn('⚠️ Erro no setup de clientes:', error)
  }
})
