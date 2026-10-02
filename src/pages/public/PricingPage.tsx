import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, HelpCircle, Shield } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      period: 'per year',
      desc: 'Essential lockscreen protection for a single Android handset.',
      highlight: false,
      features: [
        { name: 'View Own Devices', included: true },
        { name: 'Quick Settings Block', included: true },
        { name: 'Shutdown Protection', included: true },
        { name: 'Remote Ring Mode', included: false },
        { name: 'Remote Screenshot Capture', included: false },
        { name: 'Live Location Tracking', included: false },
        { name: 'Track Another Device', included: false },
        { name: 'Priority Support', included: false },
      ],
      ctaText: 'Sign In with Free Account',
      ctaLink: '/login'
    },
    {
      name: 'Pro Plan',
      price: '$1',
      period: 'per year',
      desc: 'Full surveillance and remote defense countermeasures suite.',
      highlight: true,
      features: [
        { name: 'Everything in Free', included: true },
        { name: 'Remote Ring Mode', included: true },
        { name: 'Remote Screenshot Capture', included: true },
        { name: 'Live Location Tracking', included: true },
        { name: 'Track Another Device', included: true },
        { name: 'Unlimited Device Fleet', included: true },
        { name: 'Priority Support', included: true },
      ],
      ctaText: 'Sign In to Upgrade',
      ctaLink: '/login'
    }
  ];

  const faqs = [
    {
      q: 'Why is Pro only $1 per year?',
      a: 'Anti-Theft was built by Sultan Ahmad with the philosophy that critical digital security should be universally accessible to any smartphone user without expensive subscriptions.'
    },
    {
      q: 'How do I pay or activate my subscription?',
      a: 'Once you log in to your account with your Anti-Theft mobile credentials, navigate to the Subscription tab in your dashboard to view your current period or activate/extend.'
    },
    {
      q: 'Can I manage multiple devices under one account?',
      a: 'Yes, the Pro plan supports multiple Android devices under one account, allowing you to manage your registered phones from a single dashboard.'
    }
  ];

  return (
    <PublicPageWrapper
      title="Pricing — Anti-Theft App | Only $1/Year"
      description="Simple pricing. Free tier available. Pro plan $1/year."
      keywords={[
        'anti theft pricing',
        'anti theft pro plan',
        'cheap android security app',
        'affordable phone tracker apk',
        '1 dollar anti theft app',
        'anti theft annual license',
        'remote screenshot capture cost',
        'free anti theft app android',
        'multi device security subscription',
        'anti theft upgrade pro'
      ]}
      canonicalPath="/pricing"
      schemas={[
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Anti-Theft Pro Security Plan',
          description: 'Annual anti-theft mobile security license including remote screenshot capture, high-precision live GPS tracking, and lockscreen shutdown protection.',
          brand: {
            '@type': 'Brand',
            name: 'Anti-Theft'
          },
          category: 'Security Software',
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '1280',
            bestRating: '5',
            worstRating: '1'
          },
          offers: {
            '@type': 'Offer',
            price: '1.00',
            priceCurrency: 'USD',
            priceValidUntil: '2027-12-31',
            availability: 'https://schema.org/InStock',
            url: 'https://anti-theft.sultanahmad.site/pricing'
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a
            }
          }))
        }
      ]}
    >
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] text-slate-800 dark:text-[#E2E8F0] flex flex-col justify-between transition-colors duration-200">
        <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
            Simple, Honest Pricing
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#94A3B8] mt-3">
            Choose the plan that fits your security requirements. Full remote shield for just $1 per year.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {plans.map((p, idx) => (
            <Card
              key={idx}
              variant={p.highlight ? 'glow' : 'default'}
              className={`p-8 flex flex-col justify-between relative ${
                p.highlight ? 'border-2 border-cyan-500 dark:border-[#00E5FF]' : ''
              }`}
            >
              {p.highlight && (
                <div className="absolute top-0 right-0 bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0F172A] font-bold text-xs px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#E2E8F0] font-heading mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-6">
                  {p.desc}
                </p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className={`text-5xl font-extrabold font-heading ${p.highlight ? 'text-cyan-600 dark:text-[#00E5FF]' : 'text-slate-900 dark:text-[#E2E8F0]'}`}>
                    {p.price}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-[#94A3B8] font-mono">/ {p.period}</span>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-[#334155]/60 mb-8 space-y-3">
                  {p.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-xs">
                      {f.included ? (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-[#10B981] shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={f.included ? 'text-slate-800 dark:text-[#E2E8F0]' : 'text-slate-400 line-through'}>
                        {f.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to={p.ctaLink}>
                <Button
                  variant={p.highlight ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  {p.ctaText}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-[#E2E8F0] text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx} variant="default" className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#E2E8F0] mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF] shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </PublicPageWrapper>
  );
};
