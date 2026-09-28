import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginAsDemo, getErrorMessage } from '../utils/auth'
import HeroIllustration from '../components/HeroIllustration'

const CYCLING_TEXTS = ['Modern Businesses', 'Multi-Tenant Orgs', 'Growing Teams']

const FEATURES = [
  {
    icon: '🏢',
    category: 'Architecture',
    title: 'Multi-Tenant Architecture',
    desc: 'Custom subdomain routing and organisation-scoped context across every REST endpoint and frontend view.',
  },
  {
    icon: '🔐',
    category: 'Security',
    title: 'Tenant Data Isolation',
    desc: 'Automated database query scoping by Tenant ID, guaranteeing zero cross-tenant data exposure.',
  },
  {
    icon: '🔑',
    category: 'Authentication',
    title: 'Stateless JWT Auth',
    desc: 'Cryptographically signed JWT bearer tokens with embedded tenant claims and automated request interceptors.',
  },
  {
    icon: '👥',
    category: 'Authorization',
    title: 'Role-Based Access Control',
    desc: '4-level role hierarchy (Super Admin, Org Admin, Manager, Viewer) enforced at API and UI levels.',
  },
  {
    icon: '📊',
    category: 'Data Insights',
    title: 'Analytics Dashboard',
    desc: 'Interactive Recharts dashboard visualizing 7-day activity metrics, event distributions, and temporal timelines.',
  },
  {
    icon: '💬',
    category: 'Real-Time',
    title: 'WebSocket Group Chat',
    desc: 'Instant messaging for team members using WebSockets and STOMP protocol, isolated per organization.',
  },
  {
    icon: '📋',
    category: 'Management',
    title: 'Organization & User Tools',
    desc: 'Invite team members, assign granular permissions, review uploaded document submissions, and log attendance.',
  },
  {
    icon: '⚡',
    category: 'Audit Log',
    title: 'System Event Tracking',
    desc: 'Automated event logging for user logins, signups, and administrative actions with live notification updates.',
  },
  {
    icon: '📱',
    category: 'UI / UX',
    title: 'Responsive Dashboard',
    desc: 'Polished mobile and desktop experience featuring dark brown, gold, and olive custom CSS themes.',
  },
]

const STEPS = [
  {
    num: '01',
    icon: '🏢',
    title: 'Create Organisation',
    desc: 'Register your company with a custom subdomain and administrator account in under 30 seconds.',
    tag: 'Tenant Onboarding',
  },
  {
    num: '02',
    icon: '🔐',
    title: 'Secure Authentication',
    desc: 'Authenticate via cryptographically signed JWT bearer tokens with embedded tenant claims and 4-level role scopes.',
    tag: 'Stateless Security',
  },
  {
    num: '03',
    icon: '⚙️',
    title: 'Manage Your Tenant',
    desc: 'Invite team members, assign granular permissions, review uploaded document submissions, and log daily attendance.',
    tag: 'Role Management',
  },
  {
    num: '04',
    icon: '📊',
    title: 'Monitor & Collaborate',
    desc: 'Visualize real-time analytics on 7-day timelines and engage in instant WebSocket group chat per organisation.',
    tag: 'Live Operations',
  },
]

const FLOW_NODES = [
  {
    step: '01',
    icon: '👤',
    title: 'User Request',
    sub: 'Subdomain & HTTP Request',
  },
  {
    step: '02',
    icon: '🔑',
    title: 'JWT Authentication',
    sub: 'Signed Bearer Token Validation',
  },
  {
    step: '03',
    icon: '🆔',
    title: 'Tenant Identification',
    sub: 'Extracts tenantId & User Role',
  },
  {
    step: '04',
    icon: '🛡️',
    title: 'Tenant-Isolated Data',
    sub: 'MongoDB Filtered by tenantId',
  },
  {
    step: '05',
    icon: '📊',
    title: 'Authenticated Dashboard',
    sub: 'Scoped UI View Rendered',
  },
]

