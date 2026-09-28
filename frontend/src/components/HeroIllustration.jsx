import { useEffect, useRef, useState } from 'react'

export default function HeroIllustration({ onDemoClick }) {
  const containerRef = useRef(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900 || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    let animationFrameId
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Subtle mouse offset (max ~8px shift)
      targetX = ((e.clientX - centerX) / (rect.width / 2)) * 8
      targetY = ((e.clientY - centerY) / (rect.height / 2)) * 8
    }

    const updateParallax = () => {
      setParallax((prev) => ({
        x: prev.x + (targetX - prev.x) * 0.06,
        y: prev.y + (targetY - prev.y) * 0.06,
      }))
      animationFrameId = requestAnimationFrame(updateParallax)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animationFrameId = requestAnimationFrame(updateParallax)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  // Multipliers for distinct depth layering (subtle shifts)
  const bgTransform = `translate3d(${parallax.x * 0.25}px, ${parallax.y * 0.25}px, 0)`
  const robotTransform = `translate3d(${parallax.x * 0.35}px, ${parallax.y * 0.35}px, 0)`
  const mainTransform = `translate3d(${parallax.x * 0.65}px, ${parallax.y * 0.65}px, 0) scale(${isHovered ? 1.025 : 1})`
  const floatCardsTransform = `translate3d(${parallax.x * 1.1}px, ${parallax.y * 1.1}px, 0)`

  return (
    <div
      ref={containerRef}
      className="hero-illustration-wrapper"
      aria-hidden="true"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={() => onDemoClick && onDemoClick()}
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        position: 'relative',
        userSelect: 'none',
        cursor: onDemoClick ? 'pointer' : 'default',
      }}
    >
      <svg
        viewBox="0 0 540 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: 'auto',
          overflow: 'visible',
          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))',
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2224" />
            <stop offset="50%" stopColor="#141012" />
            <stop offset="100%" stopColor="#382C24" />
          </linearGradient>

          <linearGradient id="robotGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE875" />
            <stop offset="100%" stopColor="#FFDE42" />
          </linearGradient>

          <linearGradient id="dashCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(28, 22, 24, 0.92)" />
            <stop offset="100%" stopColor="rgba(14, 11, 12, 0.98)" />
          </linearGradient>

          <linearGradient id="glowLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDE42" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#FFDE42" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFDE42" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id="chartBarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#2A2224" />
            <stop offset="100%" stopColor="#FFDE42" />
          </linearGradient>

          {/* Filters */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="pulseGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ================= LAYER 1: BACKGROUND PARTICLES & GLOW ================= */}
        <g style={{ transform: bgTransform, transition: 'transform 0.2s cubic-bezier(0.1, 0, 0.1, 1)' }}>
          {/* Ambient Glow Orbs */}
          <circle cx="270" cy="240" r="180" fill="rgba(255, 222, 66, 0.05)" filter="url(#pulseGlow)" />
          <circle cx="360" cy="180" r="120" fill="rgba(255, 222, 66, 0.04)" filter="url(#pulseGlow)" />

          {/* Floating Data Particles */}
          <circle cx="60" cy="120" r="3" fill="#FFDE42" className="hero-particle p1" opacity="0.6" />
          <circle cx="480" cy="90" r="4" fill="rgba(255, 255, 255, 0.5)" className="hero-particle p2" opacity="0.7" />
          <circle cx="490" cy="380" r="2.5" fill="#FFDE42" className="hero-particle p3" opacity="0.5" />
          <circle cx="40" cy="390" r="3" fill="rgba(255, 222, 66, 0.4)" className="hero-particle p4" opacity="0.6" />
          <circle cx="220" cy="460" r="3.5" fill="#FFDE42" className="hero-particle p5" opacity="0.8" />
        </g>

        {/* ================= LAYER 2: CONNECTING FLOW LINES ================= */}
        <g opacity="0.65">
          <path
            d="M 130 260 C 180 200, 220 180, 270 210"
            stroke="url(#glowLineGrad)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="hero-dash-line"
          />
          <path
            d="M 390 280 C 430 320, 410 380, 360 410"
            stroke="url(#glowLineGrad)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="hero-dash-line-rev"
          />
        </g>

        {/* ================= LAYER 3: MAIN FLOATING DASHBOARD PANEL ================= */}
        <g
          style={{
            transform: mainTransform,
            transformOrigin: '310px 225px',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="hero-main-dashboard"
        >
          {/* Main Dashboard Surface */}
          <rect
            x="140"
            y="90"
            width="340"
            height="270"
            rx="16"
            fill="url(#dashCardBg)"
            stroke={isHovered ? 'rgba(255, 222, 66, 0.6)' : 'rgba(255, 222, 66, 0.25)'}
            strokeWidth={isHovered ? '2' : '1.5'}
            style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
          />

          {/* Top Window Bar */}
          <rect x="140" y="90" width="340" height="34" rx="16" fill="rgba(255, 255, 255, 0.04)" />
          <circle cx="162" cy="107" r="4" fill="#ff5f56" />
          <circle cx="176" cy="107" r="4" fill="#ffbd2e" />
          <circle cx="190" cy="107" r="4" fill="#27c93f" />

          {/* Subdomain / Tenant Selector Pill */}
          <rect x="210" y="100" width="160" height="14" rx="7" fill="rgba(255, 222, 66, 0.1)" stroke="rgba(255, 222, 66, 0.25)" strokeWidth="1" />
          <text x="220" y="111" fill="#FFDE42" fontSize="8" fontWeight="600" fontFamily="sans-serif">
            acme-corp.saas-app.com
          </text>
          <rect x="345" y="103" width="20" height="8" rx="4" fill="#FFDE42" />

          {/* Dashboard Header Bar */}
          <text x="160" y="152" fill="#FFFFFF" fontSize="13" fontWeight="700" fontFamily="sans-serif">
            Organisation Analytics
          </text>
          <rect x="390" y="140" width="75" height="18" rx="9" fill="rgba(255, 222, 66, 0.12)" stroke="rgba(255, 222, 66, 0.3)" />
          <text x="400" y="152" fill="#FFDE42" fontSize="8" fontWeight="600" fontFamily="sans-serif">
            ⚡ Live STOMP
          </text>

          {/* Multi-Tenant Metric Boxes */}
          <rect x="160" y="168" width="95" height="42" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" />
          <text x="168" y="182" fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="600" fontFamily="sans-serif">ACTIVE TENANTS</text>
          <text x="168" y="199" fill="#FFDE42" fontSize="13" fontWeight="800" fontFamily="sans-serif">1,284</text>

          <rect x="263" y="168" width="95" height="42" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" />
          <text x="271" y="182" fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="600" fontFamily="sans-serif">JWT SESSIONS</text>
          <text x="271" y="199" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="sans-serif">99.98%</text>

          <rect x="366" y="168" width="98" height="42" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" />
          <text x="374" y="182" fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="600" fontFamily="sans-serif">ROLE SCOPED</text>
          <text x="374" y="199" fill="#FFDE42" fontSize="13" fontWeight="800" fontFamily="sans-serif">Org Admin</text>

          {/* Animated Bar Chart Section */}
          <rect x="160" y="222" width="304" height="118" rx="10" fill="rgba(0, 0, 0, 0.3)" stroke="rgba(255, 255, 255, 0.05)" />

          {/* Horizontal Grid lines */}
          <line x1="175" y1="245" x2="450" y2="245" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="175" y1="275" x2="450" y2="275" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="175" y1="305" x2="450" y2="305" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

          {/* Animated Chart Bars (accelerates on hover) */}
          <g className={`hero-chart-bars ${isHovered ? 'is-hovered' : ''}`}>
            <rect x="190" y="260" width="16" height="55" rx="4" fill="url(#chartBarGrad)" className="bar-b1" />
            <rect x="225" y="240" width="16" height="75" rx="4" fill="url(#chartBarGrad)" className="bar-b2" />
            <rect x="260" y="270" width="16" height="45" rx="4" fill="url(#chartBarGrad)" className="bar-b3" />
            <rect x="295" y="230" width="16" height="85" rx="4" fill="url(#chartBarGrad)" className="bar-b4" />
            <rect x="330" y="250" width="16" height="65" rx="4" fill="url(#chartBarGrad)" className="bar-b5" />
            <rect x="365" y="235" width="16" height="80" rx="4" fill="url(#chartBarGrad)" className="bar-b6" />
            <rect x="400" y="225" width="16" height="90" rx="4" fill="url(#chartBarGrad)" className="bar-b7" />
          </g>

          {/* Smooth Trend Spline */}
          <path
            d="M 198 260 Q 233 220, 268 265 T 338 230 T 408 220"
            fill="none"
            stroke="#FFDE42"
            strokeWidth="2.5"
            filter="url(#goldGlow)"
          />
          <circle cx="408" cy="220" r="4" fill="#FFDE42" filter="url(#goldGlow)" />

          {/* Hover Live Demo Tooltip Badge */}
          <g
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.92)',
              transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: '310px 60px',
            }}
          >
            <rect
              x="230"
              y="48"
              width="160"
              height="26"
              rx="13"
              fill="#FFDE42"
              filter="url(#goldGlow)"
            />
            <text x="310" y="65" fill="#1B0C0C" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
              ⚡ Click to Test Live Demo
            </text>
          </g>
        </g>

        {/* ================= LAYER 4: CARTOON SAAS ROBOT CHARACTER ================= */}
        <g style={{ transform: robotTransform, transition: 'transform 0.2s cubic-bezier(0.1, 0, 0.1, 1)' }} className="hero-robot-character">
          {/* Robot Shadow */}
          <ellipse cx="100" cy="445" rx="55" ry="12" fill="rgba(0, 0, 0, 0.45)" filter="url(#pulseGlow)" />

          {/* Entire Floating Robot Body Group */}
          <g className="hero-robot-bob">
            {/* Antenna & Pulsing Tip */}
            <line x1="100" y1="185" x2="100" y2="155" stroke="#FFDE42" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
            <circle cx="100" cy="150" r="7" fill="#FFDE42" filter="url(#goldGlow)" className="hero-antenna-glow" />

            {/* Robot Head */}
            <rect
              x="60"
              y="180"
              width="80"
              height="65"
              rx="22"
              fill="url(#robotBodyGrad)"
              stroke="#FFDE42"
              strokeWidth="2"
            />

            {/* Visor Screen */}
            <rect x="70" y="193" width="60" height="34" rx="12" fill="#0C0A0B" stroke="rgba(255, 222, 66, 0.4)" strokeWidth="1.5" />

            {/* Glowing Eyes with Blink */}
            <g className="hero-robot-eyes">
              <ellipse cx="85" cy="207" rx="5" ry="7" fill="#FFDE42" filter="url(#goldGlow)" />
              <ellipse cx="115" cy="207" rx="5" ry="7" fill="#FFDE42" filter="url(#goldGlow)" />
              {/* Eye Reflection Highlights */}
              <circle cx="83" cy="204" r="1.5" fill="#FFFFFF" />
              <circle cx="113" cy="204" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Cheerful Visor Smile */}
            <path d="M 94 218 Q 100 223, 106 218" fill="none" stroke="#FFDE42" strokeWidth="2" strokeLinecap="round" />

            {/* Neck Joint */}
            <rect x="90" y="245" width="20" height="10" rx="4" fill="#2A2224" />

            {/* Robot Body / Torso */}
            <rect
              x="50"
              y="255"
              width="100"
              height="115"
              rx="28"
              fill="url(#robotBodyGrad)"
              stroke="rgba(255, 222, 66, 0.4)"
              strokeWidth="2"
            />

            {/* Chest Core / Arc Reactor Glow */}
            <circle cx="100" cy="305" r="18" fill="rgba(255, 222, 66, 0.15)" stroke="#FFDE42" strokeWidth="2" />
            <polygon points="100,293 110,312 90,312" fill="url(#robotGoldGrad)" filter="url(#goldGlow)" />

            {/* Torso Detail Lines */}
            <rect x="70" y="335" width="60" height="4" rx="2" fill="rgba(255, 222, 66, 0.3)" />
            <rect x="78" y="344" width="44" height="4" rx="2" fill="rgba(255, 222, 66, 0.15)" />

            {/* Left Arm (Relaxed Floating) */}
            <g className="hero-left-arm">
              <rect x="26" y="270" width="18" height="50" rx="9" fill="#2A2224" stroke="#FFDE42" strokeWidth="1.5" />
              <circle cx="35" cy="330" r="9" fill="#FFDE42" />
            </g>

            {/* Right Arm & Hand (Interactive Waving / Pointing to Dashboard) */}
            <g className="hero-right-arm">
              <path
                d="M 150 275 Q 185 260, 205 235"
                fill="none"
                stroke="#2A2224"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 150 275 Q 185 260, 205 235"
                fill="none"
                stroke="#FFDE42"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Hand & Magic Spark */}
              <circle cx="210" cy="230" r="10" fill="#FFDE42" filter="url(#goldGlow)" />

              {/* Energy Beam / Cursor Touch Line */}
              <circle cx="210" cy="230" r="16" fill="none" stroke="#FFDE42" strokeWidth="1.5" opacity="0.6" className="hero-hand-pulse" />
              <line x1="218" y1="222" x2="245" y2="195" stroke="#FFDE42" strokeWidth="2" strokeDasharray="3 3" className="hero-dash-line" />
            </g>
          </g>
        </g>

        {/* ================= LAYER 5: FLOATING AUXILIARY BADGES ================= */}
        <g style={{ transform: floatCardsTransform, transition: 'transform 0.2s cubic-bezier(0.1, 0, 0.1, 1)' }}>
          {/* Top Right Floating Revenue / Analytics Card */}
          <g className="hero-float-badge-1">
            <rect x="360" y="30" width="155" height="58" rx="14" fill="rgba(20, 16, 18, 0.94)" stroke="rgba(255, 222, 66, 0.35)" strokeWidth="1.5" />
            <circle cx="384" cy="59" r="14" fill="rgba(255, 222, 66, 0.15)" />
            <text x="378" y="64" fontSize="14">📈</text>
            <text x="408" y="52" fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="700" fontFamily="sans-serif">REVENUE GROWTH</text>
            <text x="408" y="70" fill="#FFDE42" fontSize="15" fontWeight="800" fontFamily="sans-serif">+142.8%</text>
          </g>

          {/* Bottom Left Floating Security Lock Shield */}
          <g className="hero-float-badge-2">
            <rect x="20" y="380" width="170" height="62" rx="16" fill="rgba(20, 16, 18, 0.94)" stroke="rgba(255, 222, 66, 0.35)" strokeWidth="1.5" />

            {/* Shield Icon Container */}
            <circle cx="48" cy="411" r="16" fill="rgba(255, 222, 66, 0.15)" />
            <path d="M 48 399 L 58 404 V 413 C 58 419, 48 424, 48 424 C 48 424, 38 419, 38 413 V 404 Z" fill="#FFDE42" stroke="#FFDE42" strokeWidth="1" />

            <text x="74" y="405" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="sans-serif">Tenant Isolation</text>
            <text x="74" y="421" fill="#FFDE42" fontSize="8" fontWeight="600" fontFamily="sans-serif">🔐 JWT & Subdomain</text>
          </g>

          {/* Bottom Right WebSockets Active Badge */}
          <g className="hero-float-badge-3">
            <rect x="330" y="385" width="165" height="52" rx="14" fill="rgba(20, 16, 18, 0.94)" stroke="rgba(255, 222, 66, 0.3)" strokeWidth="1" />
            <circle cx="355" cy="411" r="5" fill="#27c93f" className="hero-status-pulse" />
            <text x="370" y="407" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="sans-serif">Real-Time Chat</text>
            <text x="370" y="421" fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="500" fontFamily="sans-serif">STOMP WebSockets • 12ms</text>
          </g>
        </g>
      </svg>
    </div>
  )
}
