import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Heart, 
  Github,
  Globe
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/wanghoc', icon: Github },
    { name: 'Facebook', href: 'https://www.facebook.com/wanghoctrieu', icon: Globe },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start space-x-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">PDF Tools</h3>
                <p className="text-sm text-gray-400">Bộ công cụ PDF chuyên nghiệp</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm">
              © {currentYear} WangHoc's PDF Tools. Tạo ra với
              <motion.span
                className="inline-flex items-center mx-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-500" />
              </motion.span>
              cho mọi người.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 py-2 bg-gray-800 rounded-lg text-gray-200 hover:text-white hover:bg-gray-700 transition-all duration-200 inline-flex items-center gap-2 text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{social.name}</span>
                </motion.a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
