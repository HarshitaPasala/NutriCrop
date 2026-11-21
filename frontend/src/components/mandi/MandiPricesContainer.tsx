'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Info,
  MapPin,
  Minus,
  Navigation,
  Search,
  Store,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  Sprout,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage, translateCrop } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface MandiPricesContainerProps {
  onBackToDashboard: () => void;
}

interface PriceRecord {
  id: string;
  commodity: string;
  variety: string;
  market_center: string;
  district: string;
  state: string;
  min_price_quintal: number;
  max_price_quintal: number;
  modal_price_quintal: number;
  arrival_date: string;
  price_trend: string;
  change_percent: number;
  distance_km?: number | null;
}

const LOCALES: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  gu: 'gu-IN',
  or: 'or-IN',
};

const normalizedCrop = (crop: string) => {
  if (!crop) return 'All';
  if (/rice|paddy/i.test(crop)) return 'Paddy (Rice)';
  if (/chilli|chili|mirchi/i.test(crop)) return 'Chilli';
  if (/wheat|gehu/i.test(crop)) return 'Wheat';
  if (/cotton|kapas/i.test(crop)) return 'Cotton';
  if (/maize|makka/i.test(crop)) return 'Maize';
  if (/onion|pyaz/i.test(crop)) return 'Onion';
  if (/tomato|tamatar/i.test(crop)) return 'Tomato';
  return crop;
};

