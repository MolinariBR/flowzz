'use client'

import {
  Book,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Play,
  Search,
  Star,
} from 'lucide-react'
import { useId, useState } from 'react'

export default function Ajuda() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('geral')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Generate unique IDs
  const searchInputId = useId()

  const categories = [
    { id: 'geral', name: 'Geral', icon: HelpCircle },
    { id: 'integracao', name: 'Integrações', icon: FileText },
    { id: 'relatorios', name: 'Relatórios', icon: Book },
    { id: 'faturamento', name: 'Faturamento', icon: Star },
    { id: 'suporte', name: 'Suporte', icon: MessageCircle },
  ]

  const faqData = [
    {
      id: 1,
      category: 'geral',
      question: 'Como começar a usar o FLOWZZ?',
      answer:
        'Para começar, faça login na sua conta e conecte suas primeiras integrações. Recomendamos começar com Facebook Ads e sua conta bancária para ter uma visão completa das suas finanças.',
    },
    {
      id: 2,
      category: 'geral',
      question: 'Quais integrações estão disponíveis?',
      answer:
        'Oferecemos integrações com Facebook Ads, Google Ads, Hotmart, Monetizze, bancos brasileiros, WhatsApp Business, e muito mais. Veja a lista completa na seção de Integrações.',
    },
    {
      id: 3,
      category: 'integracao',
      question: 'Como conectar minha conta do Facebook Ads?',
      answer:
        'Para conectar sua conta do Facebook Ads, vá para a seção de Integrações e clique em "Conectar Facebook Ads". Você será redirecionado para o Facebook onde poderá autorizar o acesso.',
    },
    {
      id: 4,
      category: 'relatorios',
      question: 'Como gerar relatórios personalizados?',
      answer:
        'Na seção de Relatórios, você pode criar relatórios personalizados selecionando as métricas, período e filtros específicos para sua análise.',
    },
    {
      id: 5,
      category: 'faturamento',
      question: 'Como alterar meu plano?',
      answer:
        'Para alterar seu plano, vá para Configurações > Plano e Faturamento. Lá você poderá ver os planos disponíveis e fazer a alteração conforme sua necessidade.',
    },
    {
      id: 6,
      category: 'suporte',
      question: 'Como entro em contato com o suporte?',
      answer:
        'Você pode entrar em contato conosco através do chat de suporte disponível no aplicativo, por email (suporte@flowzz.com.br) ou telefone. Nossa equipe está disponível para ajudar.',
    },
    {
      id: 7,
      category: 'integracao',
      question: 'Como conectar minha conta bancária?',
      answer:
        'Na seção de Integrações, selecione "Bancos" e escolha sua instituição financeira. Você será redirecionado para fazer a conexão segura através do Open Banking.',
    },
    {
      id: 8,
      category: 'relatorios',
      question: 'Posso agendar relatórios automáticos?',
      answer:
        'Sim! Nos relatórios personalizados, você pode configurar agendamentos para receber relatórios automaticamente por email em intervalos diários, semanais ou mensais.',
    },
  ]

  const filteredFaq = faqData.filter((faq) => {
    const matchesCategory = activeCategory === 'geral' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Central de Ajuda</h1>
            <p className="text-slate-600">Encontre respostas para suas dúvidas sobre o FLOWZZ</p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id={searchInputId}
                type="text"
                placeholder="Buscar ajuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-slate-900 mb-4">Categorias</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeCategory === category.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Perguntas Frequentes</h2>

                <div className="space-y-4">
                  {filteredFaq.map((faq) => (
                    <div key={faq.id} className="border border-slate-200 rounded-lg">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-medium text-slate-900">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4">
                          <p className="text-slate-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredFaq.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhuma pergunta encontrada para sua busca.</p>
                  </div>
                )}
              </div>

              {/* Contact Support */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Não encontrou o que procurava?</h3>
                <p className="text-slate-600 mb-4">
                  Nossa equipe de suporte está pronta para ajudar. Entre em contato conosco através dos canais abaixo.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">Chat de Suporte</p>
                      <p className="text-slate-600 text-sm">Disponível 24/7 no aplicativo</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-900">Email</p>
                      <p className="text-slate-600 text-sm">suporte@flowzz.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-slate-900">Telefone</p>
                      <p className="text-slate-600 text-sm">(11) 9999-9999</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Recursos Adicionais</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <Play className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="font-medium text-slate-900">Vídeos Tutoriais</p>
                      <p className="text-slate-600 text-sm">Assista aos nossos tutoriais em vídeo</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">Documentação Técnica</p>
                      <p className="text-slate-600 text-sm">Documentação completa da API e integrações</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-white rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <Download className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-900">Manual do Usuário</p>
                      <p className="text-slate-600 text-sm">Download do manual completo (PDF)</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
