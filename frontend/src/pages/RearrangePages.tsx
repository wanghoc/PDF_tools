import { motion } from 'framer-motion'
import { Move } from 'lucide-react'

const RearrangePages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Move className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Rearrange Pages
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Reorder and organize PDF pages with drag and drop interface.
          </p>
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <p className="text-gray-600">Rearrange Pages functionality coming soon...</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default RearrangePages
