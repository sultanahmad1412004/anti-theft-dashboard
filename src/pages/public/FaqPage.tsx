import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  Radio, 
  Camera, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';
import { fadeInUp, transitions } from '../../utils/animations';

export interface FAQItem {
  id: string;
  category: 'General' | 'Features' | 'Security' | 'Billing';
  q: string;
  a: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'what-is-antitheft',
    category: 'General',
    q: 'What is Anti-Theft and how does it protect my smartphone?',
    a: 'Anti-Theft is an enterprise-grade Android defense system paired with a synchronized real-time web command center. It gives you instant remote control over your smartphone: capturing photographic optical screenshots, blocking quick settings toggles, intercepting power shutdown attempts on the lockscreen, sounding high-decibel alarms, and streaming live GPS coordinates.'
  },
  {
    id: 'airplane-mode-shutdown',
    category: 'Features',
    q: 'How does it stop thieves from enabling Airplane Mode or turning off the device?',
    a: 'Anti-Theft integrates with Android native Accessibility Services and Foreground Monitoring APIs. When an unauthorized user pulls down the notification shade or holds the power key on a locked device, the application cancels the window action in milliseconds, keeping mobile data, Wi-Fi, and GPS transceivers active.'
  },
  {
    id: 'root-requirement',
    category: 'Security',
    q: 'Is root access or bootloader unlocking required to run Anti-Theft?',
    a: 'No root access is required! Anti-Theft is built strictly on standard, Google-certified Android Accessibility, MediaProjection, and Device Administrator APIs. It works safely on unmodified stock Android versions ranging from Android 8.0 (Oreo) up to Android 16 (API 36).'
  },
  {
    id: 'remote-screenshot',
    category: 'Features',
    q: 'How does the remote optical screenshot feature work?',
    a: 'When you trigger a screenshot command from your web dashboard, a prioritized push signal is transmitted to your phone. The Android foreground engine captures the current optical display and immediately uploads the encrypted frame to secure cloud storage, providing visual proof of the perpetrator or active app.'
  },
  {
    id: 'free-vs-pro',
    category: 'Billing',
    q: 'What is the difference between the Free Basic tier and the Pro Plan?',
    a: 'The Free tier grants lifetime access to device registration, status monitoring, Quick Settings Block, and Lockscreen Shutdown Protection. The Pro Defense License ($1.00/year) unlocks optical screenshots, remote audible siren triggers, sub-second OpenStreetMap location tracking, and multi-device fleet management.'
  },
  {
    id: 'remote-ring-silent',
    category: 'Features',
    q: 'Can the remote siren override silent mode or do-not-disturb (DND)?',
    a: 'Yes. When you trigger Remote Ring from the dashboard, the anti-theft service temporarily overrides audio stream volumes to maximum decibels, sounding a persistent alarm to locate a misplaced or concealed device in physical proximity.'
  },
  {
    id: 'multi-device-support',
    category: 'General',
    q: 'Can I monitor and protect multiple Android devices under one account?',
    a: 'Yes! You can link and monitor all your personal or family devices (smartphones, tablets, Android rugged units) under a single account. Each device gets its own independent telemetry telemetry terminal in your web dashboard.'
  },
  {
    id: 'live-gps-tracking',
    category: 'Features',
    q: 'How accurate is the live location tracking on the dashboard map?',
    a: 'Location tracking utilizes Android fused location providers combining hardware GPS, GLONASS, Wi-Fi tri-lateration, and cellular towers. Coordinates are rendered with sub-second responsiveness on an interactive OpenStreetMap layer with heading, speed, altitude, and precision radius indicators.'
  },
  {
    id: 'data-privacy-encryption',
    category: 'Security',
    q: 'How is my device telemetry and personal data protected?',
    a: 'Your telemetry data is stored in Google Firebase Firestore with strict identity-based access control rules. Only authenticated accounts have access to their own registered devices, and all data transmission over the wire is encrypted via TLS 1.3.'
  },
  {
    id: 'install-and-setup',
    category: 'General',
    q: 'How do I install and configure the APK after downloading?',
    a: 'Download the official APK from our Download page, open the package on your Android phone, grant the requested permissions (Accessibility Service, Overlay Permission, and Location), log in with your email, and your device will instantly appear in this web console.'
  },
  {
    id: 'restricted-settings-android-13',
    category: 'Security',
    q: 'Why is Accessibility Service grayed out or restricted on Android 13, 14, 15, or 16?',
    a: 'Google introduced a protective restriction called "Restricted Settings" for apps installed outside the Google Play Store. To unrestrict it: Go to your phone Settings → Apps → Anti-Theft → Tap the 3 dots (⋮) in the top-right corner → Tap "Allow restricted settings" → Authenticate with your fingerprint or PIN. After this one-time step, you can toggle Accessibility Service ON normally.'
  },
  {
    id: 'sideload-warning-play-protect',
    category: 'Security',
    q: 'Why does Android or Chrome say "File might be harmful" when downloading the APK?',
    a: 'Android displays this standard informational prompt for all sideloaded APKs downloaded outside the Google Play Store. The Anti-Theft APK is a verified, clean, non-malicious security package cryptographically signed by developer Sultan Ahmad. Simply tap "Download Anyway" and proceed with installation.'
  },
  {
    id: 'battery-optimization-kill',
    category: 'Features',
    q: 'How do I prevent Xiaomi, Oppo, Vivo, or Samsung battery savers from stopping the service?',
    a: 'Manufacturer ROMs (ColorOS, MIUI/HyperOS, FuntouchOS, OneUI) have aggressive task killers. To guarantee uninterrupted 24/7 protection: Go to phone Settings → Apps → Anti-Theft → Battery (or App Battery Usage) → Select "Unrestricted" / "Don\'t Optimize". On Xiaomi/MIUI, also toggle "Autostart" ON in App Info.'
  },
  {
    id: 'physical-buttons-siren',
    category: 'Features',
    q: 'Can a thief mute the emergency siren using physical volume buttons?',
    a: 'No. The native Kotlin background service hooks directly into Android system AudioManager. Even if a thief repeatedly presses volume down or mutes the ringer, the anti-theft loop continuously forces audio output back to 100% maximum decibels until disabled from your web command dashboard.'
  },
  {
    id: 'silent-screenshot-discreet',
    category: 'Features',
    q: 'Does capturing a remote screenshot trigger any camera flash or shutter sound?',
    a: 'No shutter noise or physical flash is triggered. The screenshot is read directly from display memory via Android MediaProjection buffers and securely transmitted to your cloud CDN, allowing stealth observation of the perpetrator or currently open application.'
  },
  {
    id: 'device-auto-registration',
    category: 'General',
    q: 'How does my smartphone automatically bind to my web account?',
    a: 'When you open the Anti-Theft APK and log in with your email credentials, the native engine reads device hardware specs, manufacturer, and Android API version, generating an encrypted device record under your Firestore user node. It links instantly with zero manual pairing codes.'
  }
];

