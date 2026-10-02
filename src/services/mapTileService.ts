import L from 'leaflet';

export type MapTileMode = 'satellite' | 'dark' | 'streets' | 'outdoor';

export interface TileLayerConfig {
  url: string;
  options: L.TileLayerOptions;
  name: string;
}

/**
 * Official MapTiler API Key provided by user
 */
export const MAPTILER_API_KEY = 'a4PEOhmg99ypFvoYw07v';

/**
 * High-reliability tile layer definitions using MapTiler API.
 *
 * 1. Dark: MapTiler Dataviz Dark
 *    FIX: Uses key 'a4PEOhmg99ypFvoYw07v'. Eliminates Carto's watermark completely!
 *
 * 2. Satellite: Google Hybrid & MapTiler Hybrid
 *    FIX: Configured with maxNativeZoom: 19 and maxZoom: 22. Leaflet scales high-res
 *    imagery seamlessly on deep zoom without ever showing "Map data not yet available"!
 *
 * 3. Streets: MapTiler Streets v2
 *
 * 4. Outdoor: MapTiler Outdoor v2
 */
export const MAP_TILE_CONFIGS: Record<MapTileMode, TileLayerConfig> = {
  satellite: {
    // High-resolution Google Hybrid with upscale beyond zoom 19
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    options: {
      maxZoom: 22,
      maxNativeZoom: 19,
      attribution: '&copy; Google Maps / OpenStreetMap contributors'
    },
    name: 'Satellite Hybrid'
  },
  dark: {
    // Official MapTiler Dataviz Dark - Pristine dark theme, zero Carto watermark!
    url: `https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
    options: {
      maxZoom: 22,
      maxNativeZoom: 19,
      attribution: '&copy; MapTiler &copy; OpenStreetMap contributors'
    },
    name: 'Dark Cyber'
  },
  streets: {
    // Official MapTiler Streets v2
    url: `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
    options: {
      maxZoom: 22,
      maxNativeZoom: 19,
      attribution: '&copy; MapTiler &copy; OpenStreetMap contributors'
    },
    name: 'Streets'
  },
  outdoor: {
    // Official MapTiler Outdoor v2
    url: `https://api.maptiler.com/maps/outdoor-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
    options: {
      maxZoom: 22,
      maxNativeZoom: 19,
      attribution: '&copy; MapTiler &copy; OpenStreetMap contributors'
    },
    name: 'Outdoor / Topo'
  }
};

/**
 * Creates a Leaflet TileLayer instance for the given mode.
 */
export function createTileLayer(mode: MapTileMode): L.TileLayer {
  const config = MAP_TILE_CONFIGS[mode] || MAP_TILE_CONFIGS.satellite;
  return L.tileLayer(config.url, config.options);
}
