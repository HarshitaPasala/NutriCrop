'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useLanguage, translateCrop } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { useVoice } from '@/context/VoiceContext';
import { DemoBadge } from '@/components/ui/DemoBadge';

interface WeatherData {
  location: string;
  district: string;
  state: string;
  temperature_c: number;
  feels_like_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  rain_probability_percent: number;
  condition: string;
  spray_advisory: {
    status: string;
    reason: string;
    recommendation: string;
  };
  alerts: Array<{
    severity: string;
    title: string;
    description: string;
    action_item: string;
  }>;
  last_updated: string;
  is_demo: boolean;
}

export const WeatherCard: React.FC = () => {
  const { t } = useLanguage();
  const { location } = useLocation();
  const areaAcres = Number.isFinite(Number(location.areaAcres)) && Number(location.areaAcres) > 0
    ? Number(location.areaAcres)
    : 0;
  const { speakText, isSpeaking, stopSpeaking } = useVoice();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const requestIdRef = useRef(0);

  const fetchWeather = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        village: location.village,
        district: location.district,
        lat: String(location.latitude),
        lon: String(location.longitude),
      });
      const res = await fetch(`/api/v1/weather/current?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (requestId === requestIdRef.current) setWeather(data);
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      // Local fallback mock data
      if (requestId !== requestIdRef.current) return;
      const lat = location.latitude ?? 16.2435;
      const lon = location.longitude ?? 80.6402;
      const locationOffset = (Math.abs(Math.round(lat * 100 + lon * 10)) % 7) - 3;
      const temperature = Number((28.5 + locationOffset * 0.6).toFixed(1));
      const windSpeed = Number((7.2 + Math.abs(locationOffset) * 0.4).toFixed(1));
      const rainChance = Math.min(70, Math.max(5, 15 + locationOffset * 3));
      const sprayStatus = rainChance >= 40 || windSpeed >= 13 ? 'Avoid' : temperature >= 31 ? 'Caution' : 'Favourable';
      setWeather({
        location: location.village || 'Tenali Village',
        district: location.district || 'Guntur',
        state: 'Andhra Pradesh',
        temperature_c: temperature,
        feels_like_c: Number((30.2 + locationOffset * 0.6).toFixed(1)),
        humidity_percent: Math.min(90, Math.max(30, 62 - locationOffset * 2)),
        wind_speed_kmh: windSpeed,
        rain_probability_percent: rainChance,
        condition: 'Partly Cloudy',
        spray_advisory: {
          status: sprayStatus,
          reason: t('weather.advisoryReasonWindRain', `Wind is ${windSpeed} km/h and rain chance is ${rainChance}%.`, {
            speed: windSpeed,
            chance: rainChance,
          }),
          recommendation: sprayStatus === 'Avoid'
            ? t('weather.avoidSprayNote', 'Postpone spraying until wind and rain conditions improve.')
            : sprayStatus === 'Caution'
              ? t('weather.cautionSprayNote', 'Spray during cooler hours and avoid heat-sensitive treatments.')
              : t('weather.favourableSprayNote', 'Conditions are suitable for foliar fertilizers and bio-pesticide applications.'),
        },
        alerts: [
          {
            severity: 'info',
            title: 'Favourable Spray Window',
            description: 'Low drift risk and dry foliage conditions prevailing today.',
            action_item: 'Safe to conduct foliar and crop protection spraying.',
          },
        ],
        last_updated: 'Just now',
        is_demo: true,
      });
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location.district, location.village, location.latitude, location.longitude, location.crop, location.areaAcres]);

  const handleAudioReadout = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (!weather) return;

    const speechText = `${t('weather.title')}. ${t('weather.temperature')} ${weather.temperature_c} degrees celsius. ${t('weather.humidity')} ${weather.humidity_percent} percent. ${t('weather.windSpeed')} ${weather.wind_speed_kmh} kilometers per hour. ${t('weather.rainChance')} ${weather.rain_probability_percent} percent. ${t('weather.sprayStatus')}: ${weather.spray_advisory.status}. ${weather.spray_advisory.recommendation}`;
    speakText(speechText);
  };

  if (loading || !weather) {
    return (
      <div className="bg-white rounded-3xl p-5 border border-nutri-cardBorder shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="h-20 bg-gray-100 rounded-2xl"></div>
          <div className="h-20 bg-gray-100 rounded-2xl"></div>
          <div className="h-20 bg-gray-100 rounded-2xl"></div>
          <div className="h-20 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const isFavourable = weather.spray_advisory.status === 'Favourable';
  const isCaution = weather.spray_advisory.status === 'Caution';

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-nutri-cardBorder shadow-sm transition hover:shadow-md">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-nutri-primary">
            <CloudSun className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-nutri-primary leading-tight">
              {t('weather.title', 'Field Weather & Spray Advisory')}
            </h2>
            <p className="text-xs text-nutri-muted font-medium">
              {weather.location}, {weather.district} · {translateCrop(location.crop, t)} · {areaAcres.toFixed(2)} {t('dashboard.acres', 'acres')} • {t('weather.lastUpdated')}: {weather.last_updated}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DemoBadge />
          <button
            onClick={handleAudioReadout}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition min-h-[40px] ${
              isSpeaking
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-emerald-50 text-nutri-primary border-emerald-200 hover:bg-emerald-100'
            }`}
            aria-label={t('weather.listenAdvisoryAria', 'Listen to weather advisory')}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">{t('dashboard.stopAudio', 'Stop')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">{t('dashboard.listenGreeting', 'Listen')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
        {/* Temperature */}
        <div className="bg-nutri-bg rounded-2xl p-3 border border-nutri-cardBorder flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-xs shrink-0">
            <CloudSun className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[11px] text-nutri-muted font-semibold block uppercase">
              {t('weather.temperature', 'Temperature')}
            </span>
            <span className="text-lg sm:text-xl font-black text-nutri-dark">
              {weather.temperature_c}°C
            </span>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-nutri-bg rounded-2xl p-3 border border-nutri-cardBorder flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sky-600 shadow-xs shrink-0">
            <Droplets className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <span className="text-[11px] text-nutri-muted font-semibold block uppercase">
              {t('weather.humidity', 'Humidity')}
            </span>
            <span className="text-lg sm:text-xl font-black text-nutri-dark">
              {weather.humidity_percent}%
            </span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-nutri-bg rounded-2xl p-3 border border-nutri-cardBorder flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-600 shadow-xs shrink-0">
            <Wind className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <span className="text-[11px] text-nutri-muted font-semibold block uppercase">
              {t('weather.windSpeed', 'Wind Speed')}
            </span>
            <span className="text-lg sm:text-xl font-black text-nutri-dark">
              {weather.wind_speed_kmh} <span className="text-xs font-normal">km/h</span>
            </span>
          </div>
        </div>

        {/* Rain Probability */}
        <div className="bg-nutri-bg rounded-2xl p-3 border border-nutri-cardBorder flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <CloudRain className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <span className="text-[11px] text-nutri-muted font-semibold block uppercase">
              {t('weather.rainChance', 'Rain Chance')}
            </span>
            <span className="text-lg sm:text-xl font-black text-nutri-dark">
              {weather.rain_probability_percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Spraying Advisory Banner */}
      <div
        className={`rounded-2xl p-3.5 sm:p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isFavourable
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            : isCaution
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-rose-50/80 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              isFavourable
                ? 'bg-emerald-200/80 text-emerald-800'
                : isCaution
                ? 'bg-amber-200/80 text-amber-800'
                : 'bg-rose-200/80 text-rose-800'
            }`}
          >
            {isFavourable ? (
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base">
                {isFavourable
                  ? t('weather.favourable', 'Favourable for Spraying')
                  : isCaution
                  ? t('weather.caution', 'Caution Advised')
                  : t('weather.avoid', 'Avoid Spraying Now')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/70 font-semibold border border-black/5">
                {weather.spray_advisory.reason}
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1 text-gray-700 leading-relaxed font-medium">
              {weather.spray_advisory.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