export const FaqPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<string | null>(FAQ_DATA[0].id);

  const categories = ['All', 'General', 'Features', 'Security', 'Billing'];

  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };

  return (
    <PublicPageWrapper
      title="Frequently Asked Questions — Anti-Theft App"
      description="Find answers to common questions about Anti-Theft APK, remote control, quick settings protection, GPS tracking, and Pro subscription."
      keywords={[
        'anti theft faq',
        'anti theft questions',
        'android security faq',
        'phone tracking questions',
        'how to track stolen android'
      ]}
      canonicalPath="/faq"
      schemas={[faqSchema]}
    >
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#0A0E1A] text-slate-800 dark:text-[#F1F5F9] flex flex-col justify-between transition-colors duration-200 font-sans">
        <Navbar />

        <main className="flex-1 py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="cyan" size="md" className="mb-4">
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                Knowledge Base & FAQ
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                Everything you need to know about setting up, controlling, and securing your Android device with Anti-Theft.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4 mb-10">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions (e.g. shutdown, airplane mode, root, pricing)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-[#161D2F] border border-slate-200 dark:border-[#252B3D] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow text-sm"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-white dark:bg-[#161D2F] border border-slate-200 dark:border-[#252B3D] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#161D2F] rounded-2xl border border-slate-200 dark:border-[#252B3D] p-6">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No matching answers found for "{searchQuery}".
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  >
                    Clear Filter
                  </Button>
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = openIndex === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-2xl border border-slate-200 dark:border-[#252B3D] bg-white dark:bg-[#161D2F] overflow-hidden transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : faq.id)}
                        className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1A2238]/60 transition-colors"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-cyan-600 dark:text-[#00E5FF] px-2 py-0.5 rounded-md bg-cyan-500/10">
                            Q{idx + 1}
                          </span>
                          <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
                            {faq.q}
                          </h2>
                        </div>
                        <ChevronDown 
                          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-cyan-500' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Support Banner */}
            <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-cyan-900/30 via-[#161D2F] to-cyan-900/20 border border-cyan-500/30 text-center relative overflow-hidden">
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Have a different question or need APK support?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
                Reach out to developer Sultan Ahmad directly through our dedicated contact help desk or browse our APK installation guides.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <Link to="/contact">
                  <Button variant="primary" size="md">
                    Contact Developer
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/download">
                  <Button variant="outline" size="md">
                    Download APK
                    <ExternalLink className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PublicPageWrapper>
  );
};
