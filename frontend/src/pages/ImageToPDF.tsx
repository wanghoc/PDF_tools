import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { 
  Upload, 
  FileImage, 
  Download, 
  Settings, 
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  Move
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface UploadedImage {
  id: string
  name: string
  size: number
  type: string
  preview: string
  file: File
  order: number
}

interface PDFSettings {
  pageSize: 'a4' | 'letter' | 'legal' | 'custom'
  orientation: 'portrait' | 'landscape'
  margin: number // mm
  quality: 'low' | 'medium' | 'high'
}

const pageSizePoints = (size: PDFSettings['pageSize']): [number, number] => {
  // points (1pt = 1/72 inch)
  switch (size) {
    case 'a4': return [595.28, 841.89]
    case 'letter': return [612, 792]
    case 'legal': return [612, 1008]
    case 'custom': return [595.28, 841.89]
  }
}

const mmToPt = (mm: number) => (mm * 72) / 25.4

const ImageToPDF = () => {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 10,
    quality: 'medium'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultPdf, setResultPdf] = useState<{
    url: string
    size: number
    bytes: Uint8Array
  } | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: UploadedImage[] = acceptedFiles.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      file,
      order: images.length + index
    }))

    setImages(prev => [...prev, ...newImages])
    toast.success(`${acceptedFiles.length} image(s) added`)
  }, [images.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === imageId)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== imageId)
    })
    toast.success('Image removed')
  }

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const newImages = [...prev]
      const currentIndex = newImages.findIndex(img => img.id === imageId)
      
      if (direction === 'up' && currentIndex > 0) {
        ;[newImages[currentIndex], newImages[currentIndex - 1]] = [newImages[currentIndex - 1], newImages[currentIndex]]
      } else if (direction === 'down' && currentIndex < newImages.length - 1) {
        ;[newImages[currentIndex], newImages[currentIndex + 1]] = [newImages[currentIndex + 1], newImages[currentIndex]]
      }
      
      return newImages.map((img, index) => ({ ...img, order: index }))
    })
  }

  const fitWithin = (imgW: number, imgH: number, boxW: number, boxH: number) => {
    const imgRatio = imgW / imgH
    const boxRatio = boxW / boxH
    if (imgRatio > boxRatio) {
      const width = boxW
      const height = width / imgRatio
      return { width, height }
    } else {
      const height = boxH
      const width = height * imgRatio
      return { width, height }
    }
  }

  const decodeImageToCanvas = (file: File): Promise<HTMLCanvasElement> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))
        ctx.drawImage(img, 0, 0)
        resolve(canvas)
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleConvert = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }
    try {
      setIsProcessing(true)
      setResultPdf(null)
      toast.success('Starting conversion process...')

      const pdf = await PDFDocument.create()
      const [baseW, baseH] = pageSizePoints(pdfSettings.pageSize)
      const isLandscape = pdfSettings.orientation === 'landscape'
      const pageW = isLandscape ? baseH : baseW
      const pageH = isLandscape ? baseW : baseH
      const margin = mmToPt(pdfSettings.margin)
      const boxW = Math.max(0, pageW - margin * 2)
      const boxH = Math.max(0, pageH - margin * 2)

      for (const img of [...images].sort((a, b) => a.order - b.order)) {
        // eslint-disable-next-line no-await-in-loop
        const page = pdf.addPage([pageW, pageH])
        let embedded
        if (img.type === 'image/jpeg' || img.type === 'image/jpg') {
          // eslint-disable-next-line no-await-in-loop
          embedded = await pdf.embedJpg(await img.file.arrayBuffer())
        } else if (img.type === 'image/png') {
          // eslint-disable-next-line no-await-in-loop
          embedded = await pdf.embedPng(await img.file.arrayBuffer())
        } else {
          // Convert GIF/WEBP to PNG via canvas
          // eslint-disable-next-line no-await-in-loop
          const canvas = await decodeImageToCanvas(img.file)
          // eslint-disable-next-line no-await-in-loop
          const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/png'))
          // eslint-disable-next-line no-await-in-loop
          embedded = await pdf.embedPng(await blob.arrayBuffer())
        }

        const { width: imgW, height: imgH } = embedded.scale(1)
        const { width, height } = fitWithin(imgW, imgH, boxW, boxH)
        const x = (pageW - width) / 2
        const y = (pageH - height) / 2
        page.drawImage(embedded, { x, y, width, height })
      }

      const bytes = await pdf.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setResultPdf({ url, size: blob.size, bytes })
      toast.success('PDF created successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to create PDF')
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

  const downloadPDF = () => {
    if (!resultPdf) return
    const a = document.createElement('a')
    a.href = resultPdf.url
    a.download = 'images.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileImage className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Image to PDF
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Convert images to PDF documents. Support for multiple formats and page sizing options.
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
                    {isDragActive ? 'Drop images here' : 'Upload your images'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your images here, or click to browse
                  </p>
                  <button className="btn-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    Select Images
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Maximum file size: 50MB • Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            </motion.div>

            {/* PDF Settings */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card mb-8"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">PDF Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Size
                    </label>
                    <select
                      value={pdfSettings.pageSize}
                      onChange={(e) => setPdfSettings(prev => ({ ...prev, pageSize: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="a4">A4 (210 × 297 mm)</option>
                      <option value="letter">Letter (8.5 × 11 in)</option>
                      <option value="legal">Legal (8.5 × 14 in)</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientation
                    </label>
                    <select
                      value={pdfSettings.orientation}
                      onChange={(e) => setPdfSettings(prev => ({ ...prev, orientation: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Margin (mm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={pdfSettings.margin}
                      onChange={(e) => setPdfSettings(prev => ({ ...prev, margin: Number(e.target.value) }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality
                    </label>
                    <select
                      value={pdfSettings.quality}
                      onChange={(e) => setPdfSettings(prev => ({ ...prev, quality: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="low">Low (Smaller file)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Better quality)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating PDF...</span>
                    </div>
                  ) : (
                    <>
                      <FileImage className="w-5 h-5 mr-2" />
                      Create PDF
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Result */}
            {resultPdf && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card mt-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Generated PDF</h3>
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileImage className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-medium text-green-900 mb-2">PDF Created Successfully!</h4>
                  <p className="text-green-700 mb-4">
                    Size: {formatFileSize(resultPdf.size)}
                  </p>
                  <button
                    onClick={downloadPDF}
                    className="btn-primary"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Image List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card sticky top-24"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>Uploaded Images</span>
                <span className="text-sm text-gray-500">({images.length})</span>
              </h3>
              
              {images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No images uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              {image.order + 1}
                            </span>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(image.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeImage(image.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Image Preview */}
                      <div className="mb-3">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Image Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveImage(image.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                          title="Move up"
                        >
                          <Move className="w-4 h-4 rotate-90" />
                        </button>
                        
                        <button
                          onClick={() => moveImage(image.id, 'down')}
                          disabled={index === images.length - 1}
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
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
              
              {images.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">
                    Total images: {images.length}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Total size: {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
                  </div>
                  <button
                    onClick={() => {
                      images.forEach(img => URL.revokeObjectURL(img.preview))
                      setImages([])
                    }}
                    className="w-full btn-secondary text-sm py-2"
                  >
                    Clear All Images
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
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload Images</h3>
            <p className="text-sm text-gray-600">
              Upload multiple images to convert to PDF
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Customize Settings</h3>
            <p className="text-sm text-gray-600">
              Choose page size, orientation, and quality
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Download PDF</h3>
            <p className="text-sm text-gray-600">
              Get your PDF document ready for use
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ImageToPDF
