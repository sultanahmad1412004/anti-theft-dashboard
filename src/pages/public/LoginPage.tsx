import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Download,
  Radio,
  ArrowRight,
  BellRing,
  Zap,
  Activity,
  MapPin,
  LockKeyhole,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';
import { ParticleBackground } from '../../components/landing/ParticleBackground';
import { GradientText } from '../../components/landing/GradientText';
import { CursorGlow } from '../../components/landing/CursorGlow';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your registered email and password.');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const result = await login(email.trim(), password);
      toast.success('Successfully authenticated!');
      
      if (result.role === 'superadmin' || result.role === 'admin' || result.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Failed to authenticate. Please check your email and password.';
      if (
        err?.code === 'auth/invalid-credential' || 
        err?.code === 'auth/user-not-found' || 
        err?.code === 'auth/wrong-password'
      ) {
        msg = 'Invalid credentials. Please register your account inside the mobile APK first.';
      } else if (err?.code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Please reset your password or try again later.';
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicPageWrapper
      title="Sign In — Anti-Theft App for Android & Web Command Dashboard"
      description="Official web control dashboard sign in for Anti-Theft Android Mobile Security. Access live GPS tracking, remote screenshot viewer, lockdown switches, and emergency siren trigger."
      keywords={[
        'anti theft app for android',
        'anti theft login', 
        'anti theft web dashboard sign in', 
        'android device tracker login', 
        'remote android command dashboard',
        'download anti theft app',
        'remote siren alarm login',
        'sultan ahmad anti-theft login'
      ]}
      canonicalPath="/login"
      schemas={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Anti-Theft App for Android & Web Dashboard Sign In',
          url: 'https://anti-theft.sultanahmad.site/login',
          description: 'Secure authentication gateway for Anti-Theft Android Mobile Security companion web dashboard.',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://anti-theft.sultanahmad.site/' },
              { '@type': 'ListItem', position: 2, name: 'Sign In', item: 'https://anti-theft.sultanahmad.site/login' }
            ]
          }
        }
      ]}
    >
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] text-slate-800 dark:text-[#F1F5F9] font-sans antialiased relative selection:bg-cyan-500/20 selection:text-cyan-600 dark:selection:text-cyan-300 transition-colors duration-200 flex flex-col justify-between overflow-hidden">
        
        {/* Particle Canvas Animation (matching Landing Page) */}
        <ParticleBackground particleCount={32} />

        {/* Global Cursor Glow */}
        <CursorGlow radius={320} />

        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-purple-600/10 to-blue-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-gradient-to-bl from-blue-500/10 via-cyan-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <div className="w-full max-w-6xl mx-auto">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center"
            >
              
              {/* LEFT COLUMN: Landing Page Style Hero Typography & Features */}
              <motion.div variants={fadeInUp} className="lg:col-span-6 space-y-7 text-left">
                {/* Genuine Product Feature Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-caption font-mono shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>OFFICIAL ANDROID APP &amp; WEB COMPANION</span>
                </div>

                {/* H1 Headline using exact Landing Page Sora typography */}
                <h1 className="font-display font-extrabold text-display-xl text-slate-900 dark:text-white tracking-tightest leading-[1.05]">
                  Android Anti-Theft <br />
                  <GradientText animate={true}>Web Command Portal</GradientText>
                </h1>

                {/* Subtitle */}
                <p className="font-sans text-body-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                  Sign in to command your Android device ecosystem. Trigger the remote high-decibel siren, stream real-time GPS locations, and grab silent intruder screenshots from any web browser.
                </p>

                {/* Feature Pill Deck */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#131826]/80 border border-slate-200 dark:border-[#252B3D] shadow-xs space-y-1 group hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white">
                      <BellRing className="w-4 h-4 text-rose-500 animate-bounce" />
                      <span>Remote Siren Override</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Bypasses silent mode &amp; DND at 100% volume
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#131826]/80 border border-slate-200 dark:border-[#252B3D] shadow-xs space-y-1 group hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white">
                      <Radio className="w-4 h-4 text-cyan-500 animate-pulse" />
                      <span>Live GPS Telemetry</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Street-level MapTiler satellite mapping
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#131826]/80 border border-slate-200 dark:border-[#252B3D] shadow-xs space-y-1 group hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Shutdown Protection</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Blocks power-off dialogs when locked
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#131826]/80 border border-slate-200 dark:border-[#252B3D] shadow-xs space-y-1 group hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-white">
                      <Activity className="w-4 h-4 text-purple-500" />
                      <span>Sub-Second Cloud Sync</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Direct reactive Firestore delta stream
                    </p>
                  </div>
                </div>

                {/* 3-Step Flow explainer */}
                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 font-bold text-cyan-800 dark:text-cyan-300">
                    <KeyRound className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
                    <span>How to access your web dashboard:</span>
                  </div>
                  <p className="text-[11px] font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
                    Install our APK on your phone, complete the quick sign-up inside the app to register hardware, then use those same credentials here.
                  </p>
                </div>
              </motion.div>

              {/* RIGHT COLUMN: Cyber Terminal Authentication Card */}
              <motion.div variants={fadeInUp} className="lg:col-span-6">
                <div className="glass-surface p-8 sm:p-10 rounded-[32px] border border-cyan-500/30 dark:border-cyan-500/25 shadow-[0_0_50px_rgba(0,229,255,0.15)] relative overflow-hidden">
                  
                  {/* Top Glowing Gradient Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />

                  {/* Header */}
                  <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-[#252B3D]">
                    <div className="relative w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-[#00E5FF]/15 border border-cyan-500/30 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                      <Shield className="w-7 h-7" />
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131826]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                        Sign In to Dashboard
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Handset-Linked Cloud Gateway
                      </p>
                    </div>
                  </div>

                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs font-sans"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@example.com"
                          autoComplete="email"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-body-sm font-sans transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-[11px] font-sans text-cyan-600 dark:text-[#00E5FF] hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          autoComplete="current-password"
                          className="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-body-sm font-sans transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button (Matching Landing Page Hero Button) */}
                    <Button
                      type="submit"
                      variant="cyan"
                      size="lg"
                      isLoading={submitting}
                      rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
                      className="w-full shadow-[0_0_25px_rgba(0,229,255,0.35)] hover:shadow-[0_0_35px_rgba(0,229,255,0.55)] transition-all font-display font-bold py-3.5 text-base mt-2"
                    >
                      {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </Button>
                  </form>

                  {/* APK Download CTA */}
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-[#252B3D] text-center space-y-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Don't have an account or need to protect a new Android phone?
                    </p>
                    <Link
                      to="/download"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-semibold text-xs text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Android APK (Free Installation)</span>
                    </Link>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </PublicPageWrapper>
  );
};
