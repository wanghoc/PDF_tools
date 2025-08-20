import { motion } from 'framer-motion'
import { FileSpreadsheet } from 'lucide-react'

const OfficeToPDF = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileSpreadsheet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Office to PDF
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Convert Word, Excel, and PowerPoint documents to PDF format with high quality.
          </p>
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <p className="text-gray-600">Office to PDF functionality coming soon...</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OfficeToPDF
