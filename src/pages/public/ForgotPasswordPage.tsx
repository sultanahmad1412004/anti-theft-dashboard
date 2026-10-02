import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { PublicPageWrapper } from '../../components/common/PublicPageWrapper';
import { fadeInUp } from '../../utils/animations';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { resetPassword } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSentSuccess(true);
      toast.success('Password reset email sent!');
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'Failed to dispatch password reset email.';
      if (err?.code === 'auth/user-not-found') {
        msg = 'No mobile account found registered with this email address.';
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicPageWrapper
      title="Reset Password — Anti-Theft Dashboard"
      description="Reset your Anti-Theft account password securely via email recovery."
      keywords={['anti theft forgot password', 'reset password anti theft', 'recover account']}
      canonicalPath="/forgot-password"
      robots="noindex, nofollow"
    >
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#0A0E1A] text-slate-800 dark:text-[#F1F5F9] flex flex-col justify-between transition-colors duration-200 font-sans">
        <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-[#00E5FF]/15 border border-cyan-500/30 dark:border-[#00E5FF]/40 flex items-center justify-center text-cyan-600 dark:text-[#00E5FF] mx-auto mb-4 shadow-sm dark:shadow-[0_0_25px_rgba(0,229,255,0.25)]">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-heading-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-body-sm text-slate-600 dark:text-slate-400 mt-2 font-sans">
              We will send a password reset link to your registered email address.
            </p>
          </div>

          <div className="glass-surface p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#252B3D]">
            {sentSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-heading-md text-slate-900 dark:text-white">
                  Reset Link Dispatched
                </h3>
                <p className="text-body-sm font-sans text-slate-600 dark:text-slate-400 leading-relaxed">
                  Check your inbox at <strong className="text-cyan-600 dark:text-[#00E5FF] font-mono">{email}</strong>. Follow the instructions to choose a new password.
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button variant="primary" className="w-full">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-600 dark:text-red-400 text-body-sm font-sans">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-caption font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 text-body-sm font-sans transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="cyan"
                  size="lg"
                  isLoading={loading}
                  className="w-full shadow-lg shadow-cyan-500/25 mt-2"
                >
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-body-sm font-sans text-slate-500 hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
    </PublicPageWrapper>
  );
};
