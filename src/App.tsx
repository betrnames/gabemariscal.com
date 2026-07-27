import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { EXTERNAL_REL, isExternalHref, safeHref } from './lib/security'
import {
  applyTheme,
  resolveInitialTheme,
  type Theme,
} from './lib/theme'

/* ═══════════════════════════════════════════
   Data
   ═══════════════════════════════════════════ */

type Project = {
  name: string
  role: string
  desc: string
  url: string
  image: string
  year: string
  tags: string[]
  featured?: boolean
}

const projects: Project[] = [
  {
    name: 'Vox.chat',
    role: 'AI Automation Platform',
    desc: 'Voice agents, AI receptionist, and review automation for service contractors. Never miss a call again.',
    url: 'https://vox.chat',
    image: '/projects/vox-chat.png',
    year: '2025',
    tags: ['AI', 'Voice', 'SaaS'],
    featured: true,
  },
  {
    name: 'AdFuel.ai',
    role: 'Brand & Web Design',
    desc: 'AI-powered advertising agency site. Conversion-focused design with aggressive lead capture.',
    url: 'https://adfuel.ai',
    image: '/projects/adfuel.png',
    year: '2025',
    tags: ['Brand', 'Marketing'],
    featured: true,
  },
  {
    name: 'x402dir.com',
    role: 'Full Stack App',
    desc: 'The x402 Facilitator Directory — real-time transaction data and protocol stats for crypto builders.',
    url: 'https://x402dir.com',
    image: '/projects/x402dir.png',
    year: '2025',
    tags: ['Crypto', 'Data'],
    featured: true,
  },
  {
    name: 'Engineering.bot',
    role: 'Domain Lander',
    desc: 'Premium .bot domain lander for physical AI — claim flow, market proof, and conversion-focused design.',
    url: 'https://engineering.bot',
    image: '/projects/engineering-bot.png',
    year: '2025',
    tags: ['Domain', 'Brand', 'Lander'],
  },
  {
    name: 'LivingWage.now',
    role: 'Data Visualization',
    desc: 'Living wage calculator by region. Feature-complete product, shipped on Vercel.',
    url: 'https://livingwage.now',
    image: '/projects/livingwage.png',
    year: '2024',
    tags: ['Product', 'Data'],
  },
  {
    name: 'Deposit.now',
    role: 'Crypto / Full Stack',
    desc: 'Autonomous deposit API and interface with wallet integration.',
    url: 'https://deposit.now',
    image: '/projects/deposit.png',
    year: '2025',
    tags: ['Crypto', 'API'],
  },
  {
    name: 'Defcon.si',
    role: 'Dashboard Design',
    desc: 'Security intelligence dashboard. Dark-themed, data-driven, built for speed.',
    url: 'https://defcon.si',
    image: '/projects/defcon.png',
    year: '2024',
    tags: ['Dashboard', 'Security'],
  },
  {
    name: 'Chanclazo',
    role: 'Brand & Game',
    desc: 'Consumer brand and game — bold identity, mobile-first interactive experience.',
    url: 'https://chanclazo.com',
    image: '/projects/chanclazo.png',
    year: '2025',
    tags: ['Brand', 'Game'],
  },
  {
    name: 'Turlock Chiro',
    role: 'Local Business',
    desc: 'SEO-optimized chiropractor site for California Central Valley.',
    url: 'https://turlockchiropractor.com',
    image: '/projects/turlock-chiro.png',
    year: '2024',
    tags: ['Local', 'SEO'],
  },
]

const services = [
  {
    n: '01',
    title: 'Web Design',
    desc: 'Bold, conversion-first sites with identity that sticks. Mobile-first, dark-native, no template slop.',
  },
  {
    n: '02',
    title: 'Web Apps',
    desc: 'React + TypeScript products that ship. From landing pages to full platforms with real data.',
  },
  {
    n: '03',
    title: 'AI Integration',
    desc: 'Voice agents, chatbots, automation pipelines. AI that answers phones and books jobs.',
  },
  {
    n: '04',
    title: 'Brand Systems',
    desc: 'Logos, visual language, and design systems that scale from domain name to product UI.',
  },
]

const marqueeItems = [
  'Web Design',
  'React',
  'AI Agents',
  'Brand Identity',
  'TypeScript',
  'Product Design',
  'Voice AI',
  'Full Stack',
  'Domain Strategy',
  'Conversion',
]

/* ═══════════════════════════════════════════
   Hooks
   ═══════════════════════════════════════════ */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          io.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return ref
}

function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4
  as?: 'div' | 'section' | 'article' | 'li' | 'h2' | 'p' | 'span'
}) {
  const ref = useReveal<HTMLDivElement>()
  const delayClass = delay ? `reveal-delay-${delay}` : ''

  return (
    // @ts-expect-error polymorphic tag
    <Tag ref={ref} className={`reveal ${delayClass} ${className}`}>
      {children}
    </Tag>
  )
}

function useScrollProgress() {
  const [p, setP] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setP(h > 0 ? window.scrollY / h : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return p
}

/* ═══════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════ */

function ArrowUpRight({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  )
}

function SunIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
      />
    </svg>
  )
}

function MoonIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 14.25A8.25 8.25 0 1110.5 3.75 6.75 6.75 0 0021 14.25z"
      />
    </svg>
  )
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'dark'
    return document.documentElement.classList.contains('light') ? 'light' : 'dark'
  })

  useEffect(() => {
    const initial = resolveInitialTheme()
    applyTheme(initial)
    setTheme(initial)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', initial === 'dark' ? '#08080a' : '#f6f4ef')
  }, [])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', next === 'dark' ? '#08080a' : '#f6f4ef')
      return next
    })
  }, [])

  return { theme, toggle }
}

function ThemeToggle({
  theme,
  onToggle,
  className = '',
}: {
  theme: Theme
  onToggle: () => void
  className?: string
}) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

/* ═══════════════════════════════════════════
   Nav
   ═══════════════════════════════════════════ */

function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const links = [
    { href: safeHref('#work'), label: 'Work' },
    { href: safeHref('#services'), label: 'Services' },
    { href: safeHref('#about'), label: 'About' },
    { href: safeHref('#contact'), label: 'Contact' },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || open
            ? 'bg-background/80 backdrop-blur-xl border-b border-border'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
          <a
            href="#"
            className="font-display font-bold text-sm sm:text-base tracking-tight text-foreground"
            onClick={() => setOpen(false)}
          >
            Gabe<span className="text-primary">.</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition-colors duration-300 tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <span className="inline-flex items-center gap-2 text-[12px] font-mono text-muted-foreground border border-border rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              Available
            </span>
            <a
              href="#contact"
              className="text-[13px] font-medium bg-primary text-primary-foreground rounded-full px-4 py-2 hover:brightness-110 transition-all duration-300"
            >
              Let&apos;s talk
            </a>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="p-2 -mr-2 text-foreground"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-background transition-all duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col justify-center h-full px-8 pt-20 pb-12">
          <nav className="space-y-2">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
                style={{
                  transitionDelay: open ? `${i * 50}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'opacity 0.4s, transform 0.4s, color 0.2s',
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-12 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              Open for projects
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-x-clip">
      <div className="aurora absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-vignette" />
      </div>

      {/* Centered block — was justify-end which left a huge empty band above the title */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[1600px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-24 sm:pt-28 pb-10 sm:pb-12 min-w-0">
        <p className="hero-rise hero-rise-1 font-mono text-[10px] sm:text-xs tracking-[0.16em] sm:tracking-[0.28em] uppercase text-primary mb-4 sm:mb-6 max-w-full">
          Creative Designer · Developer · Builder
        </p>

        <h1 className="hero-title hero-rise hero-rise-2 font-display font-extrabold text-foreground select-none">
          <span className="hero-title-line">Gabe</span>
          <span className="hero-title-line">
            Mariscal
            <span className="text-primary">.</span>
          </span>
        </h1>

        <div className="hero-rise hero-rise-3 mt-5 sm:mt-8 max-w-xl">
          <p className="text-[0.95rem] sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            I design and ship digital products that feel premium — websites, AI tools,
            and brands for people who care how things look{' '}
            <em className="font-serif text-foreground not-italic">and</em> work.
          </p>
        </div>

        <div className="hero-rise hero-rise-4 mt-7 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
          <a
            href="#work"
            className="group inline-flex items-center gap-3 bg-foreground text-background font-medium text-sm rounded-full pl-6 pr-5 py-3.5 hover:bg-primary transition-colors duration-300"
          >
            View work
            <span className="w-7 h-7 rounded-full bg-background/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </a>
          <a
            href="#contact"
            className="link-underline text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 py-1"
          >
            Start a project
          </a>
        </div>
      </div>

      {/* Bottom meta strip */}
      <div className="relative z-10 border-t border-border/60 mt-auto">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-4 flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs font-mono tracking-wider text-muted-foreground uppercase">
          <span>Central Valley, CA</span>
          <span className="hidden sm:inline">Based worldwide · Remote</span>
          <span>Est. shipping daily</span>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Marquee band
   ═══════════════════════════════════════════ */

function MarqueeBand() {
  const doubled = [...marqueeItems, ...marqueeItems]
  return (
    <div className="border-y border-border bg-card/40 overflow-hidden py-4" aria-hidden>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-6 px-6 shrink-0">
            <span className="font-display font-semibold text-sm sm:text-base tracking-tight text-foreground/80">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Work
   ═══════════════════════════════════════════ */

function ProjectPlaceholder({
  project,
  size = 'lg',
}: {
  project: Project
  size?: 'lg' | 'sm'
}) {
  return (
    <div
      className={`project-media aspect-[16/10] sm:aspect-[16/9] ${
        size === 'sm' ? 'project-media--sm' : ''
      }`}
    >
      <div className="project-placeholder">
        <div
          className={`absolute z-10 flex flex-wrap gap-2 ${
            size === 'sm'
              ? 'top-3 left-3'
              : 'top-4 left-4 sm:top-5 sm:left-5'
          }`}
        >
          {project.tags.map((t) => (
            <span
              key={t}
              className={`font-mono uppercase tracking-wider rounded-full bg-background/60 backdrop-blur-md text-foreground/80 border border-border ${
                size === 'sm'
                  ? 'text-[9px] px-2 py-0.5'
                  : 'text-[10px] sm:text-[11px] px-2.5 py-1'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        <span
          className={`absolute z-10 font-mono text-muted-foreground ${
            size === 'sm'
              ? 'top-3 right-3 text-[10px]'
              : 'top-4 right-4 sm:top-5 sm:right-5 text-[10px] sm:text-xs'
          }`}
        >
          {project.year}
        </span>

        {/* Default: project name */}
        <div className="project-panel project-panel-name">
          <h3 className="project-placeholder-name">{project.name}</h3>
          <p className="project-placeholder-role">{project.role}</p>
        </div>

        {/* Hover (media only): slides up with bounce → description */}
        <div className="project-panel project-panel-desc">
          <p className="project-placeholder-desc">{project.desc}</p>
          <p className="project-placeholder-hint">View project →</p>
        </div>
      </div>
    </div>
  )
}

function SafeProjectLink({
  url,
  className,
  children,
}: {
  url: string
  className?: string
  children: ReactNode
}) {
  const href = safeHref(url)
  const external = isExternalHref(href)

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? EXTERNAL_REL : undefined}
      className={className}
    >
      {children}
    </a>
  )
}

function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const reverse = index % 2 === 1

  return (
    <article>
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        <Reveal
          className={`lg:col-span-7 ${reverse ? 'lg:order-2' : ''}`}
          delay={0}
        >
          <SafeProjectLink url={project.url} className="block">
            <ProjectPlaceholder project={project} />
          </SafeProjectLink>
        </Reveal>

        <Reveal
          className={`lg:col-span-5 ${reverse ? 'lg:order-1 lg:text-right' : ''}`}
          delay={1}
        >
          <div className={`flex flex-col gap-5 sm:gap-6 ${reverse ? 'lg:items-end' : ''}`}>
            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="text-primary">{String(index + 1).padStart(2, '0')}</span>
              <span className="w-6 h-px bg-border" />
              <span>{project.year}</span>
            </div>

            {/* Title lives in the placeholder — column is description + CTA only */}
            <p className="text-muted-foreground leading-relaxed max-w-md text-[15px] sm:text-base">
              {project.desc}
            </p>

            <SafeProjectLink
              url={project.url}
              className={`group/link inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors ${
                reverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              View project
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </SafeProjectLink>
          </div>
        </Reveal>
      </div>
    </article>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal as="article" delay={(index % 3) as 0 | 1 | 2} className="h-full">
      <div className="flex flex-col h-full">
        <SafeProjectLink url={project.url} className="block mb-5">
          <ProjectPlaceholder project={project} size="sm" />
        </SafeProjectLink>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {project.desc}
        </p>
        <SafeProjectLink
          url={project.url}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors self-start"
        >
          View project
          <ArrowUpRight className="w-4 h-4" />
        </SafeProjectLink>
      </div>
    </Reveal>
  )
}

function Work() {
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  return (
    <section id="work" className="py-24 sm:py-32 lg:py-40">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16 sm:mb-24">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-primary mb-4">
                Selected Work
              </p>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                Projects that
                <br />
                <span className="font-serif italic font-normal text-muted-foreground">
                  actually shipped.
                </span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2}>
            <p className="text-muted-foreground max-w-xs text-sm sm:text-[15px] leading-relaxed sm:text-right">
              AI platforms, brand systems, crypto tools, and local business sites —
              designed and built end to end.
            </p>
          </Reveal>
        </div>

        <div className="space-y-20 sm:space-y-28 lg:space-y-36">
          {featured.map((p, i) => (
            <FeaturedProject key={p.name} project={p} index={i} />
          ))}
        </div>

        <div className="mt-24 sm:mt-32">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-10">
              More work
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {rest.map((p, i) => (
              <ProjectCard key={p.name} project={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Services
   ═══════════════════════════════════════════ */

function Services() {
  return (
    <section id="services" className="py-24 sm:py-32 border-t border-border">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-primary mb-4">
            Services
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-14 sm:mb-20 max-w-2xl leading-[1.05]">
            What I bring to the table
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {services.map((s, i) => (
            <Reveal
              key={s.n}
              delay={(i % 2) as 0 | 1}
              className="bg-background p-8 sm:p-10 lg:p-12 group hover:bg-card transition-colors duration-400"
            >
              <span className="font-mono text-xs text-primary mb-6 block">{s.n}</span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl tracking-tight mb-3 group-hover:text-primary transition-colors duration-300">
                {s.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[15px] max-w-sm">
                {s.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   About
   ═══════════════════════════════════════════ */

function About() {
  return (
    <section id="about" className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      <div
        className="absolute -right-32 top-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,245,66,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-primary mb-4">
                About
              </p>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.25rem] tracking-tight leading-[1.05]">
                Design that
                <br />
                <span className="font-serif italic font-normal">codes.</span>
                <br />
                Code that
                <br />
                <span className="font-serif italic font-normal">converts.</span>
              </h2>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:pt-12 space-y-8">
            <Reveal delay={1}>
              <p className="text-lg sm:text-xl text-foreground/90 leading-relaxed max-w-2xl">
                I&apos;m a web developer and designer based in California&apos;s Central Valley.
                I work at the intersection of product, brand, and engineering — building
                things that look expensive and load fast.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                From AI phone agents for contractors to crypto directories and consumer
                brands — every project starts with a clear goal and ends with something
                real: live on the web, performing, and ready to grow.
              </p>
            </Reveal>

            <Reveal delay={3}>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border max-w-lg">
                {[
                  { n: '20+', l: 'Projects shipped' },
                  { n: '8+', l: 'Products live' },
                  { n: '∞', l: 'Iterations deep' },
                ].map((stat) => (
                  <div key={stat.l}>
                    <div className="font-display font-bold text-2xl sm:text-3xl text-primary tracking-tight">
                      {stat.n}
                    </div>
                    <div className="text-[11px] sm:text-xs font-mono text-muted-foreground mt-1 uppercase tracking-wider">
                      {stat.l}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div className="pt-4">
                <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-muted-foreground mb-4">
                  Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'React',
                    'TypeScript',
                    'Tailwind',
                    'Next.js',
                    'Vite',
                    'Vercel',
                    'Three.js',
                    'Figma',
                    'AI / LLMs',
                  ].map((t) => (
                    <span
                      key={t}
                      className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Contact
   ═══════════════════════════════════════════ */

function Contact() {
  return (
    <section id="contact" className="py-24 sm:py-32 lg:py-40 border-t border-border">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-primary mb-6">
            Contact
          </p>
        </Reveal>

        {/* No Reveal here — opacity/transform layers clip Syne’s “g” descender */}
        <h2 className="contact-heading font-display font-bold text-foreground mb-8 sm:mb-10">
          <span className="contact-heading-line">Let&apos;s build</span>
          <span className="contact-heading-line contact-heading-line--loud">
            something{' '}
            <span className="font-serif italic font-normal text-primary">loud.</span>
          </span>
        </h2>

        <Reveal delay={1}>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mb-12 sm:mb-16 leading-relaxed">
            Have a product, brand, or automation problem? I take on select projects —
            remote, fast, and end-to-end.
          </p>
        </Reveal>

        <Reveal delay={2}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <a
              href={safeHref('mailto:contact@gabemariscal.com')}
              className="group inline-flex items-center gap-4 bg-primary text-primary-foreground font-display font-bold text-base sm:text-lg rounded-full pl-8 pr-6 py-4 sm:py-5 hover:brightness-110 transition-all duration-300"
            >
              contact@gabemariscal.com
              <span className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
            <a
              href={safeHref('https://github.com/betrnames')}
              target="_blank"
              rel={EXTERNAL_REL}
              className="link-underline inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
            >
              GitHub
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════ */

function Footer() {
  const year = new Date().getFullYear()

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <footer className="border-t border-border py-8 sm:py-10">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-display font-bold text-sm tracking-tight">
            Gabe Mariscal<span className="text-primary">.</span>
          </p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            &copy; {year} · California, USA
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground">
          <a href="#work" className="hover:text-foreground transition-colors">
            Work
          </a>
          <a href="#about" className="hover:text-foreground transition-colors">
            About
          </a>
          <a
            href={safeHref('mailto:contact@gabemariscal.com')}
            className="hover:text-foreground transition-colors"
          >
            Email
          </a>
          <button
            type="button"
            onClick={scrollTop}
            className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
          >
            Top
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════
   App shell
   ═══════════════════════════════════════════ */

export default function App() {
  const progress = useScrollProgress()
  const { theme, toggle } = useTheme()

  return (
    <div className="noise min-h-screen transition-colors duration-300">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
      <Nav theme={theme} onToggleTheme={toggle} />
      <main>
        <Hero />
        <MarqueeBand />
        <Work />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
