import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Shield, Lock } from 'lucide-react';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <PublicPageWrapper
      title="Privacy & Data Protection Policy — Anti-Theft Android"
      description="Read how Anti-Theft secures Android GPS coordinates and screenshot telemetry with strict end-to-end encryption, Firestore rules, and zero third-party monetization."
      keywords={[
        'anti theft privacy policy',
        'android location privacy',
        'encrypted device telemetry',
        'anti theft data safety',
        'mobile security privacy policy',
        'zero data selling policy',
        'firestore security rules privacy',
        'gps telemetry protection'
      ]}
      canonicalPath="/privacy-policy"
      schemas={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Anti-Theft Android Privacy Policy & Telemetry Protection',
          url: 'https://anti-theft.sultanahmad.site/privacy-policy',
          description: 'Comprehensive privacy policy detailing data encryption, Firestore access constraints, and anti-stalkerware commitments.',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Anti-Theft',
            url: 'https://anti-theft.sultanahmad.site'
          }
        }
      ]}
    >
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] text-slate-800 dark:text-[#E2E8F0] flex flex-col justify-between transition-colors duration-200">
        <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center mb-12">
          <Badge variant="cyan" className="mb-2">Data Protection</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
            Privacy & Surveillance Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono mt-2">
            Last Updated: September 2026 • Anti-Theft Android Protection
          </p>
        </div>

        <Card variant="default" className="p-8 space-y-6 text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
          <section>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
              1. Information We Collect
            </h3>
            <p>
              To provide effective remote anti-theft defense, Anti-Theft processes the following categories of data strictly bound to your authenticated user account:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 dark:text-slate-300">
              <li><strong>Device Telemetry:</strong> Manufacturer, model name, Android OS version, battery percentage, and network connectivity state.</li>
              <li><strong>Precise Location Coordinates:</strong> Latitude, longitude, altitude, velocity vector, and GPS confidence radius.</li>
              <li><strong>Remote Screenshot Captures:</strong> Images captured upon manual trigger via your authenticated web control center session, stored securely via encrypted Cloudinary CDN pipelines.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
              2. How Your Data Is Protected
            </h3>
            <p>
              All communication between your web dashboard and your Android device uses Google Firebase TLS 1.3 encrypted WebSockets. Your credentials and stored documents are subject to strict Firestore Security Rules, ensuring no unauthorized users can read or transmit commands to your devices.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2">
              3. Data Retention & Deletion
            </h3>
            <p>
              You maintain total sovereignty over your telemetry. When you remove a device or delete your user account, all subcollection devices, locations, and screenshot references are permanently expunged from the database.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2">
              4. Inquiries & Data Requests
            </h3>
            <p>
              For security compliance inquiries or full telemetry wipe requests, reach out directly to our privacy officer at <a href="mailto:support@sultanahmad.site" className="text-cyan-600 dark:text-[#00E5FF] hover:underline">support@sultanahmad.site</a>.
            </p>
          </section>
        </Card>
      </div>

      <Footer />
    </div>
    </PublicPageWrapper>
  );
};
