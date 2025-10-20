import { motion } from 'framer-motion'
import {
  BarChart3,
  CreditCard,
  Facebook,
  MessageCircleDashed as MessageCircle,
  Smartphone,
  Zap,
} from 'lucide-react'

const Integrations = () => {
  const integrations = [
    {
      icon: MessageCircle,
      name: 'WhatsApp',
      description: 'Notificações automáticas de cobrança',
    },
    {
      icon: Facebook,
      name: 'Facebook Ads',
      description: 'Análise completa de ROI e métricas',
    },
    {
      icon: Smartphone,
      name: 'Coinzz',
      description: 'Gestão de pagamentos e recebíveis',
    },
    {
      icon: CreditCard,
      name: 'Gateways',
      description: 'Múltiplas formas de recebimento',
    },
    {
      icon: BarChart3,
      name: 'Analytics',
      description: 'Relatórios detalhados de performance',
    },
    {
      icon: Zap,
      name: 'Automações',
      description: 'Fluxos automatizados de cobrança',
    },
  ]

  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-tight">
            <span className="font-medium text-indigo-400">Integrações</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
            Conecte todas as suas ferramentas favoritas em um só lugar. Integrações simples e
            diretas para otimizar seu trabalho.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center hover:border-gray-700 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <integration.icon className="w-6 h-6 text-gray-300" />
              </div>

              <h3 className="text-lg font-medium text-white mb-2">{integration.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{integration.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Integrations
