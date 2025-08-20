import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Scissors, 
  Image, 
  FileImage, 
  FileSpreadsheet,
  Move
} from 'lucide-react'

const HomePage = () => {
  const tools = [
    { name: 'Ghép PDF', description: 'Kết hợp nhiều tệp PDF', icon: FileText, href: '/merge-pdf' },
    { name: 'Chia PDF', description: 'Chia PDF theo khoảng trang', icon: Scissors, href: '/split-pdf' },
    { name: 'PDF → Ảnh', description: 'Xuất trang PDF thành ảnh', icon: Image, href: '/pdf-to-image' },
    { name: 'Ảnh → PDF', description: 'Tạo PDF từ ảnh', icon: FileImage, href: '/image-to-pdf' },
    { name: 'Nén PDF', description: 'Giảm dung lượng (UI mẫu)', icon: Scissors, href: '/compress-pdf' },
    { name: 'Office → PDF', description: 'Word/Excel/PowerPoint sang PDF', icon: FileSpreadsheet, href: '/office-to-pdf' },
    { name: 'Trích Trang', description: 'Chọn trang cụ thể', icon: Scissors, href: '/extract-pages' },
    { name: 'Sắp Xếp Trang', description: 'Thay đổi thứ tự trang', icon: Move, href: '/rearrange-pages' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Hero */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Bộ công cụ PDF chuyên nghiệp
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Nhanh, riêng tư và dễ sử dụng — xử lý trực tiếp trên trình duyệt của bạn.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tools */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, idx) => {
              const Icon = tool.icon
              return (
                <motion.div key={tool.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: idx * 0.05 }} className="card">
                  <Link to={tool.href} className="block">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
