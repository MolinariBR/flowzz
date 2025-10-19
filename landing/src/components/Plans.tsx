
import React from 'react'
import { motion } from 'framer-motion'
import {Check, Star, Zap, Crown} from 'lucide-react'

const Plans = () => {
  const plans = [
    {
      name: "Básico",
      price: "R$ 59,90",
      period: "/mês",
      description: "Ideal para pequenos negócios que estão começando",
      icon: Zap,
      features: [
        "Teste grátis de 7 dias",
        "Até 100 vendas por mês",
        "Dashboard básico",
        "Relatórios mensais",
        "Suporte por email",
        "Integração com 2 plataformas"
      ],
      popular: false,
      gradient: "from-gray-700 to-gray-800",
      buttonGradient: "from-gray-600 to-gray-700",
      hoverGradient: "from-gray-500 to-gray-600"
    },
    {
      name: "Pro",
      price: "R$ 99,90",
      period: "/mês",
      description: "Perfeito para empresas em crescimento",
      icon: Star,
      features: [
        "Até 500 vendas por mês",
        "Dashboard avançado",
        "Relatórios semanais",
        "Suporte prioritário",
        "Integração com 5 plataformas",
        "Automação de cobrança",
        "Análise de inadimplência"
      ],
      popular: true,
      gradient: "from-indigo-900 to-purple-900",
      buttonGradient: "from-indigo-600 via-purple-600 to-indigo-700",
      hoverGradient: "from-indigo-500 via-purple-500 to-indigo-600"
    },
    {
      name: "Premium",
      price: "R$ 109,90",
      period: "/mês",
      description: "Solução completa para grandes empresas",
      icon: Crown,
      features: [
        "Vendas ilimitadas",
        "Dashboard personalizado",
        "Relatórios em tempo real",
        "Suporte 24/7",
        "Integrações ilimitadas",
        "Automação completa",
        "Consultoria dedicada",
        "API personalizada"
      ],
      popular: false,
      gradient: "from-amber-900 to-orange-900",
      buttonGradient: "from-amber-600 to-orange-600",
      hoverGradient: "from-amber-500 to-orange-500"
    }
  ]

  return (
    <section id="planos" className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-800/30 text-indigo-300 text-sm font-medium mb-6"
          >
            💎 Planos e Preços
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">
            Escolha o plano ideal para{' '}
            <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              seu negócio
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Todos os planos incluem nossa tecnologia de ponta para gestão de vendas e cobrança inteligente
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative bg-gradient-to-br ${plan.gradient} border border-gray-700 rounded-2xl p-8 shadow-2xl ${
                  plan.popular ? 'ring-2 ring-indigo-500/50 shadow-indigo-500/20' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Mais Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-indigo-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-sm ${featureIndex === 0 && plan.name === 'Básico' ? 'text-green-400 font-semibold' : 'text-gray-300'}`}>
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button - Melhorado */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full relative bg-gradient-to-r ${plan.buttonGradient} text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 overflow-hidden group hover:shadow-2xl`}
                  style={{
                    boxShadow: plan.popular 
                      ? '0 20px 40px rgba(99, 102, 241, 0.3)' 
                      : '0 10px 30px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>Eu quero!</span>
                    {plan.popular && <Star className="w-5 h-5" />}
                  </span>
                  <div className={`absolute inset-0 bg-gradient-to-r ${plan.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </motion.button>

                {/* Guarantee */}
                <p className="text-center text-gray-400 text-xs mt-4">
                  ✅ Garantia de 30 dias
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            Precisa de algo personalizado? Entre em contato conosco
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-gray-600 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:border-indigo-500 hover:text-white hover:bg-indigo-500/10 transition-all duration-300"
          >
            Falar com Especialista
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default Plans
