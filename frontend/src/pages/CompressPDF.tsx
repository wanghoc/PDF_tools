import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Download, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  preview?: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  resultUrl?: string
  compressedSize?: number
}

const CompressPDF = () => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading'
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress: 100, status: 'processing' }
            : file
        ))
        
        // Simulate processing
        setTimeout(() => {
          simulateProcessing(fileId)
        }, 1000)
      } else {
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress }
            : file
        ))
      }
    }, 200)
  }

  const simulateProcessing = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        const compressedSize = Math.floor(Math.random() * 0.7 + 0.3) * files.find(f => f.id === fileId)!.size
        
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { 
                ...file, 
                progress: 100, 
                status: 'completed',
                resultUrl: '#',
                compressedSize
              }
            : file
        ))
        
        toast.success(`${files.find(f => f.id === fileId)?.name} compressed successfully!`)
      } else {
        setFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress }
            : file
        ))
      }
    }, 300)
  }

  const handleCompress = () => {
    if (files.length === 0) {
      toast.error('Please upload at least one PDF file')
      return
    }
    
    setIsProcessing(true)
    toast.success('Starting compression process...')
    
    // Simulate batch processing
    setTimeout(() => {
      setIsProcessing(false)
    }, 2000)
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCompressionSavings = (originalSize: number, compressedSize: number) => {
    const savings = ((originalSize - compressedSize) / originalSize) * 100
    return Math.round(savings)
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
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Compress PDF Files
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Reduce file size while optimizing for maximal PDF quality. 
            Choose your compression level and get the best balance of size and quality.
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
                    Select PDF Files
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Maximum file size: 50MB • Supported format: PDF
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Compression Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card mb-8"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Compression Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="low"
                    name="compression"
                    value="low"
                    checked={compressionLevel === 'low'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label htmlFor="low" className="flex-1">
                    <div className="font-medium text-gray-900">Low Compression</div>
                    <div className="text-sm text-gray-600">High quality, less compression</div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="medium"
                    name="compression"
                    value="medium"
                    checked={compressionLevel === 'medium'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label htmlFor="medium" className="flex-1">
                    <div className="font-medium text-gray-900">Recommended Compression</div>
                    <div className="text-sm text-gray-600">Good quality, good compression</div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="high"
                    name="compression"
                    value="high"
                    checked={compressionLevel === 'high'}
                    onChange={(e) => setCompressionLevel(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label htmlFor="high" className="flex-1">
                    <div className="font-medium text-gray-900">Extreme Compression</div>
                    <div className="text-sm text-gray-600">Less quality, high compression</div>
                  </label>
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
                onClick={handleCompress}
                disabled={files.length === 0 || isProcessing}
                className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Compressing PDF...</span>
                  </div>
                ) : (
                  'Compress PDF'
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
                <span>Uploaded Files</span>
                <span className="text-sm text-gray-500">({files.length})</span>
              </h3>
              
              {files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          ×
                        </button>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={`flex items-center space-x-1 ${
                          file.status === 'completed' ? 'text-green-600' :
                          file.status === 'error' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>
                          {file.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {file.status === 'error' && <AlertCircle className="w-3 h-3" />}
                          {file.status === 'uploading' && <Upload className="w-3 h-3" />}
                          {file.status === 'processing' && <Clock className="w-3 h-3" />}
                          <span className="capitalize">{file.status}</span>
                        </span>
                        
                        {file.status === 'completed' && file.compressedSize && (
                          <span className="text-green-600 font-medium">
                            -{getCompressionSavings(file.size, file.compressedSize)}%
                          </span>
                        )}
                      </div>
                      
                      {/* Result */}
                      {file.status === 'completed' && file.resultUrl && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Original:</span>
                            <span className="font-medium">{formatFileSize(file.size)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-gray-600">Compressed:</span>
                            <span className="font-medium text-green-600">
                              {formatFileSize(file.compressedSize!)}
                            </span>
                          </div>
                          <button className="w-full btn-primary text-sm py-2">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
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
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Processing</h3>
            <p className="text-sm text-gray-600">
              Your files are processed securely and automatically deleted after 30 minutes
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Compression</h3>
            <p className="text-sm text-gray-600">
              Advanced algorithms ensure optimal compression without losing quality
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Info className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quality Control</h3>
            <p className="text-sm text-gray-600">
              Choose compression level based on your quality requirements
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CompressPDF
