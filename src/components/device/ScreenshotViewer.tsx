import React, { useState } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ZoomIn, 
  X, 
  Download, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { formatTimeAgo, formatTimestampDate, triggerScreenshotCapture } from '../../services/deviceService';
import toast from 'react-hot-toast';

interface ScreenshotViewerProps {
  uid: string;
  deviceId: string;
  latestScreenshot: string | null;
  latestScreenshotTime: any;
  screenshotStatus: string | null;
  isCapturing?: boolean;
  isDemo?: boolean;
}

export const ScreenshotViewer: React.FC<ScreenshotViewerProps> = ({
  uid,
  deviceId,
  latestScreenshot,
  latestScreenshotTime,
  screenshotStatus,
  isCapturing = false,
  isDemo = false
}) => {
  const [requesting, setRequesting] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleCapture = async () => {
    setRequesting(true);
    try {
      await triggerScreenshotCapture(uid, deviceId, isDemo);
      toast.success('Screenshot capture request sent to device');
    } catch {
      toast.error('Failed to trigger screenshot capture');
    } finally {
      setTimeout(() => setRequesting(false), 2000);
    }
  };

  const renderStatusBadge = () => {
    if (!screenshotStatus) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Ready
        </span>
      );
    }

    if (screenshotStatus === 'Success') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Success
        </span>
      );
    }

    if (screenshotStatus === 'In progress...') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300 dark:border-blue-800 animate-pulse">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          In progress...
        </span>
      );
    }

    if (screenshotStatus === 'Screen is off') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Screen is off
        </span>
      );
    }

    if (screenshotStatus === 'Permission required') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-300 dark:border-orange-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Permission required
        </span>
      );
    }

    if (screenshotStatus === 'File not found') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          File not found
        </span>
      );
    }

    if (screenshotStatus.startsWith('Upload failed')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          {screenshotStatus}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {screenshotStatus}
      </span>
    );
  };

  const isBusy = requesting || isCapturing || screenshotStatus === 'In progress...';

  return (
    <Card variant="default" className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-cyan-600 dark:text-[#00E5FF]" />
            <h3 className="font-semibold text-slate-900 dark:text-[#E2E8F0] text-base font-heading">
              Remote Screenshot
            </h3>
            {renderStatusBadge()}
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
            Capture a screenshot of your device remotely to verify unauthorized usage.
          </p>
        </div>

        <Button
          onClick={handleCapture}
          isLoading={isBusy}
          variant="primary"
          size="sm"
          leftIcon={<Camera className="w-4 h-4" />}
        >
          {isBusy ? 'Capturing...' : 'Capture Screenshot'}
        </Button>
      </div>

      {/* Screenshot display container */}
      <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] min-h-[240px] flex items-center justify-center">
        {latestScreenshot ? (
          <div className="relative group w-full max-h-[440px] flex items-center justify-center p-3 bg-slate-950/10 dark:bg-black/40">
            <img
              src={latestScreenshot}
              alt="Remote device screenshot"
              className="max-h-[400px] object-contain rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl transition-transform group-hover:scale-[1.01] cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
              loading="lazy"
            />
            {/* Hover overlay for fullscreen view */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 dark:bg-[#00E5FF] text-slate-900 font-semibold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer hover:bg-cyan-400"
              >
                <ZoomIn className="w-4 h-4" />
                Inspect Fullscreen
              </button>
              <a
                href={latestScreenshot}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Original Link
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-[#94A3B8]">
            <ImageIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-800 dark:text-[#E2E8F0]">No screenshot captured yet</p>
            <p className="text-xs text-slate-400 dark:text-[#64748B] mt-1 max-w-xs">
              Click &quot;Capture Screenshot&quot; above to dispatch a silent capture request to the device.
            </p>
          </div>
        )}
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center justify-between mt-3 text-xs text-slate-500 dark:text-[#94A3B8] font-mono gap-2">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00E5FF]" />
          Captured: {latestScreenshotTime ? `${formatTimeAgo(latestScreenshotTime)} (${formatTimestampDate(latestScreenshotTime)})` : 'N/A'}
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Status: {screenshotStatus || 'N/A'}
        </span>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && latestScreenshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-slate-800 text-white hover:text-[#00E5FF] transition-colors cursor-pointer"
              title="Close Fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={latestScreenshot}
              alt="Remote device screenshot fullscreen"
              className="max-h-[85vh] object-contain rounded-xl border border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </Card>
  );
};
