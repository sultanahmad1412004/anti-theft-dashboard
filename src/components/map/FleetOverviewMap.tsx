import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { MapPin, Maximize2, Minimize2, Crosshair, Smartphone, ChevronRight, Layers } from 'lucide-react';
import { DeviceRecord } from '../../types';
import { isDeviceOnline, formatTimeAgo } from '../../services/deviceService';
import { createTileLayer } from '../../services/mapTileService';
import type { MapTileMode } from '../../services/mapTileService';
import { useTheme } from '../../context/ThemeContext';

interface FleetOverviewMapProps {
  devices: DeviceRecord[];
  height?: string;
  className?: string;
}

export type FleetMapTileMode = MapTileMode;

export const FleetOverviewMap: React.FC<FleetOverviewMapProps> = ({
  devices,
  height = '380px',
  className = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tileMode, setTileMode] = useState<FleetMapTileMode>(() => (theme === 'dark' ? 'dark' : 'satellite'));
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const hasInitializedViewRef = useRef(false);

  // Sync default tile mode when user toggles theme
  useEffect(() => {
    setTileMode(theme === 'dark' ? 'dark' : 'satellite');
  }, [theme]);

  // Switch or apply tile layers dynamically using unified mapTileService
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

  // Filter devices that have coordinates
  const locatedDevices = devices.filter(
    (d) => d.location && d.location.latitude !== 0 && d.location.longitude !== 0
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = locatedDevices.length > 0
        ? [locatedDevices[0].location!.latitude, locatedDevices[0].location!.longitude]
        : [37.7749, -122.4194];

      const defaultZoom = locatedDevices.length > 0 ? 16 : 4;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        maxZoom: 22,
        zoomControl: false,
        attributionControl: false
      });

      const initialTile = createTileLayer(theme === 'dark' ? 'dark' : 'satellite').addTo(map);
      tileLayerRef.current = initialTile;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    if (locatedDevices.length === 0) return;

    const bounds = L.latLngBounds([]);

    locatedDevices.forEach((device) => {
      const lat = device.location!.latitude;
      const lng = device.location!.longitude;
      const isOnline = isDeviceOnline(device.last_active);
      const isSelected = selectedDeviceId === device.device_id;

      bounds.extend([lat, lng]);

      // Custom marker HTML icon with pulsing indicator
      const customIcon = L.divIcon({
        className: 'custom-fleet-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background: ${isOnline ? 'rgba(0, 229, 255, 0.3)' : 'rgba(100, 116, 139, 0.3)'}; transform: scale(1.3); animation: ${isOnline ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'};"></div>
            <div style="position: relative; width: 30px; height: 30px; border-radius: 9999px; background: ${isSelected ? '#00E5FF' : (isOnline ? '#0F172A' : '#334155')}; border: 2px solid ${isOnline ? '#00E5FF' : '#94A3B8'}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#0F172A' : (isOnline ? '#00E5FF' : '#FFFFFF')}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
                <path d="M12 18h.01"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // REQUIRED: Marker ke upar device ka name permanent show ho
      marker.bindTooltip(
        `<div style="font-weight: 700; font-size: 11px; letter-spacing: -0.01em; display: flex; align-items: center; gap: 4px;">
           <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: ${isOnline ? '#10B981' : '#94A3B8'};"></span>
           <span>${device.device_name}</span>
         </div>`,
        {
          permanent: true,
          direction: 'top',
          offset: [0, -18],
          className: 'leaflet-fleet-device-tooltip'
        }
      );

      // Popup with device telemetry and quick manage link
      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; color: #0F172A; margin-bottom: 2px;">${device.device_name}</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">${device.manufacturer || 'Android'} ${device.model || ''}</div>
          <div style="font-size: 10px; font-family: monospace; color: #334155; margin-bottom: 8px;">
            GPS: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°<br/>
            Last seen: ${formatTimeAgo(device.last_active)}
          </div>
          <a href="/dashboard/device/${device.device_id}" style="display: inline-block; width: 100%; text-align: center; background: #00E5FF; color: #0F172A; font-weight: 700; font-size: 11px; padding: 5px 10px; border-radius: 8px; text-decoration: none;">
            Control Device &rarr;
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(markersGroup);
    });

    if (!hasInitializedViewRef.current && locatedDevices.length > 0) {
      if (locatedDevices.length === 1) {
        map.setView([locatedDevices[0].location!.latitude, locatedDevices[0].location!.longitude], 16);
      } else {
        map.fitBounds(bounds.pad(0.18), { maxZoom: 16 });
      }
      hasInitializedViewRef.current = true;
    }
  }, [devices, selectedDeviceId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  };

  const handleFocusDevice = (dev: DeviceRecord) => {
    setSelectedDeviceId(dev.device_id);
    if (dev.location && mapInstanceRef.current) {
      mapInstanceRef.current.setView([dev.location.latitude, dev.location.longitude], 16, {
        animate: true
      });
    }
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full'
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 32px)' : height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Banner Control Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md text-xs font-mono pointer-events-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span className="font-bold text-slate-900 dark:text-white">
            Fleet GPS Radar ({locatedDevices.length} Transponders)
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Tile Layer Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md">
            <button
              type="button"
              onClick={() => setTileMode('satellite')}
              className={`px-2 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                tileMode === 'satellite'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="High-Resolution Satellite Imagery"
            >
              <Layers className="w-3 h-3" />
              <span>Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => setTileMode('streets')}
              className={`px-2 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                tileMode === 'streets'
                  ? 'bg-cyan-600 dark:bg-[#00E5FF] text-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Streets
            </button>
            <button
              type="button"
              onClick={() => setTileMode('dark')}
              className={`px-2 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                tileMode === 'dark'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dark
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-[#00E5FF] shadow-md transition-colors cursor-pointer"
            aria-label="Toggle Fullscreen"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Device Selector Chips */}
      {locatedDevices.length > 0 && (
        <div className="absolute bottom-3 left-3 right-16 flex items-center gap-2 overflow-x-auto py-1 z-10 pointer-events-auto no-scrollbar">
          {locatedDevices.map((d) => {
            const isOnline = isDeviceOnline(d.last_active);
            const isSelected = selectedDeviceId === d.device_id;
            return (
              <button
                key={d.device_id}
                onClick={() => handleFocusDevice(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium backdrop-blur-md border whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md'
                    : 'bg-white/90 dark:bg-[#0F172A]/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-500'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>{d.device_name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* No Located Devices Overlay */}
      {locatedDevices.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/70 backdrop-blur-xs z-10">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00E5FF] mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white font-heading">
            No GPS Transponders Active
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            None of your registered devices have uploaded GPS coordinates yet. Click on any device card below and trigger &quot;Fetch Live Location&quot; to ping real-time coordinates.
          </p>
        </div>
      )}
    </div>
  );
};
