'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Filter,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useState } from 'react'
import { useAuth } from '../../lib/contexts/AuthContext'
import { useClients } from '../../lib/hooks/useClients'

// Tipo para a interface da página (UI)
interface UIClient {
  id: string
  name: string
  phone: string
  email: string
  value: number
  status: string
  deliveryDate: string
  tags: string[]
  avatar: string
  lastContact: string
  orders: number
}

interface UITag {
  id: string
  name: string
  color: string
  count: number
}

const TagModal = ({
  showTagModal,
  setShowTagModal,
  isAuthenticated,
}: {
  showTagModal: boolean
  setShowTagModal: (show: boolean) => void
  isAuthenticated: boolean
}) => {
  const tagNameId = useId()
  const [tagName, setTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState('bg-blue-500')
  const [editingTag, setEditingTag] = useState<UITag | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hook para operações de tags
  const { tags, createNewTag, updateExistingTag, removeTag } = useClients(isAuthenticated)

  const colorOptions = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ]

  const handleCreateTag = async () => {
    if (!tagName.trim()) return

    setIsSubmitting(true)
    try {
      await createNewTag({
        name: tagName.trim(),
        color: selectedColor,
      })
      setTagName('')
      setSelectedColor('bg-blue-500')
    } catch (error) {
      console.error('Erro ao criar tag:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTag = (tag: UITag) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setSelectedColor(tag.color)
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !tagName.trim()) return

    setIsSubmitting(true)
    try {
      await updateExistingTag(editingTag.id, {
        name: tagName.trim(),
        color: selectedColor,
      })
      setEditingTag(null)
      setTagName('')
      setSelectedColor('bg-blue-500')
    } catch (error) {
      console.error('Erro ao atualizar tag:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta etiqueta?')) return

    try {
      await removeTag(tagId)
    } catch (error) {
      console.error('Erro ao excluir tag:', error)
    }
  }

  const handleCancel = () => {
    setEditingTag(null)
    setTagName('')
    setSelectedColor('bg-blue-500')
  }

  return (
    <AnimatePresence>
      {showTagModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowTagModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Gerenciar Etiquetas</h3>
              <button
                type="button"
                onClick={() => setShowTagModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulário de criação/edição */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-slate-900 mb-4">
                {editingTag ? 'Editar Etiqueta' : 'Nova Etiqueta'}
              </h4>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={tagNameId}
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Nome da Etiqueta
                  </label>
                  <input
                    id={tagNameId}
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Ex: Cliente VIP"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-slate-700 mb-2">Cor</p>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full ${color} hover:scale-110 transition-transform ${
                          selectedColor === color ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  {editingTag && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={editingTag ? handleUpdateTag : handleCreateTag}
                    disabled={!tagName.trim() || isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : editingTag ? (
                      'Atualizar'
                    ) : (
                      'Criar Etiqueta'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de tags existentes */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-4">Etiquetas Existentes</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tags.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nenhuma etiqueta criada ainda.
                  </p>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${tag.color}`} />
                        <span className="text-sm font-medium text-slate-900">{tag.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEditTag({
                              id: tag.id,
                              name: tag.name,
                              color: tag.color,
                              count: 0,
                            })
                          }
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const CreateClientModal = ({
  showCreateModal,
  setShowCreateModal,
  onCreateClient,
}: {
  showCreateModal: boolean
  setShowCreateModal: (show: boolean) => void
  onCreateClient: (data: any) => Promise<void>
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    state: '',
    cep: '',
    status: 'ACTIVE' as const,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onCreateClient(formData)
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        address: '',
        city: '',
        state: '',
        cep: '',
        status: 'ACTIVE',
      })
      setShowCreateModal(false)
    } catch (_error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <AnimatePresence>
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Novo Cliente</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CEP</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Criando...</span>
                    </div>
                  ) : (
                    'Criar Cliente'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const EditClientModal = ({
  showEditModal,
  setShowEditModal,
  editingClient,
  onUpdateClient,
}: {
  showEditModal: boolean
  setShowEditModal: (show: boolean) => void
  editingClient: any
  onUpdateClient: (id: string, data: any) => Promise<void>
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    state: '',
    cep: '',
    status: 'ACTIVE' as const,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Preencher formulário quando o cliente muda
  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name || '',
        email: editingClient.email || '',
        phone: editingClient.phone || '',
        cpf: editingClient.cpf || '',
        address: editingClient.address || '',
        city: editingClient.city || '',
        state: editingClient.state || '',
        cep: editingClient.cep || '',
        status: editingClient.status || 'ACTIVE',
      })
    }
  }, [editingClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return

    setIsSubmitting(true)

    try {
      await onUpdateClient(editingClient.id, formData)
      setShowEditModal(false)
    } catch (_error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <AnimatePresence>
      {showEditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Editar Cliente</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CEP</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Atualizando...</span>
                    </div>
                  ) : (
                    'Atualizar Cliente'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const DeleteClientModal = ({
  showDeleteModal,
  setShowDeleteModal,
  deletingClient,
  onConfirmDelete,
}: {
  showDeleteModal: boolean
  setShowDeleteModal: (show: boolean) => void
  deletingClient: UIClient | null
  onConfirmDelete: () => Promise<void>
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirmDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Excluir Cliente</h3>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Tem certeza que deseja excluir este cliente?
                  </p>
                  <p className="text-sm text-red-600 mt-1">Esta ação não pode ser desfeita.</p>
                </div>
              </div>

              {deletingClient && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={deletingClient.avatar}
                      alt={deletingClient.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{deletingClient.name}</p>
                      <p className="text-sm text-slate-600">{deletingClient.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir Cliente</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingClient, setEditingClient] = useState<UIClient | null>(null)
  const [deletingClient, setDeletingClient] = useState<UIClient | null>(null)
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  // Verificar autenticação
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const _router = useRouter()

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    console.log('Auth check:', { isAuthenticated, authLoading })
    if (!authLoading && !isAuthenticated) {
      console.log('Redirecting to login...')
      // Forçar redirecionamento completo
      window.location.href = '/login'
    }
  }, [isAuthenticated, authLoading])

  // Hook para dados dos clientes
  const {
    isLoading,
    clients: backendClients,
    tags,
    pagination,
    updateFilters,
    clearFilters,
    createNewClient,
    updateExistingClient,
    removeClient,
    addTagToExistingClient,
    removeTagFromExistingClient,
  } = useClients(isAuthenticated)

  // Converter tags do backend para formato da UI
  const uiTags: UITag[] = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    count: 0, // TODO: calcular contagem real
  }))

  // Função para aplicar filtros
  const _applyFilters = useCallback(() => {
    const filters = {
      search: searchTerm || undefined,
      status: selectedFilter !== 'todos' ? (selectedFilter.toUpperCase() as any) : undefined,
    }
    updateFilters(filters)
  }, [searchTerm, selectedFilter, updateFilters])

  // Função para criar cliente
  const handleCreateClient = async (data: any) => {
    await createNewClient(data)
  }

  // Função para editar cliente
  const handleEditClient = (client: UIClient) => {
    setEditingClient(client)
    setShowEditModal(true)
  }

  // Função para atualizar cliente
  const handleUpdateClient = async (id: string, data: any) => {
    await updateExistingClient(id, data)
  }

  // Função para excluir cliente
  const handleDeleteClient = (client: UIClient) => {
    setDeletingClient(client)
    setShowDeleteModal(true)
  }

  // Função para confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!deletingClient) return

    try {
      await removeClient(deletingClient.id)
      setShowDeleteModal(false)
      setDeletingClient(null)
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
    }
  }

  // Função para adicionar tag ao cliente
  const handleAddTagToClient = async (clientId: string) => {
    const tagName = prompt('Digite o nome da tag para adicionar:')
    if (!tagName?.trim()) return

    const tag = uiTags.find((t) => t.name.toLowerCase() === tagName.trim().toLowerCase())
    if (!tag) {
      alert('Tag não encontrada. Crie a tag primeiro no modal de gerenciamento.')
      return
    }

    try {
      await addTagToExistingClient(clientId, tag.id)
    } catch (error) {
      console.error('Erro ao adicionar tag:', error)
    }
  }

  // Função para remover tag do cliente
  const handleRemoveTagFromClient = async (clientId: string, tagId: string) => {
    try {
      await removeTagFromExistingClient(clientId, tagId)
    } catch (error) {
      console.error('Erro ao remover tag:', error)
    }
  }

  // Função para mudar de página
  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage })
  }

  // Converter clientes do backend para formato da UI
  const clients: UIClient[] = backendClients.map((client) => ({
    id: client.id,
    name: client.name,
    phone: client.phone || '',
    email: client.email || '',
    value: Number(client.total_spent) || 0,
    status: client.status.toLowerCase(), // Converter ACTIVE -> active, etc.
    deliveryDate: client.last_order_at
      ? new Date(client.last_order_at).toISOString().split('T')[0]
      : '',
    tags: client.tags.map((ct) => ct.tag_id), // IDs das tags
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`,
    lastContact: client.last_order_at
      ? `${Math.floor((Date.now() - new Date(client.last_order_at).getTime()) / (1000 * 60 * 60 * 24))} dias atrás`
      : 'Nunca',
    orders: client.total_orders,
  }))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'entregue':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pendente':
        return <Clock className="h-4 w-4 text-amber-600" />
      case 'agendado':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'inadimplente':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregue':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-amber-100 text-amber-800'
      case 'agendado':
        return 'bg-blue-100 text-blue-800'
      case 'inadimplente':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSelectClient = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    )
  }

  return (
    <>
      {/* Verificar autenticação */}
      {authLoading ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Verificando autenticação...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Redirecionando para login...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
              <p className="text-slate-600 mt-1">Gerencie seus clientes com inteligência</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Upload className="h-4 w-4" />
                <span>Importar</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Cliente</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowTagModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  <Tag className="h-4 w-4" />
                  <span>Gerenciar Etiquetas</span>
                </button>
                {selectedClients.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">
                      {selectedClients.length} selecionados
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
                    >
                      Ações em lote
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSelectedFilter('todos')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === 'todos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todos ({clients.length})
              </button>
              {uiTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedFilter(tag.name.toLowerCase())}
                  className={`px-3 py-1 rounded-full text-sm font-medium text-white transition-colors ${tag.color} hover:opacity-80`}
                >
                  {tag.name} ({tag.count})
                </button>
              ))}
            </div>
          </div>

          {/* Clients Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
                      Contato
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
                      Valor Pedido
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
                      Etiquetas
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    // Skeleton loading rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 w-4 bg-slate-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-slate-200 rounded"></div>
                              <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="h-4 w-40 bg-slate-200 rounded"></div>
                            <div className="h-3 w-32 bg-slate-200 rounded"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-slate-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 bg-slate-200 rounded"></div>
                            <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-1">
                            <div className="h-5 w-12 bg-slate-200 rounded-full"></div>
                            <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <div className="h-8 w-8 bg-slate-200 rounded"></div>
                            <div className="h-8 w-8 bg-slate-200 rounded"></div>
                            <div className="h-8 w-8 bg-slate-200 rounded"></div>
                            <div className="h-8 w-8 bg-slate-200 rounded"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : clients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-slate-500">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">Nenhum cliente encontrado</p>
                          <p className="text-sm">Comece adicionando seu primeiro cliente.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(client.id)}
                            onChange={() => handleSelectClient(client.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Image
                              src={client.avatar}
                              alt={client.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-slate-900">{client.name}</p>
                              <p className="text-sm text-slate-600">{client.orders} pedidos</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-slate-900">{client.phone}</p>
                            <p className="text-sm text-slate-600">{client.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono font-semibold text-slate-900">
                            R$ {(client.value || 0).toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(client.status)}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}
                            >
                              {client.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 items-center">
                            {client.tags.map((tagId) => {
                              const tag = uiTags.find((t) => t.id === tagId)
                              return tag ? (
                                <button
                                  key={tagId}
                                  onClick={() => handleRemoveTagFromClient(client.id, tagId)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium text-white ${tag.color} hover:opacity-80 transition-opacity flex items-center space-x-1`}
                                  title={`Remover tag ${tag.name}`}
                                >
                                  <span>{tag.name}</span>
                                  <X className="h-3 w-3" />
                                </button>
                              ) : null
                            })}
                            <button
                              type="button"
                              onClick={() => handleAddTagToClient(client.id)}
                              className="px-2 py-1 rounded-full text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1"
                              title="Adicionar tag"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Tag</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ligar"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Agendar"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                              onClick={() => handleEditClient(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                              onClick={() => handleDeleteClient(client)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total} clientes
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {/* Renderizar páginas */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i
                    if (pageNum > pagination.totalPages) return null

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          pageNum === pagination.page
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          <TagModal
            showTagModal={showTagModal}
            setShowTagModal={setShowTagModal}
            isAuthenticated={isAuthenticated}
          />
          <CreateClientModal
            showCreateModal={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            onCreateClient={handleCreateClient}
          />
          <EditClientModal
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            editingClient={editingClient}
            onUpdateClient={handleUpdateClient}
          />
          <DeleteClientModal
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            deletingClient={deletingClient}
            onConfirmDelete={handleConfirmDelete}
          />
        </div>
      )}
    </>
  )
}
