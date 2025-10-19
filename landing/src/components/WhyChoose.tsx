
import React from 'react'
import { motion } from 'framer-motion'
import {Target, TrendingUp, Shield} from 'lucide-react'

const WhyChoose = () => {
  const reasons = [
    {
      icon: Target,
      title: "Otimização de Lucros",
      description: "A Flowzz foi criada para maximizar seus resultados através de análises precisas e automação inteligente."
    },
    {
      icon: TrendingUp,
      title: "Profissionalização",
      description: "Transforme sua operação com relatórios profissionais e controle total sobre sua contabilidade."
    },
    {
      icon: Shield,
      title: "Crescimento Seguro",
      description: "Prepare seu negócio para escalar com dados confiáveis e projeções precisas de fluxo de caixa."
    }
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
            Porque você escolhe a{' '}
            <span className="font-medium text-indigo-400">Flowzz</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
            Porque a Flowzz foi criada para otimizar seus lucros, profissionalizar sua contabilidade 
            e preparar seu negócio para crescer de verdade
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-gray-900/30 border border-gray-800 rounded-lg p-8 text-center hover:border-gray-700 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-6">
                <reason.icon className="w-6 h-6 text-gray-300" />
              </div>
              
              <h3 className="text-lg font-medium text-white mb-4">{reason.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChoose
