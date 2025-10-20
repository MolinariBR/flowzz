import { motion } from 'framer-motion'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useId } from 'react'

const Footer = () => {
  const contatoId = useId()

  const footerLinks = {
    company: [
      { name: 'Sobre nós', href: '/sobre' },
      { name: 'Carreiras', href: '/carreiras' },
      { name: 'Blog', href: '/blog' },
    ],
    product: [
      { name: 'Funcionalidades', href: '#funcionalidades' },
      { name: 'Planos', href: '#planos' },
      { name: 'Segurança', href: '/seguranca' },
    ],
    support: [
      { name: 'Central de Ajuda', href: '/ajuda' },
      { name: 'Documentação', href: '/docs' },
      { name: 'Contato', href: '#contato' },
    ],
    legal: [
      { name: 'Termos de uso', href: '/termos' },
      { name: 'Políticas de pagamento', href: '/pagamento' },
      { name: 'Políticas de Reembolso', href: '/reembolso' },
      { name: 'Privacidade', href: '/privacidade' },
    ],
  }

  return (
    <footer id={contatoId} className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center">
                <span className="text-xl font-semibold text-white tracking-tight">Flowzz</span>
              </div>

              <p className="text-gray-400 leading-relaxed max-w-md font-light">
                Gestão financeira para afiliados que trabalham com pagamento após a entrega.
                Simplifique suas vendas e maximize seus lucros.
              </p>

              <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">contato@flowzz.com.br</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">+55 (11) 9999-9999</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                  <span className="text-sm">São Paulo, SP - Brasil</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-white font-medium mb-4 text-sm">Empresa</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-white font-medium mb-4 text-sm">Produto</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-white font-medium mb-4 text-sm">Suporte</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-white font-medium mb-4 text-sm">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center"
        >
          <p className="text-gray-500 text-sm">© 2024 Flowzz. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a
              href="/privacidade"
              className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
            >
              Política de privacidade
            </a>
            <a
              href="/termos"
              className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
            >
              Termos e condições
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
