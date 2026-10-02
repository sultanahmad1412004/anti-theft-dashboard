import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Maximize2, Minimize2, Crosshair, MapPin, Globe, Layers } from 'lucide-react';
import { DeviceLocation, DeviceRecord } from '../../types';
import { createTileLayer } from '../../services/mapTileService';
import type { MapTileMode } from '../../services/mapTileService';
import { useTheme } from '../../context/ThemeContext';

interface DeviceMapProps {
  device?: DeviceRecord | null;
  location?: DeviceLocation | null;
  deviceName?: string;
  isOnline?: boolean;
  height?: string;
  className?: string;
  showControls?: boolean;
}

export type { MapTileMode };

export const DeviceMap: React.FC<DeviceMapProps> = ({
  device,
  location: propLocation,
  deviceName: propDeviceName,
  isOnline: propIsOnline,
  height = '360px',
  className = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tileMode, setTileMode] = useState<MapTileMode>(() => (theme === 'dark' ? 'dark' : 'satellite'));

  // Sync default tile mode when user toggles theme
  useEffect(() => {
    setTileMode(theme === 'dark' ? 'dark' : 'satellite');
  }, [theme]);

  const location = propLocation !== undefined ? propLocation : device?.location ?? null;
  const deviceName = propDeviceName || device?.device_name || 'Protected Device';
  const isOnline = propIsOnline !== undefined ? propIsOnline : true;

  const lat = location?.latitude ?? 0;
  const lng = location?.longitude ?? 0;
  const hasValidCoords = Boolean(location && location.latitude !== 0 && location.longitude !== 0);

  // Switch or apply tile layers dynamically using unified mapTileService
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    const newTileLayer = createTileLayer(tileMode).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [tileMode]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!hasValidCoords) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        maxZoom: 22,
        zoomControl: false,
        attributionControl: false
      });

      // Default to theme-appropriate tile (Dark in dark mode, Satellite in light mode)
      const initialTile = createTileLayer(theme === 'dark' ? 'dark' : 'satellite').addTo(map);
      tileLayerRef.current = initialTile;

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng]);
    }

    const map = mapInstanceRef.current;

    // Clean up previous marker & circle
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (hasValidCoords) {
      // Draw accuracy circle
      if (location?.accuracy) {
        circleRef.current = L.circle([lat, lng], {
          radius: Math.max(location.accuracy, 10),
          color: '#00E5FF',
          fillColor: '#00E5FF',
          fillOpacity: 0.2,
          weight: 2,
          dashArray: '4, 4'
        }).addTo(map);
      }

      // Custom animated radar marker
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 229, 255, 0.35); animation: radar-pulse 2s infinite ease-out;"></div>
            <div style="width: 18px; height: 18px; border-radius: 50%; background: ${isOnline ? '#00E5FF' : '#94A3B8'}; border: 3px solid #0F172A; box-shadow: 0 0 14px ${isOnline ? '#00E5FF' : '#94A3B8'}; z-index: 2;"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Bind rich popup
      marker.bindPopup(`
        <div style="font-family: 'Inter Tight', sans-serif; padding: 4px; min-width: 160px; color: ${isDark ? '#F1F5F9' : '#0F172A'};">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px; color: ${isDark ? '#FFFFFF' : '#0F172A'};">${deviceName}</div>
          <div style="font-size: 11px; color: ${isDark ? '#94A3B8' : '#64748B'}; font-family: monospace;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
          <div style="font-size: 11px; margin-top: 4px; font-weight: 600; color: ${isOnline ? '#00E5FF' : '#94A3B8'};">
            ${isOnline ? '● Transmitting Live' : '○ Offline Last Known'}
          </div>
        </div>
      `);

      markerRef.current = marker;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, hasValidCoords, deviceName, isOnline]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && hasValidCoords) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
  };

  if (!hasValidCoords) {
    return null;
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#334155] shadow-lg bg-slate-100 dark:bg-[#0F172A] ${
        isFullscreen ? 'fixed inset-4 z-50 !h-[calc(100vh-2rem)]' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Map Style Switcher (Satellite, Streets, Dark) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 shadow-lg text-[11px] font-mono text-white">
        <button
          type="button"
          onClick={() => setTileMode('satellite')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            tileMode === 'satellite'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="High-Resolution Satellite Imagery"
        >
          <Globe className="w-3 h-3" />
          <span>Satellite</span>
        </button>
        <button
          type="button"
          onClick={() => setTileMode('streets')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            tileMode === 'streets'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="OpenStreetMap Streets"
        >
          <Layers className="w-3 h-3" />
          <span>Street</span>
        </button>
        <button
          type="button"
          onClick={() => setTileMode('dark')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            tileMode === 'dark'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Cyber Dark High Contrast"
        >
          <span>Dark</span>
        </button>
      </div>

      {/* Floating HUD controls (Recenter & Fullscreen) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2 rounded-lg bg-white/95 dark:bg-[#1E293B]/90 backdrop-blur-md border border-slate-200 dark:border-[#334155] text-cyan-600 dark:text-[#00E5FF] hover:bg-slate-100 dark:hover:bg-[#243447] shadow-lg transition-colors cursor-pointer"
          title="Recenter Map on Device"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-white/95 dark:bg-[#1E293B]/90 backdrop-blur-md border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#E2E8F0] hover:text-cyan-600 dark:hover:text-[#00E5FF] hover:bg-slate-100 dark:hover:bg-[#243447] shadow-lg transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Coordinates pill */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-md border border-slate-200 dark:border-[#334155] text-xs font-mono text-slate-800 dark:text-[#E2E8F0] shadow-md">
          <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-[#00E5FF]" />
          <span>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
          {location?.accuracy && (
            <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] border-l border-slate-300 dark:border-[#334155] pl-2">
              ±{location.accuracy.toFixed(1)}m
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
