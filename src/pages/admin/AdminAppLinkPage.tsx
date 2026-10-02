import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  Save, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  FileCode, 
  Layers, 
  Check, 
  Copy,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { 
  getDownloadAppConfig, 
  updateDownloadAppConfig, 
  DEFAULT_DOWNLOAD_CONFIG 
} from '../../services/appConfigService';
import { DownloadAppConfig } from '../../types';
import toast from 'react-hot-toast';

export const AdminAppLinkPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<DownloadAppConfig>(DEFAULT_DOWNLOAD_CONFIG);
  const [changelogText, setChangelogText] = useState(
    (DEFAULT_DOWNLOAD_CONFIG.changelog || []).join('\n')
  );

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const config = await getDownloadAppConfig();
        setFormData(config);
        setChangelogText((config.changelog || []).join('\n'));
      } catch (err) {
        console.error('Failed to load download config:', err);
        toast.error('Failed to fetch existing config');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleChange = (field: keyof DownloadAppConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mediafireUrl) {
      toast.error('MediaFire / APK URL is required');
      return;
    }

    setSaving(true);
    try {
      const changelogArray = changelogText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      await updateDownloadAppConfig(
        {
          ...formData,
          changelog: changelogArray
        },
        currentUser?.email || 'admin'
      );

      toast.success('Live APK configuration updated successfully!');
    } catch (err: any) {
      console.error('Failed to save download config:', err);
      toast.error(err?.message || 'Failed to update download config');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Reset form fields to factory default values?')) {
      setFormData(DEFAULT_DOWNLOAD_CONFIG);
      setChangelogText((DEFAULT_DOWNLOAD_CONFIG.changelog || []).join('\n'));
      toast.success('Reset to defaults (click Save to publish)');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(formData.mediafireUrl);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] flex items-center justify-center border border-cyan-500/30 shadow-xs">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              APK &amp; App Link Manager
            </h1>
            <Badge variant="cyan" size="sm">
              Live Cloud Config
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1 font-mono">
            Dynamically update the public MediaFire APK download link, version numbers, and file size without editing code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            disabled={saving}
          >
            Reset Defaults
          </Button>
          <a
            href="/download"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl text-xs font-semibold text-cyan-600 dark:text-[#00E5FF] hover:bg-cyan-500/10 border border-cyan-500/30 transition-colors inline-flex items-center gap-1.5"
          >
            <span>View Live Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7">
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-white/5">
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                  Package &amp; Download Parameters
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Changes take effect across the entire website instantly.
                </p>
              </div>
              <Badge variant="success" size="sm">
                Instant Publish
              </Badge>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* MediaFire / Direct APK Download Link */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  MediaFire or Direct APK Download Link *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formData.mediafireUrl}
                    onChange={(e) => handleChange('mediafireUrl', e.target.value)}
                    placeholder="https://www.mediafire.com/file/.../app-arm64-v8a-release.apk/file"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-500 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={formData.mediafireUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-[#00E5FF] hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors inline-flex items-center"
                    title="Test Link in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  Paste the updated MediaFire link here whenever you compile a new APK build.
                </p>
              </div>

              {/* Version & Size in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Release Version
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    placeholder="e.g. 1.0.0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    APK File Size
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    placeholder="e.g. 28.94 MB"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Release Date & Package Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Release Date
                  </label>
                  <input
                    type="text"
                    value={formData.releaseDate}
                    onChange={(e) => handleChange('releaseDate', e.target.value)}
                    placeholder="e.g. 2026-10-01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Android Package Name
                  </label>
                  <input
                    type="text"
                    value={formData.packageName}
                    onChange={(e) => handleChange('packageName', e.target.value)}
                    placeholder="e.g. com.example.anti_theft"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Minimum Android Requirement */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Minimum Android Supported
                </label>
                <input
                  type="text"
                  value={formData.minAndroid}
                  onChange={(e) => handleChange('minAndroid', e.target.value)}
                  placeholder="e.g. Android 8.0 (API 26+) up to Android 16"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* SHA-256 Checksum (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  SHA-256 Checksum (Integrity Verification)
                </label>
                <input
                  type="text"
                  value={formData.sha256 || ''}
                  onChange={(e) => handleChange('sha256', e.target.value)}
                  placeholder="64-character hex checksum"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Changelog lines */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Changelog &amp; Highlights (One per line)
                </label>
                <textarea
                  rows={4}
                  value={changelogText}
                  onChange={(e) => setChangelogText(e.target.value)}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131826] border border-slate-300 dark:border-[#252B3D] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={saving}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="font-bold shadow-md shadow-cyan-500/20"
                >
                  Save &amp; Update Live Website
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="default" className="p-5 border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-[#00E5FF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> LIVE USER PREVIEW
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Public /download appearance</span>
            </div>

            {/* Simulated Download Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1322] border border-cyan-500/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-heading">
                      Anti-Theft APK Package
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      arm64-v8a • Release Build
                    </p>
                  </div>
                </div>
                <Badge variant="cyan" size="sm">
                  v{formData.version}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">FILE SIZE</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formData.size}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">MIN ANDROID</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formData.minAndroid}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={formData.mediafireUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Download APK Now ({formData.size})</span>
                </a>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-sans">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Release Highlights:</p>
                {changelogText.split('\n').filter(Boolean).map((line, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
