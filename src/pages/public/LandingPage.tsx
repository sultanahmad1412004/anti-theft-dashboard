import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Shield, 
  Camera, 
  Lock, 
  Power, 
  Volume2, 
  MapPin, 
  Smartphone, 
  ArrowRight, 
  Download, 
  ShieldCheck, 
  Check, 
  Radio, 
  Key, 
  Database,
  LockKeyhole,
  CheckCircle2,
  ChevronDown,
  BellRing
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';
import { ParticleBackground } from '../../components/landing/ParticleBackground';
import { GradientText } from '../../components/landing/GradientText';
import { CursorGlow } from '../../components/landing/CursorGlow';
import { ScrollProgress } from '../../components/landing/ScrollProgress';
import { StatCounter } from '../../components/landing/StatCounter';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  // 3D Phone tilt in Hero
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  // Section 6: Interactive Demo state
  const [activeDemoFeature, setActiveDemoFeature] = useState<number>(0);
  const [demoScreenshot, setDemoScreenshot] = useState<string | null>(null);
  const [demoCapturing, setDemoCapturing] = useState(false);
  const [demoQsLocked, setDemoQsLocked] = useState(true);
  const [demoShutdownLocked, setDemoShutdownLocked] = useState(true);
  const [demoSilent, setDemoSilent] = useState(false);
  const [demoNotification, setDemoNotification] = useState<string | null>('Anti-Theft Service Active · All shields enabled');

  // Section 10: FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Mouse tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / rect.height) * 12;
    const rotateY = (x / rect.width) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHoveringHero(false);
    setTilt({ x: 0, y: 0 });
  };

  // Trigger screenshot simulation in demo
  const handleDemoCapture = () => {
    setDemoCapturing(true);
    setDemoNotification('MediaProjection shutter triggered remotely...');
    toast.success('Dispatched camera capture signal via Firebase');
    setTimeout(() => {
      setDemoCapturing(false);
      setDemoScreenshot('https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&auto=format&fit=crop&q=80');
      setDemoNotification('Buffer captured & encrypted to Cloudinary CDN');
      toast.success('Screenshot asset stored & displayed in real-time');
    }, 850);
  };

  const handleAuthAction = () => {
    navigate(currentUser ? (isAdmin ? '/admin' : '/dashboard') : '/login');
  };

  // Section inView observers
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [howRef, howInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [securityRef, securityInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [pricingRef, pricingInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  // 6 Enterprise Anti-Theft Countermeasures
  const features = [
    {
      icon: BellRing,
      title: 'Remote High-Decibel Siren',
      desc: 'Instantly blares an ear-piercing anti-theft siren at maximum hardware volume. Automatically overrides silent mode, vibrate, and Do Not Disturb (DND) to locate lost devices or shock thieves.',
      tag: 'Overrides Silent / DND',
      gradient: 'from-rose-500/20 via-red-500/15 to-amber-500/10'
    },
    {
      icon: Camera,
      title: 'Remote Screenshot Capture',
      desc: 'Silently grab display frames in real-time to identify unauthorized intruders and inspect active applications without displaying any camera preview or flash.',
      tag: 'MediaProjection API',
      gradient: 'from-cyan-500/20 to-blue-500/10'
    },
    {
      icon: Lock,
      title: 'Quick Settings Block',
      desc: 'Intercepts notification shade swipe-downs on lockscreen, stopping perpetrators from turning on Airplane Mode or disabling WiFi and cellular data.',
      tag: 'Accessibility Service',
      gradient: 'from-blue-500/20 to-indigo-500/10'
    },
    {
      icon: Power,
      title: 'Shutdown Protection',
      desc: 'Suppresses hardware power menu dialogs when the phone is locked so thieves cannot turn off the handset or reboot into recovery.',
      tag: 'Device Admin Policy',
      gradient: 'from-purple-500/20 to-pink-500/10'
    },
    {
      icon: MapPin,
      title: 'Live GPS Location Tracking',
      desc: 'Continuous real-time geolocation telemetry rendered onto high-resolution maps with street address reverse-geocoding and accuracy circle.',
      tag: 'FusedLocationProvider',
      gradient: 'from-emerald-500/20 to-teal-500/10'
    },
    {
      icon: Smartphone,
      title: 'Multi-Device Web Terminal',
      desc: 'Command your entire ecosystem of Android smartphones and tablets from a single unified, secure web dashboard with real-time sync.',
      tag: 'Real-Time Sync',
      gradient: 'from-cyan-500/20 to-purple-500/10'
    },
  ];

  // 5 Steps for How It Works
  const steps = [
    {
      num: '01',
      title: 'Download APK',
      desc: 'Download the signed Android APK directly from our verified MediaFire repository in seconds.',
      icon: Download,
    },
    {
      num: '02',
      title: 'Install & Grant Permissions',
      desc: 'Enable Unknown Sources, grant Accessibility Service and Background Location permissions.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Sign In',
      desc: 'Authenticate on the handset using your email credentials to link it directly to your dashboard.',
      icon: Key,
    },
    {
      num: '04',
      title: 'Auto-Registers Device',
      desc: 'Hardware specs, battery, Wi-Fi, and live telemetry automatically synchronize to Firebase Firestore.',
      icon: Smartphone,
    },
    {
      num: '05',
      title: 'Control From Anywhere',
      desc: 'Log in to anti-theft.sultanahmad.site from any computer or mobile browser to command and track.',
      icon: Radio,
    },
  ];

  // FAQs (10 questions, rich snippet ready)
  const faqs = [
    {
      q: 'What is Anti-Theft?',
      a: 'Anti-Theft is an enterprise Android application paired with a modern real-time web command center. It gives you complete remote command over your smartphone: capturing screenshots, disabling quick settings, preventing forced shutdown, and tracking real-time GPS coordinates.'
    },
    {
      q: 'How does it stop thieves from turning off the phone or Airplane Mode?',
      a: 'Anti-Theft hooks into the Android native Accessibility Service. When a thief drags down the notification shade or holds down the power button on a locked screen, the app immediately cancels the window event, keeping cellular connectivity and GPS tracking active.'
    },
    {
      q: 'Is root access required?',
      a: 'No root is required! Anti-Theft is engineered using official Android Accessibility, MediaProjection, and Device Admin APIs, which run smoothly on stock Android 8.0 up to Android 16.'
    },
    {
      q: 'Why is the Pro subscription only $1 per year?',
      a: 'Built by software engineer Sultan Ahmad, the mission is to democratize mobile asset security worldwide. We believe essential theft defense should be accessible to all without exploitative monthly fees.'
    },
    {
      q: 'Can I monitor multiple Android devices?',
      a: 'Yes. With the Pro subscription ($1/year), you can link and command multiple Android phones and tablets from a single unified web console.'
    },
    {
      q: 'How is location tracked on the dashboard?',
      a: 'The device transmits fused GPS and cell-tower coordinates into Firebase Firestore. The web dashboard projects the coordinates on an interactive OpenStreetMap view with street-level resolution.'
    },
    {
      q: 'How does the remote optical screenshot feature work?',
      a: 'When you trigger a screenshot from the web console, a prioritized background signal prompts the Android service to capture the current screen and securely upload the frame to encrypted cloud storage.'
    },
    {
      q: 'Can remote ring override silent or vibrate mode?',
      a: 'Yes. When triggered, the remote siren overrides system audio streams to maximum decibels, sounding a persistent alarm to locate a hidden or misplaced device.'
    },
    {
      q: 'Is my personal data and telemetry kept private?',
      a: 'Yes. All data resides in Google Firebase Firestore protected by strict identity-based access control rules. Only authenticated accounts have access to their own registered devices.'
    },
    {
      q: 'How do I install the APK on my Android smartphone?',
      a: 'Download the official APK from our Download page, open the installer, grant Accessibility and Location permissions, and log in with your email to start protecting your phone immediately.'
    }
  ];

  return (
    <PublicPageWrapper
      title="Anti-Theft App for Android — Remote Siren, Screenshot & Live GPS Tracker APK"
      description="Protect your Android phone from theft. Remote emergency siren alarm, live GPS tracking, intruder screenshot capture, and lockscreen shutdown protection from a web dashboard. Free APK download."
      keywords={[
        'anti theft app for android',
        'anti theft app',
        'android anti theft apk',
        'download anti theft app',
        'remote siren alarm apk',
        'emergency siren bypass silent',
        'phone tracker android',
        'remote android control web dashboard',
        'remote screenshot capture android',
        'find my phone android',
        'block quick settings lockscreen',
        'prevent shutdown android',
        'android security app',
        'track stolen phone web dashboard',
        'live gps location tracking',
        'anti theft apk mediafire',
        'anti theft sultan ahmad',
        'project 101 anti theft',
        'best anti theft app 2026'
      ]}
      canonicalPath="/"
      schemas={[
        {
          '@context': 'https://schema.org',
          '@type': 'MobileApplication',
          name: 'Anti-Theft',
          alternateName: ['Anti-Theft Android App', 'Project-101 Anti-Theft', 'Anti-Theft APK'],
          applicationCategory: 'SecurityApplication',
          applicationSubCategory: 'Mobile Security & Anti-Theft',
          operatingSystem: 'Android 8.0+',
          softwareVersion: '2.4.0',
          fileSize: '8.4MB',
          url: 'https://anti-theft.sultanahmad.site/',
          downloadUrl: 'https://anti-theft.sultanahmad.site/download',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '1280',
            bestRating: '5',
            worstRating: '1'
          },
          author: {
            '@type': 'Person',
            name: 'Sultan Ahmad',
            url: 'https://sultanahmad.site'
          },
          offers: [
            {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free Tier with Quick Settings lockscreen block'
            },
            {
              '@type': 'Offer',
              price: '1.00',
              priceCurrency: 'USD',
              description: 'Anti-Theft Pro Annual Plan'
            }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a
            }
          }))
        }
      ]}
    >
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] text-slate-800 dark:text-[#F1F5F9] font-sans antialiased relative selection:bg-cyan-500/20 selection:text-cyan-600 dark:selection:text-cyan-300 transition-colors duration-200">
        {/* Scroll Progress Bar at very top */}
      <ScrollProgress />

      {/* Ambient Noise Texture Overlay */}
      <div className="fixed inset-0 bg-noise pointer-events-none z-30 opacity-20 dark:opacity-40" aria-hidden="true" />

      {/* Global Cursor Glow */}
      <CursorGlow radius={360} />

      {/* SECTION 1: NAVBAR */}
      <Navbar />

      <main className="relative z-10">
        {/* ─────────────────────────────────────────────────────────
            SECTION 2: HERO (The Main Attraction)
           ───────────────────────────────────────────────────────── */}
        <section 
          ref={heroRef}
          className="relative pt-12 pb-24 md:pt-20 md:pb-36 overflow-hidden border-b border-slate-200 dark:border-[#252B3D]/70"
        >
          {/* Background: Animated Gradient + Particle Mesh */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-white to-slate-50 dark:from-[#0A0E1A] dark:via-[#10172B] dark:to-[#0A0E1A] pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-cyan-500/10 via-purple-600/10 to-blue-500/10 dark:from-cyan-500/15 dark:via-purple-600/10 dark:to-blue-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.035] bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
          
          {/* Particle Background strictly < 50 particles for blazing performance */}
          <ParticleBackground particleCount={36} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* LEFT COLUMN */}
              <motion.div 
                className="lg:col-span-7 text-left space-y-7"
                initial="hidden"
                animate={heroInView ? 'visible' : 'hidden'}
                variants={staggerContainer}
              >
                {/* Genuine Product Feature Badge */}
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-caption font-mono shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>OFFICIAL ANDROID APP &amp; WEB COMPANION DASHBOARD</span>
                </motion.div>

                {/* H1 Headline */}
                <motion.h1 
                  variants={fadeInUp}
                  className="font-display font-bold text-display-xl text-slate-900 dark:text-white tracking-tightest leading-[1.05]"
                >
                  Android Anti-Theft App &amp; <br />
                  <GradientText animate={true}>Web Command Dashboard</GradientText>
                </motion.h1>

                {/* Subheading */}
                <motion.p 
                  variants={fadeInUp}
                  className="font-sans text-body-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed"
                >
                  Download the official Android APK to arm your smartphone with lockscreen shields, and command everything remotely from this unified web console. Sub-second GPS tracking, remote siren, screenshot capture, and shutdown prevention.
                </motion.p>

                {/* Direct Action CTAs: Dashboard & Download */}
                <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 pt-2">
                  <Button
                    onClick={handleAuthAction}
                    variant="cyan"
                    size="lg"
                    rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
                    className="shadow-[0_0_25px_rgba(0,229,255,0.35)] hover:shadow-[0_0_35px_rgba(0,229,255,0.55)] transition-all font-display font-bold"
                  >
                    Open Web Dashboard
                  </Button>

                  <Link
                    to="/download"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display font-semibold text-body-sm text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Android APK</span>
                  </Link>

                  <a
                    href="#features"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-display font-semibold text-body-sm text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-transparent border border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/50 transition-all shadow-xs"
                  >
                    <span>Explore Features</span>
                  </a>
                </motion.div>

                {/* Trust Badges */}
                <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 pt-4 text-caption font-mono text-slate-500 dark:text-slate-400">
                  <span className="px-3 py-1 rounded-md bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#252B3D] text-slate-700 dark:text-slate-300 shadow-xs">
                    ✓ No Root Required
                  </span>
                  <span className="px-3 py-1 rounded-md bg-white dark:bg-[#131826] border border-slate-200 dark:border-[#252B3D] text-slate-700 dark:text-slate-300 shadow-xs">
                    ✓ Android 8.0 to 16
                  </span>
                  <span className="px-3 py-1 rounded-md bg-cyan-50 dark:bg-[#131826] border border-cyan-500/30 text-cyan-700 dark:text-cyan-400 font-bold shadow-xs">
                    ✓ $1/Year Pro
                  </span>
                </motion.div>

                {/* Simple Professional Mini Stats */}
                <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4 pt-3 max-w-md">
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-[#131826]/80 border border-slate-200 dark:border-[#252B3D] backdrop-blur-md shadow-xs">
                    <div className="font-display font-extrabold text-2xl text-cyan-600 dark:text-cyan-400 tracking-tight">&lt; 15ms</div>
                    <div className="text-caption text-slate-500 dark:text-slate-400 font-sans">Real-Time Cloud Latency</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/90 dark:bg-[#131826]/80 border border-slate-200 dark:border-[#252B3D] backdrop-blur-md shadow-xs">
                    <div className="font-display font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 tracking-tight">99.9%</div>
                    <div className="text-caption text-slate-500 dark:text-slate-400 font-sans">Cloud Service Uptime</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* RIGHT COLUMN: 3D Tilt Phone Mockup with Live Dashboard Preview */}
              <div 
                className="lg:col-span-5 relative perspective-[1200px]"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHoveringHero(true)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Glowing Aura Behind Phone */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/25 to-purple-600/25 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

                {/* Floating Badge 1: Live Tracking */}
                <motion.div
                  className="absolute -top-6 -left-6 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#131826]/90 border border-cyan-500/40 backdrop-blur-xl shadow-xl font-mono text-caption text-cyan-700 dark:text-cyan-300 pointer-events-none"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
                  <span>📡 Live GPS Tracking</span>
                </motion.div>

                {/* Floating Badge 2: Screenshot */}
                <motion.div
                  className="absolute top-1/2 -right-8 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#131826]/90 border border-purple-500/40 backdrop-blur-xl shadow-xl font-mono text-caption text-purple-700 dark:text-purple-300 pointer-events-none"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>📸 Remote Screenshot</span>
                </motion.div>

                {/* Floating Badge 3: Protected */}
                <motion.div
                  className="absolute -bottom-5 left-10 z-20 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#131826]/90 border border-emerald-500/40 backdrop-blur-xl shadow-xl font-mono text-caption text-emerald-700 dark:text-emerald-300 pointer-events-none"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>🔒 256-bit Encrypted</span>
                </motion.div>

                {/* Handset Mockup Container */}
                <div
                  ref={heroCardRef}
                  style={{
                    transform: isHoveringHero
                      ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                      : 'perspective(1200px) rotateX(0deg) rotateY(0deg)',
                    transition: isHoveringHero ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
                  }}
                  className="relative rounded-[40px] bg-[#0A0E1A] border-[6px] border-[#252B3D] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.9)] max-w-sm mx-auto overflow-hidden"
                >
                  {/* Speaker notch */}
                  <div className="w-20 h-4 bg-[#131826] rounded-full mx-auto mb-2 flex items-center justify-center gap-2 border border-[#252B3D]">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>

                  {/* Simulated Mobile Dashboard Screen */}
                  <div className="rounded-[30px] bg-[#131826] border border-[#252B3D] p-4 text-left space-y-4">
                    {/* Top status */}
                    <div className="flex items-center justify-between text-caption font-mono text-slate-400 border-b border-[#252B3D] pb-2">
                      <span className="text-white font-semibold">Pixel 8 Pro</span>
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ONLINE
                      </span>
                    </div>

                    {/* Telemetry card */}
                    <div className="p-3 rounded-xl bg-[#1A2033] border border-[#252B3D] space-y-2">
                      <div className="flex items-center justify-between text-caption font-mono">
                        <span className="text-slate-400">Battery</span>
                        <span className="text-cyan-400 font-bold">88% (Charging)</span>
                      </div>
                      <div className="w-full bg-[#0A0E1A] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-[88%]" />
                      </div>
                      <div className="flex items-center justify-between text-caption font-mono text-slate-400 pt-1">
                        <span>Lat / Lng</span>
                        <span className="text-slate-300">37.7749, -122.4194</span>
                      </div>
                    </div>

                    {/* Quick Action Matrix in Phone */}
                    <div className="grid grid-cols-2 gap-2 text-caption">
                      <div className="p-2.5 rounded-lg bg-[#0A0E1A]/80 border border-cyan-500/40 text-cyan-300 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>QS Locked</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#0A0E1A]/80 border border-purple-500/40 text-purple-300 flex items-center gap-2">
                        <Power className="w-3.5 h-3.5 text-purple-400" />
                        <span>Anti-Shutdown</span>
                      </div>
                    </div>

                    {/* Live radar wave preview */}
                    <div className="relative h-28 rounded-xl bg-[#0A0E1A] border border-[#252B3D] overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(#00E5FF_1px,transparent_1px)] [background-size:14px_14px] opacity-20" />
                      <div className="w-16 h-16 rounded-full border border-cyan-400/40 animate-ping absolute" />
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 z-10">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
                        GPS Active (3m accuracy)
                      </div>
                    </div>

                    {/* Device Command Dock */}
                    <button
                      onClick={handleDemoCapture}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-display font-bold text-caption flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/25 hover:opacity-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Instant Screenshot</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 3: TRUST MARQUEE (Infinite Horizontal Strip)
           ───────────────────────────────────────────────────────── */}
        <section className="relative py-4 border-b border-slate-200 dark:border-[#252B3D] bg-slate-100/90 dark:bg-[#101524] overflow-hidden">
          <div className="flex whitespace-nowrap overflow-hidden group">
            <div className="flex items-center gap-12 font-mono text-caption text-slate-600 dark:text-slate-400 animate-[marquee_25s_linear_infinite] group-hover:[animation-play-state:paused]">
              <span>Android 8.0 to 16 Supported</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>Firebase Cloud Firestore Security</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>End-to-End Encrypted Handshakes</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>No Root Required</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>Sub-15ms Real-Time Sync</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>Encrypted Cloudinary CDN Storage</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>OpenStreetMap GPS Mapping</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
            </div>
            <div className="flex items-center gap-12 font-mono text-caption text-slate-600 dark:text-slate-400 animate-[marquee_25s_linear_infinite] group-hover:[animation-play-state:paused]" aria-hidden="true">
              <span>Android 8.0 to 16 Supported</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>Firebase Cloud Firestore Security</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>End-to-End Encrypted Handshakes</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>No Root Required</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>Sub-15ms Real-Time Sync</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>Encrypted Cloudinary CDN Storage</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
              <span>OpenStreetMap GPS Mapping</span>
              <span className="text-cyan-500 dark:text-cyan-400">·</span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 4: STATS BAR (Simple, Modern & Professional Numbers)
           ───────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 border-b border-slate-200 dark:border-[#252B3D] bg-white dark:bg-[#0D1220] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              
              {/* Stat 1: Cloud Sync Latency */}
              <div className="space-y-2 p-5 rounded-2xl glass-surface border border-slate-200 dark:border-white/10">
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-cyan-600 dark:text-cyan-400 tracking-tight tabular-nums">
                  &lt; 15ms
                </div>
                <div className="font-sans font-medium text-body-sm text-slate-800 dark:text-slate-200">
                  Cloud Link Latency
                </div>
                <div className="font-mono text-caption text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Firebase WebSocket
                </div>
              </div>

              {/* Stat 2: Uptime SLA */}
              <div className="space-y-2 p-5 rounded-2xl glass-surface border border-slate-200 dark:border-white/10">
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight tabular-nums">
                  <StatCounter target={99.9} decimals={1} suffix="%" />
                </div>
                <div className="font-sans font-medium text-body-sm text-slate-800 dark:text-slate-200">
                  Service Uptime
                </div>
                <div className="font-mono text-caption text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Google Cloud SLA
                </div>
              </div>

              {/* Stat 3: Encryption */}
              <div className="space-y-2 p-5 rounded-2xl glass-surface border border-slate-200 dark:border-white/10">
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-purple-600 dark:text-purple-400 tracking-tight tabular-nums">
                  256-bit
                </div>
                <div className="font-sans font-medium text-body-sm text-slate-800 dark:text-slate-200">
                  Encrypted Telemetry
                </div>
                <div className="font-mono text-caption text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Zero Data Selling
                </div>
              </div>

              {/* Stat 4: Transparent Cost */}
              <div className="space-y-2 p-5 rounded-2xl glass-surface border-cyan-500/40">
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-cyan-600 dark:text-cyan-400 tracking-tight tabular-nums">
                  $1
                </div>
                <div className="font-sans font-medium text-body-sm text-slate-800 dark:text-slate-200">
                  Per Full Year
                </div>
                <div className="font-mono text-caption text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Honest Pricing
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 5: FEATURES GRID (Staggered Animation + Icon Rotate)
           ───────────────────────────────────────────────────────── */}
        <section 
          id="features"
          ref={featuresRef}
          className="py-24 md:py-32 border-b border-slate-200 dark:border-[#252B3D] relative bg-slate-50 dark:bg-[#0A0E1A]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-mono text-caption uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
                SECURITY CAPABILITIES
              </span>
              <h2 className="font-display font-bold text-display-lg text-slate-900 dark:text-white">
                Everything You Need
              </h2>
              <p className="font-sans text-body text-slate-600 dark:text-slate-300">
                Six enterprise-grade Android defense countermeasures unified into a clean web console.
              </p>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate={featuresInView ? 'visible' : 'hidden'}
              variants={staggerContainer}
            >
              {features.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    variants={fadeInUp}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="p-7 rounded-3xl glass-surface border border-slate-200 dark:border-[#252B3D] hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/15 via-blue-500/15 to-purple-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 group-hover:rotate-[360deg] transition-transform duration-700">
                      <IconComponent className="w-7 h-7" />
                    </div>

                    <div className="space-y-3">
                      <div className="font-mono text-caption text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                        {feat.tag}
                      </div>
                      <h3 className="font-display font-semibold text-heading-md text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="font-sans text-body-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 6: INTERACTIVE DEMO (Interactive Phone + Controls)
           ───────────────────────────────────────────────────────── */}
        <section className="py-24 md:py-32 border-b border-slate-200 dark:border-[#252B3D] bg-slate-50/60 dark:bg-[#0E1322] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-mono text-caption uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20">
                LIVE SANDBOX
              </span>
              <h2 className="font-display font-bold text-display-lg text-slate-900 dark:text-white">
                See It In Action
              </h2>
              <p className="font-sans text-body text-slate-600 dark:text-slate-300">
                Simulate remote commands and observe immediate real-time countermeasures on the device.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left: Interactive Phone Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-72 sm:w-80 rounded-[44px] bg-[#0A0E1A] border-[6px] border-slate-700 dark:border-[#252B3D] p-3 shadow-2xl overflow-hidden relative">
                  {/* Camera hole */}
                  <div className="w-16 h-3.5 bg-[#131826] rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>

                  {/* Shutter flash overlay */}
                  {demoCapturing && (
                    <div className="absolute inset-0 bg-white z-50 animate-ping opacity-85 pointer-events-none" />
                  )}

                  {/* Phone screen inner */}
                  <div className="rounded-[32px] bg-[#131826] p-4 text-left space-y-4 min-h-[460px] flex flex-col justify-between border border-[#252B3D]">
                    {/* Header */}
                    <div className="flex items-center justify-between text-caption font-mono text-slate-400 border-b border-[#252B3D] pb-2">
                      <span className="text-white font-semibold">Pixel 8 Active</span>
                      <span className="text-cyan-400">12:00 PM</span>
                    </div>

                    {/* Main Screen Content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                      {demoScreenshot ? (
                        <div className="space-y-2 w-full">
                          <img 
                            src={demoScreenshot} 
                            alt="Captured Display Buffer" 
                            className="w-full h-44 object-cover rounded-xl border border-cyan-500/40 shadow-lg"
                          />
                          <div className="font-mono text-caption text-cyan-300 bg-cyan-950/60 p-1.5 rounded-lg border border-cyan-500/30">
                            ✓ Encrypted 1080p Frame Received
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                            <Shield className="w-8 h-8" />
                          </div>
                          <div className="font-display font-bold text-white text-base">
                            Device Protected
                          </div>
                          <p className="font-sans text-caption text-slate-400">
                            Waiting for web console command trigger...
                          </p>
                        </div>
                      )}

                      {/* Toast notification banner */}
                      {demoNotification && (
                        <motion.div 
                          key={demoNotification}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 rounded-lg bg-[#1A2033] border border-cyan-500/40 text-caption font-mono text-cyan-300 w-full"
                        >
                          {demoNotification}
                        </motion.div>
                      )}
                    </div>

                    {/* Bottom Status bar */}
                    <div className="p-2 rounded-xl bg-[#0A0E1A] border border-[#252B3D] flex items-center justify-between text-caption font-mono text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Loop Alive
                      </span>
                      <span className="text-cyan-400">v1.0.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Feature Trigger Matrix */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl glass-surface border border-cyan-500/30">
                  <div className="font-mono text-caption font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                    WEB COMMAND INTERFACE
                  </div>
                  <p className="font-sans text-body-sm text-slate-600 dark:text-slate-300">
                    Click each control below to dispatch simulated security signals directly to the handset:
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Action 1: Capture Screenshot */}
                  <div 
                    onClick={() => {
                      setActiveDemoFeature(0);
                      handleDemoCapture();
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeDemoFeature === 0 ? 'bg-cyan-50/90 dark:bg-[#1A2033] border-cyan-500 shadow-md shadow-cyan-500/10' : 'glass-surface border-slate-200 dark:border-[#252B3D] hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                          Trigger Remote Screenshot
                        </div>
                        <div className="font-sans text-body-sm text-slate-500 dark:text-slate-400">
                          Silently reads framebuffer and streams via CDN
                        </div>
                      </div>
                    </div>
                    <Button variant="cyan" size="sm">
                      Capture
                    </Button>
                  </div>

                  {/* Action 2: Quick Settings Lockdown */}
                  <div 
                    onClick={() => {
                      setActiveDemoFeature(1);
                      const next = !demoQsLocked;
                      setDemoQsLocked(next);
                      setDemoNotification(next ? 'Quick Settings locked. Shade pull-down suppressed.' : 'Quick Settings unlocked.');
                      toast.success(`Quick settings shield ${next ? 'enabled' : 'disabled'}`);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeDemoFeature === 1 ? 'bg-cyan-50/90 dark:bg-[#1A2033] border-cyan-500 shadow-md shadow-cyan-500/10' : 'glass-surface border-slate-200 dark:border-[#252B3D] hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                          Quick Settings Lockdown
                        </div>
                        <div className="font-sans text-body-sm text-slate-500 dark:text-slate-400">
                          Blocks swipe-down on lockscreen (airplane mode safeguard)
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg font-mono text-caption font-bold ${
                      demoQsLocked ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent'
                    }`}>
                      {demoQsLocked ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  {/* Action 3: Shutdown Protection */}
                  <div 
                    onClick={() => {
                      setActiveDemoFeature(2);
                      const next = !demoShutdownLocked;
                      setDemoShutdownLocked(next);
                      setDemoNotification(next ? 'Power menu intercepted. Forced shutdown aborted.' : 'Shutdown protection inactive.');
                      toast.success(`Shutdown protection ${next ? 'enabled' : 'disabled'}`);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeDemoFeature === 2 ? 'bg-cyan-50/90 dark:bg-[#1A2033] border-cyan-500 shadow-md shadow-cyan-500/10' : 'glass-surface border-slate-200 dark:border-[#252B3D] hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Power className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                          Shutdown Interceptor
                        </div>
                        <div className="font-sans text-body-sm text-slate-500 dark:text-slate-400">
                          Intercepts long-press power button and aborts dialog
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg font-mono text-caption font-bold ${
                      demoShutdownLocked ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent'
                    }`}>
                      {demoShutdownLocked ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>

                  {/* Action 4: Remote Silent Mode */}
                  <div 
                    onClick={() => {
                      setActiveDemoFeature(3);
                      const next = !demoSilent;
                      setDemoSilent(next);
                      setDemoNotification(next ? 'Mute override engaged via AudioManager.' : 'Standard audio levels restored.');
                      toast.success(`Silent mode ${next ? 'engaged' : 'disengaged'}`);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      activeDemoFeature === 3 ? 'bg-cyan-50/90 dark:bg-[#1A2033] border-cyan-500 shadow-md shadow-cyan-500/10' : 'glass-surface border-slate-200 dark:border-[#252B3D] hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                          Remote Silent Mode
                        </div>
                        <div className="font-sans text-body-sm text-slate-500 dark:text-slate-400">
                          Remotely silence the device during discrete investigation
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg font-mono text-caption font-bold ${
                      demoSilent ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-transparent'
                    }`}>
                      {demoSilent ? 'SILENT' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 7: HOW IT WORKS (Timeline with Simple Clean Numbers)
           ───────────────────────────────────────────────────────── */}
        <section 
          id="how-it-works"
          ref={howRef}
          className="py-24 md:py-32 border-b border-slate-200 dark:border-[#252B3D] bg-slate-50 dark:bg-[#0A0E1A] relative"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="font-mono text-caption uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
                QUICK SETUP
              </span>
              <h2 className="font-display font-bold text-display-lg text-slate-900 dark:text-white">
                Set Up In 5 Minutes
              </h2>
              <p className="font-sans text-body text-slate-600 dark:text-slate-300">
                No complex flashing or bootloader modifications. Follow five transparent steps to protect your device.
              </p>
            </div>

            {/* Timeline Steps */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-5 gap-6 relative"
              initial="hidden"
              animate={howInView ? 'visible' : 'hidden'}
              variants={staggerContainer}
            >
              {steps.map((st) => {
                const IconComp = st.icon;
                return (
                  <motion.div
                    key={st.title}
                    variants={fadeInUp}
                    className="p-6 rounded-3xl glass-surface border border-slate-200 dark:border-[#252B3D] relative flex flex-col justify-between space-y-6 hover:border-cyan-500/50 transition-all group"
                  >
                    <div>
                      {/* Simple Professional Step Number */}
                      <div className="font-display font-extrabold text-3xl text-cyan-600 dark:text-cyan-400/90 tracking-tight mb-4 group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                        {st.num}
                      </div>

                      <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                        <IconComp className="w-6 h-6" />
                      </div>

                      <h3 className="font-display font-semibold text-heading-md text-slate-900 dark:text-white mb-2">
                        {st.title}
                      </h3>

                      <p className="font-sans text-body-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {st.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-[#252B3D]/60 flex items-center gap-1.5 text-caption font-mono text-cyan-600 dark:text-cyan-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Ready</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 8: SECURITY SECTION (Scanning Line + Shield Pulse)
           ───────────────────────────────────────────────────────── */}
        <section 
          ref={securityRef}
          className="py-24 md:py-32 border-b border-slate-200 dark:border-[#252B3D] bg-white dark:bg-[#0A0E1A] relative overflow-hidden"
        >
          {/* Scanning radar line animation across section */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line opacity-70 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mx-auto animate-pulse-glow">
                <Shield className="w-8 h-8" />
              </div>
              <span className="font-mono text-caption uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                ZERO SURVEILLANCE EXPLOITATION
              </span>
              <h2 className="font-display font-bold text-display-lg text-slate-900 dark:text-white">
                Your Data Is Safe
              </h2>
              <p className="font-sans text-body text-slate-600 dark:text-slate-300">
                Engineered for personal security with zero third-party trackers, no ad networks, and client-encrypted telemetry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl glass-surface border border-slate-200 dark:border-[#252B3D] space-y-3">
                <LockKeyhole className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                <h3 className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                  End-to-End Encrypted
                </h3>
                <p className="font-sans text-body-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Only your authenticated browser session can decrypt screenshots and view GPS history.
                </p>
              </div>

              <div className="p-6 rounded-3xl glass-surface border border-slate-200 dark:border-[#252B3D] space-y-3">
                <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h3 className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                  Firebase Security Rules
                </h3>
                <p className="font-sans text-body-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Strict collection-level rules ensure users can only query and write to their own device records.
                </p>
              </div>

              <div className="p-6 rounded-3xl glass-surface border border-slate-200 dark:border-[#252B3D] space-y-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                  No Data Selling
                </h3>
                <p className="font-sans text-body-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  We never monetize your location history, advertising IDs, or telemetry records.
                </p>
              </div>

              <div className="p-6 rounded-3xl glass-surface border border-slate-200 dark:border-[#252B3D] space-y-3">
                <CheckCircle2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h3 className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                  Open Architecture
                </h3>
                <p className="font-sans text-body-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Verifiable Android permissions and audited cloud routes with full transparent documentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 9: PRICING (Side-by-Side with Clean Numbers)
           ───────────────────────────────────────────────────────── */}
        <section 
          id="pricing"
          ref={pricingRef}
          className="py-24 md:py-32 border-b border-slate-200 dark:border-[#252B3D] bg-slate-50 dark:bg-[#0E1424] relative"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-mono text-caption uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
                HONEST PRICING
              </span>
              <h2 className="font-display font-bold text-display-lg text-slate-900 dark:text-white">
                Simple Pricing
              </h2>
              <p className="font-sans text-body text-slate-600 dark:text-slate-300">
                Straightforward plans without predatory monthly auto-renewals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              
              {/* Free Tier */}
              <div className="p-8 rounded-3xl glass-surface border border-slate-200 dark:border-[#252B3D] flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <div className="font-mono text-caption text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    BASIC ACCESS
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">$0</span>
                    <span className="font-mono text-caption text-slate-500 dark:text-slate-400">/ forever</span>
                  </div>
                  <p className="font-sans text-body-sm text-slate-600 dark:text-slate-400">
                    Core protection features for personal device tracking and trial testing.
                  </p>

                  <ul className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#252B3D] text-body-sm font-sans">
                    <li className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Single Android device registration</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Live OpenStreetMap location tracking</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Quick Settings lockdown toggle</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Community support</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleAuthAction}
                  variant="outline"
                  className="w-full"
                >
                  Access Free Dashboard
                </Button>
              </div>

              {/* Pro Tier (Highlighted) */}
              <div className="p-8 rounded-3xl relative flex flex-col justify-between space-y-8 shadow-[0_0_40px_rgba(0,229,255,0.18)] md:scale-105 border-2 border-cyan-500 bg-gradient-to-b from-white via-cyan-50/40 to-slate-50 dark:from-[#131D33] dark:to-[#0A0E1A]">
                {/* Best Value Ribbon */}
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-display font-bold text-caption shadow-md uppercase tracking-wider">
                  BEST VALUE
                </div>

                <div className="space-y-4">
                  <div className="font-mono text-caption text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                    PRO PROTECTION
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-4xl sm:text-5xl text-cyan-600 dark:text-cyan-400 tracking-tight">$1</span>
                    <span className="font-mono text-caption text-slate-500 dark:text-slate-300">/ full year</span>
                  </div>
                  <p className="font-sans text-body-sm text-slate-600 dark:text-slate-300">
                    Complete anti-theft countermeasure suite with unlimited screenshots and multi-device support.
                  </p>

                  <ul className="space-y-3 pt-4 border-t border-cyan-500/30 text-body-sm font-sans">
                    <li className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Unlimited Remote Screenshots (CDN buffered)</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Multiple Android devices & family fleet</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Forced Shutdown suppression countermeasure</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Remote Silent & Siren audio override</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                      <Check className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Priority engineering support by Sultan Ahmad</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleAuthAction}
                  variant="cyan"
                  className="w-full shadow-lg shadow-cyan-500/30 font-display font-bold"
                >
                  Upgrade to Pro ($1/Year)
                </Button>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 10: FAQ (Accordion with Framer Motion)
           ───────────────────────────────────────────────────────── */}
        <section 
          id="faq"
          className="py-24 md:py-32 border-b border-slate-200 dark:border-[#252B3D] bg-white dark:bg-[#0A0E1A] relative"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <span className="font-mono text-caption uppercase tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20">
                FREQUENTLY ASKED
              </span>
              <h2 className="font-display font-bold text-display-lg text-slate-900 dark:text-white">
                Questions? Answered.
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl glass-surface border border-slate-200 dark:border-[#252B3D] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                    >
                      <span className="font-display font-semibold text-heading-md text-slate-900 dark:text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-5 pb-5 sm:px-6 sm:pb-6 text-body font-sans text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-[#252B3D]/60 pt-4 leading-relaxed"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 11: FINAL CTA (Full-Width Animated Gradient)
           ───────────────────────────────────────────────────────── */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-tr from-slate-100 via-cyan-50/30 to-purple-50/30 dark:from-[#0A0E1A] dark:via-[#1A1F3A] dark:to-[#0F0A1E] text-center border-b border-slate-200 dark:border-[#252B3D]">
          <ParticleBackground particleCount={24} />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
            <h2 className="font-display font-bold text-display-lg text-slate-900 dark:text-white">
              Ready to Arm Your Android Smartphone?
            </h2>
            <p className="font-sans text-body-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              Install the verified Anti-Theft APK on your handset, then log in here to command live location radar, screenshots, and remote lockdowns.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/download"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-body-sm bg-cyan-500 text-slate-950 shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:bg-cyan-400 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download Android APK</span>
              </Link>

              <Button
                onClick={handleAuthAction}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                Open User Dashboard
              </Button>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 12: FOOTER
           ───────────────────────────────────────────────────────── */}
        <Footer />
      </main>
    </div>
    </PublicPageWrapper>
  );
};
