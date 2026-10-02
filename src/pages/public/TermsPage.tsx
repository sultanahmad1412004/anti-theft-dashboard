import React from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';

export const TermsPage: React.FC = () => {
  return (
    <PublicPageWrapper
      title="Terms of Service & Acceptable Use — Anti-Theft Android"
      description="Review the official terms of service, personal asset protection guidelines, and anti-stalkerware policies for the Anti-Theft Android platform."
      keywords={[
        'terms of service',
        'anti theft terms',
        'android security acceptable use',
        'anti theft user agreement',
        'anti stalkerware policy',
        'personal asset protection legal terms',
        'android tracking software license'
      ]}
      canonicalPath="/terms"
      schemas={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Anti-Theft Android Terms of Service & Acceptable Use Agreement',
          url: 'https://anti-theft.sultanahmad.site/terms',
          description: 'Binding terms of service, acceptable use policies, and anti-stalkerware restrictions governing the Anti-Theft Android security suite.',
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
          <Badge variant="cyan" className="mb-2">Legal Terms</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono mt-2">
            Anti-Theft Android Protection Platform
          </p>
        </div>

        <Card variant="default" className="p-8 space-y-6 text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
          <section>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2">
              1. Authorized Use Only
            </h3>
            <p>
              Anti-Theft is engineered strictly for personal asset protection, family safety, and legitimate anti-theft tracking. You warrant that you are the lawful owner or authorized custodian of all registered hardware linked to your account.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2">
              2. Prohibition of Unauthorized Stalkerware
            </h3>
            <p>
              Deploying Anti-Theft covertly onto any third-party handset without explicit, informed consent is strictly prohibited and constitutes a violation of international privacy statutes.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2">
              3. Service Availability
            </h3>
            <p>
              Remote commands (such as screenshot captures, quick settings lock, and GPS polling) depend upon continuous internet access and Android device state. Anti-Theft is provided on an &quot;as-is&quot; basis.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#E2E8F0] font-heading mb-2">
              4. Subscription Policy
            </h3>
            <p>
              The Pro Plan is billed at $1/year. Subscriptions can be reviewed, managed, or extended through your web companion dashboard at any time.
            </p>
          </section>
        </Card>
      </div>

      <Footer />
    </div>
    </PublicPageWrapper>
  );
};
