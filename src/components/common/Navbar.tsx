import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, Sun, Moon, LogIn, LayoutDashboard, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

interface NavbarProps {
  forceDark?: boolean;
  hideThemeToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  forceDark = false,
  hideThemeToggle = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isDownloadPage = location.pathname === '/download';

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-colors duration-200 ${
        forceDark
          ? 'bg-[rgba(15,23,42,0.85)] border-b border-[#334155] text-[#E2E8F0]'
          : 'bg-white/80 dark:bg-[#0A0E1A]/85 border-b border-slate-200/80 dark:border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-[#00E5FF]/15 border border-cyan-500/30 dark:border-[#00E5FF]/40 flex items-center justify-center text-cyan-600 dark:text-[#00E5FF] shadow-xs group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`font-display font-bold tracking-tight text-base ${
                forceDark ? 'text-[#E2E8F0]' : 'text-slate-900 dark:text-white'
              }`}
            >
              Anti<span className="text-cyan-600 dark:text-[#00E5FF]">-Theft</span>
            </span>
            <p
              className={`text-[10px] font-mono tracking-tight hidden md:block ${
                forceDark ? 'text-[#94A3B8]' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Android Control Center
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links - Clean Minimal Typography */}
        <nav
          className={`hidden md:flex items-center gap-7 font-sans font-medium text-body-sm ${
            forceDark
              ? 'text-[#E2E8F0]'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <Link
            to="/"
            className={`transition-colors ${
              forceDark
                ? 'hover:text-[#00E5FF]'
                : 'hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            Home
          </Link>
          <a
            href="/#features"
            className={`transition-colors ${
              forceDark
                ? 'hover:text-[#00E5FF]'
                : 'hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            className={`transition-colors ${
              forceDark
                ? 'hover:text-[#00E5FF]'
                : 'hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            How It Works
          </a>
          <a
            href="/#pricing"
            className={`transition-colors ${
              forceDark
                ? 'hover:text-[#00E5FF]'
                : 'hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            Pricing
          </a>

          {/* Download Nav link with visually distinct cyan badge */}
          <Link
            to="/download"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-mono font-bold transition-all shadow-xs ${
              isDownloadPage
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/50'
                : forceDark
                ? 'bg-cyan-500/10 text-[#00E5FF] border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/60'
                : 'bg-cyan-500/10 text-cyan-700 dark:text-[#00E5FF] border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </Link>

          <Link
            to="/contact"
            className={`transition-colors ${
              forceDark
                ? 'hover:text-[#00E5FF]'
                : 'hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          {!hideThemeToggle && (
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                forceDark
                  ? 'text-[#E2E8F0] hover:text-white bg-slate-800/80 border-[#334155]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60'
              }`}
              aria-label="Toggle Theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          )}

          {/* Auth Button */}
          {currentUser ? (
            <Button
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              variant="cyan"
              size="sm"
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              {isAdmin ? 'Admin Console' : 'Dashboard'}
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              variant="primary"
              size="sm"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl md:hidden cursor-pointer ${
              forceDark
                ? 'text-[#E2E8F0] hover:text-[#00E5FF] hover:bg-slate-800/80'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b backdrop-blur-xl px-4 py-4 space-y-3 ${
            forceDark
              ? 'border-[#334155] bg-[rgba(15,23,42,0.95)] text-[#E2E8F0]'
              : 'border-slate-200 dark:border-white/5 bg-white/95 dark:bg-[#0B0F17]/95'
          }`}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-semibold ${
              forceDark
                ? 'text-[#E2E8F0] hover:text-[#00E5FF]'
                : 'text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-semibold ${
              forceDark
                ? 'text-[#E2E8F0] hover:text-[#00E5FF]'
                : 'text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            Features
          </a>
          <a
            href="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-semibold ${
              forceDark
                ? 'text-[#E2E8F0] hover:text-[#00E5FF]'
                : 'text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            Pricing
          </a>

          {/* Mobile Download Highlight */}
          <Link
            to="/download"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between py-2.5 px-3 rounded-xl border text-sm font-bold ${
              forceDark
                ? 'bg-cyan-500/10 border-cyan-500/30 text-[#00E5FF]'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-[#00E5FF]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </span>
            <span className="text-[10px] font-mono uppercase bg-cyan-500 text-slate-950 px-2 py-0.5 rounded">
              v1.0.0
            </span>
          </Link>

          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-semibold ${
              forceDark
                ? 'text-[#E2E8F0] hover:text-[#00E5FF]'
                : 'text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-[#00E5FF]'
            }`}
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
};
