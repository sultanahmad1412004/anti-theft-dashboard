import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  FileCode2, 
  Cpu, 
  Lock, 
  Radio, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  FolderDown, 
  Key, 
  Layers, 
  Info,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { DOWNLOAD_CONFIG } from '../../config/downloadConfig';
import { 
  subscribeToDownloadAppConfig, 
  DEFAULT_DOWNLOAD_CONFIG 
} from '../../services/appConfigService';
import { DownloadAppConfig } from '../../types';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';
import toast from 'react-hot-toast';

const downloadSchemas = [
  // 1. SoftwareApplication Schema
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Anti-Theft',
    operatingSystem: 'Android 8.0+',
    applicationCategory: 'SecurityApplication',
    softwareVersion: DOWNLOAD_CONFIG.VERSION,
    fileSize: DOWNLOAD_CONFIG.SIZE,
    downloadUrl: DOWNLOAD_CONFIG.MEDIAFIRE_URL,
    installUrl: 'https://anti-theft.sultanahmad.site/download',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150'
    },
    author: {
      '@type': 'Person',
      name: 'Sultan Ahmad',
      url: 'https://sultanahmad.site'
    }
  },
  // 2. HowTo Schema (Installation Steps)
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Install Anti-Theft APK on Android',
    description: 'Step-by-step guide to install the Anti-Theft Android app from APK.',
    totalTime: 'PT5M',
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Android Device (8.0+)'
      },
      {
        '@type': 'HowToTool',
        name: 'Anti-Theft APK file'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Download the APK',
        text: 'Tap the Download APK button. This opens MediaFire. Tap Download to save the APK file.'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enable Unknown Sources',
        text: 'Go to Settings → Apps → Special Access → Install Unknown Apps → Enable for your browser.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Open the APK',
        text: 'Open your Downloads folder and tap the APK file.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Confirm Installation',
        text: 'Tap Install Anyway, then Install, then Open.'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Grant Permissions',
        text: 'Allow Location, Accessibility Service, Notifications, and DND access.'
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Sign In',
        text: 'Sign in with your email to register this device.'
      }
    ]
  },
  // 3. FAQ Schema
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is the Anti-Theft APK free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes, the APK itself is free. There's a Pro plan at $1/year for advanced features."
        }
      },
      {
        '@type': 'Question',
        name: 'Does the APK work on all Android phones?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, it works on Android 8.0 and above — Samsung, Xiaomi, Oppo, Vivo, Realme, OnePlus, Google Pixel, and all others.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I need to root my device?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, Anti-Theft works without root.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is it safe to install APK from MediaFire?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, if the APK is verified. Always check the source and scan with VirusTotal.'
        }
      },
      {
        '@type': 'Question',
        name: 'How often is the APK updated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We push updates when bugs are fixed or new features are added. Check this page for the latest version.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I update the app later?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, download the new APK from this page and install over the old version. Your data is preserved.'
        }
      },
      {
        '@type': 'Question',
        name: 'What if I forget my account password?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use Forgot Password on the login screen to reset it via email.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does the APK work offline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The app needs internet to sync with the web dashboard. However, protection features work offline.'
        }
      },
      {
        '@type': 'Question',
        name: 'How do I uninstall Anti-Theft?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Go to Settings → Apps → Anti-Theft → Uninstall. Remember to disable Accessibility Service first.'
        }
      }
    ]
  },
  // 4. BreadcrumbList Schema
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://anti-theft.sultanahmad.site/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Download',
        item: 'https://anti-theft.sultanahmad.site/download'
      }
    ]
  }
];

