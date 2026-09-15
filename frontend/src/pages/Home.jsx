import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const CYCLING_TEXTS = ['Growing Teams', 'Modern Businesses', 'Global Companies']

const FEATURES = [
  {
    icon: '🔐',
    title: 'Tenant Isolation',
    desc: "Every organisation's data is completely isolated. No cross-tenant access. Ever.",
  },
  {
    icon: '👥',
    title: 'Role-Based Access',
    desc: '4-level hierarchy: Super Admin, Org Admin, Manager, Viewer. Granular permissions at every level.',
  },
  {
    icon: '💬',
    title: 'Real-Time Group Chat',
    desc: 'Instant messaging for your entire team. Stay connected with live WebSocket chat scoped to your organisation.',
  },
  {
    icon: '📋',
    title: 'Document Submission',
    desc: 'Members upload resumes, certificates, and marksheets securely. Admins review everything in one place.',
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    desc: 'Live dashboard with activity charts, KPI cards, and event tracking scoped per organisation.',
  },
  {
    icon: '📅',
    title: 'Attendance Tracking',
    desc: 'Mark daily attendance with one click. Admins monitor team presence with history and analytics.',
  },
  {
    icon: '🔑',
    title: 'JWT Security',
    desc: 'Stateless authentication with embedded tenant context. Every request is verified and scoped.',
  },
  {
    icon: '⚡',
    title: 'Instant Setup',
    desc: 'Sign up, create your organisation, and get your dashboard in under 60 seconds.',
  },
]

const STEPS = [
  { num: 1, title: 'Sign Up', desc: 'Create your organisation account in 30 seconds' },
  { num: 2, title: 'Invite Team', desc: 'Add members and assign roles instantly' },
  { num: 3, title: 'Track Everything', desc: 'Monitor activity and analytics in real time' },
]

const STATS = [
  { value: 500, suffix: '+', label: 'Organisations Registered' },
  { value: 10000, suffix: '+', label: 'API Requests Daily' },
  { value: 99.9, suffix: '%', label: 'Uptime Guaranteed', decimals: 1 },
  { value: 4, suffix: '-Level', label: 'Role Hierarchy', prefix: '' },
]

const HERO_STATS = [
  { value: '2,400+', label: 'Companies' },
  { value: '99.9%', label: 'Uptime' },
  { value: '0', label: 'Data Breaches' },
]

function generateParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${2 + Math.random() * 3}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${12 + Math.random() * 10}s`,
  }))
}

function useCountUp(target, decimals = 0, active) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!active) return
    let start = 0
    const duration = 2000
    const startTime = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target
      setDisplay(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target, decimals, active])

  return display
}

function StatItem({ stat, active }) {
  const count = useCountUp(stat.value, stat.decimals || 0, active)
  const formatted =
    stat.decimals > 0
      ? count.toFixed(stat.decimals)
      : count >= 1000
        ? count.toLocaleString()
        : count

  return (
    <div style={styles.statItem}>
      <p style={styles.statNumber}>
        {stat.prefix}
        {formatted}
        {stat.suffix}
      </p>
      <p style={styles.statLabel}>{stat.label}</p>
    </div>
  )
}

function FeatureCard({ feature, index, visible }) {
  return (
    <div
      className="home-feature-card"
      style={{
        ...styles.featureCard,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)',
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      <span style={styles.featureIcon}>{feature.icon}</span>
      <h3 style={styles.featureTitle}>{feature.title}</h3>
      <p style={styles.featureDesc}>{feature.desc}</p>
    </div>
  )
}

export default function Home() {
  const [textIndex, setTextIndex] = useState(0)
  const [textVisible, setTextVisible] = useState(true)
  const [featuresVisible, setFeaturesVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const particles = useRef(generateParticles(20)).current

  useEffect(() => {
    const interval = setInterval(() => {
      setTextVisible(false)
      setTimeout(() => {
        setTextIndex((i) => (i + 1) % CYCLING_TEXTS.length)
        setTextVisible(true)
      }, 400)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === featuresRef.current && entry.isIntersecting) {
            setFeaturesVisible(true)
          }
          if (entry.target === statsRef.current && entry.isIntersecting) {
            setStatsVisible(true)
          }
        })
      },
      { threshold: 0.15 }
    )

    if (featuresRef.current) observer.observe(featuresRef.current)
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={styles.page}>
      <style>{homeKeyframes}</style>

      <div style={styles.particlesLayer}>
        {particles.map((p) => (
          <span
            key={p.id}
            className="home-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroGradient} className="home-gradient-bg" />
        <div style={styles.heroInner} className="home-hero-inner">
          <div style={styles.heroContent} className="home-hero-fade">
            <h1 style={styles.heroHeading}>
              The Smart Platform for
              <br />
              <span
                style={{
                  ...styles.heroAnimated,
                  opacity: textVisible ? 1 : 0,
                  transform: textVisible ? 'translateY(0)' : 'translateY(12px)',
                }}
                className="home-gradient-text"
              >
                {CYCLING_TEXTS[textIndex]}
              </span>
            </h1>
            <p style={styles.heroSub}>
              One platform. Multiple organisations. Zero data leakage. Built for
              businesses that demand security and scale.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/signup" style={styles.btnPrimary}>
                Get Started Free
              </Link>
              <button type="button" style={styles.btnGhost} onClick={scrollToFeatures}>
                See How It Works
              </button>
            </div>
          </div>

          <div style={styles.heroCards} className="home-hero-cards">
            {HERO_STATS.map((stat, i) => (
              <div
                key={stat.label}
                style={{ ...styles.glassCard, animationDelay: `${0.3 + i * 0.2}s` }}
                className="home-float-card"
              >
                <p style={styles.glassValue}>{stat.value}</p>
                <p style={styles.glassLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.section} ref={featuresRef}>
        <h2 style={styles.sectionTitle} className="home-gradient-text">
          Powerful Features
        </h2>
        <p style={styles.sectionSub}>
          Everything you need to run a secure, multi-tenant organisation
        </p>
        <div style={styles.featuresGrid} className="home-features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} visible={featuresVisible} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={styles.sectionSub}>Get up and running in three simple steps</p>
        <div style={styles.stepsRow} className="home-steps-row">
          <div style={styles.stepsLine} className="home-steps-line" />
          {STEPS.map((step) => (
            <div key={step.num} style={styles.step}>
              <div style={styles.stepCircle} className="home-gradient-bg">
                {step.num}
              </div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section style={styles.statsBanner} ref={statsRef}>
        <div style={styles.statsInner} className="home-stats-inner">
          {STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} active={statsVisible} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaGradient} className="home-gradient-bg" />
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <p style={styles.ctaSub}>
          Join hundreds of companies already using our platform
        </p>
        <Link to="/signup" style={styles.ctaBtn}>
          Create Free Account
        </Link>
        <p style={styles.ctaLogin}>
          Already have an account?{' '}
          <Link to="/login" style={styles.ctaLoginLink}>
            Login
          </Link>
        </p>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div>
            <p style={styles.footerBrand}>Multi-Tenant SaaS Dashboard</p>
            <p style={styles.footerTagline}>Secure. Scalable. Isolated.</p>
          </div>
          <div style={styles.footerLinks}>
            <Link to="/signup" style={styles.footerLink}>
              Sign Up
            </Link>
            <Link to="/login" style={styles.footerLink}>
              Login
            </Link>
          </div>
        </div>
        <p style={styles.footerBottom}>
          Built with Spring Boot + React.js + MongoDB
        </p>
      </footer>
    </div>
  )
}

const homeKeyframes = `
  @keyframes homeGradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes homeHeroFadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes homeFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }
  @keyframes homeParticleFloat {
    0%, 100% { transform: translate(0, 0); opacity: 0.3; }
    25% { transform: translate(10px, -20px); opacity: 0.7; }
    50% { transform: translate(-8px, -35px); opacity: 0.5; }
    75% { transform: translate(15px, -15px); opacity: 0.6; }
  }
  .home-gradient-bg {
    background: linear-gradient(135deg, #313E17, #4C5C2D, #FFDE42, #313E17);
    background-size: 300% 300%;
    animation: homeGradientShift 10s ease-in-out infinite;
  }
  .home-gradient-text {
    background: linear-gradient(135deg, #FFDE42, #4C5C2D, #FFDE42);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .home-hero-fade {
    animation: homeHeroFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  .home-float-card {
    animation: homeFloat 4s ease-in-out infinite;
  }
  .home-particle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    animation: homeParticleFloat ease-in-out infinite;
  }
  .home-feature-card:hover {
    transform: translateY(-4px) scale(1.03) !important;
    border-color: rgba(255, 222, 66, 0.5) !important;
    box-shadow: 0 8px 32px rgba(255, 222, 66, 0.15) !important;
  }
  @media (max-width: 900px) {
    .home-hero-inner { grid-template-columns: 1fr !important; }
    .home-hero-cards { align-items: center !important; flex-direction: row !important; flex-wrap: wrap !important; justify-content: center !important; }
    .home-features-grid { grid-template-columns: 1fr 1fr !important; }
    .home-stats-inner { grid-template-columns: 1fr 1fr !important; }
    .home-steps-row { flex-direction: column !important; align-items: center !important; }
    .home-steps-line { display: none !important; }
  }
  @media (max-width: 600px) {
    .home-features-grid { grid-template-columns: 1fr !important; }
    .home-stats-inner { grid-template-columns: 1fr !important; }
  }
`

const styles = {
  page: {
    background: '#1B0C0C',
    color: '#F7F5EB',
    minHeight: '100vh',
    position: 'relative',
    overflowX: 'hidden',
  },
  particlesLayer: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: '4rem 2rem',
    zIndex: 1,
  },
  heroGradient: {
    position: 'absolute',
    inset: 0,
    opacity: 0.15,
    zIndex: 0,
  },
  heroInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  heroContent: {
    maxWidth: '560px',
  },
  heroHeading: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    margin: '0 0 1.5rem',
    color: '#fff',
  },
  heroAnimated: {
    display: 'inline-block',
    transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
  },
  heroSub: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.7,
    margin: '0 0 2rem',
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '0.85rem 1.75rem',
    background: '#FFDE42',
    color: '#1B0C0C',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 20px rgba(255, 222, 66, 0.35)',
  },
  btnGhost: {
    padding: '0.85rem 1.75rem',
    background: 'rgba(255, 222, 66, 0.08)',
    color: '#FFDE42',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '1rem',
    border: '1px solid rgba(255, 222, 66, 0.3)',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'background 0.2s ease',
  },
  heroCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    alignItems: 'flex-end',
  },
  glassCard: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '1.5rem 2rem',
    minWidth: '220px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  glassValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: '0 0 0.25rem',
    background: 'linear-gradient(135deg, #FFDE42, #4C5C2D)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  glassLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  section: {
    minHeight: 'auto',
    padding: '5rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 700,
    textAlign: 'center',
    margin: '0 0 0.75rem',
    color: '#fff',
  },
  sectionSub: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    margin: '0 0 3rem',
    fontSize: '1.05rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1), border-color 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default',
  },
  featureIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    margin: '0 0 0.75rem',
    color: '#fff',
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.6,
    margin: 0,
  },
  stepsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '2rem',
    position: 'relative',
    maxWidth: '900px',
    margin: '0 auto',
  },
  stepsLine: {
    position: 'absolute',
    top: '28px',
    left: '15%',
    right: '15%',
    height: '2px',
    background: 'linear-gradient(90deg, #313E17, #4C5C2D, #FFDE42)',
    opacity: 0.4,
    zIndex: 0,
  },
  step: {
    flex: 1,
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  stepCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1B0C0C',
    margin: '0 auto 1.25rem',
    boxShadow: '0 4px 20px rgba(255, 222, 66, 0.3)',
  },
  stepTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    margin: '0 0 0.5rem',
    color: '#fff',
  },
  stepDesc: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
    lineHeight: 1.5,
  },
  statsBanner: {
    background: 'rgba(0,0,0,0.3)',
    padding: '4rem 2rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'relative',
    zIndex: 1,
  },
  statsInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '2rem',
    textAlign: 'center',
  },
  statItem: {},
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 800,
    margin: '0 0 0.5rem',
    background: 'linear-gradient(135deg, #FFDE42, #4C5C2D, #FFDE42)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  ctaSection: {
    padding: '6rem 2rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
  },
  ctaGradient: {
    position: 'absolute',
    inset: 0,
    opacity: 0.1,
    zIndex: 0,
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    margin: '0 0 1rem',
    position: 'relative',
    zIndex: 1,
  },
  ctaSub: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.65)',
    margin: '0 0 2rem',
    position: 'relative',
    zIndex: 1,
  },
  ctaBtn: {
    display: 'inline-block',
    padding: '1rem 2.5rem',
    background: '#FFDE42',
    color: '#1B0C0C',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '1.1rem',
    textDecoration: 'none',
    boxShadow: '0 8px 30px rgba(255, 222, 66, 0.35)',
    position: 'relative',
    zIndex: 1,
    transition: 'transform 0.2s ease',
  },
  ctaLogin: {
    marginTop: '1.5rem',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.95rem',
    position: 'relative',
    zIndex: 1,
  },
  ctaLoginLink: {
    color: '#FFDE42',
    textDecoration: 'underline',
  },
  footer: {
    padding: '2.5rem 2rem 1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    zIndex: 1,
  },
  footerTop: {
    maxWidth: '1200px',
    margin: '0 auto 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  footerBrand: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 0.25rem',
    color: '#fff',
  },
  footerTagline: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  footerLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
  },
  footerBottom: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.35)',
    margin: 0,
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}