export const MandiPricesContainer: React.FC<MandiPricesContainerProps> = ({ onBackToDashboard }) => {
  const { t, language } = useLanguage();
  const { location, detectLocationGPS, isDetecting } = useLocation();

  const [records, setRecords] = useState<PriceRecord[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<number | 'all'>(50); // 25, 50, 100, 'all'
  const [selectedMandi, setSelectedMandi] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<string>(normalizedCrop(location.crop || 'All'));

  const [areaCrops, setAreaCrops] = useState<string[]>([]);
  const [availableMandis, setAvailableMandis] = useState<string[]>([]);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('distance'); // distance, price-low, price-high, date
  const [period, setPeriod] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');

  const locale = LOCALES[language] || 'en-IN';
  const formatRupees = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  const formatMarketDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
  };
  const formatUpdated = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString(locale);
  };

  // Sync crop when location context changes
  useEffect(() => {
    if (location.crop) setSelectedCrop(normalizedCrop(location.crop));
  }, [location.crop]);

  // Load crops commonly grown in this area and mandis in this area based on GPS
  useEffect(() => {
    let isCurrent = true;
    const fetchAreaMetadata = async () => {
      const q = new URLSearchParams();
      if (location.state) q.set('state', location.state);
      if (location.district) q.set('district', location.district);

      try {
        const [cropsRes, mandisRes] = await Promise.all([
          fetch(`/api/v1/mandi/crops-by-area?${q.toString()}`),
          fetch(`/api/v1/mandi/markets?${q.toString()}`),
        ]);
        if (cropsRes.ok && isCurrent) {
          const list = await cropsRes.json();
          if (Array.isArray(list) && list.length > 0) {
            setAreaCrops(list);
          }
        }
        if (mandisRes.ok && isCurrent) {
          const mList = await mandisRes.json();
          if (Array.isArray(mList)) {
            setAvailableMandis(mList);
          }
        }
      } catch {
        // Fallback
      }
    };
    void fetchAreaMetadata();
    return () => {
      isCurrent = false;
    };
  }, [location.state, location.district]);

  // Load Mandi Prices automatically from GPS coordinates
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const loadPrices = async () => {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (selectedCrop && selectedCrop !== 'All') params.set('commodity', selectedCrop);
      if (location.district) params.set('district', location.district);
      if (location.state) params.set('state', location.state);
      if (selectedMandi && selectedMandi !== 'All') params.set('market_center', selectedMandi);
      if (selectedRadius !== 'all') params.set('radius_km', String(selectedRadius));

      if (location.latitude !== null && location.longitude !== null) {
        params.set('latitude', String(location.latitude));
        params.set('longitude', String(location.longitude));
      }

      try {
        const response = await fetch(`/api/v1/mandi/prices?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(t('mandiPrices.loadError', 'Market rates could not be loaded. Try again.'));
        }
        const payload = await response.json();
        if (!cancelled) {
          setRecords(Array.isArray(payload.records) ? payload.records : []);
          setLastUpdated(payload.last_updated || new Date().toISOString());
        }
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === 'AbortError')) {
          setError(err instanceof Error ? err.message : t('mandiPrices.loadError', 'Market rates could not be loaded. Try again.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPrices();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedCrop, selectedMandi, selectedRadius, location.latitude, location.longitude, location.district, location.state, refreshKey]);

  const handleUpdateLocation = async () => {
    setLocationMessage('');
    const result = await detectLocationGPS();
    if (result && result.success) {
      setLocationMessage(result.message);
    } else if (result && result.message) {
      setLocationMessage(result.message);
    }
  };

  // Filter and sort records
  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matching = records.filter(
      (record) =>
        !query ||
        [record.market_center, record.district, record.state, record.commodity, record.variety].some((text) =>
          text.toLowerCase().includes(query)
        )
    );

    return matching.sort((a, b) => {
      if (sort === 'price-low') return a.min_price_quintal - b.min_price_quintal;
      if (sort === 'price-high') return b.max_price_quintal - a.max_price_quintal;
      if (sort === 'date') return new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime();
      return (a.distance_km ?? Number.MAX_SAFE_INTEGER) - (b.distance_km ?? Number.MAX_SAFE_INTEGER);
    });
  }, [records, search, sort]);

  const cheapest = visibleRecords.length ? [...visibleRecords].sort((a, b) => a.min_price_quintal - b.min_price_quintal)[0] : null;
  const highest = visibleRecords.length ? [...visibleRecords].sort((a, b) => b.max_price_quintal - a.max_price_quintal)[0] : null;
  const modalRecord = visibleRecords.length
    ? [...visibleRecords].sort(
        (a, b) =>
          visibleRecords.filter((record) => record.modal_price_quintal === b.modal_price_quintal).length -
          visibleRecords.filter((record) => record.modal_price_quintal === a.modal_price_quintal).length
      )[0]
    : null;

  const chartRecord = visibleRecords[0];
  const history = useMemo(() => {
    if (!chartRecord) return [];
    const today = new Date();
    return Array.from({ length: period }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (period - 1 - index));
      const variation = Math.sin((index + chartRecord.id.length) * 0.75) * 0.035 + (index / period - 0.5) * (chartRecord.change_percent / 200);
      return { day, price: Math.round(chartRecord.modal_price_quintal * (1 + variation)) };
    });
  }, [chartRecord, period]);
  const chartMax = Math.max(...history.map((item) => item.price), 1);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary hover:bg-nutri-bg transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>
      </div>

      {/* Main Location & Filter Header */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              AGMARKNET APMC Wholesale
            </span>
            <DemoBadge />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-nutri-primary flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-nutri-secondary" />
            <span>{t('mandiPrices.title', 'Nearby Mandi Market Rates')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-nutri-muted mt-1">
            {t('mandiPrices.subtitle', 'Wholesale market prices per quintal from nearby regulated mandis.')}
          </p>
        </div>

        {/* Automatic GPS Location Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-black text-emerald-900 tracking-wider">
                  Farmer GPS Location:
                </span>
                {location.isAutoDetected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Auto-Detected
                  </span>
                )}
              </div>
              <p className="text-sm font-black text-emerald-950 mt-0.5">
                {location.village ? `${location.village}, ` : ''}
                {location.mandal ? `${location.mandal}, ` : ''}
                {location.district}, {location.state}
                {location.pincode ? ` - ${location.pincode}` : ''}
              </p>
              {location.latitude !== null && location.longitude !== null && (
                <p className="text-[11px] font-mono font-semibold text-emerald-800 mt-0.5">
                  Coordinates: {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdateLocation}
            disabled={isDetecting}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-nutri-primary font-bold text-xs min-h-[44px] transition active:scale-98 shrink-0 shadow-xs"
          >
            <Navigation className={`w-4 h-4 text-emerald-600 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? t('mandiPrices.detecting', 'Detecting location…') : 'Update Location'}</span>
          </button>
        </div>

        {locationMessage && (
          <div role="status" className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{locationMessage}</span>
          </div>
        )}

        {/* Distance Radius Filter Buttons: 25 km, 50 km, 100 km, All */}
        <div className="space-y-2 pt-2 border-t border-nutri-cardBorder">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-nutri-primary">
              Distance Radius from Farm:
            </span>
            <span className="text-xs text-nutri-muted font-medium">
              Sorted by closest market distance
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Within 25 km', value: 25 },
              { label: 'Within 50 km', value: 50 },
              { label: 'Within 100 km', value: 100 },
              { label: 'All Mandis', value: 'all' as const },
            ].map((r) => {
              const isActive = selectedRadius === r.value;
              return (
                <button
                  key={String(r.value)}
                  type="button"
                  onClick={() => setSelectedRadius(r.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[42px] ${
                    isActive
                      ? 'bg-nutri-primary text-white shadow-xs border border-nutri-primary'
                      : 'bg-white hover:bg-nutri-bg text-nutri-primary border border-nutri-cardBorder'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Crops Grown in this Area */}
        {areaCrops.length > 0 && (
          <div className="pt-2 border-t border-nutri-cardBorder space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-nutri-primary flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>
                  {t('mandiPrices.cropsInArea', 'Crops Grown in Area')}: {location.district}
                </span>
              </span>
              {selectedCrop !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedCrop('All')}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                >
                  {t('mandiPrices.allCrops', 'All crops')}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCrop('All')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition min-h-[36px] ${
                  selectedCrop === 'All'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {t('mandiPrices.allCrops', 'All crops')}
              </button>
              {areaCrops.map((c) => {
                const isSelected =
                  selectedCrop.toLowerCase() === c.toLowerCase() ||
                  (c.toLowerCase().includes('paddy') && selectedCrop.toLowerCase().includes('paddy')) ||
                  (c.toLowerCase().includes('rice') && selectedCrop.toLowerCase().includes('rice'));
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCrop(isSelected ? 'All' : c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition min-h-[36px] ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {translateCrop(c, t)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search, Commodity, Mandi & Sort Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-nutri-cardBorder">
          {/* Commodity Dropdown */}
          <div>
            <label className="block text-xs font-bold text-nutri-primary mb-1">
              {t('mandiPrices.selectCrop', 'Select Commodity')}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-nutri-cardBorder bg-white font-semibold text-xs sm:text-sm min-h-[44px] outline-none"
            >
              <option value="All">{t('mandiPrices.allCrops', 'All crops')}</option>
              {Array.from(new Set([...areaCrops, 'Chilli', 'Paddy (Rice)', 'Wheat', 'Cotton', 'Maize', 'Tomato', 'Mustard', 'Onion', 'Potato', 'Groundnut', 'Soybean', 'Sugarcane'])).map((c) => (
                <option key={c} value={c}>
                  {translateCrop(c, t)}
                </option>
              ))}
            </select>
          </div>

          {/* Mandi Dropdown */}
          <div>
            <label className="block text-xs font-bold text-nutri-primary mb-1">
              {t('mandiPrices.selectMandi', 'Mandi / Market Yard')}
            </label>
            <select
              value={selectedMandi}
              onChange={(e) => setSelectedMandi(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-nutri-cardBorder bg-white font-semibold text-xs sm:text-sm min-h-[44px] outline-none"
            >
              <option value="All">{t('mandiPrices.allMandis', 'All Mandi Markets')}</option>
              {availableMandis.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-xs font-bold text-nutri-primary mb-1">
              {t('mandiPrices.searchMarket', 'Search Mandi or Crop')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search market or variety..."
                className="w-full rounded-xl border border-nutri-cardBorder pl-9 pr-3 py-2.5 text-xs sm:text-sm min-h-[44px] outline-none"
              />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-xs font-bold text-nutri-primary mb-1">
              {t('mandiPrices.sortBy', 'Sort Prices')}
            </label>
            <select
              aria-label={t('mandiPrices.sortBy', 'Sort prices')}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-nutri-cardBorder px-3 py-2.5 text-xs sm:text-sm font-semibold min-h-[44px] outline-none"
            >
              <option value="distance">{t('mandiPrices.sortDistance', 'Nearest first')}</option>
              <option value="price-low">{t('mandiPrices.sortLow', 'Lowest price')}</option>
              <option value="price-high">{t('mandiPrices.sortHigh', 'Highest price')}</option>
              <option value="date">{t('mandiPrices.sortDate', 'Most recent')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Error & Loading States */}
      {error && (
        <div role="alert" className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setRefreshKey((k) => k + 1)} className="underline font-bold min-h-[36px]">
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {loading && (
        <p role="status" className="rounded-2xl bg-white p-5 text-sm text-nutri-muted font-semibold shadow-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>{t('common.loading', 'Loading nearby market rates…')}</span>
        </p>
      )}

      {/* Empty State with Radius Expansion */}
      {!loading && !error && visibleRecords.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center border border-nutri-cardBorder shadow-sm space-y-3">
          <Store className="w-10 h-10 text-nutri-muted mx-auto" />
          <p className="text-base font-bold text-nutri-primary">
            {selectedRadius !== 'all'
              ? `No mandis found within ${selectedRadius} km of your GPS location.`
              : t('mandiPrices.empty', 'No mandis found nearby. Try another crop or district.')}
          </p>
          <p className="text-xs text-nutri-muted">
            Expand the search radius to discover regulated markets in nearby districts.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {selectedRadius !== 50 && (
              <button
                type="button"
                onClick={() => setSelectedRadius(50)}
                className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition min-h-[40px]"
              >
                Expand to 50 km
              </button>
            )}
            {selectedRadius !== 100 && (
              <button
                type="button"
                onClick={() => setSelectedRadius(100)}
                className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition min-h-[40px]"
              >
                Expand to 100 km
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedRadius('all');
                setSelectedCrop('All');
                setSelectedMandi('All');
                setSearch('');
              }}
              className="px-4 py-2 rounded-xl bg-nutri-primary hover:bg-nutri-secondary text-white text-xs font-bold transition min-h-[40px]"
            >
              Show All Mandis
            </button>
          </div>
        </div>
      )}

      {/* Loaded Mandi Records */}
      {!loading && visibleRecords.length > 0 && (
        <>
          {/* Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modalRecord && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-xs font-bold uppercase text-emerald-900">
                  {t('mandiPrices.modalHighlight', 'Most reported modal price')}
                </p>
                <p className="text-2xl font-black text-emerald-950">
                  {formatRupees(modalRecord.modal_price_quintal)}
                  <span className="text-xs font-semibold"> / {t('mandiPrices.perQuintal', 'Quintal')}</span>
                </p>
                <p className="text-xs text-emerald-900 mt-1">
                  {modalRecord.market_center} ({modalRecord.district}) · {formatMarketDate(modalRecord.arrival_date)}
                </p>
              </div>
            )}
            {cheapest && highest && (
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4">
                <p className="text-xs font-bold uppercase text-sky-900">
                  {t('mandiPrices.bestPrice', 'Best affordable price')}
                </p>
                <p className="text-2xl font-black text-sky-950">
                  {formatRupees(cheapest.min_price_quintal)} – {formatRupees(highest.max_price_quintal)}
                </p>
                <p className="text-xs text-sky-900 mt-1">
                  {t('mandiPrices.lowestAt', 'Lowest at')} {cheapest.market_center} ·{' '}
                  {cheapest.distance_km == null ? t('mandiPrices.distanceUnavailable', 'Distance unavailable') : `${cheapest.distance_km} km away`}
                </p>
              </div>
            )}
          </div>

          {/* Price Trend Chart */}
          <section className="rounded-3xl bg-white p-5 border border-nutri-cardBorder shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-black text-nutri-primary text-sm sm:text-base">
                {t('mandiPrices.priceTrend', 'Price trend')} ({chartRecord?.commodity} - {chartRecord?.market_center})
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPeriod(7)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[36px] ${
                    period === 7 ? 'bg-nutri-primary text-white shadow-xs' : 'bg-nutri-bg text-nutri-primary'
                  }`}
                >
                  7 {t('common.days', 'days')}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod(30)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[36px] ${
                    period === 30 ? 'bg-nutri-primary text-white shadow-xs' : 'bg-nutri-bg text-nutri-primary'
                  }`}
                >
                  30 {t('common.days', 'days')}
                </button>
              </div>
            </div>

            <div className="flex items-end gap-1.5 h-28 pt-2" role="img" aria-label={`${period}-day estimated modal price trend`}>
              {history.map((point) => (
                <div
                  key={point.day.toISOString()}
                  title={`${point.day.toLocaleDateString(locale)}: ${formatRupees(point.price)}`}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm min-w-[3px] transition cursor-pointer"
                  style={{ height: `${Math.max(10, (point.price / chartMax) * 100)}%` }}
                />
              ))}
            </div>
            <p className="text-[11px] text-nutri-muted font-medium">
              {t('mandiPrices.mockTrendNote', 'Historical trend estimate from the current AGMARKNET quote.')}
            </p>
          </section>

          {/* Reporting Counts Strip */}
          <div className="flex items-center justify-between text-xs text-nutri-muted font-semibold px-1">
            <span>
              {visibleRecords.length} {t('mandiPrices.markets', 'markets reporting')}
            </span>
            <span>
              {t('mandiPrices.lastUpdated', 'Last updated')}: {formatUpdated(lastUpdated || new Date().toISOString())}
            </span>
          </div>

          {/* Grid of Mandi Rate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {visibleRecords.map((record) => (
              <article key={record.id} className="bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-sm space-y-3">
                <header className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-nutri-primary">{translateCrop(record.commodity, t)}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        AGMARKNET
                      </span>
                    </div>
                    <p className="text-xs text-nutri-muted font-semibold">{record.variety}</p>
                    <p className="mt-1 text-xs font-bold flex items-center gap-1 text-emerald-900">
                      <Store className="w-3.5 h-3.5" />
                      {record.market_center}
                    </p>
                    <p className="text-xs text-nutri-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {record.district}, {record.state}
                      {record.distance_km != null && (
                        <span className="font-bold text-emerald-700">· {record.distance_km} km away</span>
                      )}
                    </p>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 shrink-0">
                    {record.price_trend === 'rising' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                    ) : record.price_trend === 'declining' ? (
                      <TrendingDown className="w-4 h-4 text-rose-700" />
                    ) : (
                      <Minus className="w-4 h-4 text-slate-500" />
                    )}
                    <span>{record.change_percent}%</span>
                  </span>
                </header>

                <div className="rounded-2xl bg-nutri-bg p-3 border border-emerald-100">
                  <p className="text-[10px] uppercase font-bold text-nutri-muted">{t('mandiPrices.modalPrice', 'Modal Price')}</p>
                  <p className="text-2xl font-black text-nutri-primary">
                    {formatRupees(record.modal_price_quintal)}{' '}
                    <span className="text-xs font-bold text-nutri-muted">/ {t('mandiPrices.perQuintal', 'Quintal')}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-nutri-muted font-semibold pt-1">
                  <span>
                    {t('mandiPrices.minMax', 'Min / Max')}: {formatRupees(record.min_price_quintal)} – {formatRupees(record.max_price_quintal)}
                  </span>
                  <span>{formatMarketDate(record.arrival_date)}</span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Advisory Source Note */}
      <div className="rounded-2xl p-4 bg-white border border-nutri-cardBorder flex items-start gap-3 text-xs text-nutri-muted">
        <Info className="w-4 h-4 text-nutri-secondary shrink-0 mt-0.5" />
        <p>{t('mandiPrices.sourceNote', 'Market rates are sourced from AGMARKNET / APMC arrival quotes.')}</p>
      </div>
    </div>
  );
};
