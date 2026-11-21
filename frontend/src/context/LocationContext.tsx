'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

export interface LocationState {
  village: string;
  mandal: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  isAutoDetected: boolean;
  crop: string;
  areaAcres: number;
}

export interface DistrictLocationInfo {
  district: string;
  state: string;
  mandal?: string;
  pincode?: string;
  lat: number;
  lng: number;
  defaultCrop: string;
  village: string;
}

export const POPULAR_DISTRICTS: DistrictLocationInfo[] = [
  // Andhra Pradesh
  { district: 'Guntur', state: 'Andhra Pradesh', mandal: 'Tenali Mandal', pincode: '522201', lat: 16.3067, lng: 80.4365, defaultCrop: 'Chilli', village: 'Tenali Village' },
  { district: 'Krishna', state: 'Andhra Pradesh', mandal: 'Machilipatnam', pincode: '521001', lat: 16.1800, lng: 81.1300, defaultCrop: 'Paddy (Rice)', village: 'Gudivada' },
  { district: 'Kurnool', state: 'Andhra Pradesh', mandal: 'Adoni', pincode: '518001', lat: 15.8281, lng: 78.0373, defaultCrop: 'Cotton', village: 'Adoni' },
  { district: 'Chittoor', state: 'Andhra Pradesh', mandal: 'Madanapalle', pincode: '517001', lat: 13.2172, lng: 79.1003, defaultCrop: 'Tomato', village: 'Madanapalle' },
  { district: 'West Godavari', state: 'Andhra Pradesh', mandal: 'Bhimavaram', pincode: '534201', lat: 16.7107, lng: 81.0952, defaultCrop: 'Paddy (Rice)', village: 'Bhimavaram' },
  { district: 'Anantapur', state: 'Andhra Pradesh', mandal: 'Dharmavaram', pincode: '515001', lat: 14.6819, lng: 77.6006, defaultCrop: 'Groundnut', village: 'Dharmavaram' },

  // Bihar
  { district: 'Patna', state: 'Bihar', mandal: 'Danapur', pincode: '800001', lat: 25.5941, lng: 85.1376, defaultCrop: 'Paddy (Rice)', village: 'Danapur' },
  { district: 'Muzaffarpur', state: 'Bihar', mandal: 'Kanti', pincode: '842001', lat: 26.1209, lng: 85.3647, defaultCrop: 'Maize', village: 'Kanti' },
  { district: 'Samastipur', state: 'Bihar', mandal: 'Pusa', pincode: '848125', lat: 25.8630, lng: 85.7811, defaultCrop: 'Wheat', village: 'Pusa' },
  { district: 'Begusarai', state: 'Bihar', mandal: 'Barauni', pincode: '851101', lat: 25.4182, lng: 86.1272, defaultCrop: 'Maize', village: 'Barauni' },
  { district: 'Bhagalpur', state: 'Bihar', mandal: 'Naugachia', pincode: '812001', lat: 25.2425, lng: 86.9842, defaultCrop: 'Paddy (Rice)', village: 'Naugachia' },

  // Gujarat
  { district: 'Rajkot', state: 'Gujarat', mandal: 'Gondal', pincode: '360001', lat: 22.3039, lng: 70.8022, defaultCrop: 'Groundnut', village: 'Gondal' },
  { district: 'Surat', state: 'Gujarat', mandal: 'Bardoli', pincode: '394601', lat: 21.1702, lng: 72.8311, defaultCrop: 'Sugarcane', village: 'Bardoli' },

  // Haryana
  { district: 'Karnal', state: 'Haryana', mandal: 'Taraori', pincode: '132001', lat: 29.6857, lng: 76.9905, defaultCrop: 'Paddy (Rice)', village: 'Taraori' },
  { district: 'Hisar', state: 'Haryana', mandal: 'Hansi', pincode: '125001', lat: 29.1492, lng: 75.7217, defaultCrop: 'Cotton', village: 'Hansi' },

  // Karnataka
  { district: 'Belagavi', state: 'Karnataka', mandal: 'Gokak', pincode: '590001', lat: 15.8497, lng: 74.4977, defaultCrop: 'Sugarcane', village: 'Gokak' },
  { district: 'Davangere', state: 'Karnataka', mandal: 'Harihar', pincode: '577001', lat: 14.4644, lng: 75.9218, defaultCrop: 'Maize', village: 'Harihar' },
  { district: 'Dharwad', state: 'Karnataka', mandal: 'Hubballi', pincode: '580001', lat: 15.4589, lng: 75.0078, defaultCrop: 'Cotton', village: 'Hubballi' },

  // Kerala
  { district: 'Palakkad', state: 'Kerala', mandal: 'Chittur', pincode: '678001', lat: 10.7867, lng: 76.6548, defaultCrop: 'Paddy (Rice)', village: 'Chittur' },

  // Madhya Pradesh
  { district: 'Indore', state: 'Madhya Pradesh', mandal: 'Sanwer', pincode: '452001', lat: 22.7196, lng: 75.8577, defaultCrop: 'Soybean', village: 'Sanwer' },
  { district: 'Ujjain', state: 'Madhya Pradesh', mandal: 'Nagda', pincode: '456001', lat: 23.1765, lng: 75.7885, defaultCrop: 'Wheat', village: 'Nagda' },

  // Maharashtra
  { district: 'Solapur', state: 'Maharashtra', mandal: 'Mohol', pincode: '413001', lat: 17.6599, lng: 75.9064, defaultCrop: 'Cotton', village: 'Mohol' },
  { district: 'Nashik', state: 'Maharashtra', mandal: 'Niphad', pincode: '422001', lat: 19.9975, lng: 73.7898, defaultCrop: 'Tomato', village: 'Niphad' },
  { district: 'Nagpur', state: 'Maharashtra', mandal: 'Katol', pincode: '440001', lat: 21.1458, lng: 79.0882, defaultCrop: 'Cotton', village: 'Katol' },

  // Odisha
  { district: 'Sambalpur', state: 'Odisha', mandal: 'Attabira', pincode: '768001', lat: 21.4669, lng: 83.9812, defaultCrop: 'Paddy (Rice)', village: 'Attabira' },
  { district: 'Bargarh', state: 'Odisha', mandal: 'Barpali', pincode: '768028', lat: 21.3340, lng: 83.6214, defaultCrop: 'Paddy (Rice)', village: 'Barpali' },

  // Punjab
  { district: 'Ludhiana', state: 'Punjab', mandal: 'Samrala', pincode: '141001', lat: 30.9010, lng: 75.8572, defaultCrop: 'Wheat', village: 'Samrala' },
  { district: 'Amritsar', state: 'Punjab', mandal: 'Ajnala', pincode: '143001', lat: 31.6340, lng: 74.8723, defaultCrop: 'Wheat', village: 'Ajnala' },
  { district: 'Jalandhar', state: 'Punjab', mandal: 'Nakodar', pincode: '144001', lat: 31.3260, lng: 75.5762, defaultCrop: 'Potato', village: 'Nakodar' },

  // Rajasthan
  { district: 'Jaipur', state: 'Rajasthan', mandal: 'Chomu', pincode: '302001', lat: 26.9124, lng: 75.7873, defaultCrop: 'Mustard', village: 'Chomu' },
  { district: 'Kota', state: 'Rajasthan', mandal: 'Ramganj Mandi', pincode: '324001', lat: 25.2138, lng: 75.8648, defaultCrop: 'Soybean', village: 'Ramganj Mandi' },

  // Tamil Nadu
  { district: 'Thanjavur', state: 'Tamil Nadu', mandal: 'Kumbakonam', pincode: '613001', lat: 10.7870, lng: 79.1378, defaultCrop: 'Paddy (Rice)', village: 'Kumbakonam' },
  { district: 'Coimbatore', state: 'Tamil Nadu', mandal: 'Pollachi', pincode: '641001', lat: 11.0168, lng: 76.9558, defaultCrop: 'Cotton', village: 'Pollachi' },

  // Telangana
  { district: 'Warangal', state: 'Telangana', mandal: 'Parkal', pincode: '506002', lat: 17.9689, lng: 79.5941, defaultCrop: 'Chilli', village: 'Parkal' },
  { district: 'Khammam', state: 'Telangana', mandal: 'Madhira', pincode: '507001', lat: 17.2473, lng: 80.1514, defaultCrop: 'Chilli', village: 'Madhira' },

  // Uttar Pradesh
  { district: 'Varanasi', state: 'Uttar Pradesh', mandal: 'Chiraigaon', pincode: '221001', lat: 25.3176, lng: 82.9739, defaultCrop: 'Wheat', village: 'Chiraigaon' },
  { district: 'Meerut', state: 'Uttar Pradesh', mandal: 'Sardhana', pincode: '250001', lat: 28.9845, lng: 77.7064, defaultCrop: 'Sugarcane', village: 'Sardhana' },

  // West Bengal
  { district: 'Burdwan', state: 'West Bengal', mandal: 'Memari', pincode: '713101', lat: 23.2324, lng: 87.8615, defaultCrop: 'Paddy (Rice)', village: 'Memari' },
  { district: 'Hooghly', state: 'West Bengal', mandal: 'Tarakeswar', pincode: '712101', lat: 22.9080, lng: 88.3968, defaultCrop: 'Potato', village: 'Tarakeswar' },
];

export const ALL_SUPPORTED_CROPS = [
  'Chilli',
  'Paddy (Rice)',
  'Wheat',
  'Cotton',
  'Tomato',
  'Sugarcane',
  'Maize',
  'Brinjal (Eggplant)',
  'Potato',
  'Mustard',
  'Groundnut',
  'Soybean',
  'Pigeon Pea',
];

interface LocationContextType {
  location: LocationState;
  setLocation: (loc: Partial<LocationState>) => void;
  setCrop: (crop: string) => void;
  setAreaAcres: (acres: number) => void;
  detectLocationGPS: () => Promise<{ success: boolean; message: string; location?: LocationState }>;
  searchLocation: (query: string) => DistrictLocationInfo | null;
  isDetecting: boolean;
  statusMessage: string | null;
}

const defaultLocation: LocationState = {
  village: 'Tenali Village',
  mandal: 'Tenali',
  district: 'Guntur',
  state: 'Andhra Pradesh',
  pincode: '522201',
  country: 'India',
  latitude: 16.2435,
  longitude: 80.6402,
  isAutoDetected: false,
  crop: 'Chilli',
  areaAcres: 2.45,
};

const normalizeLocation = (value: Partial<LocationState> | null | undefined): LocationState => {
  const rawArea = Number(value?.areaAcres ?? (value as Record<string, unknown> | null | undefined)?.area_acres ?? defaultLocation.areaAcres);
  const rawLat = value?.latitude !== undefined && value?.latitude !== null ? Number(value.latitude) : defaultLocation.latitude;
  const rawLng = value?.longitude !== undefined && value?.longitude !== null ? Number(value.longitude) : defaultLocation.longitude;

  return {
    village: typeof value?.village === 'string' && value.village.trim() ? value.village : defaultLocation.village,
    mandal: typeof value?.mandal === 'string' && value.mandal.trim() ? value.mandal : defaultLocation.mandal,
    district: typeof value?.district === 'string' && value.district.trim() ? value.district : defaultLocation.district,
    state: typeof value?.state === 'string' && value.state.trim() ? value.state : defaultLocation.state,
    pincode: typeof value?.pincode === 'string' && value.pincode.trim() ? value.pincode : defaultLocation.pincode,
    country: typeof value?.country === 'string' && value.country.trim() ? value.country : defaultLocation.country,
    latitude: Number.isFinite(rawLat) ? rawLat : defaultLocation.latitude,
    longitude: Number.isFinite(rawLng) ? rawLng : defaultLocation.longitude,
    isAutoDetected: Boolean(value?.isAutoDetected),
    crop: typeof value?.crop === 'string' && value.crop.trim() ? value.crop : defaultLocation.crop,
    areaAcres: Number.isFinite(rawArea) && rawArea > 0 ? rawArea : defaultLocation.areaAcres,
  };
};

