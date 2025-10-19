
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {BarChart3, CreditCard, Bell, FileText, ArrowRight, CheckCircle} from 'lucide-react'

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: BarChart3,
      title: "Análise Financeira Avançada",
      description: "Dashboard completo com métricas em tempo real, projeções de fluxo de caixa e relatórios personalizáveis.",
      details: [
        "Gráficos interativos e intuitivos",
        "Projeções de receita e despesas",
        "Análise de tendências automática",
        "Relatórios exportáveis"
      ],
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      icon: CreditCard,
      title: "Gestão de Pagamentos",
      description: "Controle total sobre recebimentos, cobranças automáticas e reconciliação bancária inteligente.",
      details: [
        "Cobrança automática via PIX",
        "Reconciliação bancária em tempo real",
        "Controle de inadimplência",
        "Links de pagamento personalizados"
      ],
      gradient: "from-green-600 to-emerald-600"
    },
    {
      icon: Bell,
      title: "Notificações Inteligentes",
      description: "Alertas personalizados para vencimentos, metas atingidas e oportunidades de otimização.",
      details: [
        "Alertas de vencimento automáticos",
        "Notificações de metas alcançadas",
        "Sugestões de otimização",
        "Relatórios periódicos por email"
      ],
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: FileText,
      title: "Relatórios Profissionais",
      description: "Documentos automatizados para contabilidade, investidores e tomada de decisões estratégicas.",
      details: [
        "DRE automatizada",
        "Relatórios para investidores",
        "Análise de margem por produto",
        "Exportação para Excel/PDF"
      ],
      gradient: "from-orange-600 to-red-600"
    }
  ]

  return (
    <section id="funcionalidades" className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 tracking-tight">
            Funcionalidades que{' '}
            <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              fazem a diferença
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Cada recurso foi pensado para simplificar sua rotina e maximizar seus resultados
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature List */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveFeature(index)}
                className={`cursor-pointer group ${
                  activeFeature === index ? 'scale-105' : ''
                } transition-all duration-300`}
              >
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                  activeFeature === index 
                    ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-600' 
                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${feature.gradient} ${
                      activeFeature === index ? 'scale-110' : ''
                    } transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                        activeFeature === index ? 'text-white' : 'text-gray-300'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors ${
                        activeFeature === index ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {feature.description}
                      </p>
                    </div>

                    <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                      activeFeature === index 
                        ? 'text-indigo-400 translate-x-1' 
                        : 'text-gray-600 group-hover:translate-x-1'
                    }`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Details */}
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${features[activeFeature].gradient} opacity-20 rounded-3xl blur-3xl`}></div>
            
            {/* Content Card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${features[activeFeature].gradient}`}>
                  {React.createElement(features[activeFeature].icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  {features[activeFeature].title}
                </h3>
              </div>

              <p className="text-gray-300 mb-8 leading-relaxed">
                {features[activeFeature].description}
              </p>

              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-4">Principais recursos:</h4>
                {features[activeFeature].details.map((detail, index) => (
                  <motion.div
                    key={detail}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{detail}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`mt-8 w-full bg-gradient-to-r ${features[activeFeature].gradient} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
              >
                Explorar Recurso
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Features
