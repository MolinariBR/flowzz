import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { label: 'Início', href: '#inicio' },
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Planos', href: '#planos' },
    { label: 'Contato', href: '#contato' },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center">
            <img
              src="/api/placeholder/40/40"
              alt="Flowzz Logo"
              className="w-10 h-10 rounded-full"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                whileHover={{ y: -1 }}
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* CTA Button - Melhorado */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10">Começar Agora</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 py-4"
          >
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold w-full mt-4 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 overflow-hidden group"
              >
                <span className="relative z-10">Começar Agora</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

export default Header
