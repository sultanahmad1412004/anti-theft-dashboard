import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  Crosshair, 
  Navigation,
  RefreshCw,
  Compass,
  Gauge,
  Mountain,
  AlertCircle
} from 'lucide-react';
import { DeviceLocation } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatTimeAgo } from '../../services/deviceService';
import { reverseGeocode, AddressDetails } from '../../services/geocodeService';
import { DeviceMap } from '../map/DeviceMap';
import toast from 'react-hot-toast';

interface LocationCardProps {
  location: DeviceLocation | null;
  deviceName: string;
  isOnline: boolean;
  onRequestLocation: () => Promise<void>;
  isRequestingLocation: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  deviceName,
  isOnline,
  onRequestLocation,
  isRequestingLocation
}) => {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<AddressDetails | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const lat = location?.latitude;
  const lng = location?.longitude;
  const hasCoords = Boolean(lat !== undefined && lng !== undefined && (lat !== 0 || lng !== 0));

  useEffect(() => {
    if (!hasCoords || lat === undefined || lng === undefined) {
      setAddress(null);
      return;
    }

    let isMounted = true;
    setLoadingAddress(true);

    reverseGeocode(lat, lng)
      .then((addr) => {
        if (isMounted) {
          setAddress(addr);
          setLoadingAddress(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingAddress(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lng, hasCoords]);

  const copyCoords = () => {
    if (!hasCoords || lat === undefined || lng === undefined) return;
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    toast.success('Coordinates copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const osmUrl = hasCoords
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
    : '#';

  return (
    <Card variant="default" className="p-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-600 dark:text-[#00E5FF]" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-[#E2E8F0] text-base font-heading">
              Live Location
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              OpenStreetMap live GPS positioning and reverse-geocoded physical address.
            </p>
          </div>
        </div>

        <Button
          onClick={onRequestLocation}
          isLoading={isRequestingLocation}
          variant="primary"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRequestingLocation ? 'animate-spin' : ''}`} />}
        >
          {isRequestingLocation ? 'Requesting...' : 'Fetch Live Location'}
        </Button>
      </div>

      {!hasCoords ? (
        /* Empty State */
        <div className="py-12 px-4 rounded-xl border border-dashed border-slate-300 dark:border-[#334155] bg-slate-50/60 dark:bg-[#0F172A]/50 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-[#1E293B] text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800 dark:text-[#E2E8F0]">
            No Live Location Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] max-w-sm mx-auto mt-1 mb-5">
            This device has not transmitted GPS coordinates yet. Click below to broadcast a high-priority location request to the mobile device.
          </p>
          <Button
            onClick={onRequestLocation}
            isLoading={isRequestingLocation}
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRequestingLocation ? 'animate-spin' : ''}`} />}
          >
            {isRequestingLocation ? 'Requesting...' : 'Fetch Live Location'}
          </Button>
        </div>
      ) : (
        /* Map and Telemetry when location exists */
        <div className="space-y-4">
          {/* OSM Map */}
          <DeviceMap
            location={location}
            deviceName={deviceName}
            isOnline={isOnline}
            height="380px"
          />

          {/* Address Details (via Reverse Geocoding) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]/80">
            <div className="text-xs font-mono text-cyan-600 dark:text-[#00E5FF] mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>REVERSE-GEOCODED PHYSICAL LOCATION</span>
            </div>

            {loadingAddress ? (
              <div className="py-2 flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-600 dark:text-[#00E5FF]" />
                <span>Resolving physical street address via OpenStreetMap...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Street Name</span>
                  <span className="font-semibold text-slate-800 dark:text-[#E2E8F0] text-sm">
                    {address?.street || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">City, State, Country</span>
                  <span className="font-semibold text-slate-800 dark:text-[#E2E8F0] text-sm">
                    {address ? `${address.city}, ${address.state}, ${address.country}` : 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Full Address</span>
                  <span className="text-slate-700 dark:text-slate-300 line-clamp-2">
                    {address?.fullAddress || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Coordinates, Accuracy & Vector Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Coordinates */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8] mb-1">
                <Crosshair className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00E5FF]" />
                <span>Coordinates</span>
              </div>
              <div className="font-mono text-sm font-semibold text-slate-900 dark:text-[#E2E8F0] truncate">
                {lat?.toFixed(5)}, {lng?.toFixed(5)}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-[#64748B] mt-0.5">WGS84 Format</div>
            </div>

            {/* Accuracy */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8] mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" />
                <span>Accuracy</span>
              </div>
              <div className="font-mono text-sm font-semibold text-slate-900 dark:text-[#E2E8F0]">
                {location?.accuracy !== undefined && location?.accuracy !== null
                  ? `±${Number(location.accuracy).toFixed(1)} m`
                  : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-[#64748B] mt-0.5">Confidence Radius</div>
            </div>

            {/* Speed */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8] mb-1">
                <Gauge className="w-3.5 h-3.5 text-amber-600 dark:text-[#F59E0B]" />
                <span>Speed</span>
              </div>
              <div className="font-mono text-sm font-semibold text-slate-900 dark:text-[#E2E8F0]">
                {location?.speed !== undefined && location?.speed !== null
                  ? `${(Number(location.speed) * 3.6).toFixed(1)} km/h`
                  : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-[#64748B] mt-0.5">Velocity Vector</div>
            </div>

            {/* Altitude & Heading */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8] mb-1">
                <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Altitude / Heading</span>
              </div>
              <div className="font-mono text-sm font-semibold text-slate-900 dark:text-[#E2E8F0] truncate">
                {location?.altitude !== undefined && location?.altitude !== null
                  ? `${Math.round(Number(location.altitude))}m`
                  : 'N/A'}{' '}
                /{' '}
                {location?.heading !== undefined && location?.heading !== null
                  ? `${Math.round(Number(location.heading))}°`
                  : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-[#64748B] mt-0.5">MSL Elevation / Heading</div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-[#334155]/60 text-xs">
            <span className="text-slate-500 dark:text-[#94A3B8] font-mono">
              Last GPS Fix: {location?.timestamp ? formatTimeAgo(location.timestamp) : 'N/A'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyCoords}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Coordinates'}
              </button>

              <a
                href={osmUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-[#00E5FF] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700 font-medium"
              >
                <span>View on OpenStreetMap</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
