import { useEffect, useState } from 'react'
import './Services.css'

interface Service {
  id: number
  title: string
  description: string
  features: string[]
  icon: string
}

const services: Service[] = [
  {
    id: 1,
    title: "AR 應用開發",
    description: "客製化的 AR 應用程式開發，支援多平台部署",
    features: ["WebAR", "Mobile AR", "Unity 開發", "跨平台支援"],
    icon: "📱"
  },
  {
    id: 2,
    title: "雲端影片管理",
    description: "基於 Cloudflare R2 的影片上傳、儲存和管理解決方案",
    features: ["影片上傳", "雲端儲存", "CDN 加速", "安全存取"],
    icon: "☁️"
  },
  {
    id: 3,
    title: "技術諮詢",
    description: "提供 AR 技術選型和實施策略的專業建議",
    features: ["技術評估", "架構設計", "實施規劃", "培訓支援"],
    icon: "💡"
  }
]

export default function Services() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [, setListRefreshing] = useState(false)

  async function refreshList() {
    setListRefreshing(true)
    try {
      const res = await fetch('/api/list')
      if (!res.ok) throw new Error('list failed')
      const data: { items: { key: string }[] } = await res.json()
      setUploadedFiles(data.items.map(x => x.key))
    } catch (e) {
      console.error(e)
    } finally {
      setListRefreshing(false)
    }
  }

  useEffect(() => {
    refreshList()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const form = new FormData()
        form.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: form,
        })
        if (!res.ok) throw new Error('upload failed')

        // 嘗試讀取回傳 key
        const data = await res.json().catch(() => null)
        const key = data?.key || file.name
        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
        setUploadedFiles(prev => [...prev, key])
      }
      await refreshList()
    } catch (error) {
      console.error('上傳失敗:', error)
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  return (
    <div className="services">
      <div className="container">
        {/* Header */}
        <section className="services-header">
          <h1 className="page-title">我們的服務</h1>
          <p className="page-subtitle">
            提供全方位的 AR 技術解決方案，從開發到部署的完整服務
          </p>
        </section>

        {/* Services Grid */}
        <section className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button className="service-btn">了解更多</button>
            </div>
          ))}
        </section>

        {/* Video Upload Section */}
        <section className="upload-section">
          <h2 className="section-title">影片上傳服務</h2>
          <div className="upload-container">
            <div className="upload-area">
              <div className="upload-icon">📹</div>
              <h3>上傳影片到 Cloudflare R2</h3>
              <p>支援多種影片格式，自動壓縮和優化</p>
              
              <div className="upload-controls">
                <input
                  type="file"
                  id="video-upload"
                  multiple
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <label htmlFor="video-upload" className="upload-btn">
                  選擇影片檔案
                </label>
              </div>

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4>已上傳檔案：</h4>
                  <ul>
                    {uploadedFiles.map((filename, index) => (
                      <li key={index}>✅ {filename}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="upload-info">
              <h4>支援的格式</h4>
              <ul>
                <li>MP4</li>
                <li>MOV</li>
                <li>AVI</li>
                <li>WebM</li>
              </ul>
              
              <h4>檔案限制</h4>
              <ul>
                <li>最大檔案大小：500MB</li>
                <li>支援批量上傳</li>
                <li>自動 CDN 分發</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <h2 className="section-title">開始您的專案</h2>
          <p className="contact-text">
            準備好開始您的 AR 專案了嗎？聯絡我們獲得免費諮詢
          </p>
          <div className="contact-buttons">
            <button className="btn-primary">立即諮詢</button>
            <button className="btn-secondary">查看作品集</button>
          </div>
        </section>
      </div>
    </div>
  )
}