const SECURITY_MECHANISMS = [
  {
    icon: '🔑',
    title: 'JWT Authentication & Bearer Tokens',
    badge: 'STATELESS AUTH',
    desc: 'When a user logs in, Spring Boot generates a cryptographically signed JWT token containing their user ID, role, and Tenant ID. Every API request carries this token in HTTP Authorization headers.',
  },
  {
    icon: '🛡️',
    title: 'Tenant Interceptor & Query Scoping',
    badge: 'DATA ISOLATION',
    desc: 'Spring Boot request interceptors validate the token on protected routes, extract the authenticated tenantId, and automatically enforce tenant filters on MongoDB queries to prevent cross-tenant data exposure.',
  },
  {
    icon: '👥',
    title: '4-Level Role Authorization',
    badge: 'RBAC CONTROLS',
    desc: 'Permissions are checked across Super Admin, Org Admin, Manager, and Viewer levels. API endpoints and UI elements dynamically restrict unauthorized actions based on the user role scope.',
  },
  {
    icon: '⚡',
    title: 'Protected APIs & STOMP Channels',
    badge: 'API PROTECTION',
    desc: 'REST API routes require valid bearer tokens, while WebSocket STOMP message channels are strictly restricted to organization-specific topics, keeping real-time chat history scoped per tenant.',
  },
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

export default function Home() {
  const navigate = useNavigate()
  const [textIndex, setTextIndex] = useState(0)
  const [textVisible, setTextVisible] = useState(true)
  const [featuresVisible, setFeaturesVisible] = useState(false)
  const [howItWorksVisible, setHowItWorksVisible] = useState(false)
  const [securityVisible, setSecurityVisible] = useState(false)
  const [demoVisible, setDemoVisible] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState('')

  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const securityRef = useRef(null)
  const demoRef = useRef(null)
  const particles = useRef(generateParticles(25)).current

  const handleDemoLogin = async () => {
    setDemoError('')
    setDemoLoading(true)
    try {
      await loginAsDemo()
      navigate('/dashboard')
    } catch (err) {
      setDemoError(getErrorMessage(err, 'Failed to launch demo session. Please try normal login.'))
      setDemoLoading(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) setIsScrolled(true)
      else setIsScrolled(false)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTextVisible(false)
      setTimeout(() => {
        setTextIndex((i) => (i + 1) % CYCLING_TEXTS.length)
        setTextVisible(true)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === featuresRef.current && entry.isIntersecting) setFeaturesVisible(true)
          if (entry.target === howItWorksRef.current && entry.isIntersecting) setHowItWorksVisible(true)
          if (entry.target === securityRef.current && entry.isIntersecting) setSecurityVisible(true)
          if (entry.target === demoRef.current && entry.isIntersecting) setDemoVisible(true)
        })
      },
      { threshold: 0.15 }
    )

    if (featuresRef.current) observer.observe(featuresRef.current)
    if (howItWorksRef.current) observer.observe(howItWorksRef.current)
    if (securityRef.current) observer.observe(securityRef.current)
    if (demoRef.current) observer.observe(demoRef.current)

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={styles.page}>
      <style>{homeKeyframes}</style>

      {/* Floating Particles */}
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

      {/* Top Navbar */}
      <header
        style={{
          ...styles.navHeader,
          ...(isScrolled ? styles.navHeaderScrolled : {}),
        }}
      >
        <div style={styles.navInner}>
          <div style={styles.navBrand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span style={styles.navLogoIcon}>⚡</span>
            <span style={styles.navTitle}>SaaS Dashboard</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav" style={styles.navLinks}>
            <button type="button" style={styles.navNavLink} onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button type="button" style={styles.navNavLink} onClick={() => scrollToSection('how-it-works')}>
              How It Works
            </button>
            <button type="button" style={styles.navNavLink} onClick={() => scrollToSection('security')}>
              Security
            </button>
            <button type="button" style={styles.navNavLink} onClick={() => scrollToSection('demo')}>
              Demo
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="desktop-nav" style={styles.navActions}>
            <Link to="/login" style={styles.navLoginLink}>
              Login
            </Link>
            <Link to="/signup" style={styles.navSignupLink}>
              Sign Up
            </Link>
            <button
              type="button"
              style={styles.navDemoBtn}
              onClick={handleDemoLogin}
              disabled={demoLoading}
            >
              {demoLoading ? 'Opening...' : '⚡ Explore Live Demo'}
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-hamburger"
            style={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div style={styles.mobileDropdown}>
            <button type="button" style={styles.mobileNavLink} onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button type="button" style={styles.mobileNavLink} onClick={() => scrollToSection('how-it-works')}>
              How It Works
            </button>
            <button type="button" style={styles.mobileNavLink} onClick={() => scrollToSection('security')}>
              Security
            </button>
            <button type="button" style={styles.mobileNavLink} onClick={() => scrollToSection('demo')}>
              Demo
            </button>
            <div style={styles.mobileActions}>
              <Link to="/login" style={styles.mobileLoginBtn} onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" style={styles.mobileSignupBtn} onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
              <button
                type="button"
                style={styles.mobileDemoBtn}
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleDemoLogin()
                }}
                disabled={demoLoading}
              >
                {demoLoading ? 'Opening Demo...' : '⚡ Explore Live Demo'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroGradient} className="home-gradient-bg" />
        <div style={styles.heroInner} className="home-hero-inner">
          <div style={styles.heroContent} className="home-hero-fade">
            {/* Quick Demo Banner */}
            <div style={styles.topDemoBanner} className="home-top-demo-banner">
              <div style={styles.topDemoBannerTextGroup}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={styles.topDemoBadge}>⚡ LIVE DEMO</span>
                  <strong style={styles.topDemoBannerTitle}>Want to explore without signing up?</strong>
                </div>
                <p style={styles.topDemoBannerSub}>Launch the live demo and explore the dashboard with pre-seeded data.</p>
              </div>
              <button
                type="button"
                style={styles.topDemoBannerBtn}
                onClick={handleDemoLogin}
                disabled={demoLoading}
              >
                {demoLoading ? (
                  <>
                    <span className="button-spinner"></span>
                    Opening...
                  </>
                ) : (
                  'Explore Live Demo →'
                )}
              </button>
            </div>

            <div style={styles.heroBadge}>
              <span>⚡ Enterprise Multi-Tenant Platform</span>
            </div>
            <h1 style={styles.heroHeading}>
              The Smart Platform for
              <br />
              <span
                style={{
                  ...styles.heroAnimated,
                  opacity: textVisible ? 1 : 0,
                  transform: textVisible ? 'translateY(0)' : 'translateY(10px)',
                }}
                className="home-gradient-text"
              >
                {CYCLING_TEXTS[textIndex]}
              </span>
            </h1>
            <p style={styles.heroSub}>
              One platform. Multiple organisations. Secure tenant isolation. Built for
              businesses that demand control, visibility, and scale.
            </p>

            <div style={styles.heroButtons} className="home-hero-buttons">
              <button
                type="button"
                style={styles.btnDemoPrimary}
                onClick={handleDemoLogin}
                disabled={demoLoading}
              >
                {demoLoading ? (
                  <>
                    <span className="button-spinner"></span>
                    Opening Demo...
                  </>
                ) : (
                  <>
                    <span>⚡</span> Explore Live Demo
                  </>
                )}
              </button>
              <button
                type="button"
                style={styles.btnGhost}
                onClick={() => scrollToSection('how-it-works')}
              >
                See How It Works
              </button>
            </div>

            {demoError && (
              <div className="alert alert-error" style={{ marginTop: '1.25rem', textAlign: 'left' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>{demoError}</p>
                <Link to="/login" style={{ color: '#b91c1c', fontWeight: 600, textDecoration: 'underline' }}>
                  Proceed to normal Login →
                </Link>
              </div>
            )}
          </div>

          <div style={styles.heroRightColumn} className="home-hero-cards">
            <HeroIllustration onDemoClick={handleDemoLogin} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.section} ref={featuresRef}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>CORE CAPABILITIES</span>
          <h2 style={styles.sectionTitle} className="home-gradient-text">
            Built for Security, Isolation & Speed
          </h2>
          <p style={styles.sectionSub}>
            Comprehensive multi-tenant capability suite for modern enterprise operations
          </p>
        </div>

        <div style={styles.featuresGrid} className="home-features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="home-feature-card"
              style={{
                ...styles.featureCard,
                opacity: featuresVisible ? 1 : 0,
                transform: featuresVisible ? 'translateY(0) scale(1)' : 'translateY(25px) scale(0.98)',
                transitionDelay: `${i * 0.06}s`,
              }}
            >
              <div style={styles.featureTopRow}>
                <span style={styles.featureIconCircle}>{f.icon}</span>
                <span style={styles.featureCategoryTag}>{f.category}</span>
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={styles.section} ref={howItWorksRef}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>PLATFORM WORKFLOW</span>
          <h2 style={styles.sectionTitle} className="home-gradient-text">
            How It Works
          </h2>
          <p style={styles.sectionSub}>
            Architected for instant onboarding, secure tenant isolation, and real-time collaboration
          </p>
        </div>

        {/* 4-Step Visual Flow Grid */}
        <div style={styles.stepsRow} className="home-steps-row">
          <div style={styles.stepsLine} className="home-steps-line" />
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="home-step-card"
              style={{
                ...styles.stepCard,
                opacity: howItWorksVisible ? 1 : 0,
                transform: howItWorksVisible ? 'translateY(0) scale(1)' : 'translateY(35px) scale(0.96)',
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: `${i * 0.12}s`,
              }}
            >
              <div style={styles.stepTopRow}>
                <div style={styles.stepCircle} className="home-gradient-bg">
                  {step.num}
                </div>
                <span style={styles.stepTag}>{step.tag}</span>
              </div>
              <div style={styles.stepTitleRow}>
                <span style={{ fontSize: '1.35rem' }}>{step.icon}</span>
                <h3 style={styles.stepTitle}>{step.title}</h3>
              </div>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* Security Architecture Section */}
      <section id="security" style={styles.section} ref={securityRef}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>TENANT SECURITY MODEL</span>
          <h2 style={styles.sectionTitle} className="home-gradient-text">
            Built for Secure Multi-Tenancy
          </h2>
          <p style={styles.sectionSub}>
            Designed with tenant isolation, cryptographically verified tokens, and protected API access.
          </p>
        </div>

        {/* 5-Step Visual Architecture Flow Diagram */}
        <div
          style={{
            ...styles.archFlowContainer,
            opacity: securityVisible ? 1 : 0,
            transform: securityVisible ? 'translateY(0)' : 'translateY(25px)',
            transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="home-arch-container"
        >
          <div style={styles.archFlowHeader}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFDE42', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              REQUEST ISOLATION PIPELINE
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '0.25rem 0 0' }}>
              How User Requests Pass Through Tenant Security
            </h3>
          </div>

          <div style={styles.archFlowGrid} className="home-arch-grid">
            {FLOW_NODES.map((node, i) => (
              <div key={node.step} style={{ display: 'contents' }}>
                <div style={styles.archNodeCard} className="home-arch-node">
                  <span style={styles.archNodeStep}>{node.step}</span>
                  <span style={styles.archNodeIcon}>{node.icon}</span>
                  <h4 style={styles.archNodeTitle}>{node.title}</h4>
                  <p style={styles.archNodeSub}>{node.sub}</p>
                </div>
                {i < FLOW_NODES.length - 1 && (
                  <div style={styles.archConnector} className="home-arch-arrow">
                    <span style={styles.archArrowText}>↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Mechanism Cards */}
        <div
          style={{
            ...styles.securityBanner,
            opacity: securityVisible ? 1 : 0,
            transform: securityVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
            marginTop: '2.5rem',
          }}
        >
          <div style={styles.securityHeader}>
            <span style={styles.sectionBadge}>ENFORCEMENT MECHANISMS</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '0.35rem 0 0' }}>
              Backend Protections & Scoped Access Control
            </h3>
          </div>

          <div style={styles.securityGrid} className="home-security-grid">
            {SECURITY_MECHANISMS.map((m) => (
              <div key={m.title} style={styles.securityCard} className="home-security-card">
                <div style={styles.securityCardHeader}>
                  <span style={styles.securityCardIcon}>{m.icon}</span>
                  <span style={styles.securityCardBadge}>{m.badge}</span>
                </div>
                <h4 style={styles.securityCardTitle}>{m.title}</h4>
                <p style={styles.securityCardDesc}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo CTA Section */}
      <section id="demo" style={styles.ctaSection} ref={demoRef}>
        <div style={{ ...styles.ctaCard, opacity: demoVisible ? 1 : 0.6, transform: demoVisible ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
          <div style={styles.ctaGradient} className="home-gradient-bg" />
          <span style={styles.sectionBadge}>INSTANT LIVE DEMO</span>
          <h2 style={styles.ctaTitle}>Ready to explore the live dashboard?</h2>
          <p style={styles.ctaSub}>
            Launch an instant live session with pre-seeded analytics, team members, document workflows, and real-time chat.
          </p>

          <button
            type="button"
            style={styles.ctaDemoBtn}
            onClick={handleDemoLogin}
            disabled={demoLoading}
          >
            {demoLoading ? (
              <>
                <span className="button-spinner"></span>
                Opening Demo...
              </>
            ) : (
              '⚡ Launch Live Demo'
            )}
          </button>

          <p style={styles.ctaLogin}>
            Want to register a custom organization?{' '}
            <Link to="/signup" style={styles.ctaLoginLink}>
              Create Organisation
            </Link>
            {' '}or{' '}
            <Link to="/login" style={styles.ctaLoginLink}>
              Login
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div>
            <p style={styles.footerBrand}>Multi-Tenant SaaS Dashboard</p>
            <p style={styles.footerTagline}>Modern Multi-Tenant Business Management Platform</p>
          </div>
          <div style={styles.footerLinks}>
            <button type="button" style={styles.footerLinkBtn} onClick={() => scrollToSection('features')}>
              Features
            </button>
            <button type="button" style={styles.footerLinkBtn} onClick={() => scrollToSection('security')}>
              Security
            </button>
            <Link to="/signup" style={styles.footerLink}>
              Sign Up
            </Link>
            <Link to="/login" style={styles.footerLink}>
              Login
            </Link>
          </div>
        </div>
        <p style={styles.footerBottom}>
          © {new Date().getFullYear()} SaaS Dashboard. All rights reserved.
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
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes homeFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes homeParticleFloat {
    0%, 100% { transform: translate(0, 0); opacity: 0.25; }
    25% { transform: translate(10px, -20px); opacity: 0.6; }
    50% { transform: translate(-8px, -35px); opacity: 0.4; }
    75% { transform: translate(12px, -15px); opacity: 0.5; }
  }
  .home-gradient-bg {
    background: linear-gradient(135deg, #181315, #241D17, #2F2418, #181315);
    background-size: 300% 300%;
    animation: homeGradientShift 10s ease-in-out infinite;
  }
  .home-gradient-text {
    background: linear-gradient(135deg, #FFDE42, #F3C623, #FFDE42);
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
  .home-feature-card:hover,
  .home-step-card:hover,
  .home-arch-node:hover,
  .home-security-card:hover {
    transform: translateY(-4px) scale(1.02) !important;
    border-color: rgba(255, 222, 66, 0.4) !important;
    box-shadow: 0 10px 30px rgba(255, 222, 66, 0.12) !important;
  }
  .home-tech-card:hover {
    border-color: rgba(255, 222, 66, 0.35) !important;
    background: rgba(255, 222, 66, 0.05) !important;
  }

  /* Responsive Rules for 1440px, 1280px, 1024px, 768px, 480px, 375px */
  @media (max-width: 1280px) {
    .home-section-container { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
  }

  @media (max-width: 1024px) {
    .home-steps-row { grid-template-columns: 1fr 1fr !important; gap: 1.5rem !important; }
    .home-steps-line { display: none !important; }
    .home-arch-grid { flex-direction: column !important; gap: 0.75rem !important; }
    .home-arch-arrow { transform: rotate(90deg) !important; margin: 0.25rem 0 !important; }
    .home-security-grid { grid-template-columns: 1fr !important; }
    .home-hero-title { font-size: 2.75rem !important; }
  }

  @media (max-width: 900px) {
    .desktop-nav { display: none !important; }
    .mobile-hamburger { display: flex !important; }
    .home-hero-inner { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
    .home-hero-cards { align-items: center !important; flex-direction: row !important; flex-wrap: wrap !important; justify-content: center !important; }
    .home-features-grid { grid-template-columns: 1fr 1fr !important; }
  }

  @media (max-width: 768px) {
    .home-hero-title { font-size: 2.25rem !important; }
    .home-hero-subtitle { font-size: 1rem !important; }
    .home-hero-buttons { flex-direction: column !important; width: 100% !important; }
    .home-hero-buttons button { width: 100% !important; justify-content: center !important; }
    .home-top-demo-banner { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
    .home-top-demo-banner button { width: 100% !important; justify-content: center !important; }
    .home-tech-grid { grid-template-columns: 1fr 1fr !important; }
  }

  @media (max-width: 480px) {
    .home-features-grid { grid-template-columns: 1fr !important; }
    .home-steps-row { grid-template-columns: 1fr !important; }
    .home-tech-grid { grid-template-columns: 1fr !important; }
    .home-hero-title { font-size: 1.85rem !important; }
    .home-hero-subtitle { font-size: 0.95rem !important; }
    .home-section-title { font-size: 1.65rem !important; }
  }

  @media (max-width: 375px) {
    .home-nav-header { padding: 0.75rem 1rem !important; }
    .home-nav-title { font-size: 1rem !important; }
    .home-hero-title { font-size: 1.65rem !important; }
    .home-hero-badge { font-size: 0.75rem !important; padding: 0.35rem 0.75rem !important; }
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .home-gradient-bg, .home-float-card, .home-particle, .home-hero-fade {
      animation: none !important;
      transition: none !important;
    }
  }
`

const styles = {
  page: {
    background: '#0C0A0B',
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
  navHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '1rem 2rem',
    transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease',
  },
  navHeaderScrolled: {
    background: 'rgba(12, 10, 11, 0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  navInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    cursor: 'pointer',
  },
  navLogoIcon: {
    fontSize: '1.25rem',
  },
  navTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.75rem',
  },
  navNavLink: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: 0,
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navLoginLink: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.95rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  navSignupLink: {
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 600,
    textDecoration: 'none',
    padding: '0.45rem 0.9rem',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  navDemoBtn: {
    padding: '0.55rem 1.15rem',
    background: '#FFDE42',
    color: '#0C0A0B',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255, 222, 66, 0.3)',
    transition: 'transform 0.15s, background 0.15s',
  },
  hamburgerBtn: {
    display: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1.25rem',
    width: '40px',
    height: '40px',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  mobileDropdown: {
    marginTop: '0.75rem',
    padding: '1.25rem',
    background: 'rgba(18, 14, 16, 0.96)',
    backdropFilter: 'blur(20px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mobileNavLink: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    textAlign: 'left',
    padding: '0.4rem 0',
    cursor: 'pointer',
  },
  mobileActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  mobileLoginBtn: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '0.95rem',
    textAlign: 'center',
    padding: '0.6rem',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
  },
  mobileSignupBtn: {
    color: '#0C0A0B',
    background: '#F7F5EB',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    textAlign: 'center',
    padding: '0.6rem',
    borderRadius: '8px',
  },
  mobileDemoBtn: {
    background: '#FFDE42',
    color: '#0C0A0B',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: 700,
    padding: '0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    padding: '8rem 2rem 5rem',
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
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '3rem',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  topDemoBanner: {
    background: 'rgba(255, 222, 66, 0.06)',
    border: '1px solid rgba(255, 222, 66, 0.22)',
    borderRadius: '16px',
    padding: '0.85rem 1.15rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  },
  topDemoBannerTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  topDemoBadge: {
    fontSize: '0.65rem',
    fontWeight: 800,
    color: '#FFDE42',
    background: 'rgba(255, 222, 66, 0.14)',
    border: '1px solid rgba(255, 222, 66, 0.3)',
    borderRadius: '6px',
    padding: '0.15rem 0.45rem',
    letterSpacing: '0.04em',
  },
  topDemoBannerTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
  },
  topDemoBannerSub: {
    fontSize: '0.82rem',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    lineHeight: 1.35,
  },
  topDemoBannerBtn: {
    background: '#FFDE42',
    color: '#0C0A0B',
    borderRadius: '10px',
    fontWeight: 800,
    fontSize: '0.88rem',
    padding: '0.6rem 1.15rem',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px rgba(255, 222, 66, 0.35)',
    transition: 'transform 0.15s, background 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  heroBadge: {
    display: 'inline-block',
    padding: '0.35rem 0.85rem',
    background: 'rgba(255, 222, 66, 0.1)',
    border: '1px solid rgba(255, 222, 66, 0.25)',
    borderRadius: '999px',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#FFDE42',
    marginBottom: '1.25rem',
  },
  heroHeading: {
    fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    margin: '0 0 1.5rem',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  heroAnimated: {
    display: 'inline-block',
    transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
  },
  heroSub: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 1.7,
    margin: '0 0 2rem',
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  btnDemoPrimary: {
    padding: '0.9rem 2rem',
    background: '#FFDE42',
    color: '#0C0A0B',
    borderRadius: '10px',
    fontWeight: 800,
    fontSize: '1.05rem',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 20px rgba(255, 222, 66, 0.35)',
  },
  btnGhost: {
    padding: '0.9rem 1.75rem',
    background: 'rgba(255, 222, 66, 0.06)',
    color: '#FFDE42',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '1rem',
    border: '1px solid rgba(255, 222, 66, 0.25)',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'background 0.2s ease',
  },
  heroRightColumn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  glassCard: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '1.5rem 2rem',
    minWidth: '240px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  glassValue: {
    fontSize: '1.35rem',
    fontWeight: 700,
    margin: '0 0 0.25rem',
    background: 'linear-gradient(135deg, #FFDE42, #F3C623)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  glassLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
  },
  section: {
    padding: '6rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '3.5rem',
  },
  sectionBadge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#FFDE42',
    textTransform: 'uppercase',
    display: 'inline-block',
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: 700,
    textAlign: 'center',
    margin: '0 0 0.75rem',
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  sectionSub: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
    fontSize: '1.05rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.75rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default',
  },
  featureTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  featureIconCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(255, 222, 66, 0.1)',
    border: '1px solid rgba(255, 222, 66, 0.22)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    boxShadow: '0 4px 12px rgba(255, 222, 66, 0.12)',
  },
  featureCategoryTag: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#FFDE42',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    background: 'rgba(255, 222, 66, 0.1)',
    border: '1px solid rgba(255, 222, 66, 0.22)',
    borderRadius: '6px',
    padding: '0.2rem 0.55rem',
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: '0 0 0.5rem',
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  featureDesc: {
    fontSize: '0.88rem',
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 1.6,
    margin: 0,
  },
  stepsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.25rem',
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  stepsLine: {
    position: 'absolute',
    top: '32px',
    left: '12%',
    right: '12%',
    height: '2px',
    background: 'linear-gradient(90deg, #181315, #FFDE42, #181315)',
    opacity: 0.35,
    zIndex: 0,
  },
  stepCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem 1.25rem',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  },
  stepTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  stepCircle: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#0C0A0B',
    boxShadow: '0 4px 16px rgba(255, 222, 66, 0.3)',
    flexShrink: 0,
  },
  stepTag: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#FFDE42',
    background: 'rgba(255, 222, 66, 0.12)',
    border: '1px solid rgba(255, 222, 66, 0.25)',
    borderRadius: '6px',
    padding: '0.2rem 0.5rem',
    letterSpacing: '0.02em',
  },
  stepTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0.25rem 0 0.5rem',
  },
  stepTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    margin: 0,
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  stepDesc: {
    fontSize: '0.88rem',
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
    lineHeight: 1.55,
  },
  techSummaryContainer: {
    marginTop: '4rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 222, 66, 0.2)',
    borderRadius: '24px',
    padding: '2.5rem 2rem',
    backdropFilter: 'blur(16px)',
  },
  techSummaryHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  techSummaryBadge: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#FFDE42',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    display: 'inline-block',
    marginBottom: '0.35rem',
  },
  techSummaryTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 0.5rem',
  },
  techSummarySub: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.65)',
    margin: 0,
    maxWidth: '640px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  techCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    padding: '1rem 1.15rem',
    transition: 'border-color 0.2s ease, background 0.2s ease',
  },
  techIcon: {
    fontSize: '1.4rem',
    flexShrink: 0,
  },
  techCardTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  techCardDesc: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: '0.2rem 0 0',
    lineHeight: 1.4,
  },
  archFlowContainer: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 222, 66, 0.2)',
    borderRadius: '24px',
    padding: '2.5rem 2rem',
    backdropFilter: 'blur(16px)',
    marginTop: '2.5rem',
  },
  archFlowHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  archFlowGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  archNodeCard: {
    flex: 1,
    background: 'rgba(0, 0, 0, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '1.25rem 1rem',
    textAlign: 'center',
    position: 'relative',
    transition: 'transform 0.25s ease, border-color 0.25s ease',
  },
  archNodeStep: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    fontSize: '0.65rem',
    fontWeight: 800,
    color: '#FFDE42',
    opacity: 0.7,
  },
  archNodeIcon: {
    fontSize: '1.8rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  archNodeTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 0.35rem',
  },
  archNodeSub: {
    fontSize: '0.78rem',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    lineHeight: 1.35,
  },
  archConnector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFDE42',
    fontSize: '1.25rem',
    fontWeight: 800,
    padding: '0 0.25rem',
    flexShrink: 0,
  },
  archArrowText: {
    transform: 'rotate(-90deg)',
    display: 'inline-block',
  },
  securityBanner: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '3rem 2.5rem',
    backdropFilter: 'blur(16px)',
  },
  securityHeader: {
    marginBottom: '2rem',
  },
  securityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  securityCard: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.75rem 1.5rem',
    transition: 'transform 0.25s ease, border-color 0.25s ease',
  },
  securityCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  securityCardIcon: {
    fontSize: '1.75rem',
  },
  securityCardBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#FFDE42',
    background: 'rgba(255, 222, 66, 0.12)',
    border: '1px solid rgba(255, 222, 66, 0.25)',
    borderRadius: '6px',
    padding: '0.2rem 0.5rem',
    letterSpacing: '0.04em',
  },
  securityCardTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 0.5rem',
  },
  securityCardDesc: {
    fontSize: '0.88rem',
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 1.6,
    margin: 0,
  },
  ctaSection: {
    padding: '6rem 2rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  ctaCard: {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 222, 66, 0.25)',
    borderRadius: '24px',
    padding: '4rem 2rem',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
  },
  ctaGradient: {
    position: 'absolute',
    inset: 0,
    opacity: 0.12,
    zIndex: 0,
  },
  ctaTitle: {
    fontSize: '2.25rem',
    fontWeight: 700,
    margin: '0.5rem 0 1rem',
    position: 'relative',
    zIndex: 1,
    color: '#fff',
  },
  ctaSub: {
    fontSize: '1.05rem',
    color: 'rgba(255,255,255,0.7)',
    margin: '0 auto 2.25rem',
    maxWidth: '640px',
    lineHeight: 1.6,
    position: 'relative',
    zIndex: 1,
  },
  ctaDemoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem 2.5rem',
    background: '#FFDE42',
    color: '#0C0A0B',
    borderRadius: '12px',
    fontWeight: 800,
    fontSize: '1.1rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(255, 222, 66, 0.4)',
    position: 'relative',
    zIndex: 1,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  ctaLogin: {
    marginTop: '1.75rem',
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
    padding: '3rem 2rem 1.75rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    zIndex: 1,
  },
  footerTop: {
    maxWidth: '1200px',
    margin: '0 auto 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  footerBrand: {
    fontSize: '1.05rem',
    fontWeight: 700,
    margin: '0 0 0.35rem',
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
    alignItems: 'center',
  },
  footerLinkBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  footerBottom: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}
