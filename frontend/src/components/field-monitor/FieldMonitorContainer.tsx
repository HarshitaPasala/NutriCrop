'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Satellite,
  ArrowLeft,
  Calendar,
  Cloud,
  CloudRain,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sprout,
  Activity,
  Search,
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { InteractiveFarmMap } from './InteractiveFarmMap';
import { NdviLegendCard } from './NdviLegendCard';

interface FieldMonitorContainerProps {
  onBackToDashboard: () => void;
}

const DEFAULT_PLOTS = [
  {
    id: 'plot-guntur-chilli',
    name: 'Sri Rama Chilli Field (Plot 2A)',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    crop: 'Chilli',
    sowing_date: '2026-09-15',
    area_acres: 2.45,
    centroid: [16.2435, 80.6402] as [number, number],
    coordinates: [
      { lat: 16.2445, lng: 80.6390 },
      { lat: 16.2448, lng: 80.6415 },
      { lat: 16.2425, lng: 80.6418 },
      { lat: 16.2422, lng: 80.6392 },
    ],
  },
  {
    id: 'plot-ludhiana-wheat',
    name: 'Kisan Seva Wheat Farm (Plot 1)',
    district: 'Ludhiana',
    state: 'Punjab',
    crop: 'Wheat',
    sowing_date: '2026-10-25',
    area_acres: 4.10,
    centroid: [30.9010, 75.8572] as [number, number],
    coordinates: [
      { lat: 30.9025, lng: 75.8550 },
      { lat: 30.9030, lng: 75.8590 },
      { lat: 30.8995, lng: 75.8595 },
      { lat: 30.8990, lng: 75.8555 },
    ],
  },
  {
    id: 'plot-solapur-cotton',
    name: 'Balaji Cotton Field',
    district: 'Solapur',
    state: 'Maharashtra',
    crop: 'Cotton',
    sowing_date: '2026-07-20',
    area_acres: 3.20,
    centroid: [17.6599, 75.9064] as [number, number],
    coordinates: [
      { lat: 17.6610, lng: 75.9045 },
      { lat: 17.6615, lng: 75.9085 },
      { lat: 17.6585, lng: 75.9088 },
      { lat: 17.6580, lng: 75.9050 },
    ],
  },
  {
    id: 'plot-nashik-vineyard',
    name: 'Godavari Green Vineyard & Tomato',
    district: 'Nashik',
    state: 'Maharashtra',
    crop: 'Tomato',
    sowing_date: '2026-08-10',
    area_acres: 2.80,
    centroid: [19.9975, 73.7898] as [number, number],
    coordinates: [
      { lat: 19.9990, lng: 73.7880 },
      { lat: 19.9992, lng: 73.7915 },
      { lat: 19.9960, lng: 73.7918 },
      { lat: 19.9958, lng: 73.7882 },
    ],
  },
  {
    id: 'plot-thanjavur-paddy',
    name: 'Cauvery Delta Sona Masuri Paddy',
    district: 'Thanjavur',
    state: 'Tamil Nadu',
    crop: 'Paddy (Rice)',
    sowing_date: '2026-09-01',
    area_acres: 3.75,
    centroid: [10.7870, 79.1378] as [number, number],
    coordinates: [
      { lat: 10.7885, lng: 79.1360 },
      { lat: 10.7888, lng: 79.1395 },
      { lat: 10.7855, lng: 79.1398 },
      { lat: 10.7852, lng: 79.1362 },
    ],
  },
  {
    id: 'plot-warangal-chilli',
    name: 'Kakatiya Red Chilli Estate',
    district: 'Warangal',
    state: 'Telangana',
    crop: 'Chilli',
    sowing_date: '2026-09-10',
    area_acres: 2.20,
    centroid: [17.9689, 79.5941] as [number, number],
    coordinates: [
      { lat: 17.9702, lng: 79.5925 },
      { lat: 17.9705, lng: 79.5955 },
      { lat: 17.9672, lng: 79.5958 },
      { lat: 17.9670, lng: 79.5928 },
    ],
  },
];

const createFieldBoundary = (lat: number, lng: number, areaAcres: number) => {
  const sideMeters = Math.sqrt(Math.max(areaAcres, 0.2) * 4046.86);
  const halfLat = sideMeters / (2 * 111_139);
  const halfLng = sideMeters / (2 * 111_139 * Math.max(Math.cos((lat * Math.PI) / 180), 0.1));
  return [
    { lat: lat + halfLat, lng: lng - halfLng },
    { lat: lat + halfLat, lng: lng + halfLng },
    { lat: lat - halfLat, lng: lng + halfLng },
    { lat: lat - halfLat, lng: lng - halfLng },
  ];
};

