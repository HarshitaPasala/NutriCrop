'use client';

import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DailyForecastDay {
  date: string;
  day_name: string;
  temp_max_c: number;
  temp_min_c: number;
  humidity_percent: number;
  rain_prob_percent: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  condition: string;
  icon: string;
  spray_rating: 'good' | 'marginal' | 'poor';
}

interface SevenDayForecastCardProps {
  days: DailyForecastDay[];
}

export const SevenDayForecastCard: React.FC<SevenDayForecastCardProps> = ({ days }) => {
  const { t } = useLanguage();

  const getConditionIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-6 h-6 text-amber-500" />;
      case 'cloud-sun':
        return <CloudSun className="w-6 h-6 text-amber-400" />;
      case 'cloud-rain':
        return <CloudRain className="w-6 h-6 text-sky-500" />;
      case 'wind':
        return <Wind className="w-6 h-6 text-teal-600" />;
      default:
        return <Cloud className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-nutri-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-nutri-secondary" />
            <span>{t('weatherForecast.sevenDayOutlook', '7-Day Village Weather Outlook')}</span>
          </h3>
          <p className="text-xs text-nutri-muted font-semibold mt-0.5">
            {t('weather.sevenDayOutlookSubtitle', 'Micro-meteorological village forecast with daily spray suitability flags')}
          </p>
        </div>
      </div>

      {/* Daily Cards Scroll / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {days.map((d, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between items-center transition ${
              idx === 0
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/10'
                : 'bg-white hover:bg-nutri-bg border-nutri-cardBorder'
            }`}
          >
            <div>
              <div className="text-xs font-black text-nutri-primary">
                {idx === 0 ? t('common.today', 'Today') : d.day_name}
              </div>
              <div className="text-[10px] text-nutri-muted font-semibold">{d.date}</div>
            </div>

            <div className="my-2">{getConditionIcon(d.icon)}</div>

            <div className="space-y-1 w-full">
              <div className="text-xs font-black text-nutri-primary">
                {d.temp_max_c}° <span className="text-[11px] text-nutri-muted font-normal">/ {d.temp_min_c}°</span>
              </div>

              {/* Rain Chance */}
              <div className="flex items-center justify-center gap-1 text-[11px] text-sky-700 font-bold">
                <Droplets className="w-3 h-3 text-sky-500" />
                <span>{d.rain_prob_percent}%</span>
              </div>

              {/* Spray Rating Badge */}
              <div
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 ${
                  d.spray_rating === 'good'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    : d.spray_rating === 'marginal'
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}
              >
                {d.spray_rating === 'good' ? t('weather.sprayRatingGood', 'Spray Safe') : d.spray_rating === 'marginal' ? t('weather.sprayRatingMarginal', 'Marginal') : t('weather.sprayRatingPoor', 'No Spray')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
