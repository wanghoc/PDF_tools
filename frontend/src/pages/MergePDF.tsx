import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2,
  Move,
  Eye,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PDFDocument } from 'pdf-lib'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  file: File
  order: number
}

const MergePDF = () => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      order: files.length + index
    }))

    setFiles(prev => [...prev, ...newFiles])
    toast.success(`${acceptedFiles.length} file(s) added`)
  }, [files.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
    toast.success('File removed')
  }

  const moveFile = (fileId: string, direction: 'up' | 'down') => {
    setFiles(prev => {
      const newFiles = [...prev]
      const currentIndex = newFiles.findIndex(f => f.id === fileId)
      
      if (direction === 'up' && currentIndex > 0) {
        ;[newFiles[currentIndex], newFiles[currentIndex - 1]] = [newFiles[currentIndex - 1], newFiles[currentIndex]]
      } else if (direction === 'down' && currentIndex < newFiles.length - 1) {
        ;[newFiles[currentIndex], newFiles[currentIndex + 1]] = [newFiles[currentIndex + 1], newFiles[currentIndex]]
      }
      
      return newFiles.map((file, index) => ({ ...file, order: index }))
    })
  }

  const triggerDownload = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please upload at least 2 PDF files to merge')
      return
    }
    try {
      setIsProcessing(true)
      toast.success('Starting merge process...')

      // Sort by order
      const sorted = [...files].sort((a, b) => a.order - b.order)

      const mergedPdf = await PDFDocument.create()
      for (const f of sorted) {
        // eslint-disable-next-line no-await-in-loop
        const bytes = await f.file.arrayBuffer()
        // eslint-disable-next-line no-await-in-loop
        const pdf = await PDFDocument.load(bytes)
        const pageIndices = pdf.getPageIndices()
        // eslint-disable-next-line no-await-in-loop
        const copied = await mergedPdf.copyPages(pdf, pageIndices)
        copied.forEach(p => mergedPdf.addPage(p))
      }
      const mergedBytes = await mergedPdf.save()
      triggerDownload(mergedBytes, 'merged.pdf')
      toast.success('PDFs merged successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to merge PDFs')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Merge PDF Files
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Combine multiple PDF files into one document. Drag and drop to reorder pages, 
            then merge them into a single PDF file.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card mb-8"
            >
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'dropzone-active' : ''} transition-all duration-200`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {isDragActive ? 'Drop PDF files here' : 'Upload your PDF files'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your PDF files here, or click to browse
                  </p>
                  <button className="btn-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    Select PDF Files
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Maximum file size: 50MB • Supported format: PDF
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <button
                onClick={handleMerge}
                disabled={files.length < 2 || isProcessing}
                className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Merging PDFs...</span>
                  </div>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Merge PDFs
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* File List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card sticky top-24"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>PDF Files to Merge</span>
                <span className="text-sm text-gray-500">({files.length})</span>
              </h3>
              
              {files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No files uploaded yet</p>
                  <p className="text-sm">Upload at least 2 PDF files to merge</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              {file.order + 1}
                            </span>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* File Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveFile(file.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Move up"
                        >
                          <Move className="w-4 h-4 rotate-90" />
                        </button>
                        
                        <button
                          onClick={() => moveFile(file.id, 'down')}
                          disabled={index === files.length - 1}
                          className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Move down"
                        >
                          <Move className="w-4 h-4 -rotate-90" />
                        </button>
                        
                        <button
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {files.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">
                    Total files: {files.length}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Total size: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                  </div>
                  <button
                    onClick={() => setFiles([])}
                    className="w-full btn-secondary text-sm py-2"
                  >
                    Clear All Files
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy Upload</h3>
            <p className="text-sm text-gray-600">
              Drag and drop multiple PDF files or click to browse
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Move className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Reorder Pages</h3>
            <p className="text-sm text-gray-600">
              Drag and drop to reorder files before merging
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Download Result</h3>
            <p className="text-sm text-gray-600">
              Get your merged PDF file ready for download
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MergePDF
