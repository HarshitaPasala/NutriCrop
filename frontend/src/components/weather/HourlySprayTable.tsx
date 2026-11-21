'use client';

import React from 'react';
import { Clock, Wind, Droplets, Thermometer, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface HourlySprayWindow {
  time_label: string;
  temp_c: number;
  wind_speed_kmh: number;
  humidity_percent: number;
  rain_prob_percent: number;
  status: 'Favourable' | 'Marginal' | 'Unfavourable';
  reason: string;
  drift_risk: 'Low' | 'Moderate' | 'Severe';
}

interface HourlySprayTableProps {
  windows: HourlySprayWindow[];
}

export const HourlySprayTable: React.FC<HourlySprayTableProps> = ({ windows }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-nutri-cardBorder shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black text-nutri-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-nutri-secondary" />
            <span>{t('weatherForecast.hourlySchedule', 'Hourly Spray Suitability Windows')}</span>
          </h3>
          <p className="text-xs text-nutri-muted font-semibold mt-0.5">
            {t('weatherForecast.subtitle', 'Evaluates wind drift, ambient temperature evaporation, and rain-wash risks')}
          </p>
        </div>
      </div>

      {/* Grid of hourly slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {windows.map((win, idx) => {
          const isFav = win.status === 'Favourable';
          const isMarg = win.status === 'Marginal';
          const isUnfav = win.status === 'Unfavourable';

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition ${
                isFav
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : isMarg
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-nutri-primary">{win.time_label}</span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isFav
                      ? 'bg-emerald-200 text-emerald-950'
                      : isMarg
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-rose-200 text-rose-950'
                  }`}
                >
                  {win.status}
                </span>
              </div>

              {/* Weather parameters */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
                <div className="flex items-center gap-1.5 text-nutri-primary font-bold">
                  <Wind className="w-3.5 h-3.5 text-nutri-muted" />
                  <span>{win.wind_speed_kmh} km/h</span>
                </div>
                <div className="flex items-center gap-1.5 text-nutri-primary font-bold">
                  <Thermometer className="w-3.5 h-3.5 text-nutri-muted" />
                  <span>{win.temp_c}°C</span>
                </div>
                <div className="flex items-center gap-1.5 text-nutri-primary font-bold">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  <span>{win.humidity_percent}% RH</span>
                </div>
                <div className="flex items-center gap-1.5 text-nutri-primary font-bold">
                  <span className="text-[11px] text-nutri-muted">{t('weatherForecast.driftLabel', 'Drift:')}</span>
                  <span
                    className={`font-black ${
                      win.drift_risk === 'Low'
                        ? 'text-emerald-700'
                        : win.drift_risk === 'Moderate'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {win.drift_risk}
                  </span>
                </div>
              </div>

              {/* Reason description */}
              <p className="text-[11px] text-nutri-primary font-medium leading-tight">
                {win.reason}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
