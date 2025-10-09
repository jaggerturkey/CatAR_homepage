import './About.css'

interface TeamMember {
  id: number
  name: string
  position: string
  description: string
  avatar: string
  skills: string[]
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "張小明",
    position: "技術總監",
    description: "擁有 10 年 AR/VR 開發經驗，專精於 Unity 和 WebXR 技術。",
    avatar: "👨‍💻",
    skills: ["Unity", "WebXR", "JavaScript", "C#"]
  },
  {
    id: 2,
    name: "李美華",
    position: "產品經理",
    description: "專注於用戶體驗設計，擅長將複雜技術轉化為直觀的產品。",
    avatar: "👩‍💼",
    skills: ["UX Design", "Product Strategy", "Project Management"]
  },
  {
    id: 3,
    name: "王大偉",
    position: "前端工程師",
    description: "React 和 TypeScript 專家，負責開發現代化的 Web 應用。",
    avatar: "👨‍💻",
    skills: ["React", "TypeScript", "Node.js", "Cloudflare"]
  },
  {
    id: 4,
    name: "陳小芳",
    position: "UI/UX 設計師",
    description: "創意設計師，專注於創造美觀且實用的用戶介面。",
    avatar: "👩‍🎨",
    skills: ["UI Design", "Figma", "Adobe Creative Suite", "Prototyping"]
  }
]

export default function About() {
  return (
    <div className="about">
      <div className="container">
        {/* Header */}
        <section className="about-header">
          <h1 className="page-title">認識我們的團隊</h1>
          <p className="page-subtitle">
            我們是一群熱愛技術的專業人士，致力於為客戶提供最優質的 AR 解決方案
          </p>
        </section>

        {/* Team Members */}
        <section className="team-section">
          <h2 className="section-title">核心團隊</h2>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  <span className="avatar-icon">{member.avatar}</span>
                </div>
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-position">{member.position}</p>
                  <p className="member-description">{member.description}</p>
                  <div className="member-skills">
                    {member.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Company Story */}
        <section className="company-story">
          <h2 className="section-title">公司故事</h2>
          <div className="story-content">
            <div className="story-text">
              <p>
                CatAR 成立於 2024 年，我們相信 AR 技術將改變人們與數位世界的互動方式。
                我們的使命是讓 AR 技術變得更加普及和實用，為各行各業提供創新的解決方案。
              </p>
              <p>
                從小型創業公司到大型企業，我們都致力於提供客製化的 AR 服務，
                幫助客戶在競爭激烈的市場中脫穎而出。
              </p>
            </div>
            <div className="story-stats">
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">完成專案</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">20+</div>
                <div className="stat-label">合作客戶</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4</div>
                <div className="stat-label">核心團隊</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
