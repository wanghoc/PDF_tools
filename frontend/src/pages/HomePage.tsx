import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Scissors, 
  Image, 
  FileImage, 
  FileSpreadsheet,
  Move,
  Upload,
  Shield,
  Zap,
  Globe
} from 'lucide-react'

const HomePage = () => {
  const tools = [
    {
      name: 'Merge PDF',
      description: 'Combine multiple PDF files into one document',
      icon: FileText,
      href: '/merge-pdf',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      name: 'Split PDF',
      description: 'Split PDF into multiple files by pages',
      icon: Scissors,
      href: '/split-pdf',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      name: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: Scissors,
      href: '/compress-pdf',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      name: 'PDF to Image',
      description: 'Convert PDF pages to high-quality images',
      icon: Image,
      href: '/pdf-to-image',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      name: 'Image to PDF',
      description: 'Convert images to PDF documents',
      icon: FileImage,
      href: '/image-to-pdf',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      name: 'Office to PDF',
      description: 'Convert Word, Excel, PowerPoint to PDF',
      icon: FileSpreadsheet,
      href: '/office-to-pdf',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      name: 'Extract Pages',
      description: 'Extract specific pages from PDF',
      icon: Scissors,
      href: '/extract-pages',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700'
    },
    {
      name: 'Rearrange Pages',
      description: 'Reorder and organize PDF pages',
      icon: Move,
      href: '/rearrange-pages',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    }
  ]

  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Drag & drop files or click to browse. Support for multiple file formats.'
    },
    {
      icon: Shield,
      title: 'Secure Processing',
      description: 'Your files are processed securely and automatically deleted after 30 minutes.'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Advanced algorithms ensure quick processing without compromising quality.'
    },
    {
      icon: Globe,
      title: 'Access Anywhere',
      description: 'Use our tools from any device, anywhere in the world.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional{' '}
              <span className="text-gradient">PDF Tools</span>
              <br />
              for Everyone
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Convert, merge, split, and compress PDF files with our powerful online tools. 
              Fast, secure, and completely free to use.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Converting Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              All PDF Tools You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From basic conversions to advanced PDF manipulation, we've got you covered with professional-grade tools.
            </p>
          </motion.div>

          <div className="tool-grid">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="card card-hover"
                >
                  <Link to={tool.href} className="block">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {tool.description}
                    </p>
                    <div className={`inline-flex items-center text-sm font-medium ${tool.textColor}`}>
                      Get Started
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Tools?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built our platform with security, speed, and ease of use in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of users who trust our PDF tools for their document needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-600 font-semibold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Start Converting Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
