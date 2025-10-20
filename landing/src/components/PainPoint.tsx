import { motion } from 'framer-motion'
import { AlertTriangle, Calculator, Clock, TrendingDown } from 'lucide-react'

const PainPoint = () => {
  const painPoints = [
    {
      icon: Calculator,
      title: 'Planilhas Confusas',
      description:
        'Cálculos manuais que nunca batem e geram incerteza sobre a real situação financeira.',
    },
    {
      icon: Clock,
      title: 'Timing de Cobrança',
      description:
        'Perde o momento ideal de cobrar e deixa dinheiro na mesa por falta de controle.',
    },
    {
      icon: TrendingDown,
      title: 'Escalabilidade Limitada',
      description: 'Incerteza sobre quando reinvestir sem comprometer o fluxo de caixa.',
    },
    {
      icon: AlertTriangle,
      title: 'Custos Ocultos',
      description:
        'Visão distorcida do lucro real por não contabilizar todos os custos operacionais.',
    },
  ]

  return (
    <section className="py-20 px-6 lg:px-8 bg-gray-950/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-tight">
            Chega de quebrar a cabeça com{' '}
            <span className="font-medium text-red-400">planilhas</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
            Veja seus lucros de forma simples e profissional. Diga adeus à confusão financeira.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {painPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <point.icon className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-3">{point.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white text-black px-8 py-4 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Eu quero!
          </motion.button>
          <p className="text-gray-500 mt-4">Diga adeus à confusão financeira.</p>
        </motion.div>
      </div>
    </section>
  )
}

export default PainPoint
