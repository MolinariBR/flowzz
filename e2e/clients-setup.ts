import { test as setup } from '@playwright/test'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

/**
 * Setup para criar clientes de teste
 * Executado ANTES dos testes de clientes
 * Cria alguns clientes de teste para que os testes E2E tenham dados
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'

setup('criar clientes de teste', async ({ request }) => {
  // Obter token do arquivo de autenticação
  const authFile = path.join(__dirname, '.auth/demo-user.json')

  try {
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