export const FieldMonitorContainer: React.FC<FieldMonitorContainerProps> = ({
  onBackToDashboard,
}) => {
  const { t } = useLanguage();
  const { location, searchLocation } = useLocation();

  const [demoPlots, setDemoPlots] = useState<any[]>(DEFAULT_PLOTS);
  const [selectedPlotId, setSelectedPlotId] = useState<string>('plot-guntur-chilli');
  const [fieldData, setFieldData] = useState<any | null>(null);
  const [selectedObsIndex, setSelectedObsIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [shareSuccessLabel, setShareSuccessLabel] = useState<string>('Link Copied!');
  const [shareError, setShareError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const res = await fetch('/api/v1/satellite/demo-plots');
        if (res.ok) {
          const plots = await res.json();
          if (Array.isArray(plots) && plots.length > 0) {
            setDemoPlots(plots);
            if (requestIdRef.current === 0) loadPlotAnalysis(plots[0]);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch satellite demo plots, using defaults', e);
      }
      if (requestIdRef.current === 0) loadPlotAnalysis(DEFAULT_PLOTS[0]);
    };
    fetchPlots();
  }, []);

  const loadPlotAnalysis = async (plot: any) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setSelectedPlotId(plot.id || `plot-${Date.now()}`);
    setSelectedObsIndex(0);
    setSearchError(null);

    const parsedCoords = plot.coordinates?.map((c: any) => ({
      lat: Number(typeof c.lat === 'number' ? c.lat : c[0]),
      lng: Number(typeof c.lng === 'number' ? c.lng : c[1]),
    })).filter((c: any) => Number.isFinite(c.lat) && Number.isFinite(c.lng));
    const coords = parsedCoords?.length >= 3 ? parsedCoords : [
      { lat: 16.2445, lng: 80.6390 },
      { lat: 16.2448, lng: 80.6415 },
      { lat: 16.2425, lng: 80.6418 },
      { lat: 16.2422, lng: 80.6392 },
    ];

    // Switch the visible field as soon as the farmer selects it. The API result
    // replaces this location-aware demo snapshot when it arrives.
    createDynamicLocalPlot(plot, coords);

    try {
      const res = await fetch('/api/v1/satellite/analyze-plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_name: plot.name || `${plot.crop || 'Crop'} Field`,
          crop_name: plot.crop || 'Chilli',
          sowing_date: plot.sowing_date || '2026-09-15',
          coordinates: coords,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (requestId === requestIdRef.current) {
          setFieldData({ ...data, area_acres: plot.area_acres ?? data.area_acres });
        }
      } else {
        if (requestId === requestIdRef.current) createDynamicLocalPlot(plot, coords);
      }
    } catch (e) {
      if (requestId === requestIdRef.current) createDynamicLocalPlot(plot, coords);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  };

  const createDynamicLocalPlot = (plot: any, coords: any[]) => {
    const centroid = [
      coords.reduce((acc, c) => acc + c.lat, 0) / coords.length,
      coords.reduce((acc, c) => acc + c.lng, 0) / coords.length,
    ] as [number, number];

    const crop = plot.crop || 'Chilli';
    const isPaddy = crop.toLowerCase().includes('paddy') || crop.toLowerCase().includes('rice');
    const isWheat = crop.toLowerCase().includes('wheat');
    const isCotton = crop.toLowerCase().includes('cotton');

    const locationSeed = Math.abs(Math.round(centroid[0] * 100 + centroid[1] * 10)) % 7;
    const areaAdjustment = Math.min(0.04, Math.max(-0.04, ((plot.area_acres || 2.5) - 2.5) * 0.008));
    const cropBaseline = isPaddy ? 0.82 : isWheat ? 0.76 : isCotton ? 0.54 : 0.68;
    const meanNdvi = Math.min(0.9, Math.max(0.25, cropBaseline + (locationSeed - 3) * 0.012 + areaAdjustment));
    const healthy = Math.round(Math.min(92, Math.max(45, meanNdvi * 100 + 2)));
    const stressed = Math.round(Math.min(25, Math.max(3, (1 - meanNdvi) * 24)));
    const moderate = 100 - healthy - stressed;
    const observationDate = (daysAgo: number) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      }).format(date);
    };
    const currentDate = observationDate(0);

    setFieldData({
      plot_id: plot.id || 'plot-local',
      plot_name: plot.name || `${crop} Parcel`,
      crop: crop,
      area_acres: plot.area_acres || 2.5,
      boundary_coordinates: coords.map((c) => [c.lat, c.lng]),
      centroid: centroid,
      current_observation: {
        date: currentDate,
        ndvi_score: meanNdvi,
        cloud_cover_percent: 4.2,
        is_cloud_obscured: false,
        observation_label: 'Current Scene - Optimal Sentinel-2 Pass',
      },
      historical_observations: [
        {
          date: currentDate,
          ndvi_score: meanNdvi,
          cloud_cover_percent: 4.2,
          is_cloud_obscured: false,
          observation_label: 'Current Scene (Clear)',
        },
        {
          date: observationDate(15),
          ndvi_score: Math.max(0.2, meanNdvi - 0.07),
          cloud_cover_percent: 6.5,
          is_cloud_obscured: false,
          observation_label: 'Clear Pass',
        },
        {
          date: observationDate(30),
          ndvi_score: Math.max(0.15, meanNdvi - 0.22),
          cloud_cover_percent: 34.0,
          is_cloud_obscured: true,
          observation_label: 'Partially Cloud Obscured',
        },
        {
          date: observationDate(60),
          ndvi_score: Math.max(0.12, meanNdvi - 0.38),
          cloud_cover_percent: 2.1,
          is_cloud_obscured: false,
          observation_label: 'Early Vegetative Stage',
        },
      ],
      ndvi_summary: {
        mean_ndvi: meanNdvi,
        min_ndvi: 0.28,
        max_ndvi: 0.88,
        health_score_percent: Math.round(meanNdvi * 100),
        healthy_canopy_percent: healthy,
        moderate_canopy_percent: moderate,
        stressed_or_bare_percent: stressed,
        canopy_status: isCotton ? 'Moderate Canopy / Active Boll Development' : 'Vigorous / Healthy Vegetative Canopy',
        management_advice: `${healthy}% of your field shows strong vegetative growth (NDVI > 0.60). A section (${stressed}%) along borders shows lower biomass; inspect for irrigation uniformity or localized pest pressure.`,
      },
      satellite_source: 'Copernicus Sentinel-2 (B8 NIR / B4 Red)',
      farmer_disclaimer:
        'IMPORTANT: Sentinel-2 NDVI calculates vegetative canopy density based on optical green reflectance. It does NOT measure soil nitrogen, phosphorus, or chemical soil fertility directly. Use Soil Health Card tests for nutrient recommendations.',
      is_demo: true,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchError('Please enter a district, place name, or coordinates.');
      return;
    }

    const q = searchQuery.trim();
    const result = searchLocation(q);

    if (result) {
      setSearchError(null);
      // Create a 4-point polygon around the searched point
      const boundary = createFieldBoundary(result.lat, result.lng, 2.5);
      const customPlot = {
        id: `plot-searched-${Date.now()}`,
        name: `${result.district} Field (${result.village})`,
        district: result.district,
        state: result.state,
        crop: result.defaultCrop || location.crop || 'Chilli',
        area_acres: 2.5,
        centroid: [result.lat, result.lng] as [number, number],
        coordinates: boundary,
      };

      setDemoPlots((prev) => [customPlot, ...prev]);
      loadPlotAnalysis(customPlot);
    } else {
      setSearchError(
        `Location "${q}" not found. Please enter a valid Indian district, place name, or latitude, longitude coordinates (e.g. 16.24, 80.64).`
      );
    }
  };

  const handleSyncGlobalLocation = () => {
    const lat = location.latitude || 16.2435;
    const lng = location.longitude || 80.6402;
    const areaAcres = location.areaAcres || 2.45;

    const userPlot = {
      id: `plot-user-farm`,
      name: `${location.village || 'My Farm'} (${location.district})`,
      district: location.district,
      state: location.state,
      crop: location.crop || 'Chilli',
      area_acres: areaAcres,
      centroid: [lat, lng] as [number, number],
      coordinates: createFieldBoundary(lat, lng, areaAcres),
    };

    setDemoPlots((prev) => [userPlot, ...prev.filter((p) => p.id !== 'plot-user-farm')]);
    loadPlotAnalysis(userPlot);
  };

  const handleShare = async () => {
    if (!fieldData) return;
    const summary = `NutriCrop Field Report for ${fieldData.plot_name}: Mean NDVI ${activeObs?.ndvi_score?.toFixed(2)} (${fieldData.ndvi_summary?.canopy_status})`;
    setShareError(null);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'NutriCrop Field Report', text: summary });
        setShareSuccessLabel('Report Shared!');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        setShareSuccessLabel('Link Copied!');
      } else {
        throw new Error('Sharing is not supported in this browser.');
      }
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setShareError('Unable to share this report. Check your browser permissions and try again.');
    }
  };

  const activeObs =
    fieldData?.historical_observations?.[selectedObsIndex] ||
    fieldData?.current_observation;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
        >
          {shareSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{shareSuccessLabel}</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>{t('fieldMonitor.shareSummary', 'Share Field Summary')}</span>
            </>
          )}
        </button>
      </div>
      {shareError && (
        <p role="alert" className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {shareError}
        </p>
      )}

      {/* Title & Plot Selection Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                Copernicus Sentinel-2
              </span>
              <DemoBadge />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-nutri-primary flex items-center gap-2">
              <Satellite className="w-6 h-6 text-nutri-secondary" />
              <span>{t('fieldMonitor.title', 'Satellite Field Monitor (NDVI)')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-nutri-muted mt-1">
              {t(
                'fieldMonitor.subtitle',
                'Track vegetation greenness, biomass vigor, and crop growth with Copernicus Sentinel-2 multispectral imagery.'
              )}
            </p>
          </div>

          {/* Sync with Current Profile Location Button */}
          <button
            onClick={handleSyncGlobalLocation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-nutri-primary text-xs font-bold transition self-start sm:self-auto shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('fieldMonitor.syncMyFarm', 'Sync My Farm: {district}', { district: location.district })}</span>
          </button>
        </div>

        {/* Location Search Bar with Error Handling */}
        <form onSubmit={handleSearch} className="space-y-1.5 pt-2 border-t border-nutri-cardBorder">
          <label className="block text-xs font-bold text-nutri-muted uppercase tracking-wider">
            {t('fieldMonitor.searchLabel', 'Search Any Indian Region / Field Coordinates:')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('fieldMonitor.searchPlaceholder', 'Enter district (e.g. Ludhiana, Nashik, Warangal) or GPS (16.24, 80.64)...')}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-gray-200 focus:border-nutri-primary bg-nutri-bg text-xs sm:text-sm font-semibold outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl bg-nutri-primary hover:bg-nutri-secondary text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 min-h-[44px]"
            >
              <Search className="w-4 h-4" />
              <span>{t('fieldMonitor.locate', 'Locate')}</span>
            </button>
          </div>
          {searchError && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold mt-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>

        {/* Dropdown and Benchmark Plot Chips */}
        <div className="pt-2 border-t border-nutri-cardBorder space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-nutri-muted uppercase tracking-wider">
              {t('fieldMonitor.selectPlotDropdownLabel', 'Select Region or Benchmark Plot:')}
            </label>

            {/* Area Dropdown Selector */}
            <select
              value={selectedPlotId}
              onChange={(e) => {
                const found = demoPlots.find((p) => p.id === e.target.value);
                if (found) loadPlotAnalysis(found);
              }}
              className="px-3 py-2 rounded-xl bg-white border border-nutri-cardBorder text-xs font-bold text-nutri-primary focus:outline-none focus:ring-2 focus:ring-nutri-secondary"
            >
              {demoPlots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.crop})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {demoPlots.map((p: any) => {
              const isSelected = selectedPlotId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => loadPlotAnalysis(p)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition min-h-[44px] flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-nutri-primary text-white border-nutri-primary shadow-sm'
                      : 'bg-white hover:bg-nutri-bg text-nutri-primary border-nutri-cardBorder'
                  }`}
                >
                  <Sprout className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Overlay or Interactive Leaflet Map Card */}
      {fieldData && (
        <div className="space-y-4 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex items-center justify-center rounded-3xl">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-lg border border-nutri-cardBorder text-xs font-bold text-nutri-primary">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>{t('fieldMonitor.processing', 'Processing satellite data…')}</span>
              </div>
            </div>
          )}

          <InteractiveFarmMap
            coordinates={
              fieldData.boundary_coordinates?.map((c: any) => ({
                lat: c[0],
                lng: c[1],
              })) || []
            }
            centroid={fieldData.centroid || [16.2435, 80.6402]}
            meanNdvi={activeObs?.ndvi_score || 0.71}
            plotName={fieldData.plot_name}
            cropName={fieldData.crop}
            areaAcres={fieldData.area_acres}
          />

          {/* Multi-Temporal Date Comparison Selector */}
          <div className="bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-nutri-primary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-nutri-secondary" />
                <span>{t('fieldMonitor.dateComparison', 'Satellite Date Comparison')}</span>
              </h3>
              <span className="text-[11px] font-bold text-nutri-muted">
                {t('fieldMonitor.fiveDayCycle', '5-Day Sentinel-2 Cycle')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {fieldData.historical_observations?.map((obs: any, idx: number) => {
                const isSelected = selectedObsIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedObsIndex(idx)}
                    className={`p-3 rounded-2xl border text-left transition min-h-[48px] flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white hover:bg-nutri-bg border-nutri-cardBorder'
                    }`}
                  >
                    <div className="text-xs font-black text-nutri-primary">{obs.date}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="font-bold text-emerald-800">
                        NDVI: {obs.ndvi_score.toFixed(2)}
                      </span>
                      {obs.is_cloud_obscured && (
                        <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {t('fieldMonitor.cloudyBadge', 'Cloudy')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Biomass Breakdown & Agronomic Management Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Mean NDVI Card */}
            <div className="bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-nutri-muted uppercase tracking-wider block mb-1">
                  {t('fieldMonitor.selectedPassNdvi', 'Selected Pass NDVI')}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-nutri-primary">
                    {activeObs?.ndvi_score?.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {t('fieldMonitor.vigorPercent', '({percent}% Vigor)', {
                      percent: Math.round((activeObs?.ndvi_score || 0.7) * 100),
                    })}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-nutri-cardBorder text-xs text-nutri-muted">
                {t('fieldMonitor.obsDate', 'Obs Date:')} <strong className="text-nutri-primary">{activeObs?.date}</strong>
              </div>
            </div>

            {/* 2. Canopy Biomass Breakdown */}
            <div className="bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-sm sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-nutri-muted uppercase tracking-wider">
                  {t('fieldMonitor.canopyDistribution', 'Canopy Health Distribution')}
                </span>
                <span className="text-xs font-bold text-nutri-secondary">
                  {fieldData.ndvi_summary?.canopy_status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-gray-100">
                <div
                  style={{ width: `${fieldData.ndvi_summary?.healthy_canopy_percent || 70}%` }}
                  className="bg-emerald-500 h-full"
                  title={t('fieldMonitor.healthyCanopy', 'Healthy Vegetative Canopy')}
                />
                <div
                  style={{ width: `${fieldData.ndvi_summary?.moderate_canopy_percent || 20}%` }}
                  className="bg-amber-400 h-full"
                  title={t('fieldMonitor.moderateBiomass', 'Moderate Biomass')}
                />
                <div
                  style={{ width: `${fieldData.ndvi_summary?.stressed_or_bare_percent || 10}%` }}
                  className="bg-rose-500 h-full"
                  title={t('fieldMonitor.stressedBiomass', 'Stressed or Thin Canopy')}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  {t('fieldMonitor.healthyCanopy', 'Healthy')}: {fieldData.ndvi_summary?.healthy_canopy_percent}%
                </span>
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  {t('fieldMonitor.moderateBiomass', 'Moderate')}: {fieldData.ndvi_summary?.moderate_canopy_percent}%
                </span>
                <span className="flex items-center gap-1.5 text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  {t('fieldMonitor.stressedBiomass', 'Stressed')}: {fieldData.ndvi_summary?.stressed_or_bare_percent}%
                </span>
              </div>
            </div>
          </div>

          {/* Scientific Actionable Advice Card */}
          <div className="bg-emerald-50/80 rounded-3xl p-5 border border-emerald-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <h4 className="text-sm font-black text-nutri-primary">
                {t('fieldMonitor.agronomicRecommendation', 'Agronomic Management Recommendation')}
              </h4>
            </div>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              {fieldData.ndvi_summary?.management_advice}
            </p>
          </div>

          {/* NDVI Legend Guide */}
          <NdviLegendCard />

          {/* Legal Science Disclaimer */}
          <div className="p-4 rounded-2xl bg-nutri-bg border border-nutri-cardBorder text-xs text-nutri-muted leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{fieldData.farmer_disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
