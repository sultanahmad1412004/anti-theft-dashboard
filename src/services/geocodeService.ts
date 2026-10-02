export interface AddressDetails {
  street: string;
  city: string;
  state: string;
  country: string;
  fullAddress: string;
}

const geocodeCache = new Map<string, AddressDetails>();

/**
 * Reverse geocode latitude and longitude using OpenStreetMap Nominatim API
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<AddressDetails> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Project-101-Web-Dashboard'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding HTTP ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const street =
      addr.road ||
      addr.street ||
      addr.pedestrian ||
      addr.footway ||
      addr.cycleway ||
      addr.path ||
      'N/A';

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.suburb ||
      addr.county ||
      'N/A';

    const state = addr.state || addr.region || addr.province || 'N/A';
    const country = addr.country || 'N/A';
    const fullAddress = data.display_name || (street !== 'N/A' && city !== 'N/A' ? `${street}, ${city}, ${country}` : 'N/A');

    const result: AddressDetails = {
      street,
      city,
      state,
      country,
      fullAddress
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Reverse geocoding fetch error:', err);
    return {
      street: 'N/A',
      city: 'N/A',
      state: 'N/A',
      country: 'N/A',
      fullAddress: 'N/A'
    };
  }
}
