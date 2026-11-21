'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Droplets,
  Satellite,
  Thermometer,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Sprout,
  ArrowRight,
  Layers,
  Sparkles,
  BarChart2,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import { useLocation, POPULAR_DISTRICTS, ALL_SUPPORTED_CROPS } from '@/context/LocationContext';
import { useLanguage, translateCrop } from '@/context/LanguageContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface DashboardMetricsProps {
  onNavigateTab: (tab: any) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ onNavigateTab }) => {
  const { location, setCrop, setAreaAcres, detectLocationGPS, isDetecting } = useLocation();
  const { t } = useLanguage();

  const [activeChartTab, setActiveChartTab] = useState<'ndvi' | 'moisture' | 'temperature'>('ndvi');

  // Compute reactive values based on selected crop and district
  const crop = location.crop || 'Chilli';
  const district = location.district || 'Guntur';
  const acres = location.areaAcres || 2.45;

  const cropLower = crop.toLowerCase();
  const isPaddy = cropLower.includes('paddy') || cropLower.includes('rice');
  const isWheat = cropLower.includes('wheat');
  const isCotton = cropLower.includes('cotton');
  const isTomato = cropLower.includes('tomato');
  const isSugarcane = cropLower.includes('sugarcane');

  // Area climate profiles
  const distLower = district.toLowerCase();
  const isColdNorth = distLower.includes('ludhiana') || distLower.includes('varanasi');
  const isDryDeccan = distLower.includes('solapur') || distLower.includes('nashik');
  const isCoastalSouth = distLower.includes('guntur') || distLower.includes('thanjavur') || distLower.includes('krishna');

  // 1. Dynamic Soil Moisture (%)
  let soilMoisture = 58;
  if (isPaddy) soilMoisture = 85;
  else if (isSugarcane) soilMoisture = 72;
  else if (isDryDeccan) soilMoisture = isCotton ? 38 : 46;
  else if (isColdNorth) soilMoisture = 52;
  else if (isCoastalSouth) soilMoisture = 64;

  // 2. Dynamic NDVI
  let meanNdvi = 0.68;
  if (isPaddy) meanNdvi = 0.82;
  else if (isWheat) meanNdvi = 0.76;
  else if (isCotton) meanNdvi = 0.54;
  else if (isSugarcane) meanNdvi = 0.79;
  else if (isTomato) meanNdvi = 0.72;

  // 3. Dynamic Temperature
  let temperature = 28.5;
  if (isColdNorth) temperature = 22.4;
  else if (isDryDeccan) temperature = 31.8;
  else if (distLower.includes('thanjavur') || distLower.includes('palakkad')) temperature = 30.5;

  // 4. Dynamic Yield (Quintals/Acre)
  let yieldPerAcre = 14.0; // Chilli default
  let yieldUnit = 'Qtl/Ac';
  if (isPaddy) yieldPerAcre = 26.5;
  else if (isWheat) yieldPerAcre = 21.0;
  else if (isCotton) yieldPerAcre = 9.5;
  else if (isTomato) yieldPerAcre = 115.0;
  else if (isSugarcane) {
    yieldPerAcre = 42.0;
    yieldUnit = 'Ton/Ac';
  }

  const totalEstimatedYield = (yieldPerAcre * acres).toFixed(1);

  // 5. Health Score
  const healthScore = Math.min(96, Math.max(62, Math.round(meanNdvi * 100 + (soilMoisture > 50 ? 5 : -5))));

  // Dynamic 7-day trend values
  const getTrendPoints = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    if (activeChartTab === 'ndvi') {
      return days.map((d, i) => ({
        day: d,
        val: +(meanNdvi - 0.05 + i * 0.01).toFixed(2),
        label: `${+(meanNdvi - 0.05 + i * 0.01).toFixed(2)}`,
        height: Math.round(((meanNdvi - 0.05 + i * 0.01) / 1.0) * 100),
      }));
    } else if (activeChartTab === 'moisture') {
      return days.map((d, i) => ({
        day: d,
        val: Math.round(soilMoisture - 4 + (i % 3) * 3),
        label: `${Math.round(soilMoisture - 4 + (i % 3) * 3)}%`,
        height: Math.round(soilMoisture - 4 + (i % 3) * 3),
      }));
    } else {
      return days.map((d, i) => ({
        day: d,
        val: +(temperature - 1.5 + (i * 0.4)).toFixed(1),
        label: `${+(temperature - 1.5 + (i * 0.4)).toFixed(1)}°`,
        height: Math.round(((temperature - 10) / 30) * 100),
      }));
    }
  };

  const trendData = getTrendPoints();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-nutri-cardBorder shadow-sm space-y-6">
      {/* Reactive Area & Crop Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-nutri-cardBorder">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              {t('dashboard.liveFarmIntelligence', 'Live Farm Intelligence')}
            </span>
            <DemoBadge />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-nutri-primary flex items-center gap-2">
            <Activity className="w-6 h-6 text-nutri-secondary" />
            <span>{t('dashboard.fieldMetricsTitle', 'Farm Field Metrics & Real-time Status')}</span>
          </h2>
          <p className="text-xs text-nutri-muted font-medium mt-0.5">
            {t('dashboard.metricsSubtitle', 'Values react dynamically to your selected region, standing crop, and parcel acreage.')}
          </p>
        </div>

        {/* Quick Selectors for Area, Crop, and Acres */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Automatic GPS Location Badge & Update Button */}
          <button
            type="button"
            onClick={() => detectLocationGPS()}
            disabled={isDetecting}
            title={t('header.updateLocation', 'Update Location via GPS')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 transition text-xs font-bold text-emerald-900 shadow-2xs active:scale-98 disabled:opacity-70"
          >
            {isDetecting ? (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin shrink-0" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            )}
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {location.village ? `${location.village}, ` : ''}{district} {location.pincode ? `(${location.pincode})` : ''}
            </span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-800">
              GPS
            </span>
          </button>

          {/* Crop Select */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-nutri-bg border border-nutri-cardBorder">
            <Sprout className="w-4 h-4 text-nutri-secondary shrink-0" />
            <select
              aria-label={t('dashboard.selectCropAria', 'Select Standing Crop')}
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="bg-transparent text-xs font-bold text-nutri-primary focus:outline-none cursor-pointer"
            >
              {ALL_SUPPORTED_CROPS.map((c) => (
                <option key={c} value={c}>
                  {translateCrop(c, t)}
                </option>
              ))}
            </select>
          </div>

          {/* Acres Input */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-nutri-bg border border-nutri-cardBorder">
            <span className="text-xs font-bold text-gray-500">{t('dashboard.acres', 'Acres')}:</span>
            <input
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              value={acres}
              onChange={(e) => setAreaAcres(parseFloat(e.target.value) || 1.0)}
              className="w-14 bg-transparent text-xs font-black text-nutri-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5 Reactive Dashboard KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Soil Moisture */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider">
              {t('dashboard.soilMoisture', 'Soil Moisture')}
            </span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-sky-950 block">{soilMoisture}%</span>
            <span className="text-[10px] text-sky-800 font-semibold">
              {soilMoisture > 75
                ? t('dashboard.saturatedAdequate', 'Saturated / Adequate')
                : soilMoisture > 45
                  ? t('dashboard.optimalFieldCapacity', 'Optimal Field Capacity')
                  : t('dashboard.lowMoistureStress', 'Low Moisture Stress')}
            </span>
          </div>
        </div>

        {/* 2. Sentinel-2 NDVI */}
        <div
          onClick={() => onNavigateTab('fieldMonitor')}
          className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between cursor-pointer hover:bg-emerald-100/60 transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
              {t('dashboard.meanNdvi', 'Mean NDVI')}
            </span>
            <Satellite className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-950 block">{meanNdvi.toFixed(2)}</span>
              <span className="text-[11px] font-bold text-emerald-700">Sentinel-2</span>
            </div>
            <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
              <span>{t('dashboard.viewSatellite', 'View Satellite')}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 3. Ambient Temperature */}
        <div
          onClick={() => onNavigateTab('weather')}
          className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between cursor-pointer hover:bg-amber-100/60 transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              {t('dashboard.temperature', 'Temperature')}
            </span>
            <Thermometer className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-2xl font-black text-amber-950 block">{temperature}°C</span>
            <span className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
              <span>{t('dashboard.districtClimate', '{district} Climate', { district })}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 4. Estimated Yield */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              {t('dashboard.estYield', 'Est. Yield')}
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-indigo-950 block">{yieldPerAcre} <span className="text-xs font-bold">{yieldUnit}</span></span>
            <span className="text-[10px] text-indigo-800 font-semibold">
              {t('dashboard.totalYieldCalc', 'Total: {total} Qtl ({rate} Qtl/Ac)', {
                total: totalEstimatedYield,
                rate: `${yieldPerAcre} ${yieldUnit}`,
              })}
            </span>
          </div>
        </div>

        {/* 5. Health Score */}
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider">
              {t('dashboard.vigorScore', 'Vigor Score')}
            </span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-teal-950 block">{healthScore}/100</span>
            <span className="text-[10px] text-teal-800 font-semibold">
              {healthScore >= 75
                ? t('dashboard.healthyCanopy', 'Healthy Canopy')
                : t('dashboard.moderateVigor', 'Moderate Vigor')}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 7-Day Trend Visualization */}
      <div className="bg-nutri-bg rounded-2xl p-4 sm:p-5 border border-nutri-cardBorder space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-nutri-secondary" />
            <h4 className="text-xs sm:text-sm font-black text-nutri-primary">
              {t('dashboard.progressionTitle', '7-Day Reactive Agronomic Progression ({crop} in {district})', {
                crop: translateCrop(crop, t),
                district,
              })}
            </h4>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('ndvi')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${activeChartTab === 'ndvi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {t('dashboard.ndviTab', 'NDVI Index')}
            </button>
            <button
              onClick={() => setActiveChartTab('moisture')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${activeChartTab === 'moisture'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {t('dashboard.moistureTab', 'Moisture %')}
            </button>
            <button
              onClick={() => setActiveChartTab('temperature')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${activeChartTab === 'temperature'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {t('dashboard.tempTab', 'Temp °C')}
            </button>
          </div>
        </div>

        {/* Bar / Column Chart Representation */}
        <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28">
          {trendData.map((pt, idx) => (
            <div key={idx} className="flex flex-col items-center justify-end h-full gap-1">
              <span className="text-[10px] font-black text-nutri-dark">{pt.label}</span>
              <div className="w-full bg-white rounded-t-lg overflow-hidden flex items-end h-16 border border-gray-200">
                <div
                  style={{ height: `${Math.max(15, Math.min(100, pt.height))}%` }}
                  className={`w-full rounded-t-lg transition-all duration-500 ${activeChartTab === 'ndvi'
                    ? 'bg-emerald-600'
                    : activeChartTab === 'moisture'
                      ? 'bg-sky-500'
                      : 'bg-amber-500'
                    }`}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-500">{pt.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
