import './Homepage.css'

export default function Homepage() {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            歡迎來到 <span className="highlight">CatAR</span>
          </h1>
          <p className="hero-subtitle">
            我們專注於創新科技解決方案，為企業提供最先進的 AR 技術服務
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">了解服務</button>
            <button className="btn-secondary">聯絡我們</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="placeholder-image">
            <span>封面圖片</span>
          </div>
        </div>
      </section>

      {/* Company Goals */}
      <section className="goals">
        <div className="container">
          <h2 className="section-title">我們的目標</h2>
          <div className="goals-grid">
            <div className="goal-card">
              <div className="goal-icon">🚀</div>
              <h3>創新技術</h3>
              <p>運用最新的 AR 技術，為客戶創造獨特的數位體驗</p>
            </div>
            <div className="goal-card">
              <div className="goal-icon">🎯</div>
              <h3>精準解決</h3>
              <p>深入了解客戶需求，提供客製化的解決方案</p>
            </div>
            <div className="goal-card">
              <div className="goal-icon">🤝</div>
              <h3>長期合作</h3>
              <p>建立穩固的合作關係，持續提供技術支援</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">核心優勢</h2>
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <div className="feature-content">
                <h3>先進 AR 技術</h3>
                <p>採用最新的 AR 開發框架，確保最佳的用戶體驗</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-number">02</div>
              <div className="feature-content">
                <h3>雲端整合</h3>
                <p>與 Cloudflare 深度整合，提供穩定快速的服務</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-number">03</div>
              <div className="feature-content">
                <h3>客製化開發</h3>
                <p>根據客戶需求量身打造專屬的 AR 應用</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