export const getNearestDistrict = (lat: number, lon: number): DistrictLocationInfo => {
  let closest = POPULAR_DISTRICTS[0];
  let minDistance = Number.MAX_VALUE;
  for (const d of POPULAR_DISTRICTS) {
    const dLat = (d.lat - lat) * (Math.PI / 180);
    const dLng = (d.lng - lon) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat * (Math.PI / 180)) *
      Math.cos(d.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
    const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (distance < minDistance) {
      minDistance = distance;
      closest = d;
    }
  }
  return closest;
};

const syncLocationToBackend = async (loc: LocationState) => {
  try {
    let phoneParam = '9876543210';
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('nutricrop_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.phone) phoneParam = parsed.phone;
        } catch {
          // ignore
        }
      }
    }
    await fetch(`/api/v1/auth/location?phone=${encodeURIComponent(phoneParam)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        village: loc.village,
        mandal: loc.mandal,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
        country: loc.country,
        latitude: String(loc.latitude),
        longitude: String(loc.longitude),
      }),
    });
  } catch (e) {
    console.debug('Backend profile sync skipped/offline:', e);
  }
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const [location, setLocationState] = useState<LocationState>(defaultLocation);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Restore saved location or auto-trigger GPS detection on initial load
  useEffect(() => {
    let hasSaved = false;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nutricrop_location');
      if (saved) {
        try {
          const normalized = normalizeLocation(JSON.parse(saved));
          setLocationState(normalized);
          void syncLocationToBackend(normalized);
          hasSaved = true;
        } catch (e) {
          console.error('Failed to parse saved location', e);
        }
      }
    }

    if (!hasSaved) {
      // Trigger automatic GPS detection immediately
      void detectLocationGPS();
    }
  }, []);

  const setLocation = (newLoc: Partial<LocationState>) => {
    setLocationState((prev) => {
      const updated = normalizeLocation({ ...prev, ...newLoc });
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutricrop_location', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('nutricrop_location_changed', { detail: updated }));
      }
      void syncLocationToBackend(updated);
      return updated;
    });
  };

  const setCrop = (crop: string) => {
    setLocation({ crop });
  };

  const setAreaAcres = (areaAcres: number) => {
    setLocation({ areaAcres });
  };

  const detectLocationGPS = async (): Promise<{ success: boolean; message: string; location?: LocationState }> => {
    setIsDetecting(true);
    setStatusMessage(t('header.detectingGps', 'Detecting GPS location...'));

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setStatusMessage(msg);
      setIsDetecting(false);
      return { success: false, message: msg };
    }

    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      const msg = 'GPS requires a secure HTTPS connection or localhost.';
      setStatusMessage(msg);
      setIsDetecting(false);
      return { success: false, message: msg };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          let reverseVillage = '';
          let reverseMandal = '';
          let reverseDistrict = '';
          let reverseState = '';
          let reversePincode = '';
          let reverseCountry = 'India';

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`/api/v1/auth/reverse-geocode?lat=${lat}&lon=${lon}`, {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              reverseVillage = data.village || '';
              reverseMandal = data.mandal || '';
              reverseDistrict = data.district || '';
              reverseState = data.state || '';
              reversePincode = data.pincode || '';
              reverseCountry = data.country || 'India';
            }
          } catch {
            // Fallback to local coordinates matching
          }

          const nearest = getNearestDistrict(lat, lon);
          const resolvedDistrict = reverseDistrict || nearest.district;
          const resolvedState = reverseState || nearest.state;
          const resolvedMandal = reverseMandal || nearest.mandal || `${nearest.district} Mandal`;
          const resolvedPincode = reversePincode || nearest.pincode || '';
          const resolvedVillage = reverseVillage || nearest.village || `Field (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`;
          const resolvedCrop = nearest.defaultCrop || location.crop || 'Chilli';

          const updated: LocationState = {
            latitude: lat,
            longitude: lon,
            isAutoDetected: true,
            village: resolvedVillage,
            mandal: resolvedMandal,
            district: resolvedDistrict,
            state: resolvedState,
            pincode: resolvedPincode,
            country: reverseCountry,
            crop: resolvedCrop,
            areaAcres: location.areaAcres || 2.45,
          };

          setLocation(updated);
          const successMsg = `GPS locked: ${resolvedVillage}, ${resolvedMandal ? resolvedMandal + ', ' : ''}${resolvedDistrict}, ${resolvedState}${resolvedPincode ? ' - ' + resolvedPincode : ''}`;
          setStatusMessage(successMsg);
          setIsDetecting(false);
          setTimeout(() => setStatusMessage(null), 5000);
          resolve({ success: true, message: successMsg, location: updated });
        },
        (err) => {
          console.warn('Geolocation error:', err.message, err.code);
          let errorMsg = 'Could not detect GPS location. Please check browser location permissions.';
          if (err.code === 1) {
            errorMsg = 'Location permission denied. Please allow browser location access to detect your farm.';
          } else if (err.code === 2) {
            errorMsg = 'Location unavailable. Ensure GPS / Location service is turned on in your device.';
          } else if (err.code === 3) {
            errorMsg = 'GPS request timed out. Please click Retry Location.';
          }
          setStatusMessage(errorMsg);
          setIsDetecting(false);
          resolve({ success: false, message: errorMsg });
        },
        { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
      );
    });
  };

  const searchLocation = (query: string): DistrictLocationInfo | null => {
    if (!query) return null;
    const cleanQuery = query.toLowerCase().trim();
    const coordMatch = cleanQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (!isNaN(lat) && !isNaN(lng)) {
        const nearest = getNearestDistrict(lat, lng);
        return {
          ...nearest,
          lat,
          lng,
          village: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
      }
    }
    const found = POPULAR_DISTRICTS.find(
      (d) =>
        d.district.toLowerCase().includes(cleanQuery) ||
        d.state.toLowerCase().includes(cleanQuery) ||
        d.village.toLowerCase().includes(cleanQuery) ||
        (d.mandal && d.mandal.toLowerCase().includes(cleanQuery)) ||
        (d.pincode && d.pincode === cleanQuery)
    );
    return found || null;
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        setCrop,
        setAreaAcres,
        detectLocationGPS,
        searchLocation,
        isDetecting,
        statusMessage,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
