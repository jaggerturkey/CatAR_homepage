// 檔案路徑: src/pages/Services.tsx
import { useEffect, useState } from 'react';
import './Services.css';

// 你的 Worker 固定網址
const WORKER_URL = 'https://catar-api-worker.jaggerturkey.workers.dev';

// 定義「服務卡片」的資料結構
interface Service {
  id: number;
  title: string;
  description: string;
  features: string[];
  icon: string;
}

// 定義「已上傳檔案」的資料結構
interface UploadedFile {
  key: string;
  uploaded: string;
  size: number;
}

// 你的服務項目資料
const services: Service[] = [
  {
    id: 1,
    title: "AR 應用開發",
    description: "客製化的擴增實境 (AR) 應用程式開發，支援多平台部署，為您的業務帶來沉浸式體驗。",
    features: ["WebAR 網頁式體驗", "iOS/Android App 開發", "Unity / Unreal Engine", "跨平台支援"],
    icon: "📱"
  },
  {
    id: 2,
    title: "雲端影片管理",
    description: "基於 Cloudflare R2 的高效能影片上傳、儲存和管理解決方案，安全且成本效益高。",
    features: ["安全預簽章上傳", "全球 CDN 加速", "大規模儲存", "後端分析整合"],
    icon: "☁️"
  },
  {
    id: 3,
    title: "技術導入諮詢",
    description: "提供 AR 技術選型、系統架構設計和實施策略的專業建議，確保您的專案成功落地。",
    features: ["技術可行性評估", "系統架構設計", "專案實施規劃", "團隊技術培訓"],
    icon: "💡"
  }
];

export default function Services() {
  // --- 狀態管理 ---
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [listRefreshing, setListRefreshing] = useState(false);

  // --- API: 列表 ---
  async function refreshList() {
    if (listRefreshing) return;
    setListRefreshing(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/list`);
      if (!res.ok) throw new Error('無法從伺服器獲取檔案列表');
      const data: { items: UploadedFile[] } = await res.json();
      setUploadedFiles(data.items || []);
    } catch (e) {
      console.error(e);
      alert('無法取得檔案列表，請確認 Worker 是否正常運作');
    } finally {
      setListRefreshing(false);
    }
  }

  useEffect(() => { refreshList(); }, []);

  // --- 上傳：簽名 → PUT 到 R2 ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // (1) 向 Worker 取得簽名
        const sig = await fetch(`${WORKER_URL}/api/sign-upload`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
            size: file.size
          })
        }).then(r => r.json());

        if (!sig?.uploadUrl) {
          throw new Error(`簽名失敗：${file.name}`);
        }

        // (2) 直接 PUT 到 R2
        await putWithProgress(sig.uploadUrl, file, p => setUploadProgress(p), sig.contentType);

        // 可在這裡把 sig.key 回報給你的後端以建立分析任務

        // 顯示一下 100% 再歸零
        setUploadProgress(100);
        await new Promise(r => setTimeout(r, 300));
        setUploadProgress(0);
      }

      await refreshList();
    } catch (error: any) {
      console.error('上傳失敗:', error);
      alert(`上傳過程中發生錯誤: ${error?.message || '未知錯誤'}`);
    } finally {
      setUploading(false);
      // 清空 <input> 的值，避免再次選同檔案時 onChange 不觸發
      (event.target as HTMLInputElement).value = '';
    }
  };

  // --- JSX ---
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
              <h3>上傳影片至雲端分析平台</h3>
              <p>您的影片將被安全地傳輸並儲存於 Cloudflare R2。</p>

              <div className="upload-controls">
                <input
                  type="file"
                  id="video-upload"
                  multiple
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="file-input"
                />
                <label htmlFor="video-upload" className={`upload-btn ${uploading ? 'disabled' : ''}`}>
                  {uploading ? `上傳中...` : '選擇影片檔案'}
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
                  <span className="progress-text">{uploadProgress.toFixed(1)}%</span>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4>雲端檔案列表：</h4>
                  <ul>
                    {uploadedFiles.map((file) => (
                      <li key={file.key}>
                        ✅ {file.key.split('-').slice(1).join('-')} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                  <button onClick={refreshList} disabled={listRefreshing} className="refresh-btn">
                    {listRefreshing ? '更新中...' : '重新整理列表'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// 以 XHR 追蹤上傳進度；注意 Content-Type 必須與簽名時相同
function putWithProgress(url: string, file: File, onProgress: (pct: number) => void, contentType: string) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType || file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () =>
      (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`R2 狀態碼 ${xhr.status}`));
    xhr.onerror = () => reject(new Error('網路錯誤'));
    xhr.send(file);
  });
}
