import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api/client'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string
  cpf: string
  address: string
  city: string
  state: string
  cep: string
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/integrations/coinzz/clients')
        setClients(response.data)
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar clientes.')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (loading) {
    return <div>Carregando clientes...</div>
  }

  if (error) {
    return <div>Erro: {error}</div>
  }

  return (
    <div>
      <h1>Clientes</h1>
      {clients.length === 0 ? (
        <p>Nenhum cliente encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>CPF</th>
              <th>Endereço</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>CEP</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.email || 'N/A'}</td>
                <td>{client.phone}</td>
                <td>{client.cpf}</td>
                <td>{client.address}</td>
                <td>{client.city}</td>
                <td>{client.state}</td>
                <td>{client.cep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ClientsPage
