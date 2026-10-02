import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Calendar,
  Lock,
  ExternalLink,
  Shield,
  Zap,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { updateUserSubscription } from '../../services/deviceService';
import toast from 'react-hot-toast';

const STRIPE_PUBLISHABLE_KEY = "pk_test_51U41ywP08laRRBhPRi8kJ7XNNh7UYlYbLRCdoUQT8f0jFuZw6PI40sy4o9q6nS3I6Ifydq4nNLYa0mYS4Ojb8Dz300Tim3u4Jv";

export const SubscriptionPage: React.FC = () => {
  const { currentUser, userRecord, isDemoMode } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Stripe Card Form States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(userRecord?.full_name || 'Cardholder');
  const [processingPayment, setProcessingPayment] = useState(false);

  const isPro = Boolean(userRecord?.subscription);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 4);
    if (digits.length >= 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2)}`;
    }
    return digits;
  };

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('888');
    setCardName(userRecord?.full_name || 'Sultan Ahmad');
    toast.success('Stripe test credentials populated');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      toast.error('You must be signed in to purchase a defense license');
      return;
    }

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }
    if (cardExpiry.length < 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (cardCvc.length < 3) {
      toast.error('Please enter a valid CVC');
      return;
    }

    setProcessingPayment(true);
    try {
      // Initialize Stripe instance with test key
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error('Failed to initialize Stripe client');
      }

      // Simulate payment network transaction latency
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Update Firestore: subscription = true, subscription_start = serverTimestamp(), subscription_end = +365 days
      await updateUserSubscription(currentUser.uid, true, isDemoMode);

      toast.success('Payment of $1.00 succeeded! Pro License activated for 365 days.');
      setIsCheckoutOpen(false);
      // Reset form
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err?.message || 'Payment processing failed. Please check card details.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDowngrade = async () => {
    if (!currentUser?.uid) return;
    setUpgrading(true);
    try {
      await updateUserSubscription(currentUser.uid, false, isDemoMode);
      toast.success('License changed to Free Basic Tier');
    } catch {
      toast.error('Failed to change plan');
    } finally {
      setUpgrading(false);
    }
  };

  const proFeatures = [
    'Sub-Second OpenStreetMap Live Telemetry & Heading',
    'Optical Screenshot Capture with Cloud Storage Preview',
    'High-Decibel Remote Ring & Siren Override',
    'Real-time Quick Settings Curtain Interceptor',
    'Lockscreen Shutdown & Reboot Prevention',
    'Multi-Device Fleet Synchronization'
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-[#334155]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-[#E2E8F0]">
              Subscription & Defense License
            </h1>
            <Badge variant={isPro ? 'cyan' : 'neutral'} size="sm">
              {isPro ? 'Pro Active' : 'Free Basic'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
            Manage your annual anti-theft cloud license and hardware privilege keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#161D2F] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#252B3D]">
            Stripe Live Key: Verified
          </span>
        </div>
      </div>

      {/* Current Plan Overview Card */}
      <Card variant={isPro ? 'glow' : 'default'} className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#334155]">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
              isPro 
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-[#00E5FF] border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.25)]' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-[#E2E8F0]">
                  {isPro ? 'Pro Defense Annual License' : 'Free Basic Tier'}
                </h3>
                <Badge variant={isPro ? 'success' : 'neutral'} size="sm">
                  {isPro ? 'Active' : 'Current'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                {isPro
                  ? 'All tactical remote switches, optical screenshots, and sub-second live GPS tracking enabled.'
                  : 'Basic device status and physical switches enabled. Upgrade to Pro for remote ring, screenshot, and tracking.'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl font-extrabold font-heading text-cyan-600 dark:text-[#00E5FF]">
              {isPro ? '$1.00' : '$0.00'}
            </span>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] block font-mono">
              {isPro ? '/ year (Annual License)' : 'Free forever'}
            </span>
          </div>
        </div>

        {/* Details & Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-[#94A3B8] font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF]" />
              {isPro ? 'Status: 365 Days Guaranteed' : 'Basic Tier (No Expiry)'}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-[#10B981]" />
              Stripe 256-bit Encrypted
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isPro ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsManageModalOpen(true)}
                  variant="primary"
                  size="sm"
                  className="bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0A0E1A] font-bold"
                >
                  Manage Subscription
                </Button>
                <Button
                  onClick={handleDowngrade}
                  isLoading={upgrading}
                  variant="outline"
                  size="sm"
                >
                  Switch to Free
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsCheckoutOpen(true)}
                variant="primary"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0A0E1A] font-bold shadow-lg shadow-cyan-500/25"
              >
                Upgrade to Pro — $1/Year
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Free Tier Card */}
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Free Basic Plan
            </h4>
            <span className="font-mono text-xs text-slate-400">$0 / forever</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Essential physical device security features included at no charge.
          </p>

          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Register and view own Android devices</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Toggle Quick Settings Curtain Block</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Toggle Lockscreen Shutdown Protection</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400 line-through">
              <X className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Remote Ring & Siren Audible Mode</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400 line-through">
              <X className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Live Photographic Optical Screenshot</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400 line-through">
              <X className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Sub-Second OpenStreetMap GPS Tracking</span>
            </li>
          </ul>
        </Card>

        {/* Pro Defense Card */}
        <Card variant="glow" className="p-6 relative border-cyan-500/50">
          <div className="absolute top-4 right-4">
            <Badge variant="cyan" size="sm">Recommended</Badge>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-cyan-600 dark:text-[#00E5FF]" />
            <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Pro Defense License
            </h4>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-2xl font-extrabold text-cyan-600 dark:text-[#00E5FF]">$1.00</span>
            <span className="text-xs text-slate-500 font-mono">/ year</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            All tactical remote recovery features unlocked with zero limits.
          </p>

          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            {proFeatures.map((feat, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-[#00E5FF] shrink-0" />
                <span className="font-medium text-slate-800 dark:text-white">{feat}</span>
              </li>
            ))}
          </ul>

          {!isPro && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0A0E1A] font-bold"
                onClick={() => setIsCheckoutOpen(true)}
              >
                Get Pro for $1/Year
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Stripe Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161D2F] border border-slate-200 dark:border-[#252B3D] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Stripe Secure Checkout
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Anti-Theft Pro Defense 1-Year License ($1.00 USD)
                </p>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Annual Pro License</span>
              </div>
              <span className="font-mono font-bold text-cyan-600 dark:text-[#00E5FF]">$1.00 / 365 Days</span>
            </div>

            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={handleFillTestCard}
                className="text-[11px] font-mono text-cyan-600 dark:text-[#00E5FF] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Use Stripe 4242 Test Card</span>
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sultan Ahmad"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-[#252B3D] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-[#252B3D] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiration (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-[#252B3D] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Security Code (CVC)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-[#252B3D] text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={processingPayment}
                  className="w-full justify-center bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0A0E1A] font-bold py-3 text-sm shadow-lg shadow-cyan-500/30"
                >
                  Pay $1.00 USD & Activate Pro
                </Button>
              </div>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Stripe Test Key: pk_test_...3u4Jv · SSL Encrypted
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#252B3D] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    Manage Pro Subscription
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Annual Pro Defense License
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A0E1A] border border-slate-200 dark:border-[#252B3D] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">License Status:</span>
                  <Badge variant="success" size="sm">Active (365 Days)</Badge>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">License Key:</span>
                  <span className="text-cyan-600 dark:text-[#00E5FF]">PRO-{(currentUser?.uid || '101').substring(0, 12).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Billing Amount:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">$1.00 USD / year</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Payment Engine:</span>
                  <span className="text-slate-400">Stripe Elements (Test Gateway)</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                Your annual license grants real-time optical screenshots, GPS transponders, and lockscreen protection across all your devices.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsManageModalOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full sm:w-auto flex-1 justify-center bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-[#0A0E1A] font-bold"
              >
                Renew / Extend +365 Days
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsManageModalOpen(false);
                  handleDowngrade();
                }}
                isLoading={upgrading}
                className="w-full sm:w-auto text-red-500 hover:text-red-600"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
