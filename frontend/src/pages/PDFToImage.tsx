import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Image as ImageIcon, 
  Download, 
  Settings, 
  FileText,
  Plus,
  Trash2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import * as pdfjsLib from 'pdfjs-dist'
// Vite-friendly worker import
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

interface UploadedFile {
  file: File
  id: string
  name: string
  size: number
  type: string
  totalPages: number
}

interface ImageSettings {
  format: 'png' | 'jpg' | 'webp'
  dpi: number
  quality: number
  pageRange: string
}

type ProcessedImage = {
  id: string
  page: number
  url: string
  size: number
  filename: string
  blob: Blob
}

const PDFToImage = () => {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    format: 'png',
    dpi: 150,
    quality: 90,
    pageRange: 'all'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0]
      try {
        const arrayBuffer = await f.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        const newFile: UploadedFile = {
          file: f,
          id: Math.random().toString(36).substr(2, 9),
          name: f.name,
          size: f.size,
          type: f.type,
          totalPages: pdf.numPages
        }
        setFile(newFile)
        setProcessedImages([])
        toast.success(`Loaded PDF with ${pdf.numPages} page(s)`) 
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
    processedImages.forEach(img => URL.revokeObjectURL(img.url))
    setProcessedImages([])
    toast.success('File removed')
  }

  const getPagesFromRange = (range: string, total: number): number[] => {
    if (range.trim().toLowerCase() === 'all') {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    const pages: number[] = []
    const parts = range.split(',').map(p => p.trim()).filter(Boolean)
    for (const part of parts) {
      if (part.includes('-')) {
        const [s, e] = part.split('-').map(Number)
        if (!Number.isFinite(s) || !Number.isFinite(e)) continue
        for (let i = Math.max(1, s); i <= Math.min(total, e); i++) pages.push(i)
      } else {
        const p = Number(part)
        if (Number.isFinite(p) && p >= 1 && p <= total) pages.push(p)
      }
    }
    return Array.from(new Set(pages)).sort((a, b) => a - b)
  }

  const renderPageToBlob = async (pdf: any, pageNumber: number): Promise<ProcessedImage> => {
    const page = await pdf.getPage(pageNumber)
    const scale = Math.max(0.1, imageSettings.dpi / 72)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas not supported')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    await page.render({ canvasContext: context, viewport }).promise

    const type = imageSettings.format === 'jpg' ? 'image/jpeg' : imageSettings.format === 'webp' ? 'image/webp' : 'image/png'
    const quality = Math.min(1, Math.max(0.1, imageSettings.quality / 100))

    const blob: Blob = await new Promise((resolve) => {
      if (type === 'image/png') {
        canvas.toBlob(b => resolve(b as Blob), type)
      } else {
        canvas.toBlob(b => resolve(b as Blob), type, quality)
      }
    })
    const url = URL.createObjectURL(blob)
    return {
      id: Math.random().toString(36).substr(2, 9),
      page: pageNumber,
      url,
      size: blob.size,
      filename: `${file?.name.replace(/\.pdf$/i, '') || 'document'}-page-${pageNumber}.${imageSettings.format}`,
      blob
    }
  }

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please upload a PDF file first')
      return
    }
    try {
      setIsProcessing(true)
      setProcessedImages([])
      toast.success('Starting conversion...')

      const arrayBuffer = await file.file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pages = getPagesFromRange(imageSettings.pageRange, pdf.numPages)
      if (pages.length === 0) {
        toast.error('No valid pages selected')
        setIsProcessing(false)
        return
      }

      const results: ProcessedImage[] = []
      for (const p of pages) {
        // eslint-disable-next-line no-await-in-loop
        const img = await renderPageToBlob(pdf, p)
        results.push(img)
      }
      setProcessedImages(results)
      toast.success(`Converted ${results.length} page(s)`) 
    } catch (e) {
      console.error(e)
      toast.error('Conversion failed')
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

  const downloadImage = (image: ProcessedImage) => {
    const a = document.createElement('a')
    a.href = image.url
    a.download = image.filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">PDF to Image</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Convert PDF pages to high-quality images. Choose format, DPI, and page ranges.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card mb-8"
            >
              {!file ? (
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''} transition-all duration-200`}>
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{isDragActive ? 'Drop PDF file here' : 'Upload your PDF file'}</h3>
                    <p className="text-gray-600 mb-4">Drag and drop your PDF file here, or click to browse</p>
                    <button className="btn-primary"><Plus className="w-5 h-5 mr-2" />Select PDF File</button>
                    <p className="text-sm text-gray-500 mt-4">Maximum file size: 50MB • Supported format: PDF</p>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Uploaded File</h3>
                    <button onClick={removeFile} className="text-red-500 hover:text-red-700 transition-colors duration-200"><Trash2 className="w-5 h-5" /></button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-orange-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">Total pages: {file.totalPages}</div>
                  </div>
                </div>
              )}
            </motion.div>

            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card mb-8"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Image Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Format</label>
                    <select value={imageSettings.format} onChange={(e) => setImageSettings(prev => ({ ...prev, format: e.target.value as any }))} className="input-field">
                      <option value="png">PNG (Lossless)</option>
                      <option value="jpg">JPEG (Compressed)</option>
                      <option value="webp">WebP (Modern)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DPI (Resolution)</label>
                    <select value={imageSettings.dpi} onChange={(e) => setImageSettings(prev => ({ ...prev, dpi: Number(e.target.value) }))} className="input-field">
                      <option value={72}>72 DPI (Screen)</option>
                      <option value={150}>150 DPI (Standard)</option>
                      <option value={300}>300 DPI (Print)</option>
                      <option value={600}>600 DPI (High Quality)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                    <input type="range" min="1" max="100" value={imageSettings.quality} onChange={(e) => setImageSettings(prev => ({ ...prev, quality: Number(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1%</span>
                      <span>{imageSettings.quality}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Range</label>
                    <input type="text" value={imageSettings.pageRange} onChange={(e) => setImageSettings(prev => ({ ...prev, pageRange: e.target.value }))} className="input-field" placeholder="e.g., all or 1,3,5-7" />
                    <p className="text-xs text-gray-500 mt-1">Use 'all' for all pages, or specify like '1,3,5-7'</p>
                  </div>
                </div>
              </motion.div>
            )}

            {file && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-center">
                <button onClick={handleConvert} disabled={isProcessing} className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isProcessing ? (
                    <div className="flex items-center space-x-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Converting PDF...</span></div>
                  ) : (
                    <><ImageIcon className="w-5 h-5 mr-2" />Convert to Images</>
                  )}
                </button>
              </motion.div>
            )}

            {processedImages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="card mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Converted Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processedImages.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Page {image.page}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">{formatFileSize(image.size)}</p>
                        <div className="flex space-x-2">
                          <button onClick={() => downloadImage(image)} className="btn-primary text-sm py-2 px-3 flex-1"><Download className="w-4 h-4 mr-1" />Download</button>
                          <a href={image.url} target="_blank" rel="noreferrer" className="btn-secondary text-sm py-2 px-3"><Eye className="w-4 h-4" /></a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="card sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2"><ImageIcon className="w-5 h-5" /><span>Conversion Info</span></h3>
              {!file ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No file uploaded yet</p>
                  <p className="text-sm">Upload a PDF file to start converting</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-2">File Details</h4>
                    <p className="text-sm text-orange-700">Name: {file.name}</p>
                    <p className="text-sm text-orange-700">Size: {formatFileSize(file.size)}</p>
                    <p className="text-sm text-orange-700">Pages: {file.totalPages}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Current Settings</h4>
                    <p className="text-sm text-blue-700">Format: {imageSettings.format.toUpperCase()}</p>
                    <p className="text-sm text-blue-700">DPI: {imageSettings.dpi}</p>
                    <p className="text-sm text-blue-700">Quality: {imageSettings.quality}%</p>
                    <p className="text-sm text-blue-700">Pages: {imageSettings.pageRange}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFToImage
