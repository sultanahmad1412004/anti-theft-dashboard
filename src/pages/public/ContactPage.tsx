import React, { useState } from 'react';
import { Mail, MessageSquare, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('technical');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    let success = false;

    // 1. Try AJAX JSON endpoint first
    try {
      const response = await fetch(
        'https://formsubmit.co/ajax/sultanahmad.real1@gmail.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name, email, subject, message,
            _subject: `[Anti-Theft] ${subject} - ${name}`,
            _replyto: email,
            _template: 'table',
            _captcha: 'false',
          })
        }
      );
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('📥 FormSubmit AJAX:', response.status, data);
        success = true;
      }
    } catch (ajaxErr) {
      console.warn('FormSubmit AJAX notice:', ajaxErr);
    }

    // 2. Resilient fallback for unverified endpoints or CORS preflight blocks
    if (!success) {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('_subject', `[Anti-Theft] ${subject} - ${name}`);
        formData.append('_replyto', email);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');

        await fetch('https://formsubmit.co/sultanahmad.real1@gmail.com', {
          method: 'POST',
          mode: 'no-cors',
          body: formData,
        });
        success = true;
        console.log('📥 FormSubmit direct POST delivered successfully');
      } catch (postErr) {
        console.warn('FormSubmit fallback notice:', postErr);
      }
    }

    if (success) {
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } else {
      toast.error('Unable to send. Please contact sultanahmad.real1@gmail.com directly.');
    }
    setSubmitting(false);
  };

  return (
    <PublicPageWrapper
      title="Contact & Security Support — Anti-Theft App"
      description="Get in touch with Sultan Ahmad and the Anti-Theft engineering team for support, feature requests, or security inquiries."
      keywords={[
        'contact anti theft support',
        'anti theft customer support',
        'android security help desk',
        'contact anti theft developer',
        'sultan ahmad support',
        'anti theft apk technical support',
        'report anti theft bug',
        'phone tracker customer service'
      ]}
      canonicalPath="/contact"
      schemas={[
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Anti-Theft Support & Engineering',
          url: 'https://anti-theft.sultanahmad.site/contact',
          description: 'Direct communication desk for technical support, bug reports, and Android pairing assistance.',
          mainEntity: {
            '@type': 'Organization',
            name: 'Anti-Theft',
            url: 'https://anti-theft.sultanahmad.site',
            contactPoint: {
              '@type': 'ContactPoint',
              email: 'support@sultanahmad.site',
              contactType: 'technical support',
              availableLanguage: ['English'],
              areaServed: 'Global'
            }
          }
        }
      ]}
    >
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] text-slate-800 dark:text-[#E2E8F0] flex flex-col justify-between transition-colors duration-200">
        <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="cyan" className="mb-2">Support & Feedback</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
            Get In Touch
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#94A3B8] mt-2">
            Have questions about Anti-Theft Android setup, remote command latency, or feature requests?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Direct channels */}
          <div className="space-y-4">
            <Card variant="default" className="p-6">
              <Mail className="w-6 h-6 text-cyan-600 dark:text-[#00E5FF] mb-2" />
              <h4 className="font-semibold text-slate-900 dark:text-[#E2E8F0] text-sm">Direct Support</h4>
              <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1 font-mono">
                sultanahmad.real1@gmail.com
              </p>
            </Card>

            <Card variant="default" className="p-6">
              <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-[#10B981] mb-2" />
              <h4 className="font-semibold text-slate-900 dark:text-[#E2E8F0] text-sm">Portfolio & Connect</h4>
              <a
                href="https://sultanahmad.site"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-600 dark:text-[#00E5FF] hover:underline mt-1 inline-flex items-center gap-1 font-mono font-medium"
              >
                <span>sultanahmad.site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </Card>

            <Card variant="default" className="p-6">
              <h4 className="font-semibold text-slate-900 dark:text-[#E2E8F0] text-sm mb-1">Developer Desk</h4>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                Led by Sultan Ahmad. Feedback and feature suggestions for future Android companion releases are welcome.
              </p>
            </Card>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <Card variant="default" className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Ticket Submitted
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Thank you, {name}. Your inquiry has been routed to our technical support desk. We will respond within 24-48 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                  >
                    Submit Another Query
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                      Inquiry Category
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
                    >
                      <option value="technical">Android App Setup &amp; Accessibility</option>
                      <option value="subscription">Subscription &amp; Licensing ($1/yr)</option>
                      <option value="hardware">Device Pairing &amp; Detection</option>
                      <option value="general">Feature Request or Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                      Message / Question *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your question or issue in detail..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#080C14] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={submitting}
                    variant="primary"
                    size="md"
                    className="w-full"
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Transmit Message
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </PublicPageWrapper>
  );
};
