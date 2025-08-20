import { motion } from 'framer-motion'
import { Scissors } from 'lucide-react'

const ExtractPages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Extract Pages
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Extract specific pages from PDF documents. Choose page ranges or individual pages.
          </p>
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <p className="text-gray-600">Extract Pages functionality coming soon...</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ExtractPages
