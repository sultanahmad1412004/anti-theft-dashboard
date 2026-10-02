import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DeviceRecord } from '../../types';
import { isDeviceOnline, formatTimeAgo } from '../../services/deviceService';
import { Layers, RefreshCw, Smartphone } from 'lucide-react';
import { createTileLayer } from '../../services/mapTileService';
import type { MapTileMode } from '../../services/mapTileService';
import { useTheme } from '../../context/ThemeContext';

interface MultiDeviceMapProps {
  devices: DeviceRecord[];
  onSelectDevice?: (deviceId: string) => void;
  className?: string;
  height?: string;
}

export type MultiMapTileMode = MapTileMode;

export const MultiDeviceMap: React.FC<MultiDeviceMapProps> = ({
  devices,
  onSelectDevice,
  className = '',
  height = '500px'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [tileMode, setTileMode] = useState<MultiMapTileMode>(() => (theme === 'dark' ? 'dark' : 'satellite'));

  // Sync default tile mode when user toggles theme
  useEffect(() => {
    setTileMode(theme === 'dark' ? 'dark' : 'satellite');
  }, [theme]);

  // Dynamically update tile layers using unified mapTileService
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    const newTile = createTileLayer(tileMode).addTo(map);
    tileLayerRef.current = newTile;
  }, [tileMode]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 12,
        maxZoom: 22,
        zoomControl: false,
        attributionControl: false
      });

      // Default to theme-appropriate tile (Dark in dark mode, Satellite in light mode)
      const initialTile = createTileLayer(theme === 'dark' ? 'dark' : 'satellite').addTo(map);
      tileLayerRef.current = initialTile;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    const filtered = devices.filter(d => {
      const online = isDeviceOnline(d.last_active);
      if (filter === 'online') return online;
      if (filter === 'offline') return !online;
      return true;
    });

    const bounds = L.latLngBounds([]);

    filtered.forEach(device => {
      const lat = device.location?.latitude;
      const lng = device.location?.longitude;
      if (!lat || !lng) return;

      const online = isDeviceOnline(device.last_active);
      const pinColor = online ? '#00E5FF' : '#94A3B8';
      const glowColor = online ? 'rgba(0, 229, 255, 0.4)' : 'rgba(148, 163, 184, 0.2)';

      const markerIcon = L.divIcon({
        className: 'multi-device-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${glowColor}; animation: ${online ? 'radar-pulse 2s infinite ease-out' : 'none'};"></div>
            <div style="width: 16px; height: 16px; border-radius: 50%; background: ${pinColor}; border: 2.5px solid #0F172A; box-shadow: 0 0 10px ${pinColor}; z-index: 2;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([lat, lng], { icon: markerIcon });
      
      const popupHtml = `
        <div style="font-family: 'Inter Tight', sans-serif; color: ${isDark ? '#F1F5F9' : '#0F172A'}; min-width: 170px; padding: 4px;">
          <div style="font-weight: 700; font-size: 13px; color: ${isDark ? '#FFFFFF' : '#0F172A'}; margin-bottom: 2px;">
            ${device.device_name}
          </div>
          <div style="font-size: 11px; color: ${isDark ? '#94A3B8' : '#64748B'}; margin-bottom: 4px;">
            ${device.model} (${device.manufacturer || 'Android'})
          </div>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${online ? '#10B981' : '#64748B'};"></span>
            <span style="font-weight: 600; color: ${online ? '#10B981' : '#64748B'};">${online ? 'ONLINE' : 'OFFLINE'}</span>
            <span style="color: #94A3B8;">• ${formatTimeAgo(device.last_active)}</span>
          </div>
          ${device.owner_email ? `<div style="font-size: 10px; color: ${isDark ? '#CBD5E1' : '#475569'}; margin-bottom: 6px;">User: ${device.owner_email}</div>` : ''}
          <div style="font-size: 10px; font-family: monospace; color: ${isDark ? '#00E5FF' : '#0284C7'}; background: ${isDark ? '#162238' : '#F0F9FF'}; padding: 3px 6px; border-radius: 4px;">
            ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectDevice) onSelectDevice(device.device_id);
      });

      markersGroup.addLayer(marker);
      bounds.extend([lat, lng]);
    });

    if (filtered.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [devices, filter, onSelectDevice]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#334155] shadow-lg bg-slate-100 dark:bg-[#0F172A] ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Floating Filter & Layer Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-md border border-slate-200 dark:border-[#334155] shadow-xl">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            filter === 'all'
              ? 'bg-cyan-500 dark:bg-[#00E5FF] text-white dark:text-[#0F172A] font-semibold shadow-xs'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All ({devices.length})
        </button>
        <button
          onClick={() => setFilter('online')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
            filter === 'online'
              ? 'bg-emerald-500 dark:bg-[#10B981] text-white dark:text-[#0F172A] font-semibold'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#10B981]" />
          Online ({devices.filter(d => isDeviceOnline(d.last_active)).length})
        </button>
        <button
          onClick={() => setFilter('offline')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            filter === 'offline'
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Offline ({devices.filter(d => !isDeviceOnline(d.last_active)).length})
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Tile Layer Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTileMode('satellite')}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              tileMode === 'satellite'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
            title="High-Resolution Satellite Imagery"
          >
            <Layers className="w-3 h-3" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => setTileMode('streets')}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              tileMode === 'streets'
                ? 'bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-slate-900 font-bold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Streets
          </button>
          <button
            onClick={() => setTileMode('dark')}
            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              tileMode === 'dark'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      {/* Top Right Counter Indicator */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-md border border-slate-200 dark:border-[#334155] text-xs font-mono text-cyan-600 dark:text-[#00E5FF] shadow-md flex items-center gap-1.5">
        <Smartphone className="w-3.5 h-3.5" />
        <span>RADAR ACTIVE</span>
      </div>
    </div>
  );
};
