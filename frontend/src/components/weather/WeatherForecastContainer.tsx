'use client';

import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  ArrowLeft,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  Waves,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { HourlySprayTable } from './HourlySprayTable';
import { SevenDayForecastCard } from './SevenDayForecastCard';
import { SprayingAdvisoryModal } from './SprayingAdvisoryModal';

interface WeatherForecastContainerProps {
  onBackToDashboard: () => void;
}

export const WeatherForecastContainer: React.FC<WeatherForecastContainerProps> = ({
  onBackToDashboard,
}) => {
  const { t } = useLanguage();
  const { location, detectLocationGPS, isDetecting } = useLocation();

  const [forecastData, setForecastData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const fetchForecast = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          village: location.village || '',
          district: location.district || 'Guntur',
          lat: String(location.latitude || 16.2435),
          lon: String(location.longitude || 80.6402),
        });
        const res = await fetch(`/api/v1/weather/forecast?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (active) setForecastData(data);
        } else {
          if (active) loadFallback();
        }
      } catch (e) {
        if (active) loadFallback();
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void fetchForecast();
    return () => {
      active = false;
    };
  }, [location.district, location.village, location.latitude, location.longitude]);

  const loadFallback = () => {
    setForecastData({
      current: {
        location: 'Tenali Village',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        temperature_c: 28.5,
        feels_like_c: 30.2,
        humidity_percent: 62,
        wind_speed_kmh: 7.2,
        wind_direction: 'SE',
        rain_probability_percent: 15,
        condition: 'Partly Cloudy',
        icon: 'cloud-sun',
        uv_index: 5,
        spray_advisory: {
          status: 'Favourable',
          reason: 'Mild wind (7.2 km/h) and low rain chance (15%).',
          recommendation: 'Optimal condition for foliar fertilizers and bio-pesticide applications.',
        },
        alerts: [
          {
            severity: 'info',
            title: 'Favourable Spray Window',
            description: 'Low drift risk and dry canopy conditions prevailing today.',
            action_item: 'Safe to conduct nutrient and pesticide spraying.',
          },
        ],
        last_updated: '18 Nov 2026, 06:30 PM',
        is_demo: true,
      },
      daily_forecast: [
        { date: '18 Nov', day_name: 'Wed', temp_max_c: 31.0, temp_min_c: 21.0, humidity_percent: 55, rain_prob_percent: 10, rainfall_mm: 0.0, wind_speed_kmh: 6.5, condition: 'Clear Sunny', icon: 'sun', spray_rating: 'good' },
        { date: '19 Nov', day_name: 'Thu', temp_max_c: 30.5, temp_min_c: 22.0, humidity_percent: 60, rain_prob_percent: 20, rainfall_mm: 0.0, wind_speed_kmh: 8.0, condition: 'Partly Cloudy', icon: 'cloud-sun', spray_rating: 'good' },
        { date: '20 Nov', day_name: 'Fri', temp_max_c: 27.0, temp_min_c: 21.5, humidity_percent: 78, rain_prob_percent: 65, rainfall_mm: 8.5, wind_speed_kmh: 14.0, condition: 'Light Passing Showers', icon: 'cloud-rain', spray_rating: 'poor' },
        { date: '21 Nov', day_name: 'Sat', temp_max_c: 29.0, temp_min_c: 20.5, humidity_percent: 68, rain_prob_percent: 25, rainfall_mm: 0.0, wind_speed_kmh: 9.2, condition: 'Scattered Clouds', icon: 'cloud', spray_rating: 'good' },
        { date: '22 Nov', day_name: 'Sun', temp_max_c: 32.5, temp_min_c: 23.0, humidity_percent: 52, rain_prob_percent: 15, rainfall_mm: 0.0, wind_speed_kmh: 16.5, condition: 'Warm Breeze', icon: 'wind', spray_rating: 'marginal' },
        { date: '23 Nov', day_name: 'Mon', temp_max_c: 30.0, temp_min_c: 20.0, humidity_percent: 58, rain_prob_percent: 5, rainfall_mm: 0.0, wind_speed_kmh: 7.0, condition: 'Pleasant & Sunny', icon: 'sun', spray_rating: 'good' },
        { date: '24 Nov', day_name: 'Tue', temp_max_c: 31.5, temp_min_c: 21.0, humidity_percent: 54, rain_prob_percent: 10, rainfall_mm: 0.0, wind_speed_kmh: 6.8, condition: 'Clear Sky', icon: 'sun', spray_rating: 'good' },
      ],
      hourly_spray_windows: [
        { time_label: '06:00 AM', temp_c: 22.0, wind_speed_kmh: 4.2, humidity_percent: 78, rain_prob_percent: 5, status: 'Favourable', reason: 'Ideal dew evaporation, calm air, near-zero drift risk.', drift_risk: 'Low' },
        { time_label: '08:00 AM', temp_c: 25.5, wind_speed_kmh: 6.5, humidity_percent: 68, rain_prob_percent: 10, status: 'Favourable', reason: 'Optimal leaf stomatal uptake window; mild air velocity.', drift_risk: 'Low' },
        { time_label: '10:00 AM', temp_c: 28.5, wind_speed_kmh: 8.8, humidity_percent: 58, rain_prob_percent: 12, status: 'Favourable', reason: 'Acceptable spray window before noon temperature rise.', drift_risk: 'Low' },
        { time_label: '12:00 PM', temp_c: 31.2, wind_speed_kmh: 12.5, humidity_percent: 48, rain_prob_percent: 15, status: 'Marginal', reason: 'Midday thermal inversion; higher droplet evaporation risk.', drift_risk: 'Moderate' },
        { time_label: '02:00 PM', temp_c: 32.8, wind_speed_kmh: 14.8, humidity_percent: 42, rain_prob_percent: 15, status: 'Unfavourable', reason: 'High solar radiation and wind drift; chemical burn risk.', drift_risk: 'Severe' },
        { time_label: '04:30 PM', temp_c: 29.0, wind_speed_kmh: 7.5, humidity_percent: 55, rain_prob_percent: 10, status: 'Favourable', reason: 'Declining wind and lower temperature; great evening window.', drift_risk: 'Low' },
        { time_label: '06:30 PM', temp_c: 26.2, wind_speed_kmh: 5.0, humidity_percent: 65, rain_prob_percent: 5, status: 'Favourable', reason: 'Calm evening conditions. Suitable for bio-pesticides.', drift_risk: 'Low' },
      ],
      evapotranspiration_mm_day: 4.2,
      irrigation_deficit_mm: 12.6,
      irrigation_recommendation: 'Crop water balance indicates a 12.6 mm deficit over past 3 days. Recommend 2.5 hours of furrow or drip irrigation in the evening.',
      is_demo: true,
    });
  };

  const curr = forecastData?.current;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-nutri-bg border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.backToDashboard', 'Back to Dashboard')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => detectLocationGPS()}
            disabled={isDetecting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-nutri-cardBorder text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px] disabled:opacity-60"
          >
            {isDetecting ? (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>{t('header.updateLocation', 'Update GPS Location')}</span>
          </button>

          <button
            onClick={() => setIsAdvisoryModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs sm:text-sm font-bold text-nutri-primary transition min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{t('weatherForecast.sprayGuide', 'Safe Spraying Guide')}</span>
          </button>
        </div>
      </div>

      {/* Main Hero Card: Current Weather & Spraying Dial */}
      {curr && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-nutri-cardBorder shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Agro-Meteorology
                </span>
                <DemoBadge />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-nutri-primary flex items-center gap-2">
                <CloudSun className="w-6 h-6 text-nutri-secondary" />
                <span>{t('weatherForecast.title', 'Village Agro-Weather & Spraying Windows')}</span>
              </h1>
              <p className="text-xs text-nutri-muted font-semibold mt-0.5">
                Location: {curr.location}, {curr.district} ({curr.state}) • Updated {curr.last_updated}
              </p>
            </div>

            {/* Current Temperature Badge */}
            <div className="flex items-center gap-3 bg-nutri-bg/60 p-3 rounded-2xl border border-nutri-cardBorder self-start sm:self-auto">
              <span className="text-3xl sm:text-4xl font-black text-nutri-primary">
                {curr.temperature_c}°C
              </span>
              <div className="text-xs font-bold text-nutri-muted leading-tight">
                <div>{curr.condition}</div>
                <div>Feels {curr.feels_like_c}°C</div>
              </div>
            </div>
          </div>

          {/* Key Weather Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-nutri-cardBorder">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Wind className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <div className="text-[11px] text-nutri-muted font-bold">{t('weather.windSpeed', 'Wind Speed')}</div>
                <div className="text-sm font-black text-nutri-primary">
                  {curr.wind_speed_kmh} km/h ({curr.wind_direction})
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Droplets className="w-5 h-5 text-sky-700 shrink-0" />
              <div>
                <div className="text-[11px] text-nutri-muted font-bold">{t('weather.humidity', 'Humidity')}</div>
                <div className="text-sm font-black text-nutri-primary">
                  {curr.humidity_percent}% RH
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Droplets className="w-5 h-5 text-indigo-700 shrink-0" />
              <div>
                <div className="text-[11px] text-nutri-muted font-bold">{t('weather.rainChance', 'Rain Probability')}</div>
                <div className="text-sm font-black text-nutri-primary">
                  {curr.rain_probability_percent}%
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
              <Thermometer className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <div className="text-[11px] text-nutri-muted font-bold">{t('weatherForecast.uvIndex', 'UV Index')}</div>
                <div className="text-sm font-black text-nutri-primary">
                  {curr.uv_index} of 10
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Spraying Suitability Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              curr.spray_advisory.status === 'Favourable'
                ? 'bg-emerald-50 border-emerald-300'
                : curr.spray_advisory.status === 'Caution'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-rose-50 border-rose-300'
            }`}
          >
            {curr.spray_advisory.status === 'Favourable' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-nutri-primary tracking-wider">
                  Spray Advisory:
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    curr.spray_advisory.status === 'Favourable'
                      ? 'bg-emerald-200 text-emerald-950'
                      : 'bg-amber-200 text-amber-950'
                  }`}
                >
                  {curr.spray_advisory.status} Window Open
                </span>
              </div>
              <p className="text-xs font-semibold text-nutri-primary mt-1">
                {curr.spray_advisory.reason}
              </p>
              <p className="text-xs text-nutri-primary font-medium mt-0.5">
                {curr.spray_advisory.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Soil Moisture Deficit & Evapotranspiration Card */}
      {forecastData && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-sky-950 flex items-center gap-2">
              <Waves className="w-5 h-5 text-sky-700" />
              <span>{t('weatherForecast.waterDeficit', 'Soil Moisture & Evapotranspiration Balance')}</span>
            </h3>
            <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
              ET₀: {forecastData.evapotranspiration_mm_day} mm/day
            </span>
          </div>
          <p className="text-xs sm:text-sm text-nutri-primary font-medium leading-relaxed">
            {forecastData.irrigation_recommendation}
          </p>
        </div>
      )}

      {/* Hourly Spray Windows Table */}
      {forecastData?.hourly_spray_windows && (
        <HourlySprayTable windows={forecastData.hourly_spray_windows} />
      )}

      {/* 7-Day Forecast Outlook */}
      {forecastData?.daily_forecast && (
        <SevenDayForecastCard days={forecastData.daily_forecast} />
      )}

      {/* Spraying Advisory Guidelines Modal */}
      <SprayingAdvisoryModal
        isOpen={isAdvisoryModalOpen}
        onClose={() => setIsAdvisoryModalOpen(false)}
      />
    </div>
  );
};
