import React from 'react'
import { motion } from 'framer-motion'
import {BarChart3, Clock, Shield, Zap, Target, TrendingUp} from 'lucide-react'

const Benefits = () => {
  const benefits = [
    {
      icon: BarChart3,
      title: "Dashboards Inteligentes",
      description: "Visualize seus dados financeiros em tempo real com gráficos intuitivos e métricas que realmente importam.",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      icon: Clock,
      title: "Automação Completa",
      description: "Automatize cobranças, relatórios e reconciliações. Foque no que realmente gera valor para seu negócio.",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: Shield,
      title: "Segurança Bancária",
      description: "Proteção de dados com criptografia de nível bancário e conformidade com as principais regulamentações.",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      icon: Zap,
      title: "Integração Instantânea",
      description: "Conecte-se com suas ferramentas favoritas em minutos. APIs robustas e integrações nativas.",
      gradient: "from-orange-600 to-red-600"
    },
    {
      icon: Target,
      title: "Precisão Absoluta",
      description: "Elimine erros humanos com validações automáticas e reconciliação inteligente de transações.",
      gradient: "from-indigo-600 to-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Crescimento Sustentável",
      description: "Tome decisões baseadas em dados reais e projete o futuro do seu negócio com confiança.",
      gradient: "from-teal-600 to-blue-600"
    }
  ]

  return (
    <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 tracking-tight">
            Transforme sua gestão{' '}
            <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              financeira
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Descubra como a Flowzz pode revolucionar a forma como você gerencia suas finanças, 
            com tecnologia de ponta e simplicidade incomparável.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500`}></div>
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 h-full hover:border-gray-600 transition-all duration-300">
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-r ${benefit.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-gray-100 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {benefit.description}
                </p>

                {/* Hover Arrow */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute bottom-6 right-6 text-gray-500 group-hover:text-gray-300"
                >
                  →
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              y: -3,
              boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            className="relative group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-500 shadow-2xl shadow-indigo-500/30 border border-indigo-400/20 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-pulse"></div>
            
            <span className="relative z-10 flex items-center gap-2">
              Eu quero! 
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-xl"
              >
                🚀
              </motion.span>
            </span>
          </motion.button>
          <p className="text-gray-400 mt-4 text-sm">Sem compromisso • Configuração em 5 minutos</p>
        </motion.div>
      </div>
    </section>
  )
}

export default Benefits
