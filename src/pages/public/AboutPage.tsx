import React from 'react';
import { Shield, Smartphone, Terminal, ExternalLink, Cpu, Lock, Globe, Server } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';

export const AboutPage: React.FC = () => {
  return (
    <PublicPageWrapper
      title="About Anti-Theft — Sultan Ahmad & Android Security"
      description="Anti-Theft is developed by Sultan Ahmad, a Flutter & Firebase developer. Visit sultanahmad.site for more projects."
      keywords={[
        'about anti theft',
        'sultan ahmad flutter firebase developer',
        'android anti theft architecture',
        'anti theft app engineering',
        'accessibility service security android',
        'phone theft prevention system',
        'remote android security framework',
        'prevent shutdown lockscreen android',
        'block quick settings lockscreen',
        'sultan ahmad developer',
        'project 101 anti theft mission'
      ]}
      canonicalPath="/about"
      schemas={[
        {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Anti-Theft Android Security Platform',
          url: 'https://anti-theft.sultanahmad.site/about',
          description: 'Anti-Theft is developed by Sultan Ahmad, a Flutter & Firebase developer. Visit sultanahmad.site for more projects.',
          mainEntity: {
            '@type': 'SoftwareApplication',
            name: 'Anti-Theft',
            operatingSystem: 'Android 8.0+',
            applicationCategory: 'SecurityApplication'
          },
          author: {
            '@type': 'Person',
            name: 'Sultan Ahmad',
            url: 'https://sultanahmad.site'
          }
        }
      ]}
    >
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] text-slate-800 dark:text-[#E2E8F0] flex flex-col justify-between transition-colors duration-200">
        <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-3">Mission & Architecture</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-white">
            About Anti-Theft
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#94A3B8] mt-3 leading-relaxed">
            Anti-Theft is developed by Sultan Ahmad, a Flutter & Firebase developer. Visit{' '}
            <a 
              href="https://sultanahmad.site" 
              target="_blank" 
              rel="noreferrer"
              className="text-cyan-600 dark:text-[#00E5FF] font-semibold hover:underline"
            >
              sultanahmad.site
            </a>{' '}
            for more projects.
          </p>
        </div>

        {/* Story & Philosophy */}
        <div className="space-y-8 mb-16">
          <Card variant="default" className="p-8">
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-[#E2E8F0] mb-4 flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-cyan-600 dark:text-[#00E5FF]" />
              The Anti-Theft Problem
            </h2>
            <div className="space-y-4 text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              <p>
                When a smartphone is stolen, perpetrators exploit a predictable 60-second window: they immediately pull down the Android notification shade, toggle Airplane Mode to sever network connectivity, and force-shutdown the handset.
              </p>
              <p>
                Once offline, traditional tracking tools like Find My Device become completely ineffective. <strong className="text-slate-900 dark:text-[#E2E8F0]">Anti-Theft</strong> stops this sequence at the root:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300">
                <li>Locks access to Quick Settings on lock screens so Airplane Mode cannot be activated.</li>
                <li>Intercepts standard power-off dialogs and forces the display back to lock screen.</li>
                <li>Executes stealth remote captures to photograph the unauthorized handler and screen state.</li>
                <li>Transmits live GPS updates via low-overhead OpenStreetMap WebSockets.</li>
              </ul>
            </div>
          </Card>

          {/* Architecture overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default" className="p-6">
              <Cpu className="w-6 h-6 text-cyan-600 dark:text-[#00E5FF] mb-3" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] mb-2 font-heading">
                Foreground Service
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Persistent Android native service running in foreground mode with notification pinning, ensuring the OS never kills the security loop.
              </p>
            </Card>

            <Card variant="default" className="p-6">
              <Server className="w-6 h-6 text-emerald-600 dark:text-[#10B981] mb-3" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] mb-2 font-heading">
                Real-Time Cloud Sync
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Commands dispatched on this web interface transpond instantly to handsets via Google Firebase encrypted listeners.
              </p>
            </Card>

            <Card variant="default" className="p-6">
              <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] mb-2 font-heading">
                Zero Root Required
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                Uses official Android Accessibility and Device Administrator APIs. No bootloader unlocking or root exploit vulnerabilities.
              </p>
            </Card>
          </div>
        </div>

        {/* Engineering Attribution */}
        <Card variant="default" className="p-8 text-center max-w-xl mx-auto">
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-[#E2E8F0] mb-2">
            Engineering & Leadership
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-4">
            Designed and engineered by Sultan Ahmad with the goal of providing military-grade remote phone protection for everyday users at an honest price point of $1/year.
          </p>
          <a
            href="https://sultanahmad.site"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-[#00E5FF] hover:underline font-semibold font-mono"
          >
            <span>Visit Developer Website (sultanahmad.site)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Card>
      </div>

      <Footer />
    </div>
    </PublicPageWrapper>
  );
};