export const DownloadPage: React.FC = () => {
  const [config, setConfig] = useState<DownloadAppConfig>(DEFAULT_DOWNLOAD_CONFIG);
  const [copiedHash, setCopiedHash] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openTroubleshootIndex, setOpenTroubleshootIndex] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToDownloadAppConfig((latest) => {
      setConfig(latest);
    });
    return () => unsubscribe();
  }, []);

  const handleDownloadClick = () => {
    window.open(config.mediafireUrl || DOWNLOAD_CONFIG.MEDIAFIRE_URL, '_blank', 'noopener,noreferrer');
    toast.success('Opening MediaFire download link in new tab...');
  };

  const copySha256 = () => {
    const hash = config.sha256 || DOWNLOAD_CONFIG.SHA256;
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    toast.success('SHA-256 hash copied to clipboard');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const installationSteps = [
    {
      num: 1,
      icon: Download,
      title: 'Download the APK',
      desc: "Tap the 'Download APK Now' button above. This will open MediaFire in a new tab.",
      actionText: "Tap the 'Download' button on MediaFire to save the APK file to your device."
    },
    {
      num: 2,
      icon: Settings,
      title: "Enable 'Install from Unknown Sources'",
      desc: 'Android blocks APKs from outside the Play Store by default. You need to allow installation from your browser or file manager.',
      path: 'Settings → Apps → Special Access → Install Unknown Apps → [Your Browser/File Manager] → Allow',
      note: 'On older Android versions: Settings → Security → Unknown Sources → Enable'
    },
    {
      num: 3,
      icon: FolderDown,
      title: 'Open the Downloaded APK',
      desc: "Open your Downloads folder (or the notification that says 'Download complete').",
      actionText: 'Tap the APK file to start installation.'
    },
    {
      num: 4,
      icon: ShieldAlert,
      title: 'Confirm Installation',
      desc: "A warning will appear saying 'For your security, your phone is not allowed to install unknown apps from this source.'",
      actionText: "Tap 'Install Anyway' or 'Settings' → Enable → Install, then wait for installation to finish and tap 'Open'."
    },
    {
      num: 5,
      icon: Key,
      title: 'Grant Security Permissions',
      desc: 'When the app opens, it will ask for critical security permissions:',
      bullets: [
        'Location Permission → Tap "Allow All The Time" for live GPS transponders',
        'Accessibility Service → Tap "Enable" (opens system settings → find Anti-Theft → Toggle ON)',
        'Notification Permission → Tap "Allow" to keep foreground service pinned',
        'DND Access (Do Not Disturb) → Tap "Allow" to control remote silent mode'
      ]
    },
    {
      num: 6,
      icon: Lock,
      title: 'Sign In to Your Account',
      desc: 'Sign in with your email and password to register this device to your Anti-Theft web companion dashboard.'
    },
    {
      num: 7,
      icon: CheckCircle2,
      title: 'Done! Your Device is Protected',
      desc: 'Your device is now armed with remote shields. Access real-time controls anytime at anti-theft.sultanahmad.site.'
    }
  ];

  const systemRequirements = [
    { req: 'Operating System', val: 'Android 8.0 (Oreo) or higher' },
    { req: 'API Level', val: 'API 26+' },
    { req: 'RAM', val: '2 GB minimum' },
    { req: 'Storage', val: '50 MB free space' },
    { req: 'Permissions', val: 'Location, Accessibility, Notifications, DND Access' },
    { req: 'Internet', val: 'Required for remote control & cloud sync' },
    { req: 'Root', val: 'Not required (Works on stock Android)' },
    { req: 'Google Play Services', val: 'Required for accurate fused location' }
  ];

  const supportedVersions = [
    'Android 8.0 (Oreo)',
    'Android 9 (Pie)',
    'Android 10',
    'Android 11',
    'Android 12',
    'Android 13',
    'Android 14',
    'Android 15',
    'Android 16 (latest)'
  ];

  const permissionsList = [
    'ACCESS_FINE_LOCATION',
    'ACCESS_COARSE_LOCATION',
    'ACCESS_BACKGROUND_LOCATION',
    'POST_NOTIFICATIONS',
    'FOREGROUND_SERVICE',
    'FOREGROUND_SERVICE_MEDIA_PROJECTION',
    'ACCESS_NOTIFICATION_POLICY',
    'BIND_ACCESSIBILITY_SERVICE',
    'MODIFY_AUDIO_SETTINGS',
    'INTERNET'
  ];

  const troubleshootingItems = [
    {
      q: '"Install blocked" or "Install anyway" option is not showing',
      a: 'Go to Settings → Apps → Special Access → Install Unknown Apps. Select the browser or File Manager app you used to download the APK and toggle "Allow from this source" ON.'
    },
    {
      q: '"App not installed" error message',
      a: 'Uninstall any previous debug or older version of Anti-Theft from your handset first, reboot your phone, and then reinstall the freshly downloaded APK.'
    },
    {
      q: '"Parse error" during installation',
      a: 'The downloaded APK file is corrupt or incomplete due to an interrupted connection. Delete the file from your Downloads folder and download it again from MediaFire.'
    },
    {
      q: '"This app is not compatible with your device"',
      a: 'Verify your Android OS version. Anti-Theft requires Android 8.0 (Oreo) or higher. Check Settings → About Phone → Android Version to verify compatibility.'
    },
    {
      q: 'App crashes immediately after opening',
      a: 'Ensure all requested runtime permissions are granted when prompted. If issues persist, reinstall the APK or reach out to our developer support desk.'
    },
    {
      q: 'Accessibility Service keeps turning off automatically',
      a: 'Aggressive battery management in certain manufacturer ROMs (Xiaomi/MIUI, Oppo/ColorOS, Vivo, Realme) may terminate background services. Go to Settings → Battery → App Battery Management → Anti-Theft → select "Don\'t Optimize" / "No Restrictions".'
    }
  ];

  const faqItems = [
    {
      q: 'Is the Anti-Theft APK free?',
      a: "Yes, the APK itself is completely free to download and install. There is a Pro plan at $1/year for complete surveillance countermeasures (remote screenshot capture and live GPS tracking)."
    },
    {
      q: 'Does the APK work on all Android phones?',
      a: 'Yes, it works on Android 8.0 and above across all manufacturers — Samsung, Xiaomi, Oppo, Vivo, Realme, OnePlus, Google Pixel, Motorola, and others.'
    },
    {
      q: 'Will I lose warranty by installing the APK?',
      a: "No, installing APKs from unknown sources does not void your hardware warranty. Only unlocking your bootloader and rooting voids manufacturer warranties."
    },
    {
      q: 'Do I need to root my device?',
      a: 'No, Anti-Theft functions completely on stock, unrooted Android using standard Accessibility and Device Administration APIs.'
    },
    {
      q: 'Is it safe to install the APK from MediaFire?',
      a: 'Yes. The APK is officially built, signed, and maintained by Sultan Ahmad. You can independently verify the package integrity using SHA-256 or upload it to VirusTotal before running it.'
    },
    {
      q: 'How often is the APK updated?',
      a: 'We push regular updates whenever bug fixes or performance enhancements are released. Check this download page periodically for the latest builds.'
    },
    {
      q: 'Can I update the app later?',
      a: 'Yes. When an update is released, simply download the new APK from this page and install it directly over the existing version. Your credentials and paired settings are preserved.'
    },
    {
      q: 'What if I forget my account password?',
      a: 'Use the "Forgot Password" feature on the login screen at anti-theft.sultanahmad.site to reset your password via your registered email address.'
    },
    {
      q: 'Does the APK work offline?',
      a: 'The application requires an active cellular or WiFi connection to transpond coordinates and receive remote commands from the web dashboard. However, on-device locks (like Quick Settings blocking and Shutdown intercepting) operate locally even when offline.'
    },
    {
      q: 'How do I uninstall Anti-Theft?',
      a: 'Go to Settings → Apps → Anti-Theft → Uninstall. Make sure to first toggle off Accessibility Service in Settings → Accessibility.'
    }
  ];

  return (
    <PublicPageWrapper
      title="Download Anti-Theft APK for Android — Free"
      description="Direct APK download. No Play Store needed. Android 8.0+."
      keywords={[
        'anti theft apk download',
        'anti theft app apk',
        'android anti theft apk',
        'download anti theft app',
        'anti theft apk free',
        'android security apk',
        'phone tracker apk',
        'anti theft app download android',
        'apk download anti theft',
        'remote control apk',
        'find my phone apk',
        'anti theft apk 2026',
        'anti theft apk mediafire',
        'download anti theft app for android',
        'anti theft apk latest version'
      ]}
      canonicalPath="/download"
      ogImage="https://anti-theft.sultanahmad.site/og-download.png"
      ogImageAlt="Download Anti-Theft APK for Android"
      schemas={downloadSchemas}
    >
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#0A0E1A] text-slate-800 dark:text-[#F1F5F9] flex flex-col font-sans transition-colors duration-300">
        {/* SECTION 1: NAVBAR */}
      <Navbar />

      <main className="flex-1">
        {/* ─────────────────────────────────────────────────────────
            SECTION 2: HERO
           ───────────────────────────────────────────────────────── */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200/80 dark:border-[#252B3D]/70">
          {/* Ambient Light */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-indigo-500/10 dark:from-cyan-400/20 dark:via-blue-500/15 dark:to-transparent rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* SEO Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-surface text-cyan-700 dark:text-[#00E5FF] text-caption font-mono mb-6 shadow-xs border border-cyan-500/20">
              <Download className="w-3.5 h-3.5" />
              <span className="font-semibold tracking-wide">DIRECT ANDROID APK DOWNLOAD (OFFICIAL)</span>
            </div>

            {/* H1 SEO Critical */}
            <h1 className="text-display-lg font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-6">
              Download Anti-Theft APK for Android — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-[#00E5FF] dark:via-cyan-300 dark:to-blue-400">Free &amp; Safe</span>
            </h1>

            {/* Subheading */}
            <p className="text-body-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto font-normal font-sans">
              Get the Anti-Theft app for your Android device. Direct APK download — no Play Store needed. Works on Android 8.0 and above.
            </p>

            {/* Two CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Button
                onClick={handleDownloadClick}
                variant="cyan"
                size="lg"
                leftIcon={<Download className="w-5 h-5" />}
                rightIcon={<ExternalLink className="w-4 h-4 opacity-70" />}
                className="w-full sm:w-auto shadow-xl shadow-cyan-500/25 px-8 py-3.5 font-display font-bold text-body-sm"
              >
                Download APK Now ({config.size || DOWNLOAD_CONFIG.SIZE})
              </Button>

              <a
                href="#installation-guide"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-semibold text-body-sm glass-surface text-slate-800 dark:text-[#E2E8F0] hover:border-cyan-500/50 transition-all shadow-xs"
              >
                <span>View Installation Guide</span>
              </a>
            </div>

            {/* Caption */}
            <p className="text-caption text-slate-500 dark:text-slate-400 font-mono">
              File size: {config.size || DOWNLOAD_CONFIG.SIZE} • Version: {config.version || DOWNLOAD_CONFIG.VERSION} • Updated: {config.releaseDate || DOWNLOAD_CONFIG.RELEASE_DATE}
            </p>

            {/* ⚠️ CRITICAL INSTALLATION & PERMISSION NOTICE (HIGH-VISIBILITY RED WARNING) */}
            <div className="max-w-4xl mx-auto mt-10 p-6 sm:p-7 rounded-3xl bg-red-500/10 border-2 border-red-500/50 shadow-xl shadow-red-500/10 text-left space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/40 shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 font-heading">
                    ⚠️ CRITICAL INSTALLATION &amp; PERMISSION NOTICE (Android 13, 14, 15 &amp; 16)
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                    Because this APK is downloaded directly outside the Google Play Store, Android requires granting specific permissions:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* Notice 1: Unknown Sources */}
                <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Ignore &quot;File Might Be Harmful&quot; &amp; Allow Install</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    Android displays a standard safety warning for all sideloaded APKs. Tap <strong className="text-slate-900 dark:text-white font-bold">&quot;Download Anyway&quot;</strong>. When installing, if prompted: tap <strong className="text-slate-900 dark:text-white font-bold">&quot;Settings → Allow from this source&quot;</strong>.
                  </p>
                </div>

                {/* Notice 2: Restricted Settings */}
                <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Unrestrict Restricted Settings (Android 13+)</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    If Accessibility is grayed out: Open your phone <strong className="text-slate-900 dark:text-white font-bold">Settings → Apps → Anti-Theft → Tap 3 Dots (⋮) top-right corner → Tap &quot;Allow restricted settings&quot;</strong>. Then enable Accessibility!
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div className="pt-3 border-t border-red-500/20">
                <p className="text-[11px] font-mono font-bold text-red-700 dark:text-red-300 uppercase tracking-wider mb-2">
                  Required Permissions Checklist for Full Protection:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-red-500/5 dark:bg-black/30 border border-red-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-red-600 dark:text-red-400 block">✓ Accessibility:</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Blocks Quick Settings &amp; Shutdown</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-500/5 dark:bg-black/30 border border-red-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-red-600 dark:text-red-400 block">✓ Location (Always):</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Continuous live GPS radar</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-500/5 dark:bg-black/30 border border-red-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-red-600 dark:text-red-400 block">✓ DND Access:</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Remote silent &amp; siren override</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-500/5 dark:bg-black/30 border border-red-500/20 text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-red-600 dark:text-red-400 block">✓ Battery Saver:</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Set to &quot;Unrestricted&quot;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 3: APK INFO CARD
           ───────────────────────────────────────────────────────── */}
        <section className="py-12 bg-white dark:bg-[#0A0F1D] border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 rounded-3xl glass-surface elevate-3d">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-white/10 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 dark:bg-[#00E5FF]/15 border border-cyan-500/30 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    APK Package Specification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Cryptographic build metadata &amp; runtime parameters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl neumorphic-well">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">PACKAGE NAME</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block" title={config.packageName || DOWNLOAD_CONFIG.PACKAGE_NAME}>
                    {config.packageName || DOWNLOAD_CONFIG.PACKAGE_NAME}
                  </span>
                </div>

                <div className="p-4 rounded-2xl neumorphic-well">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">APP NAME</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Anti-Theft
                  </span>
                </div>

                <div className="p-4 rounded-2xl neumorphic-well">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">VERSION &amp; SIZE</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    v{config.version || DOWNLOAD_CONFIG.VERSION} ({config.size || DOWNLOAD_CONFIG.SIZE})
                  </span>
                </div>

                <div className="p-4 rounded-2xl neumorphic-well">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">RELEASE DATE</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {config.releaseDate || DOWNLOAD_CONFIG.RELEASE_DATE}
                  </span>
                </div>

                <div className="p-4 rounded-2xl neumorphic-well">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">PLATFORM</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {DOWNLOAD_CONFIG.MIN_ANDROID}
                  </span>
                </div>
              </div>

              {/* SHA-256 Verification & Requirements */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 space-y-3 text-xs">
                {DOWNLOAD_CONFIG.SHA256 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 font-mono">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Lock className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span className="text-slate-500 shrink-0">SHA-256:</span>
                      <span className="text-slate-800 dark:text-slate-300 truncate text-[11px]">
                        {DOWNLOAD_CONFIG.SHA256}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copySha256}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-500 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span><strong>Requires:</strong> Accessibility Service + Precise Location Permission</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 4: INSTALLATION GUIDE (Step-by-Step)
           ───────────────────────────────────────────────────────── */}
        <section id="installation-guide" className="py-20 bg-slate-50 dark:bg-[#080C14] border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] uppercase tracking-wider block mb-2">
                STEP-BY-STEP WALKTHROUGH
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                How to Install Anti-Theft APK on Android
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Follow these simple steps to deploy Anti-Theft securely onto your handset.
              </p>
            </div>

            <div className="space-y-6">
              {installationSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="p-6 rounded-3xl glass-surface elevate-3d flex items-start gap-4 sm:gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-[#00E5FF]/15 border border-cyan-500/30 text-cyan-600 dark:text-[#00E5FF] font-black font-mono flex items-center justify-center shrink-0 shadow-sm">
                      0{step.num}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
                        <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                          Step {step.num}: {step.title}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {step.desc}
                      </p>

                      {step.actionText && (
                        <p className="text-xs text-cyan-700 dark:text-cyan-400 font-mono bg-cyan-500/5 p-2.5 rounded-xl border border-cyan-500/20">
                          👉 {step.actionText}
                        </p>
                      )}

                      {step.path && (
                        <div className="p-3 rounded-xl neumorphic-well font-mono text-xs text-slate-800 dark:text-slate-200">
                          <span className="text-[10px] text-slate-500 block mb-0.5">NAVIGATION PATH:</span>
                          <code>{step.path}</code>
                          {step.note && (
                            <span className="block mt-1 text-[11px] text-slate-400">{step.note}</span>
                          )}
                        </div>
                      )}

                      {step.bullets && (
                        <ul className="space-y-1.5 pt-1 text-xs text-slate-700 dark:text-slate-300">
                          {step.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 5: ⚠️ IMPORTANT NOTE (HIGHLIGHTED BOX)
           ───────────────────────────────────────────────────────── */}
        <section className="py-14 bg-white dark:bg-[#0A0F1D] border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 shadow-xl shadow-amber-500/5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-amber-900 dark:text-amber-300">
                    ⚠️ IMPORTANT — PLEASE READ CAREFULLY
                  </h3>
                  <span className="text-xs text-amber-700 dark:text-amber-400/90 font-mono">
                    Security API Disclosures &amp; OS Prompts
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <p>
                  Anti-Theft uses advanced Android system-level security APIs to protect your device. This means you will see several warnings during installation. These warnings are <strong>NORMAL and expected</strong> for apps that need accessibility and location access.
                </p>

                <div className="space-y-2 font-mono text-xs bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30">
                  <p className="flex items-start gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>When you see <em>&quot;For your security, your phone is not allowed to install unknown apps&quot;</em> — this is Android&apos;s standard warning. Please tap <strong>&quot;Install Anyway&quot;</strong> to continue.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>When Android asks <em>&quot;Are you sure you want to install this app?&quot;</em> — Tap <strong>&quot;Install Anyway&quot;</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>When asked for Accessibility Service permission — this is <strong>REQUIRED</strong> for Quick Settings Blocking and Shutdown Protection. Please tap <strong>&quot;Enable&quot;</strong>.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="shrink-0">⚠️</span>
                    <span>When asked for Location Permission — this is <strong>REQUIRED</strong> for live device tracking. Please tap <strong>&quot;Allow All The Time&quot;</strong>.</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
                  <span>
                    <strong>100% Safe:</strong> No root required. No ads. No data selling. Your data is encrypted and only accessible to you through your authenticated dashboard.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 6: SYSTEM REQUIREMENTS
           ───────────────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-50 dark:bg-[#080C14] border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] uppercase tracking-wider block mb-2">
                HARDWARE &amp; OS COMPATIBILITY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                System Requirements
              </h2>
            </div>

            {/* Requirements Table */}
            <div className="rounded-3xl glass-surface elevate-3d overflow-hidden mb-8">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 font-mono text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-4 font-bold">Requirement</th>
                    <th className="p-4 font-bold">Required Specification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-slate-200">
                  {systemRequirements.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 font-semibold font-mono text-slate-700 dark:text-slate-300">{row.req}</td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Supported Android Versions */}
            <div className="p-6 rounded-3xl glass-surface">
              <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Supported Android Versions
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                {supportedVersions.map((ver, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl neumorphic-well flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{ver}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 font-mono">
                * Note: Hardware-level features like &quot;Shutdown Protection&quot; and &quot;Quick Settings Block&quot; perform with maximum reliability on Android 10+.
              </p>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 7: WHY NOT PLAY STORE?
           ───────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white dark:bg-[#0A0F1D] border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] uppercase tracking-wider block mb-2">
                HONEST TRANSPARENCY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                Why is Anti-Theft Not on the Play Store?
              </h2>
            </div>

            <div className="p-8 rounded-3xl glass-surface elevate-3d space-y-6">
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                The Anti-Theft app uses accessibility service and screenshot capture APIs that Google Play Store policies restrict for third-party commercial applications. To provide full, uncompromised anti-theft countermeasures, we distribute the app directly via verified APK download.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl neumorphic-well space-y-3">
                  <h4 className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] uppercase tracking-wider">
                    Benefits of Direct APK Download:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Full features (zero Play Store restrictions)</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Latest updates available immediately</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>No dependency on Google Play services policies</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Smaller, bloat-free download size</span></li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl neumorphic-well space-y-3">
                  <h4 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Safety &amp; Integrity:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>APK is signed with verifiable developer keys</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Zero advertisements, zero third-party telemetry</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Open-source and security auditing friendly</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Easily verified on VirusTotal scanner</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 8: VERIFY APK SAFETY
           ───────────────────────────────────────────────────────── */}
        <section className="py-20 bg-slate-50 dark:bg-[#080C14] border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] uppercase tracking-wider block mb-2">
                INDEPENDENT AUDITING
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                Verify APK Safety Before Installing
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Before installing any Android package, we recommend verifying it independently.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-3xl glass-surface elevate-3d flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-cyan-500">01</span>
                  <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white mt-2 mb-1">
                    VirusTotal Scan
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Upload the downloaded APK to <a href="https://www.virustotal.com" target="_blank" rel="noreferrer" className="text-cyan-500 underline">virustotal.com</a> to scan across 70+ antivirus engines.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl glass-surface elevate-3d flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-cyan-500">02</span>
                  <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white mt-2 mb-1">
                    Check Signature
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Use any APK Signature Verifier tool to inspect developer signing certs against our published hash.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl glass-surface elevate-3d flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-bold font-mono text-cyan-500">03</span>
                  <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white mt-2 mb-1">
                    Audit Developer
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Review Sultan Ahmad&apos;s portfolio and engineering projects directly at <a href="https://sultanahmad.site" target="_blank" rel="noreferrer" className="text-cyan-500 underline">sultanahmad.site</a>.
                  </p>
                </div>
              </div>
            </div>

            {/* Explicit Permissions requested */}
            <div className="p-6 rounded-3xl glass-surface">
              <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Anti-Theft Only Requests These Essential Permissions:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2">
                {permissionsList.map((perm, idx) => (
                  <div key={idx} className="p-2 rounded-xl neumorphic-well text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 9: TROUBLESHOOTING
           ───────────────────────────────────────────────────────── */}
        <section className="py-20 bg-white dark:bg-[#0A0F1D] border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] uppercase tracking-wider block mb-2">
                RESOLVE COMMON SETUP ISSUES
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                Troubleshooting Installation Issues
              </h2>
            </div>

            <div className="space-y-3.5">
              {troubleshootingItems.map((item, idx) => {
                const isOpen = openTroubleshootIndex === idx;
                return (
                  <div key={idx} className="rounded-2xl glass-surface elevate-3d overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenTroubleshootIndex(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-heading font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-[#00E5FF] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-500">Q{idx + 1}:</span>
                        <span>{item.q}</span>
                      </span>
                      <span className="shrink-0 text-slate-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 font-normal">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 10: FAQ (SEO)
           ───────────────────────────────────────────────────────── */}
        <section id="faq" className="py-20 bg-slate-50 dark:bg-[#080C14] border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] uppercase tracking-wider block mb-2">
                FREQUENTLY ASKED QUESTIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                Frequently Asked Questions — Anti-Theft APK
              </h2>
            </div>

            <div className="space-y-3.5">
              {faqItems.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="rounded-2xl glass-surface elevate-3d overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-heading font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-[#00E5FF] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="shrink-0 text-slate-400">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 font-normal">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────
            SECTION 11: FINAL CTA
           ───────────────────────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-950 text-center relative overflow-hidden text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight mb-4">
              Ready to Protect Your Android?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
              Download Anti-Theft APK now and secure your device against physical lockscreen tampering and unauthorized shutdowns.
            </p>
            <Button
              onClick={handleDownloadClick}
              variant="primary"
              size="lg"
              leftIcon={<Download className="w-5 h-5" />}
              rightIcon={<ExternalLink className="w-4 h-4 opacity-70" />}
              className="shadow-xl shadow-cyan-500/35 px-8 py-3.5 text-base"
            >
              Download APK Now
            </Button>
            <p className="text-xs text-slate-400 mt-4">
              By downloading, you agree to our <Link to="/terms" className="underline hover:text-cyan-300">Terms of Service</Link> and <Link to="/privacy-policy" className="underline hover:text-cyan-300">Privacy Policy</Link>.
            </p>
          </div>
        </section>
      </main>

      {/* SECTION 12: FOOTER */}
      <Footer />
    </div>
    </PublicPageWrapper>
  );
};
