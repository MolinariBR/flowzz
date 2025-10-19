
import React from 'react'
import { motion } from 'framer-motion'
import {ArrowRight, BarChart3, TrendingUp, Shield} from 'lucide-react'

const Hero = () => {
  return (
    <section id="inicio" className="pt-24 pb-20 px-6 lg:px-8 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-800/30 text-indigo-300 text-sm font-medium"
            >
              ✨ Gestão Financeira Inteligente
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight"
            >
              A gestão das suas{' '}
              <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                vendas
              </span>{' '}
              nunca foi tão fácil
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 leading-relaxed font-light"
            >
              Centralizamos toda a contabilidade e gerenciamos a inadimplência e o timing da cobrança. 
              Garanta que o produto chegue e o pagamento também.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center group shadow-lg shadow-indigo-500/25"
              >
                Descomplique suas vendas
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="border border-gray-600 text-gray-300 px-8 py-4 rounded-lg font-semibold hover:border-gray-500 hover:text-white hover:bg-gray-800/30 transition-all duration-300"
              >
                Ver Demonstração
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-800"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">+300%</div>
                <div className="text-sm text-gray-400 mt-1">Conversão</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-400 mt-1">Monitoramento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">R$ 2M+</div>
                <div className="text-sm text-gray-400 mt-1">Gerenciados</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Card Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
            
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-gray-400 text-sm font-mono">Flowzz Dashboard</div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-6">
                {/* Revenue Chart */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Receita Mensal</h3>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-end space-x-2 h-20">
                    {[40, 60, 45, 80, 65, 90, 75].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-sm flex-1"
                      ></motion.div>
                    ))}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">Vendas</span>
                    </div>
                    <div className="text-white font-bold text-xl">R$ 45.2K</div>
                    <div className="text-green-400 text-sm">+12.5%</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400 text-sm">Lucro</span>
                    </div>
                    <div className="text-white font-bold text-xl">R$ 18.7K</div>
                    <div className="text-green-400 text-sm">+8.3%</div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300 text-sm">Sistema Ativo</span>
                  </div>
                  <div className="text-gray-400 text-sm">Atualizado agora</div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full p-3 shadow-lg"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-3 shadow-lg"
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
