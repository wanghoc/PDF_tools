import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Scissors, 
  Download, 
  Trash2,
  Plus,
  Minus,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PDFDocument } from 'pdf-lib'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  file: File
}

interface SplitRange {
  id: string
  start: number
  end: number
  name: string
}

const SplitPDF = () => {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [splitRanges, setSplitRanges] = useState<SplitRange[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalPages, setTotalPages] = useState(1)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const picked = acceptedFiles[0]
      try {
        const bytes = await picked.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const pagesCount = pdf.getPages().length
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: picked.name,
          size: picked.size,
          type: picked.type,
          file: picked
        }
        setFile(newFile)
        setTotalPages(pagesCount)
        setSplitRanges([
          { id: '1', start: 1, end: pagesCount, name: `Pages 1-${pagesCount}` }
        ])
        toast.success(`Loaded PDF with ${pagesCount} page(s)`) 
      } catch (e) {
        console.error(e)
        toast.error('Failed to read PDF')
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeFile = () => {
    setFile(null)
    setSplitRanges([])
    setTotalPages(1)
    toast.success('File removed')
  }

  const addSplitRange = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    const newRange: SplitRange = {
      id: newId,
      start: 1,
      end: 1,
      name: `New Split ${splitRanges.length + 1}`
    }
    setSplitRanges(prev => [...prev, newRange])
  }

  const removeSplitRange = (id: string) => {
    if (splitRanges.length > 1) {
      setSplitRanges(prev => prev.filter(range => range.id !== id))
      toast.success('Split range removed')
    } else {
      toast.error('At least one split range is required')
    }
  }

  const updateSplitRange = (id: string, field: 'start' | 'end' | 'name', value: string | number) => {
    setSplitRanges(prev => prev.map(range => {
      if (range.id === id) {
        const updated = { ...range, [field]: value }
        if (field === 'start' || field === 'end') {
          const s = updated.start
          const e = updated.end
          updated.name = s === e ? `Page ${s}` : `Pages ${s}-${e}`
        }
        return updated
      }
      return range
    }))
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

  const handleSplit = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first')
      return
    }

    // Validate ranges
    for (const range of splitRanges) {
      if (range.start < 1 || range.end > totalPages || range.start > range.end) {
        toast.error(`Invalid range: ${range.name}`)
        return
      }
    }

    try {
      setIsProcessing(true)
      toast.success('Starting split process...')

      const srcBytes = await file.file.arrayBuffer()
      const srcPdf = await PDFDocument.load(srcBytes)

      for (const range of splitRanges) {
        const outPdf = await PDFDocument.create()
        const indices = [] as number[]
        for (let i = range.start; i <= range.end; i++) indices.push(i - 1)
        const copied = await outPdf.copyPages(srcPdf, indices)
        copied.forEach(p => outPdf.addPage(p))
        const outBytes = await outPdf.save()
        const safeBase = file.name.replace(/\.pdf$/i, '')
        const outName = `${safeBase}-${range.name.replace(/\s+/g, '-')}.pdf`
        triggerDownload(outBytes, outName)
      }

      toast.success('Split completed! Files downloaded.')
    } catch (e) {
      console.error(e)
      toast.error('Failed to split PDF')
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Split PDF Files
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Split PDF into multiple files by pages. Choose specific page ranges or split by individual pages.
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
              {!file ? (
                <div
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? 'dropzone-active' : ''} transition-all duration-200`}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {isDragActive ? 'Drop PDF file here' : 'Upload your PDF file'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <button className="btn-primary">
                      <Plus className="w-5 h-5 mr-2" />
                      Select PDF File
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                      Maximum file size: 50MB • Supported format: PDF
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Uploaded File</h3>
                    <button
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Total pages: {totalPages}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Split Configuration */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Split Configuration</h3>
                  <button
                    onClick={addSplitRange}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Split
                  </button>
                </div>

                <div className="space-y-4">
                  {splitRanges.map((range, index) => (
                    <motion.div
                      key={range.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{range.name}</h4>
                        {splitRanges.length > 1 && (
                          <button
                            onClick={() => removeSplitRange(range.id)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Page
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={range.start}
                            onChange={(e) => updateSplitRange(range.id, 'start', parseInt(e.target.value) || 1)}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Page
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={range.end}
                            onChange={(e) => updateSplitRange(range.id, 'end', parseInt(e.target.value) || 1)}
                            className="input-field"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Output Name
                        </label>
                        <input
                          type="text"
                          value={range.name}
                          onChange={(e) => updateSplitRange(range.id, 'name', e.target.value)}
                          className="input-field"
                          placeholder="Enter output file name"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Splitting PDF...</span>
                    </div>
                  ) : (
                    <>
                      <Scissors className="w-5 h-5 mr-2" />
                      Split PDF
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card sticky top-24"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Scissors className="w-5 h-5" />
                <span>Split Information</span>
              </h3>
              
              {!file ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No file uploaded yet</p>
                  <p className="text-sm">Upload a PDF file to configure splits</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">File Details</h4>
                    <p className="text-sm text-blue-700">Name: {file.name}</p>
                    <p className="text-sm text-blue-700">Size: {formatFileSize(file.size)}</p>
                    <p className="text-sm text-blue-700">Pages: {totalPages}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Split Summary</h4>
                    <p className="text-sm text-green-700">Total splits: {splitRanges.length}</p>
                    <p className="text-sm text-green-700">
                      Pages covered: {splitRanges.reduce((sum, range) => sum + (range.end - range.start + 1), 0)}/{totalPages}
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Tips</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Use page ranges for multiple pages</li>
                      <li>• Set start = end for single pages</li>
                      <li>• Customize output file names</li>
                    </ul>
                  </div>
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
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
            <p className="text-sm text-gray-600">
              Upload your PDF file to get started with splitting
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scissors className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Configure Splits</h3>
            <p className="text-sm text-gray-600">
              Define page ranges and customize output file names
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Download Results</h3>
            <p className="text-sm text-gray-600">
              Get your split PDF files ready for download
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SplitPDF
