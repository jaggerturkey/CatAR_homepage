// 檔案路徑: src/pages/Services.tsx
import { useState } from 'react';
import './Services.css';

// --- 環境常數 ---
// 注意：開發時請確保這裡是 http (非 https)，或設定 Cloudflare Tunnel
const GCP_API_BASE = 'http://34.84.33.208:8000'; 

// --- 資料結構 ---
interface Service {
  id: number;
  title: string;
  description: string;
  features: string[];
  icon: string;
}

const services: Service[] = [
  {
    id: 1,
    title: "AR 應用開發",
    description: "客製化的擴增實境 (AR) 應用程式開發，支援多平台部署。",
    features: ["WebAR 體驗", "APP 開發", "Unity / Unreal", "跨平台支援"],
    icon: "📱"
  },
  {
    id: 2,
    title: "雲端影片管理",
    description: "基於 Google Cloud 的高效能影片上傳與分析串接。",
    features: ["GCS 直傳加速", "自動化分析", "大規模儲存", "安全簽章機制"],
    icon: "☁️"
  },
  {
    id: 3,
    title: "技術導入諮詢",
    description: "提供 AR 技術選型與系統架構設計建議。",
    features: ["可行性評估", "架構設計", "實施規劃", "技術培訓"],
    icon: "💡"
  }
];

export default function Services() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // --- 核心上傳邏輯 ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[開始處理] ${file.name}`);

        // Step 1: 取得 Signed URL (後端簽名)
        const signRes = await fetch(`${GCP_API_BASE}/api/generate-signed-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            content_type: file.type || 'application/octet-stream'
          })
        });

        if (!signRes.ok) throw new Error('無法取得上傳權限');
        const { upload_url, clean_filename } = await signRes.json();
        
        // Step 2: 直傳 GCS (前端 -> GCS)
        // 使用 XHR 以支援進度條
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', upload_url);
          xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = (e.loaded / e.total) * 100;
              setUploadProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`GCS Upload Failed: ${xhr.statusText}`));
          };

          xhr.onerror = () => reject(new Error('Network Error during upload'));
          xhr.send(file);
        });

        // Step 3: 通知後端 (GCS -> Worker)
        const notifyRes = await fetch(`${GCP_API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: clean_filename })
        });

        if (!notifyRes.ok) throw new Error('觸發分析失敗');
        console.log('分析任務已觸發');
      }

      alert('上傳成功！Worker 已啟動分析。');
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);

    } catch (error: any) {
      console.error(error);
      alert(`上傳失敗: ${error.message}`);
    } finally {
      setUploading(false);
      (event.target as HTMLInputElement).value = '';
    }
  };

  return (
    <div className="services">
      <div className="container">
        <section className="services-header">
          <h1 className="page-title">我們的服務</h1>
          <p className="page-subtitle">AR 技術解決方案與雲端分析平台</p>
        </section>

        <section className="services-grid">
          {services.map((s) => (
            <div key={s.id} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-description">{s.description}</p>
              <ul className="service-features">
                {s.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          ))}
        </section>

        <section className="upload-section">
          <h2 className="section-title">影片分析上傳區</h2>
          <div className="upload-container">
            <div className="upload-area">
              <div className="upload-icon">📹</div>
              <h3>上傳影片至分析佇列</h3>
              <p>目前的上傳目標：<b>GCS Direct Upload</b></p>
              
              <div className="upload-controls">
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="file-input"
                />
                <label htmlFor="video-upload" className={`upload-btn ${uploading ? 'disabled' : ''}`}>
                  {uploading ? `上傳中 ${uploadProgress.toFixed(0)}%` : '選擇影片檔案'}
                </label>
              </div>

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}