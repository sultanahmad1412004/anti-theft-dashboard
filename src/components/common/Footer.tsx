import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, Lock, Mail, Linkedin, Globe, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-[#0A0E1A] border-t border-slate-200 dark:border-[#252B3D] text-slate-600 dark:text-[#94A3B8] transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo + tagline + status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-[#00E5FF]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-display font-bold tracking-tight text-slate-900 dark:text-[#E2E8F0] text-base">
                Anti-Theft
              </span>
            </div>
            <p className="text-body-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Official web dashboard and remote control companion for the Anti-Theft Android security application.
            </p>
            <div className="flex items-center gap-2 text-caption text-cyan-700 dark:text-[#00E5FF] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>Real-Time Cloud Sync Active</span>
            </div>
          </div>

          {/* Column 2: Product (Features, Pricing, How It Works, APK) */}
          <div>
            <h4 className="text-caption font-semibold text-slate-900 dark:text-[#E2E8F0] uppercase tracking-wider mb-4 font-mono">
              Product
            </h4>
            <ul className="space-y-2.5 text-body-sm">
              <li>
                <a href="/#features" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors">
                  Pricing ($1/Year)
                </a>
              </li>
              <li>
                <Link to="/download" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors font-semibold flex items-center gap-1 text-cyan-600 dark:text-[#00E5FF]">
                  <span>Download APK</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-cyan-500/10">Direct APK</span>
                </Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Security */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0] uppercase tracking-wider mb-4 font-mono">
              Legal &amp; Privacy
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/privacy-policy" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors">
                  About Anti-Theft
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors font-mono">
                  Sign In Gateway
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Verified Developer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-[#E2E8F0] uppercase tracking-wider mb-4 font-mono">
              Support &amp; Developer
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00E5FF] shrink-0" />
                <a 
                  href="mailto:sultanahmad.real1@gmail.com" 
                  className="hover:underline font-mono text-[11px] text-slate-700 dark:text-slate-200"
                >
                  sultanahmad.real1@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/sultan-ahmad-33397b28a/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all font-mono text-[11px]"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>Sultan Ahmad on LinkedIn</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
              <li className="pt-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Official Developer Site:</span>
                <a
                  href="https://sultanahmad.site"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-600 dark:text-[#00E5FF] font-semibold hover:underline inline-flex items-center gap-1 mt-0.5 text-xs font-mono"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>sultanahmad.site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-[#334155]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#64748B]">
          <p>
            Built by{' '}
            <a 
              href="https://sultanahmad.site" 
              target="_blank" 
              rel="noreferrer" 
              className="text-cyan-600 dark:text-[#00E5FF] hover:underline font-semibold"
            >
              Sultan Ahmad (sultanahmad.site)
            </a>{' '}
            | © 2026 Anti-Theft. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00E5FF]" />
              End-to-End Encrypted Cloud Telemetry
            </span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
            <a
              href="https://anti-theft.sultanahmad.site"
              className="text-slate-600 dark:text-[#94A3B8] hover:text-cyan-600 dark:hover:text-[#00E5FF] transition-colors font-mono"
            >
              anti-theft.sultanahmad.site
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
